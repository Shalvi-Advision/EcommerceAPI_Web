// Multi-tenant FCM sender. Every function takes a `messaging` instance built
// per-tenant by integrations/fcm.js -> fcmFor(req.tenant). FCM is optional, so
// callers may pass null (push is then skipped, never an error).

/**
 * Send push notification to a specific user
 * @param {import('firebase-admin').messaging.Messaging} messaging - tenant FCM messaging
 * @param {string} fcmToken - User's FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 * @returns {Promise<Object>} Response from FCM
 */
const sendNotification = async (messaging, fcmToken, title, body, data = {}) => {
    if (!messaging) {
        throw new Error('Push notifications are not configured for this store');
    }

    if (!fcmToken) {
        throw new Error('FCM token is required');
    }

    // Ensure all data values are strings (FCM requirement for iOS)
    const stringifiedData = {};
    Object.keys(data).forEach(key => {
        const value = data[key];
        stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    });

    const message = {
        notification: {
            title: title || 'Notification',
            body: body || ''
        },
        data: stringifiedData,
        token: fcmToken,
        // iOS specific configuration
        apns: {
            payload: {
                aps: {
                    alert: {
                        title: title || 'Notification',
                        body: body || ''
                    },
                    sound: 'default',
                    badge: 1
                }
            }
        },
        // Android specific configuration
        android: {
            notification: {
                title: title || 'Notification',
                body: body || '',
                sound: 'default',
                priority: 'high'
            }
        }
    };

    try {
        const response = await messaging.send(message);
        console.log('Successfully sent notification:', response);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

/**
 * Send push notification to a user by user ID
 * @param {Object} user - User object with fcmToken
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 * @returns {Promise<Object>} Response from FCM
 */
const sendNotificationToUser = async (messaging, user, title, body, data = {}) => {
    if (!user || !user.fcmToken) {
        throw new Error('User does not have an FCM token');
    }

    return await sendNotification(messaging, user.fcmToken, title, body, data);
};

/**
 * Send push notification to multiple users
 * @param {Array} users - Array of user objects with fcmTokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 * @returns {Promise<Object>} Summary of results
 */
const sendNotificationToMultipleUsers = async (messaging, users, title, body, data = {}) => {
    if (!messaging) {
        throw new Error('Push notifications are not configured for this store');
    }

    // Filter users who have FCM tokens
    const usersWithTokens = users.filter(user => user.fcmToken);

    if (usersWithTokens.length === 0) {
        throw new Error('No users have FCM tokens');
    }

    const tokens = usersWithTokens.map(user => user.fcmToken);

    // Ensure all data values are strings (FCM requirement for iOS)
    const stringifiedData = {};
    Object.keys(data).forEach(key => {
        const value = data[key];
        stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    });

    const message = {
        notification: {
            title: title || 'Notification',
            body: body || ''
        },
        data: stringifiedData,
        tokens: tokens,
        // iOS specific configuration
        apns: {
            payload: {
                aps: {
                    alert: {
                        title: title || 'Notification',
                        body: body || ''
                    },
                    sound: 'default',
                    badge: 1
                }
            }
        },
        // Android specific configuration
        android: {
            notification: {
                title: title || 'Notification',
                body: body || '',
                sound: 'default',
                priority: 'high'
            }
        }
    };

    try {
        const response = await messaging.sendEachForMulticast(message);
        console.log(`Successfully sent notifications: ${response.successCount}/${tokens.length}`);

        return {
            success: true,
            totalUsers: users.length,
            usersWithTokens: usersWithTokens.length,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses
        };
    } catch (error) {
        console.error('Error sending notifications to multiple users:', error);
        throw error;
    }
};

/**
 * Send notification to all users with FCM tokens
 * @param {Array} users - Array of all user objects
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 * @returns {Promise<Object>} Summary of results
 */
const sendNotificationToAllUsers = async (messaging, users, title, body, data = {}) => {
    return await sendNotificationToMultipleUsers(messaging, users, title, body, data);
};

module.exports = {
    sendNotification,
    sendNotificationToUser,
    sendNotificationToMultipleUsers,
    sendNotificationToAllUsers
};
