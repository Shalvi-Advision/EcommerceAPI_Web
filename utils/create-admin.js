require('dotenv').config();
const { controlConn, Tenant } = require('../db/controlConnection');
const { getTenantDb, closeAll } = require('../db/tenantConnections');

/**
 * Create Admin User Script (multi-tenant)
 *
 * Creates/updates an admin user INSIDE A SPECIFIC TENANT's database. Because the
 * platform is DB-per-tenant, you must say which tenant the admin belongs to.
 * The tenant is looked up in the control plane (by slug) to find its dbName,
 * then the User model is bound to that tenant connection via the registry.
 *
 * Usage:
 *   node utils/create-admin.js <tenantSlug> [mobile]
 *
 * Examples:
 *   node utils/create-admin.js patel               # mobile 9999999999
 *   node utils/create-admin.js patel 9876543210
 */

async function createAdmin() {
  try {
    const tenantSlug = process.argv[2];
    const adminMobile = process.argv[3] || '9999999999';
    const adminName = 'Admin';

    if (!tenantSlug) {
      console.error('❌ Usage: node utils/create-admin.js <tenantSlug> [mobile]');
      process.exit(1);
    }

    console.log('🔄 Connecting to control plane...');
    await controlConn.asPromise();

    const tenant = await Tenant.findOne({ slug: tenantSlug }).lean();
    if (!tenant) {
      console.error(`❌ No tenant found with slug "${tenantSlug}". Create the tenant first.`);
      process.exit(1);
    }

    console.log(`✅ Tenant: ${tenant.name} (db: ${tenant.dbName})`);
    console.log('🔄 Creating/updating admin user...');

    const { models } = getTenantDb(tenant.dbName);
    const { User } = models;

    // Check if user already exists
    let user = await User.findOne({ mobile: adminMobile });

    if (user) {
      console.log(`📌 User with mobile ${adminMobile} already exists`);

      // Update to admin if not already
      if (user.role === 'admin') {
        console.log('✅ User is already an admin');
      } else {
        user.role = 'admin';
        user.isVerified = true;
        user.name = adminName;
        await user.save();
        console.log('✅ User updated to admin role');
      }
    } else {
      // Create new admin user
      user = await User.create({
        mobile: adminMobile,
        name: adminName,
        role: 'admin',
        isVerified: true,
        email: 'admin@patel-ecommerce.com'
      });
      console.log('✅ New admin user created');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ADMIN USER DETAILS');
    console.log('='.repeat(50));
    console.log(`🏪 Tenant: ${tenant.slug}`);
    console.log(`📱 Mobile: ${user.mobile}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`📧 Email: ${user.email || 'Not set'}`);
    console.log(`🔐 Role: ${user.role}`);
    console.log(`✔️  Verified: ${user.isVerified}`);
    console.log(`🆔 User ID: ${user._id}`);
    console.log('='.repeat(50));

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Get admin token (send the tenant via Host/subdomain or X-Tenant header):');
    console.log(`   POST /api/auth/send-otp    { "mobile": "${user.mobile}" }   (X-Tenant: ${tenant.slug})`);
    console.log(`   POST /api/auth/verify-otp  { "mobile": "${user.mobile}", "otp": "0000" }`);
    console.log('\n2. Use the token to access admin APIs:');
    console.log('   Authorization: Bearer YOUR_TOKEN');
    console.log('\n3. Test admin endpoint:');
    console.log('   GET /api/admin/dashboard/overview');

    console.log('\n✅ Admin user ready to use!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await closeAll().catch(() => {});
    await controlConn.close().catch(() => {});
    console.log('🔌 Connections closed');
    process.exit(0);
  }
}

// Run the script
createAdmin();
