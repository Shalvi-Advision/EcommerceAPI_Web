const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import admin sub-routes
const userAdminRoutes = require('./admin/users');
const productAdminRoutes = require('./admin/products');
const orderAdminRoutes = require('./admin/orders');
const dashboardAdminRoutes = require('./admin/dashboard');
const categoryAdminRoutes = require('./admin/categories');
const contentAdminRoutes = require('./admin/content');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Mount admin sub-routes
router.use('/users', userAdminRoutes);
router.use('/products', productAdminRoutes);
router.use('/orders', orderAdminRoutes);
router.use('/dashboard', dashboardAdminRoutes);
router.use('/categories', categoryAdminRoutes);
router.use('/content', contentAdminRoutes);

module.exports = router;
