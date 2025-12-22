const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Order = require('../../models/Order');
const Notification = require('../../models/Notification');

// @route   GET /api/admin/users
// @desc    Get all users with pagination, search, and filters (with notification insights)
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search by mobile, name, or email
    if (search) {
      query.$or = [
        { mobile: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-otp -otpExpiresAt')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Aggregate notification counts for all users in this page
    const userIds = users.map(u => u._id);
    const notificationStats = await Notification.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalCount: { $sum: 1 },
          unreadCount: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } }
        }
      }
    ]);

    // Create a map for quick lookup
    const notifMap = {};
    notificationStats.forEach(stat => {
      notifMap[stat._id.toString()] = {
        totalCount: stat.totalCount,
        unreadCount: stat.unreadCount
      };
    });

    // Enhance users with notification data
    const enhancedUsers = users.map(user => ({
      ...user,
      pushEnabled: !!user.fcmToken,
      platform: user.currentSession?.device?.platform || null,
      notificationCount: notifMap[user._id.toString()]?.totalCount || 0,
      unreadNotificationCount: notifMap[user._id.toString()]?.unreadCount || 0
    }));

    res.status(200).json({
      success: true,
      data: enhancedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get single user by ID with detailed information
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-otp -otpExpiresAt')
      .populate('addresses')
      .populate('favorites');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's order statistics
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: orderStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          completedOrders: 0,
          cancelledOrders: 0
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, email, mobile, role, isVerified } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (role !== undefined) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-otp -otpExpiresAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (soft delete by deactivating)
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active orders
    const activeOrders = await Order.countDocuments({
      user: user._id,
      status: { $in: ['pending', 'confirmed', 'processing', 'out_for_delivery'] }
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${activeOrders} active order(s). Please complete or cancel them first.`
      });
    }

    // Actually delete the user (you can implement soft delete if needed)
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Change user role
// @access  Admin
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-otp -otpExpiresAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role changed to ${role} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing user role',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users/stats/overview
// @desc    Get user statistics overview
// @access  Admin
router.get('/stats/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get active users (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastActiveAt: { $gte: oneDayAgo }
    });

    // Get new users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        activeUsers24h: activeUsers,
        newUsersLast7Days: newUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

module.exports = router;
