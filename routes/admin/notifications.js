const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    sendNotificationToUser,
    sendNotificationToAllUsers,
    getUsersWithFcmTokens
} = require('../../controllers/notifications');

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// @route   POST /api/admin/notifications/send-to-user
// @desc    Send push notification to a specific user
// @access  Private/Admin
router.post('/send-to-user', sendNotificationToUser);

// @route   POST /api/admin/notifications/send-to-all
// @desc    Send push notification to all users
// @access  Private/Admin
router.post('/send-to-all', sendNotificationToAllUsers);

// @route   GET /api/admin/notifications/users
// @desc    Get all users with FCM tokens
// @access  Private/Admin
router.get('/users', getUsersWithFcmTokens);

module.exports = router;
