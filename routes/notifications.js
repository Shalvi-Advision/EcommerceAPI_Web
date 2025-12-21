const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getUserNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
} = require('../controllers/notifications');

// User notification routes (all protected)
router.get('/', protect, getUserNotifications);
router.get('/unread-count', protect, getUnreadCount); // Optimized endpoint for count only
router.put('/:id/read', protect, markNotificationRead);
router.put('/read-all', protect, markAllNotificationsRead);

module.exports = router;
