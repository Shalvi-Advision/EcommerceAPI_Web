const express = require('express');
const {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead
} = require('../controllers/notifications');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getUserNotifications);
router.put('/:id/read', markNotificationRead);
router.put('/read-all', markAllNotificationsRead);

module.exports = router;
