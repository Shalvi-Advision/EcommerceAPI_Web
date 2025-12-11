const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/razorpay');
const { protect } = require('../middleware/auth');

// Create Razorpay order
router.post('/order', protect, createOrder);

// Verify payment signature
router.post('/verify', protect, verifyPayment);

module.exports = router;
