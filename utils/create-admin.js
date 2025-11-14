require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

/**
 * Create Admin User Script
 *
 * This script creates an admin user with:
 * - Mobile: 9999999999 (default admin number)
 * - Name: Admin
 * - Role: admin
 * - Verified: true
 *
 * Usage:
 *   node create-admin.js
 *
 * Or with custom mobile:
 *   node create-admin.js 9876543210
 */

async function createAdmin() {
  try {
    // Get mobile from command line args or use default
    const adminMobile = process.argv[2] || '9999999999';
    const adminName = 'Admin';

    console.log('🔄 Connecting to database...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');

    console.log('✅ Connected to database');
    console.log('🔄 Creating/updating admin user...');

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
    console.log(`📱 Mobile: ${user.mobile}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`📧 Email: ${user.email || 'Not set'}`);
    console.log(`🔐 Role: ${user.role}`);
    console.log(`✔️  Verified: ${user.isVerified}`);
    console.log(`🆔 User ID: ${user._id}`);
    console.log('='.repeat(50));

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Get admin token:');
    console.log(`   POST /api/auth/send-otp { "mobile": "${user.mobile}" }`);
    console.log(`   POST /api/auth/verify-otp { "mobile": "${user.mobile}", "otp": "0000" }`);
    console.log('\n2. Use the token to access admin APIs:');
    console.log('   Authorization: Bearer YOUR_TOKEN');
    console.log('\n3. Test admin endpoint:');
    console.log('   GET /api/admin/dashboard/overview');

    console.log('\n✅ Admin user ready to use!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createAdmin();
