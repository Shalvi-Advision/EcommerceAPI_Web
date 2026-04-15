const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { requireSuperAdmin } = require('../../middleware/checkPermission');

// All routes in this file require super admin access
router.use(requireSuperAdmin);

// Valid permission sections and actions
const VALID_SECTIONS = ['dashboard', 'users', 'orders', 'notifications', 'ecommerce', 'outlet', 'dynamicSection'];
const VALID_ACTIONS = ['view', 'create', 'edit', 'delete'];
const DASHBOARD_ACTIONS = ['view']; // Dashboard only supports view

// @route   GET /api/admin/permissions/admins
// @desc    List all admin users with their permissions
// @access  Super Admin
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('name email mobile role isSuperAdmin permissions createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin users',
      error: error.message
    });
  }
});

// @route   GET /api/admin/permissions/admins/:id
// @desc    Get a specific admin's permissions
// @access  Super Admin
router.get('/admins/:id', async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'admin' })
      .select('name email mobile role isSuperAdmin permissions');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin permissions',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/permissions/admins/:id
// @desc    Update an admin's permissions
// @access  Super Admin
router.put('/admins/:id', async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'permissions object is required'
      });
    }

    // Prevent super admin from removing their own isSuperAdmin
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own permissions'
      });
    }

    const admin = await User.findOne({ _id: req.params.id, role: 'admin' });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Validate and apply permissions
    for (const section of VALID_SECTIONS) {
      if (permissions[section]) {
        const allowedActions = section === 'dashboard' ? DASHBOARD_ACTIONS : VALID_ACTIONS;
        for (const action of allowedActions) {
          if (typeof permissions[section][action] === 'boolean') {
            admin.permissions[section][action] = permissions[section][action];
          }
        }
      }
    }

    admin.markModified('permissions');
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      data: {
        id: admin._id,
        name: admin.name,
        mobile: admin.mobile,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: error.message
    });
  }
});

module.exports = router;
