const express = require('express');
const { body } = require('express-validator');
const { sendOtp, verifyOtp, getProfile, updateProfile, logout, isActive } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const sendOtpValidation = [
  body('mobile')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid mobile number starting with 6-9')
];

const verifyOtpValidation = [
  body('mobile')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid mobile number starting with 6-9'),
  body('otp')
    .isLength({ min: 4, max: 4 })
    .withMessage('OTP must be exactly 4 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

// Routes

// @route   POST /api/auth/send-otp
// @desc    Send OTP to mobile number
// @access  Public
router.post('/send-otp', sendOtpValidation, sendOtp);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and get authentication token
// @access  Public
router.post('/verify-otp', verifyOtpValidation, verifyOtp);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfileValidation, updateProfile);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

// @route   POST /api/auth/is-active
// @desc    Update user session/activity and report status
// @access  Private
router.post('/is-active', protect, isActive);

module.exports = router;
