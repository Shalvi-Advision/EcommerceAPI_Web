const { controlConn, Tenant, ProvisioningJob } = require('../db/controlConnection');
const { getTenantDb } = require('../db/tenantConnections');
const { encrypt } = require('../utils/crypto');
const { seedFromTemplate } = require('../lib/catalogTemplates');

// Transactional tenant provisioning (plan §9). Drives the onboarding wizard's
// POST /api/admin/tenants. Each step is recorded on a control-plane ProvisioningJob
// so a mid-flight failure rolls back precisely (drop the half-created DB, delete
// the reserved Tenant row) and the job is marked `failed` — no orphans.
//
// Integration secrets are validated for SHAPE here and encrypted onto the Tenant
// row. Live Razorpay/SMS test calls (plan step 2) are a follow-up; this keeps
// provisioning runnable without live third-party keys.

const SLUG_RE = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/; // 3-40 chars, dns-safe
const MOBILE_RE = /^[6-9]\d{9}$/;

function fail(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  return e;
}

// ---- validation -------------------------------------------------------------

function validateInput(body) {
  const { name, slug, subdomain, adminUser } = body;
  if (!name || !slug || !subdomain) {
    throw fail('name, slug and subdomain are required');
  }
  if (!SLUG_RE.test(slug)) {
    throw fail('slug must be 3-40 lowercase letters/digits/hyphens (dns-safe)');
  }
  if (!SLUG_RE.test(subdomain)) {
    throw fail('subdomain must be 3-40 lowercase letters/digits/hyphens');
  }
  if (!adminUser || !adminUser.mobile || !MOBILE_RE.test(adminUser.mobile)) {
    throw fail('adminUser.mobile must be a valid 10-digit mobile number');
  }
}

// Build the integrations sub-document, encrypting every secret. Validates the
// SHAPE of whatever is provided; integrations are optional at create time but if
// present must carry their required public+secret fields.
function buildIntegrations(integrations = {}) {
  const out = {};

  if (integrations.razorpay) {
    const r = integrations.razorpay;
    if (!r.keyId || !r.keySecret) throw fail('razorpay requires keyId and keySecret');
    out.razorpay = { keyId: r.keyId, keySecretEnc: encrypt(r.keySecret), enabled: true };
  }
  if (integrations.sms) {
    const s = integrations.sms;
    if (!s.baseUrl || !s.userId || !s.password) throw fail('sms requires baseUrl, userId and password');
    out.sms = {
      baseUrl: s.baseUrl, userId: s.userId, passwordEnc: encrypt(s.password),
      senderId: s.senderId, clientName: s.clientName, enabled: true,
    };
  }
  if (integrations.fcm && integrations.fcm.serviceAccount) {
    const f = integrations.fcm;
    out.fcm = {
      serviceAccountEnc: encrypt(typeof f.serviceAccount === 'string' ? f.serviceAccount : JSON.stringify(f.serviceAccount)),
      vapidKey: f.vapidKey, webConfig: f.webConfig, enabled: true,
    };
  }
  if (integrations.cloudinary) {
    const c = integrations.cloudinary;
    if (!c.cloudName || !c.apiKey || !c.apiSecret) throw fail('cloudinary requires cloudName, apiKey and apiSecret');
    out.cloudinary = {
      cloudName: c.cloudName, apiKey: c.apiKey, apiSecretEnc: encrypt(c.apiSecret),
      folder: c.folder, enabled: true,
    };
  }
  return out;
}

// ---- job step helpers -------------------------------------------------------

async function startStep(job, key) {
  job.steps.push({ key, status: 'running', startedAt: new Date() });
  await job.save();
  return job.steps[job.steps.length - 1];
}
async function finishStep(job, step, status, error = null) {
  step.status = status;
  step.finishedAt = new Date();
  if (error) step.error = error;
  await job.save();
}

// ---- main -------------------------------------------------------------------

/**
 * Provision a new tenant transactionally.
 * @param {object} body - wizard payload (see plan §9)
 * @param {object} [actor] - { id, name } platform admin, for audit
 * @returns {Promise<{ job, tenant }>}
 */
