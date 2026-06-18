const { decrypt } = require('../utils/crypto');

// Per-tenant SMS factory (plan §5). OTP send/verify must use the TENANT's own
// SMS gateway account so messages are branded and billed correctly, and so one
// store's OTPs are never sent through another store's provider.
// per-tenant-required: an unconfigured store gets a 422 at OTP time.

/**
 * Resolve the SMS gateway config for a tenant (password decrypted).
 * @param {object} tenant - req.tenant
 * @returns {{ baseUrl, userId, password, senderId, clientName }}
 * @throws {Error} status 422 if SMS is not configured for this tenant
 */
function smsConfigFor(tenant) {
  const s = tenant && tenant.integrations && tenant.integrations.sms;
  if (!s || !s.enabled) {
    const e = new Error('SMS is not configured for this store');
    e.status = 422;
    throw e;
  }
  if (!s.baseUrl || !s.userId || !s.passwordEnc) {
    const e = new Error('SMS configuration for this store is incomplete');
    e.status = 422;
    throw e;
  }
  return {
    baseUrl: s.baseUrl,
    userId: s.userId,
    password: decrypt(s.passwordEnc),
    senderId: s.senderId,
    clientName: s.clientName,
  };
}

module.exports = { smsConfigFor };
