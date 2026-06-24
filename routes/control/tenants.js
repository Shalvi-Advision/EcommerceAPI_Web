const express = require('express');

const router = express.Router();

const { Tenant, AuditLog, ProvisioningJob } = require('../../db/controlConnection');
const { requirePlatformAdmin, assertTenantAllowed } = require('../../middleware/platformAuth');
const { provisionTenant, deleteTenant } = require('../../services/provisionTenant');
const { listTemplates } = require('../../lib/catalogTemplates');
const resolveTenant = require('../../middleware/resolveTenant');

// Control-plane tenant management (plan §8 "Tenants section"). These routes act on
// the CONTROL database, NOT a tenant DB, so they are mounted in server.js BEFORE
// app.use('/api', resolveTenant) and never carry a tenant context. All routes
// require a platform super-admin.
//
// Full tenant provisioning (POST /api/admin/tenants, transactional) is Phase 7;
// this phase covers list + suspend/resume only.

// A platform admin may be scoped to a subset of tenants via allowedTenantSlugs.
function visibleFilter(req) {
  const allowed = req.platformAdmin?.allowedTenantSlugs || [];
  return allowed.length ? { slug: { $in: allowed } } : {};
}

// Public-safe projection — NEVER return integration secrets (*Enc) or the whole
// integrations sub-document. Only enough for the admin list/detail view.
const LIST_PROJECTION =
  'name slug subdomain customDomain domainStatus dbName status branding.appName branding.logoUrl goLiveChecklist createdAt updatedAt';

// Detail/edit projection — includes the FULL branding sub-document (no secrets
// live in branding) plus features. Still excludes `integrations` (the *Enc
// secrets). Used by GET /:slug and the PATCH /:slug response.
const DETAIL_PROJECTION =
  'name slug subdomain customDomain domainStatus dbName status branding features goLiveChecklist createdAt updatedAt';

// Branding fields a platform admin may edit. slug/subdomain/dbName are immutable
// (isolation keys); status uses suspend/resume; customDomain uses the domain
// routes. Everything else here is free-text branding.
const EDITABLE_BRANDING = [
  'appName',
  'logoUrl',
  'faviconUrl',
  'primaryColor',
  'secondaryColor',
  'themeColor',
  'supportEmail',
  'supportPhone',
  'footerText',
];

// @route   GET /api/admin/tenants
// @desc    List tenants (no secrets)
// @access  Platform admin
router.get('/', requirePlatformAdmin, async (req, res) => {
  try {
    const tenants = await Tenant.find(visibleFilter(req)).select(LIST_PROJECTION).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (error) {
    console.error('List tenants error:', error);
    res.status(500).json({ success: false, message: 'Failed to list tenants', error: error.message });
  }
});

// @route   GET /api/admin/tenants/catalog-templates
// @desc    Available catalog seed templates (for the wizard's Catalog step)
// @access  Platform admin
// NOTE: declared BEFORE '/:slug' so 'catalog-templates' isn't matched as a slug.
router.get('/catalog-templates', requirePlatformAdmin, (req, res) => {
  res.status(200).json({ success: true, data: listTemplates() });
});

// @route   POST /api/admin/tenants
// @desc    Provision a new tenant (transactional, with rollback). Returns the job.
// @access  Platform admin
router.post('/', requirePlatformAdmin, async (req, res) => {
  try {
    const { job, tenant } = await provisionTenant(req.body, {
      id: req.platformAdmin._id,
      name: req.platformAdmin.name,
    });
    res.status(201).json({
      success: true,
      message: 'Tenant provisioned',
      data: { slug: tenant.slug, status: tenant.status, jobId: job._id },
    });
  } catch (error) {
    console.error('Provision tenant error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to provision tenant',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/tenants/:slug/job
// @desc    Latest provisioning job for a tenant (step-by-step status)
// @access  Platform admin
router.get('/:slug/job', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const job = await ProvisioningJob.findOne({ tenantSlug: req.params.slug })
      .sort({ createdAt: -1 })
      .lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'No provisioning job for this tenant' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ success: false, message: 'Failed to get job', error: error.message });
  }
});

// @route   DELETE /api/admin/tenants/:slug
// @desc    Delete a tenant (drop its DB, mark deleted)
// @access  Platform admin
router.delete('/:slug', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const result = await deleteTenant(req.params.slug, {
      id: req.platformAdmin._id,
      name: req.platformAdmin.name,
    });
    resolveTenant.invalidate();
    res.status(200).json({ success: true, message: 'Tenant deleted', data: result });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Failed to delete tenant',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/tenants/:slug
// @desc    One tenant's platform record (no secrets)
// @access  Platform admin
router.get('/:slug', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug }).select(DETAIL_PROJECTION).lean();
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ success: false, message: 'Failed to get tenant', error: error.message });
  }
});

