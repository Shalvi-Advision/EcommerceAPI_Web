// Restrict a route to loopback callers only (plan §10.3). The on-demand-TLS "ask"
// endpoint is called by Caddy over 127.0.0.1 and must NEVER be reachable from the
// public internet — otherwise anyone could probe which custom domains are
// approved. We enforce this in-app (not just via bind config) so an accidental
// public exposure still fails closed.
//
// NOTE: behind a proxy, req.ip honours `trust proxy`. Caddy talks to the API
// directly on loopback (no XFF for the internal call), so req.ip is the real
// socket address here.

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

module.exports = function loopbackOnly(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '';
  if (LOOPBACK.has(ip)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Forbidden' });
};
