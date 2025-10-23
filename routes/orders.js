const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const AddressBook = require('../models/AddressBook');
const DeliverySlot = require('../models/DeliverySlot');
const PaymentMode = require('../models/PaymentMode');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/orders/place-order
 * @desc    Place a new order with validated cart, delivery, and payment information
 * @access  Private (requires JWT token)
 * @body    {
 *   "store_code": "AVB",
 *   "project_code": "PROJ001",
 *   "cart_validated": true,
 *   "delivery_slot_id": 1,
 *   "delivery_date": "2025-01-15",
 *   "address_id": "68f9fcfaa8873e89d5faf4f9",
 *   "payment_mode_id": 2,
 *   "order_notes": "Please handle with care",
 *   "payment_details": {
 *     "card_number": "**** **** **** 1234",
 *     "card_holder": "John Doe"
 *   }
 * }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/place-order', protect, async (req, res, next) => {
  try {
    const {
      store_code,
      project_code,
      cart_validated = false,
      delivery_slot_id,
      delivery_date,
      address_id,
      payment_mode_id,
      order_notes,
      payment_details
    } = req.body;

    // Validate required fields
    if (!store_code || store_code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'store_code is required'
      });
    }

    if (!project_code || project_code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'project_code is required'
      });
    }

    if (!delivery_slot_id) {
      return res.status(400).json({
        success: false,
        error: 'delivery_slot_id is required'
      });
    }

    if (!delivery_date) {
      return res.status(400).json({
        success: false,
        error: 'delivery_date is required'
      });
    }

    if (!address_id) {
      return res.status(400).json({
        success: false,
        error: 'address_id is required'
      });
    }

    if (!payment_mode_id) {
      return res.status(400).json({
        success: false,
        error: 'payment_mode_id is required'
      });
    }

    if (!cart_validated) {
      return res.status(400).json({
        success: false,
        error: 'Cart must be validated before placing order. Please call validate-cart API first.'
      });
    }

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Validate and get cart
    const cart = await Cart.findByMobile(userMobile);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty. Please add items to cart before placing order.'
      });
    }

    // Validate delivery slot
    const deliverySlot = await DeliverySlot.findOne({
      iddelivery_slot: delivery_slot_id,
      store_code: store_code.trim(),
      is_active: 'yes'
    });

    if (!deliverySlot) {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery slot or slot not available for this store'
      });
    }

    // Validate payment mode
    const paymentMode = await PaymentMode.findOne({
      idpayment_mode: payment_mode_id,
      is_enabled: 'Yes'
    });

    if (!paymentMode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment mode or payment mode not available'
      });
    }

    // Validate delivery address
    const deliveryAddress = await AddressBook.findById(address_id);
    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'Delivery address not found'
      });
    }

    // Check if address belongs to user
    if (deliveryAddress.mobile_number !== userMobile) {
      return res.status(403).json({
        success: false,
        error: 'You can only use your own addresses for delivery'
      });
    }

    // Validate delivery date
    const deliveryDateObj = new Date(delivery_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deliveryDateObj < today) {
      return res.status(400).json({
        success: false,
        error: 'Delivery date cannot be in the past'
      });
    }

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // Calculate order totals
    const subtotal = cart.subtotal;
    const deliveryCharges = 0; // Could be calculated based on distance/area
    const taxAmount = Math.round(subtotal * 0.18); // 18% GST (example)
    const discountAmount = 0; // Could be calculated based on coupons/promotions
    const totalAmount = subtotal + deliveryCharges + taxAmount - discountAmount;

    // Create order
    const order = new Order({
      order_number: orderNumber,
      mobile_no: userMobile,
      customer_info: {
        name: req.user.name || '',
        email: req.user.email || ''
      },
      store_code: store_code.trim(),
      project_code: project_code.trim(),
      order_items: cart.items,
      delivery_info: {
        delivery_date: deliveryDateObj,
        delivery_slot_id: deliverySlot.iddelivery_slot,
        delivery_slot_from: deliverySlot.delivery_slot_from,
        delivery_slot_to: deliverySlot.delivery_slot_to,
        delivery_address: {
          full_name: deliveryAddress.full_name,
          mobile_number: deliveryAddress.mobile_number,
          email_id: deliveryAddress.email_id,
          line_1: deliveryAddress.delivery_addr_line_1,
          line_2: deliveryAddress.delivery_addr_line_2,
          city: deliveryAddress.delivery_addr_city,
          pincode: deliveryAddress.delivery_addr_pincode,
          latitude: deliveryAddress.latitude,
          longitude: deliveryAddress.longitude,
          area_id: deliveryAddress.area_id
        }
      },
      payment_info: {
        payment_mode_id: paymentMode.idpayment_mode,
        payment_mode_name: paymentMode.payment_mode_name,
        payment_details: payment_details || {}
      },
      order_summary: {
        subtotal: subtotal,
        delivery_charges: deliveryCharges,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        total_items: cart.total_items,
        total_quantity: cart.total_quantity
      },
      order_notes: order_notes || '',
      estimated_delivery_date: deliveryDateObj
    });

    // Save order
    const savedOrder = await order.save();

    // Clear cart after successful order placement
    await Cart.clearCart(userMobile);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        order_number: savedOrder.order_number,
        order_status: savedOrder.order_status,
        order_placed_at: savedOrder.order_placed_at,
        estimated_delivery_date: savedOrder.estimated_delivery_date,
        delivery_slot: `${savedOrder.delivery_info.delivery_slot_from} - ${savedOrder.delivery_info.delivery_slot_to}`,
        delivery_address: {
          full_name: savedOrder.delivery_info.delivery_address.full_name,
          line_1: savedOrder.delivery_info.delivery_address.line_1,
          city: savedOrder.delivery_info.delivery_address.city,
          pincode: savedOrder.delivery_info.delivery_address.pincode
        },
        payment_mode: savedOrder.payment_info.payment_mode_name,
        order_summary: savedOrder.order_summary,
        items_count: savedOrder.order_summary.total_items
      }
    });

  } catch (error) {
    // Handle duplicate order number (very rare but possible)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.order_number) {
      // Retry with a new order number
      try {
        const orderNumber = await Order.generateOrderNumber();
        // Re-run the order creation logic with new order number
        // For simplicity, we'll just return an error for now
        return res.status(500).json({
          success: false,
          error: 'Order number generation conflict. Please try again.'
        });
      } catch (retryError) {
        return next(retryError);
      }
    }

    next(error);
  }
});

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get user's order history
 * @access  Private (requires JWT token)
 * @header  Authorization: Bearer <jwt_token>
 */
