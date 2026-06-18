const express = require('express');
const router = express.Router();

// Public tenant config (plan §6). The single source of truth both the storefront
// and admin panel boot from. NO auth, NO secrets — only public branding and
// public keys, resolved from the Host (or X-Tenant) by resolveTenant.
//
// SECURITY: never include any `*Enc` field or anything under integrations that
// is a secret. Only the PUBLIC half of each integration is exposed:
//   - razorpay.keyId          (publishable key)
//   - fcm.webConfig + vapidKey (web push config is public by design)
// Secrets (keySecretEnc, passwordEnc, serviceAccountEnc, apiSecretEnc) stay server-side.

/**
 * @route   GET /api/tenant/config
 * @desc    Public branding + public integration keys for the active tenant
 * @access  Public (no token). Unknown Host already 404s in resolveTenant.
 */
router.get('/config', (req, res) => {
  const t = req.tenant;
  const branding = t.branding || {};
  const integrations = t.integrations || {};
  const razorpay = integrations.razorpay || {};
  const fcm = integrations.fcm || {};

  res.status(200).json({
    success: true,
    data: {
      tenant: { slug: t.slug, name: t.name },
      branding: {
        appName: branding.appName || t.name,
        logoUrl: branding.logoUrl || null,
        faviconUrl: branding.faviconUrl || null,
        primaryColor: branding.primaryColor || null,
        secondaryColor: branding.secondaryColor || null,
        themeColor: branding.themeColor || branding.primaryColor || null,
        supportEmail: branding.supportEmail || null,
        supportPhone: branding.supportPhone || null,
        footerText: branding.footerText || null,
      },
      // PUBLIC key only — present only when payments are enabled.
      razorpayKeyId: razorpay.enabled ? (razorpay.keyId || null) : null,
      // Web push config is public; present only when FCM is enabled.
      firebase: fcm.enabled
        ? { config: fcm.webConfig || null, vapidKey: fcm.vapidKey || null }
        : null,
      features: t.features || {},
    },
  });
});

module.exports = router;
