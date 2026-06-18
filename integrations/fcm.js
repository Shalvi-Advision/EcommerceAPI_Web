const admin = require('firebase-admin');
const { decrypt } = require('../utils/crypto');

// Per-tenant FCM factory (plan §5). One firebase-admin app per tenant, cached by
// slug (firebase-admin requires a unique app name per credential set). FCM is
// OPTIONAL — a store without push configured simply gets null and push is skipped
// (not a 422; missing push must never block an order or a login).

const apps = new Map(); // tenant.slug -> admin.App

/**
 * Return the Messaging instance for a tenant, or null if push is not configured.
 * @param {object} tenant - req.tenant
 * @returns {import('firebase-admin').messaging.Messaging | null}
 */
function fcmFor(tenant) {
  const f = tenant && tenant.integrations && tenant.integrations.fcm;
  if (!f || !f.enabled || !f.serviceAccountEnc) return null;

  if (!apps.has(tenant.slug)) {
    const serviceAccount = JSON.parse(decrypt(f.serviceAccountEnc));
    const app = admin.initializeApp(
      { credential: admin.credential.cert(serviceAccount) },
      tenant.slug // unique app name keeps tenants isolated
    );
    apps.set(tenant.slug, app);
  }
  return apps.get(tenant.slug).messaging();
}

module.exports = { fcmFor };
