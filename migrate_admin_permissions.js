/**
 * Migration script: Set up RBAC permissions for existing admin users.
 *
 * - Gaurav Pawar (8108053372) → isSuperAdmin with full permissions
 * - All other admins → view-only permissions across all sections
 *
 * Idempotent: safe to re-run.
 *
 * Usage: npm run migrate-permissions
 */

const { connectDB, disconnectDB } = require('./config/database');
const User = require('./models/User');

const SUPER_ADMIN_MOBILE = '8108053372';

const fullPermissions = {
  dashboard:      { view: true },
  users:          { view: true, create: true, edit: true, delete: true },
  orders:         { view: true, create: true, edit: true, delete: true },
  notifications:  { view: true, create: true, edit: true, delete: true },
  ecommerce:      { view: true, create: true, edit: true, delete: true },
  outlet:         { view: true, create: true, edit: true, delete: true },
  dynamicSection: { view: true, create: true, edit: true, delete: true },
  offers:         { view: true, create: true, edit: true, delete: true },
};

const viewOnlyPermissions = {
  dashboard:      { view: true },
  users:          { view: true, create: false, edit: false, delete: false },
  orders:         { view: true, create: false, edit: false, delete: false },
  notifications:  { view: true, create: false, edit: false, delete: false },
  ecommerce:      { view: true, create: false, edit: false, delete: false },
  outlet:         { view: true, create: false, edit: false, delete: false },
  dynamicSection: { view: true, create: false, edit: false, delete: false },
  offers:         { view: true, create: false, edit: false, delete: false },
};

async function migrate() {
  await connectDB();

  const admins = await User.find({ role: 'admin' });
  console.log(`Found ${admins.length} admin user(s)\n`);

  for (const admin of admins) {
    const isSuperAdmin = admin.mobile === SUPER_ADMIN_MOBILE;
    const permissions = isSuperAdmin ? fullPermissions : viewOnlyPermissions;

    admin.isSuperAdmin = isSuperAdmin;
    admin.permissions = permissions;
    admin.markModified('permissions');
    await admin.save();

    console.log(
      `${isSuperAdmin ? '★ SUPER ADMIN' : '  Admin'}  ${admin.name || 'N/A'} (${admin.mobile}) — permissions set`
    );
  }

  console.log('\nMigration complete.');
  await disconnectDB();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
