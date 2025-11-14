const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and pagination
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      paymentStatus = '',
      startDate = '',
      endDate = '',
      sortBy = 'order_placed_at',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search by order number or mobile number
    if (search) {
      query.$or = [
        { order_number: { $regex: search, $options: 'i' } },
        { mobile_no: { $regex: search, $options: 'i' } },
        { 'customer_info.name': { $regex: search, $options: 'i' } },
        { 'customer_info.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by order status
    if (status) {
      query.order_status = status;
    }

    // Filter by payment status
    if (paymentStatus) {
      query['payment_info.payment_status'] = paymentStatus;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.order_placed_at = {};
      if (startDate) {
        query.order_placed_at.$gte = new Date(startDate);
      }
      if (endDate) {
        query.order_placed_at.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get single order by ID
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/orders/:id/status
// @desc    Update order status
// @access  Admin
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Use the instance method to update status
    await order.updateStatus(status);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status} successfully`,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/orders/:id/payment-status
// @desc    Update payment status
// @access  Admin
router.patch('/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const validPaymentStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }

    const updateData = {
      'payment_info.payment_status': paymentStatus,
      last_updated_at: new Date()
    };

    if (transactionId) {
      updateData['payment_info.transaction_id'] = transactionId;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus} successfully`,
      data: order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update order details
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      last_updated_at: new Date()
    };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete order (only if not processed)
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow deletion if order is in placed or cancelled status
    if (!['placed', 'cancelled'].includes(order.order_status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete order that is being processed or completed'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
});

// @route   GET /api/admin/orders/stats/overview
// @desc    Get order statistics overview
// @access  Admin
router.get('/stats/overview', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    // Get orders by status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$order_status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payment status counts
    const paymentStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$payment_info.payment_status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total revenue
    const revenueStats = await Order.aggregate([
      {
        $match: {
          order_status: { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$order_summary.total_amount' },
          averageOrderValue: { $avg: '$order_summary.total_amount' },
          totalItems: { $sum: '$order_summary.total_items' }
        }
      }
    ]);

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      order_placed_at: { $gte: today }
    });

    // Get this month's orders
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthOrders = await Order.countDocuments({
      order_placed_at: { $gte: firstDayOfMonth }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        monthOrders,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        paymentStatusCounts: paymentStatusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          averageOrderValue: 0,
          totalItems: 0
        }
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/orders/stats/revenue
// @desc    Get revenue statistics by date range
// @access  Admin
router.get('/stats/revenue', async (req, res) => {
  try {
    const {
      startDate = new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate = new Date(),
      groupBy = 'day'
    } = req.query;

    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$order_placed_at' } };
        break;
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$order_placed_at' } };
        break;
      case 'year':
        dateFormat = { $dateToString: { format: '%Y', date: '$order_placed_at' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$order_placed_at' } };
    }

    const revenueByDate = await Order.aggregate([
      {
        $match: {
          order_placed_at: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          order_status: { $nin: ['cancelled', 'refunded'] }
        }
      },
      {
        $group: {
          _id: dateFormat,
          totalRevenue: { $sum: '$order_summary.total_amount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$order_summary.total_amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: revenueByDate
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue statistics',
      error: error.message
    });
  }
});

// @route   POST /api/admin/orders/bulk-update-status
// @desc    Bulk update order status
// @access  Admin
router.post('/bulk-update-status', async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
    }

    const validStatuses = ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        order_status: status,
        last_updated_at: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} orders to ${status}`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk update',
      error: error.message
    });
  }
});

module.exports = router;
