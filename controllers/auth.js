const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sms = require('../utils/sms');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// @desc    Send OTP to mobile number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    // Validate mobile number
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    // Validate mobile number format (10 digits starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Find or create user
    // We still ensure user exists in DB, even if we don't store OTP there
    await User.findOrCreateByMobile(mobile);

    // Send valid OTP via SMS Gateway
    const smsResponse = await sms.sendOtp(mobile);
    console.log(`SMS OTP Sent to ${mobile}:`, smsResponse);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      expiresIn: 5 // minutes
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

// @desc    Verify OTP and login user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    // Validate input
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required'
      });
    }

    // Validate mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Find user by mobile
    const user = await User.findByMobile(mobile);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please request OTP first.'
      });
    }

    // Verify OTP via SMS Gateway Provider
    const isValid = await sms.verifyOtp(mobile, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP or OTP expired'
      });
    }

    // Set last active timestamp
    user.lastActiveAt = new Date();

    // Save verified user (marks as verified if not already)
    if (!user.isVerified) {
      user.isVerified = true;
    }
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          addresses: user.addresses,
          favorites: user.favorites
        }
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('addresses').populate('favorites');

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;
    user.updatedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          mobile: user.mobile,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // For stateless JWT, logout is handled client-side by removing token
    // But we can log the logout event here
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// @desc    Heartbeat / IsActive - update session + activity
// @route   POST /api/auth/is-active
// @access  Private
const isActive = async (req, res) => {
  try {
    const { sessionId, device } = req.body || {};
    const user = await User.findById(req.user.id);

    const now = new Date();
    const ACTIVE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes considered "active"

    // Start a new session if none or mismatched
    if (!user.currentSession?.sessionId || (sessionId && sessionId !== user.currentSession.sessionId)) {
      const newId = user.startSession(device);
      // If client sent a mismatched sessionId, send the new one back
      await user.save();
      return res.status(200).json({
        success: true,
        data: {
          isActive: true,
          lastActiveAt: user.lastActiveAt,
          session: {
            sessionId: newId,
            startedAt: user.currentSession.startedAt,
            lastSeenAt: user.currentSession.lastSeenAt,
            durationMs: user.currentSession.durationMs,
            device: user.currentSession.device
          },
          totalActiveMs: user.totalActiveMs,
          activeWindowMs: ACTIVE_WINDOW_MS
        }
      });
    }

    // Existing session: update activity
    user.touchActivity(now);
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        isActive: user.isActiveWithin(ACTIVE_WINDOW_MS),
        lastActiveAt: user.lastActiveAt,
        session: {
          sessionId: user.currentSession.sessionId,
          startedAt: user.currentSession.startedAt,
          lastSeenAt: user.currentSession.lastSeenAt,
          durationMs: user.currentSession.durationMs,
          device: user.currentSession.device
        },
        totalActiveMs: user.totalActiveMs,
        activeWindowMs: ACTIVE_WINDOW_MS
      }
    });
  } catch (error) {
    console.error('IsActive Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user activity',
      error: error.message
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  logout,
  isActive
};
