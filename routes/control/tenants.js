const express = require('express');

const router = express.Router();

const { Tenant, AuditLog } = require('../../db/controlConnection');
const { requirePlatformAdmin, assertTenantAllowed } = require('../../middleware/platformAuth');
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

// @route   GET /api/admin/tenants/:slug
// @desc    One tenant's platform record (no secrets)
// @access  Platform admin
router.get('/:slug', requirePlatformAdmin, assertTenantAllowed, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ slug: req.params.slug }).select(LIST_PROJECTION).lean();
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ success: false, message: 'Failed to get tenant', error: error.message });
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

module.exports = router;
