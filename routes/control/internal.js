const express = require('express');

const router = express.Router();

const { Tenant } = require('../../db/controlConnection');

// Internal control-plane routes called by the edge proxy (Caddy), not by clients.
// Mounted under /api/internal behind loopbackOnly + BEFORE resolveTenant.

// @route   GET /api/internal/domain-allowed?domain=shop.patelmart.com
// @desc    Caddy on-demand-TLS "ask" gate (plan §10.3). 200 => Caddy issues a
//          cert; anything else => it refuses. Only domains a tenant has
//          registered AND a super-admin has approved (or that are already live)
//          may get a cert. This is the abuse gate that stops cert issuance for
//          arbitrary domains pointed at the VPS.
// @access  Loopback only (no auth — Caddy can't present a token)
router.get('/domain-allowed', async (req, res) => {
  const domain = (req.query.domain || '').toString().trim().toLowerCase();
  if (!domain) {
    return res.status(400).send('missing domain');
  }

  const tenant = await Tenant.findOne({
    customDomain: domain,
    domainStatus: { $in: ['approved', 'live'] },
    status: 'active',
  })
    .select('_id')
    .lean();

  if (tenant) {
    return res.status(200).send('ok');
  }
  return res.status(403).send('not allowed');
});

// @route   GET /api/internal/pending-domains
// @desc    All custom domains that should have an nginx vhost + cert on the edge:
//          registered, super-admin approved (or already live), active tenant. The
//          VPS reconciler (sync-tenant-domains.sh, see docs/07) polls this and
//          provisions any domain that lacks an nginx site. Loopback-only, so it
//          needs no auth token — Caddy/cron call it over 127.0.0.1.
// @access  Loopback only
router.get('/pending-domains', async (req, res) => {
  try {
    const tenants = await Tenant.find({
      customDomain: { $ne: null },
      domainStatus: { $in: ['approved', 'live'] },
      status: 'active',
    })
      .select('slug customDomain domainStatus')
      .lean();

    res.status(200).json({
      success: true,
      data: tenants.map((t) => ({
        slug: t.slug,
        customDomain: t.customDomain,
        domainStatus: t.domainStatus,
      })),
    });
  } catch (error) {
    console.error('pending-domains error:', error);
    res.status(500).json({ success: false, message: 'Failed to list pending domains' });
  }
});

module.exports = router;
