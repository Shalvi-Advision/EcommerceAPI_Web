// Shared bootstrap for standalone CLI scripts (seed / upload / migrate / verify)
// in the DB-per-tenant world.
//
// Before multi-tenancy these scripts called connectDB() (one shared DB) and used
// `require('../models/X')` directly. Now every model is tenant-scoped, so a
// script must say WHICH tenant it operates on and bind models/collections to
// that tenant's connection.
//
// Usage:
//   const { openTenant } = require('./scripts/lib/tenantScript'); // adjust path
//   const { db, models, close } = await openTenant(process.argv[2]);
//   await models.User.find(...);                 // model-based access
//   await db.collection('deliveryslots').find(); // raw-collection access
//   await close();
//
// The tenant slug is resolved against the control plane to find its dbName.

require('dotenv').config();
const { controlConn, Tenant } = require('../../db/controlConnection');
const { getTenantDb, closeAll } = require('../../db/tenantConnections');

/**
 * Resolve a tenant by slug and open its database.
 * @param {string} slug - tenant slug (usually process.argv[2])
 * @returns {Promise<{tenant, conn, db, models, close: () => Promise<void>}>}
 */
async function openTenant(slug) {
  if (!slug) {
    throw new Error(
      'Tenant slug is required. Usage: node <script>.js <tenantSlug> [...args]'
    );
  }

  await controlConn.asPromise();
  const tenant = await Tenant.findOne({ slug }).lean();
  if (!tenant) {
    throw new Error(`No tenant found with slug "${slug}". Create the tenant first.`);
  }

  const { conn, models } = getTenantDb(tenant.dbName);
  await conn.asPromise(); // ensure conn.db is populated for raw-collection access

  const close = async () => {
    await closeAll().catch(() => {});
    await controlConn.close().catch(() => {});
  };

  return { tenant, conn, db: conn.db, models, close };
}

module.exports = { openTenant };
