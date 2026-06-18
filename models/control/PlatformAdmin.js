const mongoose = require('mongoose');

// Platform super-admins. These live on the control plane (NOT in any tenant DB)
// and may switch into / act across any tenant. Distinct from tenant store-admins,
// which are ordinary User docs (role: 'admin') inside a tenant's own database.
const platformAdminSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  mobile:   { type: String, required: true, unique: true }, // OTP login, same provider as storefront
  email:    { type: String, default: null },
  isActive: { type: Boolean, default: true },
  // null/empty => access to all tenants. Otherwise restrict to these tenant slugs.
  allowedTenantSlugs: { type: [String], default: [] },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

// `mobile` already has a unique index from its field option above.

module.exports = { name: 'PlatformAdmin', schema: platformAdminSchema };
