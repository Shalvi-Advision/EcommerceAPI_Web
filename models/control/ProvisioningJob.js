const mongoose = require('mongoose');

// Tracks the onboarding wizard's transactional tenant-create (plan §9).
// Phase 7 drives this; the model lives here so Phase 1 establishes the full
// control-plane schema set up front. Each step records its own status so a
// failure mid-provision can be rolled back precisely (drop half-created DB,
// free the reserved slug) and the job marked `failed` with no orphans.
const stepSchema = new mongoose.Schema({
  key:    { type: String, required: true },   // e.g. "reserve-slug", "create-db", "seed-catalog"
  status: { type: String, enum: ['pending', 'running', 'done', 'failed', 'rolledback'], default: 'pending' },
  startedAt:  { type: Date, default: null },
  finishedAt: { type: Date, default: null },
  error:  { type: String, default: null },
}, { _id: false });

const provisioningJobSchema = new mongoose.Schema({
  tenantSlug: { type: String, required: true, index: true },
  status:     { type: String, enum: ['pending', 'running', 'done', 'failed', 'rolledback'], default: 'pending' },
  steps:      { type: [stepSchema], default: [] },
  // Snapshot of the wizard input MINUS plaintext secrets (secrets are encrypted
  // straight onto the Tenant row; never persist them here in the clear).
  request:    { type: mongoose.Schema.Types.Mixed, default: {} },
  error:      { type: String, default: null },
}, { timestamps: true });

module.exports = { name: 'ProvisioningJob', schema: provisioningJobSchema };