router.get('/my-orders', protect, async (req, res, next) => {
  try {
    const userMobile = req.user.mobile;
    const limit = parseInt(req.query.limit) || 20;

    const orders = await Order.findByMobile(userMobile, limit);

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No orders found',
        orders: []
      });
    }

    const ordersData = orders.map(order => ({
      order_number: order.order_number,
      order_status: order.order_status,
      order_placed_at: order.order_placed_at,
      estimated_delivery_date: order.estimated_delivery_date,
      actual_delivery_date: order.actual_delivery_date,
      delivery_slot: `${order.delivery_info.delivery_slot_from} - ${order.delivery_info.delivery_slot_to}`,
      delivery_address: {
        full_name: order.delivery_info.delivery_address.full_name,
        line_1: order.delivery_info.delivery_address.line_1,
        city: order.delivery_info.delivery_address.city,
        pincode: order.delivery_info.delivery_address.pincode
      },
      payment_mode: order.payment_info.payment_mode_name,
      payment_status: order.payment_info.payment_status,
      order_summary: order.order_summary,
      items_count: order.order_summary.total_items
    }));

    res.status(200).json({
      success: true,
      count: ordersData.length,
      message: `Found ${ordersData.length} order(s)`,
      orders: ordersData
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders/:orderNumber
 * @desc    Get order details by order number
 * @access  Private (requires JWT token)
 * @header  Authorization: Bearer <jwt_token>
 */
router.get('/:orderNumber', protect, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const userMobile = req.user.mobile;

    const order = await Order.findOne({
      order_number: orderNumber,
      mobile_no: userMobile
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order: {
        order_number: order.order_number,
        order_status: order.order_status,
        order_placed_at: order.order_placed_at,
        order_confirmed_at: order.order_confirmed_at,
        order_completed_at: order.order_completed_at,
        estimated_delivery_date: order.estimated_delivery_date,
        actual_delivery_date: order.actual_delivery_date,
        delivery_info: order.delivery_info,
        payment_info: {
          payment_mode_name: order.payment_info.payment_mode_name,
          payment_status: order.payment_info.payment_status,
          transaction_id: order.payment_info.transaction_id
        },
        order_items: order.order_items,
        order_summary: order.order_summary,
        order_notes: order.order_notes
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders (for admin/testing purposes)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.order_status = status;
    }

    const orders = await Order.find(query)
      .sort({ order_placed_at: -1 })
      .limit(limit);

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No orders found',
        orders: []
      });
    }

    const ordersData = orders.map(order => ({
      order_number: order.order_number,
      mobile_no: order.mobile_no,
      order_status: order.order_status,
      order_placed_at: order.order_placed_at,
      total_amount: order.order_summary.total_amount,
      total_items: order.order_summary.total_items,
      store_code: order.store_code
    }));

    res.status(200).json({
      success: true,
      count: ordersData.length,
      message: `Found ${ordersData.length} order(s)`,
      orders: ordersData
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;