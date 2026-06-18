const { Tenant } = require('../db/controlConnection');
const { getTenantDb } = require('../db/tenantConnections');

// Resolves the active tenant from the request and attaches the tenant's DB
// connection + bound models (plan §4.1). Runs before all business routes so
// every downstream handler reads/writes the correct per-tenant database via
// req.models.* / req.db.
//
// Resolution order:
//   1. `X-Tenant: <slug>` header  — for dev, mobile apps, Postman.
//   2. Host header:
//        sub.shalvi.in     -> subdomain match
//        <custom domain>   -> exact customDomain match
//   3. DEFAULT_TENANT_SLUG env (dev convenience on localhost only).
//
// A short in-process cache avoids a control-DB hit on every request.

const PLATFORM_DOMAIN = (process.env.PLATFORM_DOMAIN || 'shalvi.in').toLowerCase();
const DEFAULT_TENANT_SLUG = (process.env.DEFAULT_TENANT_SLUG || '').toLowerCase();

const tenantCache = new Map(); // cacheId -> { tenant, ts }
const TTL = Number(process.env.TENANT_RESOLVE_TTL_MS || 60 * 1000);

function hostKey(req) {
  const override = req.headers['x-tenant'];
  if (override) return { type: 'slug', value: String(override).toLowerCase() };

  const host = (req.headers.host || '').split(':')[0].toLowerCase();

  // On localhost with no override, fall back to a configured default tenant so
  // local dev "just works" without a Host trick. Never applies in production
  // (real Hosts never resolve to localhost).
  if ((host === 'localhost' || host === '127.0.0.1') && DEFAULT_TENANT_SLUG) {
    return { type: 'slug', value: DEFAULT_TENANT_SLUG };
  }

  return { type: 'host', value: host };
}

async function lookupTenant(key) {
  if (key.type === 'slug') {
    return Tenant.findOne({ slug: key.value, status: 'active' }).lean();
  }
  const host = key.value;
  const dotPlatform = `.${PLATFORM_DOMAIN}`;
  if (host.endsWith(dotPlatform)) {
    const sub = host.slice(0, -dotPlatform.length);
    return Tenant.findOne({ subdomain: sub, status: 'active' }).lean();
  }
  return Tenant.findOne({ customDomain: host, status: 'active' }).lean();
}

module.exports = async function resolveTenant(req, res, next) {
  try {
    const key = hostKey(req);
    const cacheId = `${key.type}:${key.value}`;

    let hit = tenantCache.get(cacheId);
    if (!hit || Date.now() - hit.ts > TTL) {
      const tenant = await lookupTenant(key);
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Unknown tenant' });
      }
      hit = { tenant, ts: Date.now() };
      tenantCache.set(cacheId, hit);
    }

    const { conn, models } = getTenantDb(hit.tenant.dbName);
    req.tenant = hit.tenant;
    req.db = conn;
    req.models = models;
    next();
  } catch (err) {
    next(err);
  }
};

// Exposed so the provisioning flow (Phase 7) can invalidate a tenant's cached
// row after status/branding/integration changes.
module.exports.invalidate = function invalidate() {
  tenantCache.clear();
};
