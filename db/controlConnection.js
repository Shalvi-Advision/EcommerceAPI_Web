const mongoose = require('mongoose');

// Singleton connection to the control-plane database (MONGODB_CONTROL_URI).
// Holds only platform-level data — Tenant, PlatformAdmin, AuditLog,
// ProvisioningJob — never any retailer business data.
//
// We use a dedicated createConnection (not the default mongoose.connect) so the
// control models are isolated from per-tenant connections and never leak across.
const CONTROL_URI = process.env.MONGODB_CONTROL_URI;

if (!CONTROL_URI) {
  // Fail fast and loud — the platform cannot resolve tenants without this.
  throw new Error(
    'MONGODB_CONTROL_URI is not set. The control-plane database is required ' +
    'for multi-tenant routing. Set it in the environment before starting the API.'
  );
}

const controlConn = mongoose.createConnection(CONTROL_URI, {
  maxPoolSize: Number(process.env.CONTROL_POOL_SIZE || 5),
});

controlConn.on('connected', () => {
  console.log(`🛰️  Control-plane DB connected: ${controlConn.name}`);
});
controlConn.on('error', (err) => {
  console.error('Control-plane DB error:', err.message);
});

// Register every control-plane model on this connection.
const Tenant          = controlConn.model('Tenant', require('../models/control/Tenant').schema);
const PlatformAdmin   = controlConn.model('PlatformAdmin', require('../models/control/PlatformAdmin').schema);
const AuditLog        = controlConn.model('AuditLog', require('../models/control/AuditLog').schema);
const ProvisioningJob = controlConn.model('ProvisioningJob', require('../models/control/ProvisioningJob').schema);

module.exports = { controlConn, Tenant, PlatformAdmin, AuditLog, ProvisioningJob };
