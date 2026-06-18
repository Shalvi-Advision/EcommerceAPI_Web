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

module.exports = router;
