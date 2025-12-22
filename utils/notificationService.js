/**
 * Notification Service
 * Creates in-app notifications for order events (no Firebase push)
 */

const Notification = require('../models/Notification');

/**
 * Create notification when user places an order
 * @param {string} userId - MongoDB User ID
 * @param {string} orderNumber - Order number
 * @param {number} totalAmount - Order total amount
 */
const createOrderPlacedNotification = async (userId, orderNumber, totalAmount) => {
    try {
        await Notification.create({
            user: userId,
            title: 'Order Placed Successfully! 🎉',
            body: `Your order #${orderNumber} worth ₹${totalAmount.toLocaleString('en-IN')} has been placed successfully. We'll notify you when it's confirmed.`,
            type: 'order',
            data: {
                orderNumber,
                totalAmount,
                action: 'order_placed'
            }
        });
        console.log(`📦 Notification created: Order placed #${orderNumber}`);
    } catch (error) {
        console.error('Error creating order placed notification:', error);
        // Don't throw - notification creation shouldn't break order flow
    }
};

/**
 * Create notification when order status is updated
 * @param {string} userId - MongoDB User ID
 * @param {string} orderNumber - Order number
 * @param {string} newStatus - New order status
 */
const createOrderStatusNotification = async (userId, orderNumber, newStatus) => {
    try {
        // Map status to user-friendly messages
        const statusMessages = {
            'confirmed': 'Your order has been confirmed! We are preparing it.',
            'processing': 'Your order is being processed.',
            'packed': 'Your order has been packed and is ready for dispatch!',
            'shipped': 'Your order is on its way! 🚚',
            'delivered': 'Your order has been delivered! Thank you for shopping with us. 🎉',
            'cancelled': 'Your order has been cancelled.',
            'refunded': 'Your order refund has been processed.'
        };

        const statusEmojis = {
            'confirmed': '✅',
            'processing': '⏳',
            'packed': '📦',
            'shipped': '🚚',
            'delivered': '🎉',
            'cancelled': '❌',
            'refunded': '💰'
        };

        const emoji = statusEmojis[newStatus] || '📋';
        const message = statusMessages[newStatus] || `Order status updated to ${newStatus}.`;

        await Notification.create({
            user: userId,
            title: `Order Update ${emoji}`,
            body: `Order #${orderNumber}: ${message}`,
            type: 'order',
            data: {
                orderNumber,
                status: newStatus,
                action: 'order_status_updated'
            }
        });
        console.log(`📦 Notification created: Order status updated #${orderNumber} -> ${newStatus}`);
    } catch (error) {
        console.error('Error creating order status notification:', error);
    }
};

/**
 * Create notification when payment status is updated
 * @param {string} userId - MongoDB User ID
 * @param {string} orderNumber - Order number
 * @param {string} paymentStatus - New payment status
 */
const createPaymentStatusNotification = async (userId, orderNumber, paymentStatus) => {
    try {
        const paymentMessages = {
            'completed': 'Payment received successfully! ✅',
            'failed': 'Payment failed. Please try again or contact support.',
            'processing': 'Payment is being processed.',
            'cancelled': 'Payment has been cancelled.',
            'pending': 'Payment is pending.'
        };

        const message = paymentMessages[paymentStatus] || `Payment status: ${paymentStatus}`;

        await Notification.create({
            user: userId,
            title: 'Payment Update 💳',
            body: `Order #${orderNumber}: ${message}`,
            type: 'order',
            data: {
                orderNumber,
                paymentStatus,
                action: 'payment_status_updated'
            }
        });
        console.log(`💳 Notification created: Payment status updated #${orderNumber} -> ${paymentStatus}`);
    } catch (error) {
        console.error('Error creating payment status notification:', error);
    }
};

module.exports = {
    createOrderPlacedNotification,
    createOrderStatusNotification,
    createPaymentStatusNotification
};
