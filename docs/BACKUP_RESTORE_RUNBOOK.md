# Per-Tenant Backup & Restore Runbook

Operational runbook for backing up and restoring the Shalvi multi-tenant SaaS
(plan §6, §12). The platform is **DB-per-tenant**: there is no single database to
dump — each retailer has its own.

## Topology recap

| Database | Holds | Connection env |
|---|---|---|
| **Control plane** (`MONGODB_CONTROL_URI`) | `tenants`, `platformadmins`, `auditlogs`, `provisioningjobs` | `MONGODB_CONTROL_URI` |
| **Tenant DB** — one per retailer, named `dbName` on the Tenant row (e.g. `tenant_patel`) | that retailer's business data (users, products, orders, …) | `MONGODB_CLUSTER_URI` + `dbName` |

The list of every tenant database lives in the control plane:

```js
// list all tenant dbNames
db.tenants.find({}, { slug: 1, dbName: 1, status: 1 })
```

> **A full platform backup = the control DB + every tenant DB.** Backing up only
> one is never sufficient: the control DB without tenant DBs loses all business
> data; a tenant DB without the control DB loses its routing/branding/integration
> config.

## Secrets — read before restoring

Integration secrets in `tenants.integrations.*Enc` are **AES-256-GCM ciphertext**
encrypted with `INTEGRATION_ENC_KEY` (`utils/crypto.js`). A control-DB backup is
useless without the matching `INTEGRATION_ENC_KEY`.

- Store `INTEGRATION_ENC_KEY` in your secret manager, **separately** from the DB
  backups. Losing it = every tenant must re-enter Razorpay/SMS/FCM/Cloudinary keys.
- Rotating `INTEGRATION_ENC_KEY` requires decrypting with the old key and
  re-encrypting with the new one for every tenant before old backups become
  unreadable — plan rotation as a migration, not a config flip.

## Backup

Set the cluster base URI once (no db name on it):

```bash
CLUSTER_URI="mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net"
CONTROL_DB="shalvi_control"        # the db in MONGODB_CONTROL_URI
STAMP=$(date +%Y%m%d-%H%M%S)
OUT="backups/$STAMP"
```

### 1. Control plane (always)

```bash
mongodump --uri "$CLUSTER_URI/$CONTROL_DB" --out "$OUT/control"
```

### 2. Every tenant DB

```bash
# read tenant dbNames from the control DB and dump each
mongosh "$CLUSTER_URI/$CONTROL_DB" --quiet \
  --eval 'db.tenants.find({}, {dbName:1,_id:0}).toArray().forEach(t=>print(t.dbName))' \
| while read -r DBNAME; do
    echo "dumping $DBNAME"
    mongodump --uri "$CLUSTER_URI/$DBNAME" --out "$OUT/tenants"
  done
```

### 3. One tenant only (e.g. before a risky migration)

```bash
mongodump --uri "$CLUSTER_URI/tenant_patel" --out "$OUT/tenant_patel"
```

Archive `$OUT` and store off-host. Keep `INTEGRATION_ENC_KEY` with it (in a
separate secret store, not the same bucket).

## Restore

### Restore one tenant

```bash
# --drop replaces the target db's collections; omit to merge.
mongorestore --uri "$CLUSTER_URI/tenant_patel" --drop "$OUT/tenants/tenant_patel"
```

### Restore the control plane

```bash
mongorestore --uri "$CLUSTER_URI/$CONTROL_DB" --drop "$OUT/control/$CONTROL_DB"
```

> After restoring the control DB, the running API caches tenant rows for 60s
> (`resolveTenant`). Restart the API (or wait out the TTL) so it re-reads tenant
> status/branding/integration changes. A suspend/resume via
> `PATCH /api/admin/tenants/:slug/{suspend,resume}` also calls
> `resolveTenant.invalidate()`.

### Full platform restore (DR)

1. Provision a fresh cluster; set `INTEGRATION_ENC_KEY` from the secret store.
2. Restore the control DB (above).
3. For each `dbName` in `db.tenants`, restore its tenant dump.
4. Point `MONGODB_CONTROL_URI` / `MONGODB_CLUSTER_URI` at the new cluster; boot.
5. Smoke test: `GET /api/admin/tenants` lists tenants; for one tenant,
   `GET /api/tenant/config` returns branding and OTP login works.

## Verification after restore

```bash
# control plane intact
mongosh "$CLUSTER_URI/$CONTROL_DB" --quiet --eval 'db.tenants.countDocuments()'

# a tenant's data intact
mongosh "$CLUSTER_URI/tenant_patel" --quiet --eval 'db.users.countDocuments()'
```

Then hit the API: `GET /api/admin/tenants` (platform token) and, with
`X-Tenant: <slug>`, a couple of read endpoints to confirm the tenant resolves and
its collections return data.

## Scheduling

- Daily `mongodump` of control + all tenant DBs, retained per your policy.
- For Atlas, enable Cloud Backups / continuous backup in addition to these
  logical dumps (logical dumps are what you need for selective per-tenant
  restore; snapshots are for whole-cluster DR).
- Test a restore into a scratch database at least quarterly — an untested backup
  is not a backup.
