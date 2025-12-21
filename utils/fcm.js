const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp;

const initializeFirebase = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Initialize with JSON from environment variable
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountJson) {
            const serviceAccount = JSON.parse(serviceAccountJson);
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin SDK initialized successfully');
            return firebaseApp;
        } else {
            console.warn('Firebase Admin SDK not initialized: No service account credentials provided');
            return null;
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error.message);
        return null;
    }
};

/**
 * Send push notification to a specific user
 * @param {string} fcmToken - User's FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 * @returns {Promise<Object>} Response from FCM
 */
const sendNotification = async (fcmToken, title, body, data = {}) => {
    const app = initializeFirebase();

    if (!app) {
        throw new Error('Firebase Admin SDK not initialized');
    }

    if (!fcmToken) {
        throw new Error('FCM token is required');
    }

    const message = {
        notification: {
            title: title || 'Notification',
            body: body || ''
        },
        data: data,
        token: fcmToken
    };

    try {
        const response = await admin.messaging().send(message);
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
const sendNotificationToUser = async (user, title, body, data = {}) => {
    if (!user || !user.fcmToken) {
        throw new Error('User does not have an FCM token');
    }

    return await sendNotification(user.fcmToken, title, body, data);
};

/**
 * Send push notification to multiple users
 * @param {Array} users - Array of user objects with fcmTokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Optional custom data payload
 * @returns {Promise<Object>} Summary of results
 */
const sendNotificationToMultipleUsers = async (users, title, body, data = {}) => {
    const app = initializeFirebase();

    if (!app) {
        throw new Error('Firebase Admin SDK not initialized');
    }

    // Filter users who have FCM tokens
    const usersWithTokens = users.filter(user => user.fcmToken);

    if (usersWithTokens.length === 0) {
        throw new Error('No users have FCM tokens');
    }

    const tokens = usersWithTokens.map(user => user.fcmToken);

    const message = {
        notification: {
            title: title || 'Notification',
            body: body || ''
        },
        data: data,
        tokens: tokens
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
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
const sendNotificationToAllUsers = async (users, title, body, data = {}) => {
    return await sendNotificationToMultipleUsers(users, title, body, data);
};

module.exports = {
    initializeFirebase,
    sendNotification,
    sendNotificationToUser,
    sendNotificationToMultipleUsers,
    sendNotificationToAllUsers
};
