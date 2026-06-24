#!/usr/bin/env node
/**
 * One-time importer: provision a tenant from a legacy fork's MasterRetailDB JSON
 * dumps (Grahak Peth / Pagariya Collection) into its own tenant DB.
 *
 *   node scripts/import-fork-tenant.js <slug> "<forkDir>" <subdomain> "<name>" [adminMobile]
 *
 * It (1) creates/reuses the control-plane Tenant row (status active), (2) opens
 * tenant_<slug>, (3) wipes + bulk-loads each collection from the fork's JSON,
 * cleaning mongoexport extended-JSON (_id.$oid, $numberDecimal, "null" strings).
 * Data is written with the native driver (no schema validation) so the real
 * catalog imports as-is.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { controlConn, Tenant } = require('../db/controlConnection');
const { getTenantDb, closeAll } = require('../db/tenantConnections');

// Fork file (MasterRetailDB.<collection>.json) -> tenant collection name.
const COLLECTIONS = [
  'departmentmasters',
  'categorymasters',
  'subcategorymasters',
  'productmasters',
  'deliveryslots',
  'paymentmodes',
  'bannermasters',
  'pincodemasters',
  'pincodestoremasters',
];

// Recursively normalise mongoexport extended-JSON into plain values.
function clean(v) {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') {
    if ('$oid' in v) return undefined; // drop _id so Mongo assigns a fresh one
    if ('$numberDecimal' in v) return parseFloat(v.$numberDecimal);
    if ('$numberInt' in v) return parseInt(v.$numberInt, 10);
    if ('$numberLong' in v) return parseInt(v.$numberLong, 10);
    if ('$date' in v) return new Date(v.$date);
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (k === '_id' || k === '__v') continue; // let Mongo regenerate _id
      const c = clean(val);
      // Convert legacy string "null" -> actual null, matching the original
      // upload_*_data.js scripts. Department.findByStoreCode("null") queries for
      // { store_code: null } (real null), so store-agnostic departments MUST be
      // stored as null, not the string, to be findable.
      out[k] = c === 'null' ? null : c;
    }
    return out;
  }
  return v;
}

function loadJson(forkDir, collection) {
  const file = path.join(forkDir, `MasterRetailDB.${collection}.json`);
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Array.isArray(raw) ? raw.map(clean) : [];
}

async function main() {
  const [, , slug, forkDir, subdomain, name, adminMobile] = process.argv;
  if (!slug || !forkDir || !subdomain || !name) {
    console.error('Usage: node scripts/import-fork-tenant.js <slug> "<forkDir>" <subdomain> "<name>" [adminMobile]');
    process.exit(1);
  }
  const dbName = `tenant_${slug}`;

  await controlConn.asPromise();

  // 1. control-plane Tenant row (upsert -> active)
  let tenant = await Tenant.findOne({ slug });
  if (!tenant) {
    tenant = await Tenant.create({ name, slug, subdomain, dbName, status: 'active', branding: { appName: name } });
    console.log(`✅ created Tenant ${slug} -> ${dbName}`);
  } else {
    tenant.status = 'active';
    tenant.dbName = dbName;
    await tenant.save();
    console.log(`↻ reused Tenant ${slug} -> ${dbName}`);
  }

  // 2. open tenant DB
  const { conn, models } = getTenantDb(dbName);
  await conn.asPromise();
  const db = conn.db;

  // 3. import each collection (wipe then insert). Legacy fork data sometimes
  // violates the tenant model's unique indexes (e.g. Pagariya has the same
  // iddelivery_slot across multiple store_codes). We import the REAL data
  // faithfully: drop the model-created secondary indexes on the collection first,
  // so those "duplicates" load as-is. (Indexes are rebuilt on next model use.)
  for (const coll of COLLECTIONS) {
    const docs = loadJson(forkDir, coll);
    if (docs === null) { console.log(`   – ${coll}: (no file, skipped)`); continue; }

    const c = db.collection(coll);
    await c.deleteMany({});
    // drop every index except the mandatory _id_
    try {
      const idx = await c.indexes();
      for (const i of idx) { if (i.name !== '_id_') await c.dropIndex(i.name).catch(() => {}); }
    } catch (_) { /* collection may not exist yet */ }

    if (docs.length) {
      const CHUNK = 1000;
      for (let i = 0; i < docs.length; i += CHUNK) {
        await c.insertMany(docs.slice(i, i + CHUNK), { ordered: false });
      }
    }
    console.log(`   ✅ ${coll}: ${docs.length}`);
  }

  // 4. ensure a store-admin user exists (OTP login; 2786 backdoor works for now)
  if (adminMobile) {
    const existing = await models.User.findOne({ mobile: adminMobile });
    if (!existing) {
      await models.User.create({ name: `${name} Admin`, mobile: adminMobile, role: 'admin', isVerified: true, isSuperAdmin: true });
      console.log(`   ✅ store-admin ${adminMobile} created`);
    } else {
      console.log(`   ↻ store-admin ${adminMobile} already exists`);
    }
  }

  console.log(`\n🎉 ${name} (${slug}) imported. Subdomain: ${subdomain}.${process.env.PLATFORM_DOMAIN || 'shalvi.in'}\n`);

  await closeAll();
  await controlConn.close();
  process.exit(0);
}

main().catch((e) => { console.error('IMPORT FAILED:', e.message); process.exit(1); });
