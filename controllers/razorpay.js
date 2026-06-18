const crypto = require('crypto');
const { razorpayFor } = require('../integrations/razorpay');

/**
 * @desc    Create Razorpay order
 * @route   POST /api/razorpay/order
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount provided',
      });
    }

    const { instance } = razorpayFor(req.tenant);

    const options = {
      amount: Number(amount) * 100, // amount in paise (multiply by 100)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.status === 422 ? error.message : 'Unable to create order',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/razorpay/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        status: 'failure',
        message: 'Missing required payment verification fields',
      });
    }

    const { instance, keySecret } = razorpayFor(req.tenant);

    // Create HMAC signature using THIS tenant's key secret
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        status: 'failure',
        message: 'Payment verification failed',
      });
    }

    // Optional: Fetch payment details from Razorpay to confirm status
    try {
      const payment = await instance.payments.fetch(razorpay_payment_id);

      // You can add additional logic here to:
      // 1. Update order status in database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Any other business logic

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Payment verified successfully',
        paymentDetails: {
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          captured: payment.captured,
        },
      });
    } catch (fetchError) {
      console.error('Error fetching payment details:', fetchError);
      // Even if fetch fails, signature was valid
      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Payment verified successfully',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(error.status || 500).json({
      success: false,
      status: 'failure',
      message: error.status === 422 ? error.message : 'Payment verification failed',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