async function provisionTenant(body, actor = {}) {
  validateInput(body);

  const slug = body.slug;
  const dbName = `tenant_${slug}`;

  // Snapshot the request WITHOUT plaintext secrets.
  const safeRequest = JSON.parse(JSON.stringify(body));
  if (safeRequest.integrations) {
    for (const k of Object.keys(safeRequest.integrations)) {
      const v = safeRequest.integrations[k];
      ['keySecret', 'password', 'apiSecret', 'serviceAccount'].forEach((s) => { if (v && v[s]) v[s] = '***'; });
    }
  }

  const job = await ProvisioningJob.create({ tenantSlug: slug, status: 'running', request: safeRequest });

  let tenantDoc = null;
  let tenantConn = null;
  let dbCreated = false;

  const rollback = async (reason) => {
    try {
      if (dbCreated && tenantConn) await tenantConn.dropDatabase().catch(() => {});
      if (tenantDoc) await Tenant.deleteOne({ _id: tenantDoc._id }).catch(() => {});
    } finally {
      job.status = 'failed';
      job.error = reason;
      job.steps.forEach((s) => { if (s.status === 'running') s.status = 'rolledback'; });
      await job.save().catch(() => {});
    }
  };

  try {
    // 1. reserve slug/subdomain (uniqueness)
    let step = await startStep(job, 'reserve-slug');
    const clash = await Tenant.findOne({ $or: [{ slug }, { subdomain: body.subdomain }, { dbName }] }).lean();
    if (clash) throw fail(`slug/subdomain already in use`, 409);
    await finishStep(job, step, 'done');

    // 2. encrypt secrets + write Tenant(status: provisioning)
    step = await startStep(job, 'create-tenant-row');
    const integrations = buildIntegrations(body.integrations);
    tenantDoc = await Tenant.create({
      name: body.name,
      slug,
      subdomain: body.subdomain,
      customDomain: body.customDomain || null,
      domainStatus: body.customDomain ? 'pending' : 'none',
      dbName,
      status: 'provisioning',
      branding: body.branding || {},
      integrations,
      features: body.features || {},
    });
    await finishStep(job, step, 'done');

    // 3. create tenant DB + register models
    step = await startStep(job, 'create-db');
    const t = getTenantDb(dbName);
    tenantConn = t.conn;
    await tenantConn.asPromise();
    dbCreated = true;
    await finishStep(job, step, 'done');

    // 4. seed baseline catalog
    step = await startStep(job, 'seed-catalog');
    const storeCode = (body.catalog && body.catalog.storeCode) || 'MAIN';
    const seedSummary = await seedFromTemplate(t.models, {
      template: (body.catalog && body.catalog.template) || 'grocery',
      storeCode,
      projectCode: (body.catalog && body.catalog.projectCode) || slug.toUpperCase(),
    });
    await finishStep(job, step, 'done');

    // 5. create the store-admin user (verified, role admin)
    step = await startStep(job, 'create-admin');
    await t.models.User.create({
      name: body.adminUser.name || 'Admin',
      mobile: body.adminUser.mobile,
      role: 'admin',
      isVerified: true,
      isSuperAdmin: true, // first admin of the tenant
    });
    await finishStep(job, step, 'done');

    // 6. activate
    step = await startStep(job, 'activate');
    tenantDoc.status = 'active';
    tenantDoc.goLiveChecklist = {
      razorpay: !!integrations.razorpay,
      sms: !!integrations.sms,
      catalog: true,
      adminUser: true,
    };
    await tenantDoc.save();
    await finishStep(job, step, 'done');

    job.status = 'done';
    await job.save();

    // audit
    await controlConn.model('AuditLog').create({
      actorType: 'platformAdmin', actorId: actor.id || null, actorName: actor.name || null,
      action: 'tenant.create', tenantSlug: slug, meta: { dbName, seed: seedSummary },
    }).catch(() => {});

    return { job, tenant: tenantDoc };
  } catch (err) {
    // mark the running step failed, then roll back everything created so far.
    const running = job.steps.find((s) => s.status === 'running');
    if (running) await finishStep(job, running, 'failed', err.message).catch(() => {});
    await rollback(err.message);
    throw err;
  }
}

// Delete a tenant. SOFT by default: marks the Tenant row 'deleted' but PRESERVES
// the tenant database, so an accidental delete is fully recoverable (just set the
// row back to 'active'). The DB is dropped ONLY when called with { purge: true }
// — an explicit, irreversible purge. Rollback-safe to call even if the DB is gone.
async function deleteTenant(slug, actor = {}, opts = {}) {
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) throw fail('Tenant not found', 404);

  if (opts.purge) {
    const t = getTenantDb(tenant.dbName);
    await t.conn.asPromise();
    await t.conn.dropDatabase().catch(() => {});
  }

  tenant.status = 'deleted';
  await tenant.save();

  await controlConn.model('AuditLog').create({
    actorType: 'platformAdmin', actorId: actor.id || null, actorName: actor.name || null,
    action: 'tenant.delete', tenantSlug: slug,
    meta: { dbName: tenant.dbName, purged: !!opts.purge },
  }).catch(() => {});

  return { slug, status: 'deleted', purged: !!opts.purge };
}

module.exports = { provisionTenant, deleteTenant, buildIntegrations, validateInput };
