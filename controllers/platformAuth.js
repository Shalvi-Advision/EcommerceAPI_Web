const jwt = require('jsonwebtoken');
const sms = require('../utils/sms');
const { PlatformAdmin } = require('../db/controlConnection');

// Platform super-admin auth (plan §8/§9). Platform admins live in the CONTROL DB
// (PlatformAdmin model), NOT in any tenant. They can list/suspend tenants and
// switch tenant context from the admin panel. Their JWT carries `platformAdmin:true`
// so middleware/platformAuth.js can distinguish it from a tenant user token.
//
// There is no tenant here, so OTP uses a PLATFORM-level SMS gateway from env
// (PLATFORM_SMS_*). The shared SMS_DEFAULT_OTP backdoor (utils/sms.js) still
// applies for verification, consistent with the rest of the system.

const PLATFORM_SMS = {
  baseUrl: process.env.PLATFORM_SMS_BASE_URL || process.env.SMS_BASE_URL,
  userId: process.env.PLATFORM_SMS_USER_ID || process.env.SMS_USER_ID,
  password: process.env.PLATFORM_SMS_PASSWORD || process.env.SMS_PASSWORD,
  senderId: process.env.PLATFORM_SMS_SENDER_ID || process.env.SMS_SENDER_ID,
  clientName: process.env.PLATFORM_SMS_CLIENT_NAME || 'Shalvi Platform',
};

// Mint a platform JWT. The `platformAdmin` claim is what requirePlatformAdmin
// checks; it is never minted by the tenant auth path, so a tenant user can't
// forge platform access without the signing secret.
const generatePlatformToken = (adminId) =>
  jwt.sign(
    { id: adminId, platformAdmin: true },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

const mobileRegex = /^[6-9]\d{9}$/;

// @desc    Send OTP to a platform admin's mobile
// @route   POST /api/admin/platform/send-otp
// @access  Public (but only known platform-admin mobiles proceed)
const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !mobileRegex.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    // Only registered, active platform admins may request an OTP.
    const admin = await PlatformAdmin.findOne({ mobile, isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Not a registered platform admin' });
    }

    const smsResponse = await sms.sendOtp(PLATFORM_SMS, mobile);
    console.log(`Platform OTP sent to ${mobile}:`, smsResponse);

    res.status(200).json({ success: true, message: 'OTP sent successfully', expiresIn: 5 });
  } catch (error) {
    console.error('Platform Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
};

// @desc    Verify OTP and issue a platform JWT
// @route   POST /api/admin/platform/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp || !mobileRegex.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    const admin = await PlatformAdmin.findOne({ mobile, isActive: true });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Not a registered platform admin' });
    }

    const isValid = await sms.verifyOtp(PLATFORM_SMS, mobile, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP or OTP expired' });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generatePlatformToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          mobile: admin.mobile,
          email: admin.email,
          // empty/absent => access to all tenants
          allowedTenantSlugs: admin.allowedTenantSlugs || [],
        },
      },
    });
  } catch (error) {
    console.error('Platform Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
};

// @desc    Current platform admin profile (token check)
// @route   GET /api/admin/platform/me
// @access  Platform admin
const me = async (req, res) => {
  const a = req.platformAdmin;
  res.status(200).json({
    success: true,
    data: {
      id: a._id,
      name: a.name,
      mobile: a.mobile,
      email: a.email,
      allowedTenantSlugs: a.allowedTenantSlugs || [],
    },
  });
};

module.exports = { sendOtp, verifyOtp, me };
