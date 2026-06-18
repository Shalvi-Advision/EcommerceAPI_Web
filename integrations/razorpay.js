const Razorpay = require('razorpay');
const { decrypt } = require('../utils/crypto');

// Per-tenant Razorpay factory (plan §5). Each store uses its OWN Razorpay
// account; secrets live encrypted in tenant.integrations.razorpay. There is no
// shared/platform fallback — per-tenant-required means an unconfigured store
// gets a clear 422 instead of silently charging into another account.

/**
 * Build a Razorpay client for the given tenant.
 * @param {object} tenant - req.tenant (control-plane Tenant doc, integrations decrypted on demand)
 * @returns {{ instance: import('razorpay'), keyId: string, keySecret: string }}
 * @throws {Error} status 422 if payments are not configured for this tenant
 */
function razorpayFor(tenant) {
  const r = tenant && tenant.integrations && tenant.integrations.razorpay;
  if (!r || !r.enabled) {
    const e = new Error('Payments are not configured for this store');
    e.status = 422;
    throw e;
  }
  if (!r.keyId || !r.keySecretEnc) {
    const e = new Error('Payment configuration for this store is incomplete');
    e.status = 422;
    throw e;
  }
  const keySecret = decrypt(r.keySecretEnc);
  return {
    instance: new Razorpay({ key_id: r.keyId, key_secret: keySecret }),
    keyId: r.keyId,
    keySecret,
  };
}

module.exports = { razorpayFor };
