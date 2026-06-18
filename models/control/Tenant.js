const mongoose = require('mongoose');

// Control-plane Tenant model. Registered ONLY on the control connection
// (see db/controlConnection.js). Holds platform-level data for one retailer:
// routing (subdomain/customDomain), branding, ENCRYPTED integration secrets,
// feature flags and a go-live checklist. Never holds retailer business data —
// that lives in the per-tenant database identified by `dbName`.
const tenantSchema = new mongoose.Schema({
  name:         { type: String, required: true },                                  // "Patel Mart"
  slug:         { type: String, required: true, unique: true },                    // internal id, e.g. "patel"
  subdomain:    { type: String, required: true, unique: true, lowercase: true },   // "patel" -> patel.shalvi.in
  customDomain: { type: String, default: null, index: true },                      // "shop.patelmart.com" | null
  domainStatus: { type: String, enum: ['none', 'pending', 'approved', 'live', 'failed'], default: 'none' },
  dbName:       { type: String, required: true, unique: true },                    // "tenant_patel"
  status:       { type: String, enum: ['provisioning', 'active', 'suspended', 'deleted'], default: 'provisioning' },

  branding: {
    appName:        String,
    logoUrl:        String,
    faviconUrl:     String,
    primaryColor:   String,   // hex
    secondaryColor: String,   // hex
    themeColor:     String,   // PWA theme_color
    supportEmail:   String,
    supportPhone:   String,
    footerText:     String,
  },

  // Integration secrets — *Enc fields are AES-256-GCM ciphertext (see utils/crypto.js).
  // Never return the *Enc fields or this whole sub-document to clients.
  integrations: {
    razorpay:   { keyId: String, keySecretEnc: String, enabled: { type: Boolean, default: false } },
    sms:        { baseUrl: String, userId: String, passwordEnc: String, senderId: String, clientName: String, enabled: { type: Boolean, default: false } },
    fcm:        { serviceAccountEnc: String, vapidKey: String, webConfig: Object, enabled: { type: Boolean, default: false } },
    cloudinary: { cloudName: String, apiKey: String, apiSecretEnc: String, folder: String, enabled: { type: Boolean, default: false } },
  },

  features: { type: Map, of: Boolean, default: {} }, // feature flags

  goLiveChecklist: {
    razorpay:  { type: Boolean, default: false },
    sms:       { type: Boolean, default: false },
    catalog:   { type: Boolean, default: false },
    adminUser: { type: Boolean, default: false },
  },
}, { timestamps: true });

// subdomain (unique) and customDomain (index) already get indexes from their
// field options above; resolveTenant filters by status too, so index that.
tenantSchema.index({ status: 1 });

module.exports = { name: 'Tenant', schema: tenantSchema };