// @route   PATCH /api/admin/tenants/:slug
// @desc    Edit a tenant's display name and branding (no secrets, no routing/db
//          keys). For status use suspend/resume; for customDomain use the domain
//          routes.
// @access  Platform admin
router.patch('/:slug', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    if (tenant.status === 'deleted') {
      return res.status(409).json({ success: false, message: 'Tenant is deleted' });
    }

    const changed = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      tenant.name = name;
      changed.name = name;
    }

    const branding = req.body.branding;
    if (branding && typeof branding === 'object') {
      tenant.branding = tenant.branding || {};
      for (const key of EDITABLE_BRANDING) {
        if (branding[key] === undefined) continue;
        const value = String(branding[key]).trim();
        // hex-color sanity check for the color fields
        if (
          ['primaryColor', 'secondaryColor', 'themeColor'].includes(key) &&
          value &&
          !/^#?[0-9a-fA-F]{6}$/.test(value)
        ) {
          return res.status(400).json({ success: false, message: `Invalid hex color for ${key}` });
        }
        tenant.branding[key] = value || undefined;
        changed[`branding.${key}`] = tenant.branding[key];
      }
    }

    if (Object.keys(changed).length === 0) {
      return res.status(400).json({ success: false, message: 'No editable fields provided' });
    }

    await tenant.save();
    // Branding feeds the public tenant config; clear the resolve cache so changes
    // surface promptly.
    resolveTenant.invalidate();

    await AuditLog.create({
      actorType: 'platformAdmin',
      actorId: req.platformAdmin._id,
      actorName: req.platformAdmin.name,
      action: 'tenant.update',
      tenantSlug: tenant.slug,
      meta: { changed: Object.keys(changed) },
      ip: req.ip,
    }).catch(() => {});

    const updated = await Tenant.findOne({ slug: tenant.slug }).select(DETAIL_PROJECTION).lean();
    res.status(200).json({ success: true, message: 'Tenant updated', data: updated });
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ success: false, message: 'Failed to update tenant', error: error.message });
  }
});

