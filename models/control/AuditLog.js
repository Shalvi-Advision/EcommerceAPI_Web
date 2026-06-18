const mongoose = require('mongoose');

// Control-plane audit trail for platform-level actions: tenant create/suspend,
// domain approval, integration changes, super-admin tenant switches.
const auditLogSchema = new mongoose.Schema({
  actorType: { type: String, enum: ['platformAdmin', 'system'], default: 'platformAdmin' },
  actorId:   { type: mongoose.Schema.Types.ObjectId, default: null },
  actorName: { type: String, default: null },
  action:    { type: String, required: true },              // e.g. "tenant.create", "domain.approve"
  tenantSlug: { type: String, default: null, index: true },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} }, // never store secrets here
  ip:        { type: String, default: null },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

module.exports = { name: 'AuditLog', schema: auditLogSchema };
