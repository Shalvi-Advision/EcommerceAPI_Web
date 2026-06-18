const mongoose = require('mongoose');
const { registerModels } = require('./modelRegistry');

// Pooled, idle-evicted cache of per-tenant connections (plan §3.3).
// Each entry holds one mongoose connection to `tenant_<slug>` plus all 25
// models bound to it. Resolved by dbName so two tenants never share a pool.
//
// MONGODB_CLUSTER_URI is the cluster base URI WITHOUT a database name; the
// per-tenant dbName is supplied via the `dbName` connection option. Example:
//   mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
const cache = new Map(); // dbName -> { conn, models, lastUsed }

const CLUSTER_URI = process.env.MONGODB_CLUSTER_URI;
const MAX_IDLE_MS = Number(process.env.TENANT_MAX_IDLE_MS || 30 * 60 * 1000); // 30 min
const POOL_SIZE = Number(process.env.TENANT_POOL_SIZE || 5);

function assertClusterUri() {
  if (!CLUSTER_URI) {
    throw new Error(
      'MONGODB_CLUSTER_URI is not set. It is the cluster base URI (no database ' +
      'name) used to open per-tenant connections. Set it before resolving tenants.'
    );
  }
}

// Get (or lazily open) the connection + bound models for a tenant database.
function getTenantDb(dbName) {
  if (!dbName) throw new Error('getTenantDb: dbName is required');

  let entry = cache.get(dbName);
  if (!entry) {
    assertClusterUri();
    const conn = mongoose.createConnection(CLUSTER_URI, {
      dbName,
      maxPoolSize: POOL_SIZE,
    });
    conn.on('error', (err) => {
      console.error(`Tenant DB error (${dbName}):`, err.message);
    });
    entry = { conn, models: registerModels(conn), lastUsed: Date.now() };
    cache.set(dbName, entry);
  }
  entry.lastUsed = Date.now();
  return entry; // { conn, models, lastUsed }
}

// Periodic eviction of idle connections. .unref() so it never keeps the
// process alive on its own.
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const [dbName, e] of cache) {
    if (now - e.lastUsed > MAX_IDLE_MS) {
      e.conn.close().catch(() => {});
      cache.delete(dbName);
    }
  }
}, 5 * 60 * 1000);
sweeper.unref();

// For graceful shutdown / tests.
async function closeAll() {
  clearInterval(sweeper);
  await Promise.all([...cache.values()].map((e) => e.conn.close().catch(() => {})));
  cache.clear();
}

module.exports = { getTenantDb, closeAll, _cache: cache };