// Shared status transition for suspend/resume.
async function setStatus(req, res, nextStatus, action) {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    if (tenant.status === 'deleted') {
      return res.status(409).json({ success: false, message: 'Tenant is deleted' });
    }

    tenant.status = nextStatus;
    await tenant.save();

    // resolveTenant caches active tenants for 60s; clear it so the change takes
    // effect immediately (a suspended tenant must stop resolving at once).
    resolveTenant.invalidate();

    await AuditLog.create({
      actorType: 'platformAdmin',
      actorId: req.platformAdmin._id,
      actorName: req.platformAdmin.name,
      action,
      tenantSlug: tenant.slug,
      meta: { status: nextStatus },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Tenant ${nextStatus === 'suspended' ? 'suspended' : 'resumed'}`,
      data: { slug: tenant.slug, status: tenant.status },
    });
  } catch (error) {
    console.error(`${action} error:`, error);
    res.status(500).json({ success: false, message: `Failed to ${action}`, error: error.message });
  }
}

// @route   PATCH /api/admin/tenants/:slug/suspend
// @access  Platform admin
router.patch('/:slug/suspend', requirePlatformAdmin, assertTenantAllowed, (req, res) =>
  setStatus(req, res, 'suspended', 'tenant.suspend')
);

// @route   PATCH /api/admin/tenants/:slug/resume
// @access  Platform admin
router.patch('/:slug/resume', requirePlatformAdmin, assertTenantAllowed, (req, res) =>
  setStatus(req, res, 'active', 'tenant.resume')
);

// ---- Custom domain lifecycle (plan §10.4): pending -> approved -> live -------
// The CNAME target retailers point their domain at (edge of the VPS).
const EDGE_HOST = process.env.EDGE_HOST || 'edge.shalvi.in';

async function logDomain(req, slug, action, meta) {
  await AuditLog.create({
    actorType: 'platformAdmin',
    actorId: req.platformAdmin._id,
    actorName: req.platformAdmin.name,
    action,
    tenantSlug: slug,
    meta,
    ip: req.ip,
  }).catch(() => {});
}

// @route   PATCH /api/admin/tenants/:slug/domain   { customDomain }
// @desc    Register/replace a tenant's custom domain -> domainStatus 'pending'.
//          Returns the CNAME instruction to show the retailer.
// @access  Platform admin
router.patch('/:slug/domain', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const domain = (req.body.customDomain || '').toString().trim().toLowerCase();
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      return res.status(400).json({ success: false, message: 'A valid customDomain is required' });
    }
    const taken = await Tenant.findOne({ customDomain: domain, slug: { $ne: req.params.slug } }).lean();
    if (taken) {
      return res.status(409).json({ success: false, message: 'Domain already in use by another tenant' });
    }

    const tenant = await Tenant.findOne({ slug: req.params.slug });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    tenant.customDomain = domain;
    tenant.domainStatus = 'pending';
    await tenant.save();
    resolveTenant.invalidate();
    await logDomain(req, tenant.slug, 'domain.set', { customDomain: domain });

    res.status(200).json({
      success: true,
      message: 'Domain registered; awaiting DNS + approval',
      data: {
        customDomain: domain,
        domainStatus: 'pending',
        cname: { host: domain, target: EDGE_HOST },
        instructions: `Create a CNAME record: ${domain} -> ${EDGE_HOST}`,
      },
    });
  } catch (error) {
    console.error('Set domain error:', error);
    res.status(500).json({ success: false, message: 'Failed to set domain', error: error.message });
  }
});

// @route   PATCH /api/admin/tenants/:slug/domain/approve
// @desc    Super-admin confirms DNS resolves -> domainStatus 'approved'. Now the
//          ask endpoint (GET /api/internal/domain-allowed) returns 200 so Caddy
//          will issue a cert on the first HTTPS request.
// @access  Platform admin
router.patch('/:slug/domain/approve', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    if (!tenant.customDomain || tenant.domainStatus === 'none') {
      return res.status(409).json({ success: false, message: 'No pending domain to approve' });
    }
    tenant.domainStatus = 'approved';
    await tenant.save();
    resolveTenant.invalidate();
    await logDomain(req, tenant.slug, 'domain.approve', { customDomain: tenant.customDomain });
    res.status(200).json({
      success: true,
      message: 'Domain approved; certificate will be issued on first HTTPS request',
      data: { customDomain: tenant.customDomain, domainStatus: 'approved' },
    });
  } catch (error) {
    console.error('Approve domain error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve domain', error: error.message });
  }
});

// @route   PATCH /api/admin/tenants/:slug/domain/mark-live
// @desc    Flip 'approved' -> 'live' once the cert is confirmed serving. (A future
//          health check could automate this; for now it's an explicit step.)
// @access  Platform admin
router.patch('/:slug/domain/mark-live', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    if (tenant.domainStatus !== 'approved' && tenant.domainStatus !== 'live') {
      return res.status(409).json({ success: false, message: 'Domain must be approved before going live' });
    }
    tenant.domainStatus = 'live';
    await tenant.save();
    resolveTenant.invalidate();
    await logDomain(req, tenant.slug, 'domain.live', { customDomain: tenant.customDomain });
    res.status(200).json({
      success: true,
      message: 'Domain marked live',
      data: { customDomain: tenant.customDomain, domainStatus: 'live' },
    });
  } catch (error) {
    console.error('Mark live error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark live', error: error.message });
  }
});

module.exports = router;
