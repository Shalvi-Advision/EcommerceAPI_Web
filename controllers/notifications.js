const User = require('../models/User');
const fcm = require('../utils/fcm');

// @desc    Send notification to a specific user
// @route   POST /api/admin/notifications/send-to-user
// @access  Private/Admin
const sendNotificationToUser = async (req, res) => {
    try {
        const { userId, title, body, data } = req.body;

        // Validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (!title || !body) {
            return res.status(400).json({
                success: false,
                message: 'Title and body are required'
            });
        }

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.fcmToken) {
            return res.status(400).json({
                success: false,
                message: 'User does not have an FCM token. They need to login to the app first.'
            });
        }

        // Send notification
        const result = await fcm.sendNotificationToUser(user, title, body, data || {});

        res.status(200).json({
            success: true,
            message: 'Notification sent successfully',
            data: result
        });

    } catch (error) {
        console.error('Send Notification to User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send notification',
            error: error.message
        });
    }
};

// @desc    Send notification to all users
// @route   POST /api/admin/notifications/send-to-all
// @access  Private/Admin
const sendNotificationToAllUsers = async (req, res) => {
    try {
        const { title, body, data } = req.body;

        // Validation
        if (!title || !body) {
            return res.status(400).json({
                success: false,
                message: 'Title and body are required'
            });
        }

        // Find all users with FCM tokens
        const users = await User.find({ fcmToken: { $ne: null, $exists: true } });

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No users have FCM tokens'
            });
        }

        // Send notification to all users
        const result = await fcm.sendNotificationToAllUsers(users, title, body, data || {});

        res.status(200).json({
            success: true,
            message: `Notification sent to ${result.successCount} out of ${result.usersWithTokens} users`,
            data: result
        });

    } catch (error) {
        console.error('Send Notification to All Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send notifications',
            error: error.message
        });
    }
};

// @desc    Get all users with FCM tokens (for admin to see who can receive notifications)
// @route   GET /api/admin/notifications/users
// @access  Private/Admin
const getUsersWithFcmTokens = async (req, res) => {
    try {
        const users = await User.find(
            { fcmToken: { $ne: null, $exists: true } },
            { _id: 1, name: 1, mobile: 1, email: 1, lastActiveAt: 1 }
        ).sort({ lastActiveAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Get Users with FCM Tokens Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};

module.exports = {
    sendNotificationToUser,
    sendNotificationToAllUsers,
    getUsersWithFcmTokens
};
