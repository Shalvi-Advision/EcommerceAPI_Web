const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/favorites/add-to-favorites
 * @desc    Add a product to user's favorites
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001", "p_code": "2390" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/add-to-favorites', protect, async (req, res, next) => {
  try {
    const { store_code, project_code, p_code } = req.body;

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

    if (!p_code || p_code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'p_code is required'
      });
    }

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Check if product is already in favorites
    const existingFavorite = await Favorite.isFavorited(userMobile, p_code.trim(), store_code.trim());

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Product is already in favorites'
      });
    }

    // Create new favorite
    const newFavorite = new Favorite({
      mobile_no: userMobile,
      p_code: p_code.trim(),
      store_code: store_code.trim()
    });

    const savedFavorite = await newFavorite.save();

    res.status(201).json({
      success: true,
      message: 'Product added to favorites successfully',
      store_code: store_code.trim(),
      project_code: project_code,
      data: {
        id: savedFavorite._id,
        mobile_no: savedFavorite.mobile_no,
        p_code: savedFavorite.p_code,
        store_code: savedFavorite.store_code,
        createdAt: savedFavorite.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        error: 'Product is already in favorites'
      });
    }
    next(error);
  }
});

/**
 * @route   DELETE /api/favorites/remove-from-favorites
 * @desc    Remove a product from user's favorites
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001", "p_code": "2390" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.delete('/remove-from-favorites', protect, async (req, res, next) => {
  try {
    const { store_code, project_code, p_code } = req.body;

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

    if (!p_code || p_code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'p_code is required'
      });
    }

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Remove favorite
    const removedFavorite = await Favorite.removeFavorite(userMobile, p_code.trim(), store_code.trim());

    if (!removedFavorite) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in favorites'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from favorites successfully',
      store_code: store_code.trim(),
      project_code: project_code,
      data: {
        mobile_no: removedFavorite.mobile_no,
        p_code: removedFavorite.p_code,
        store_code: removedFavorite.store_code,
        removedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/favorites/get-favorites
 * @desc    Get all favorites for the authenticated user
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/get-favorites', protect, async (req, res, next) => {
  try {
    const { store_code, project_code } = req.body;

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

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Find favorites for the user
    const favorites = await Favorite.findByMobile(userMobile);

    if (!favorites || favorites.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No favorites found for mobile number: ${userMobile}`,
        store_code: store_code.trim(),
        project_code: project_code,
        mobile_no: userMobile,
        data: []
      });
    }

    // Format response data
    const favoritesData = favorites.map(favorite => ({
      id: favorite._id,
      mobile_no: favorite.mobile_no,
      p_code: favorite.p_code,
      store_code: favorite.store_code,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: favoritesData.length,
      message: `Found ${favoritesData.length} favorite(s) for mobile number: ${userMobile}`,
      store_code: store_code.trim(),
      project_code: project_code,
      mobile_no: userMobile,
      data: favoritesData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/favorites/get-favorites-by-store
 * @desc    Get favorites for the authenticated user in a specific store
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/get-favorites-by-store', protect, async (req, res, next) => {
  try {
    const { store_code, project_code } = req.body;

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

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Find favorites for the user in the specific store
    const favorites = await Favorite.findByMobileAndStore(userMobile, store_code.trim());

    if (!favorites || favorites.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No favorites found for mobile number: ${userMobile} in store: ${store_code.trim()}`,
        store_code: store_code.trim(),
        project_code: project_code,
        mobile_no: userMobile,
        data: []
      });
    }

    // Format response data
    const favoritesData = favorites.map(favorite => ({
      id: favorite._id,
      mobile_no: favorite.mobile_no,
      p_code: favorite.p_code,
      store_code: favorite.store_code,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: favoritesData.length,
      message: `Found ${favoritesData.length} favorite(s) for mobile number: ${userMobile} in store: ${store_code.trim()}`,
      store_code: store_code.trim(),
      project_code: project_code,
      mobile_no: userMobile,
      data: favoritesData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/favorites/is-favorited
 * @desc    Check if a product is favorited by the authenticated user
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001", "p_code": "2390" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/is-favorited', protect, async (req, res, next) => {
  try {
    const { store_code, project_code, p_code } = req.body;

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

    if (!p_code || p_code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'p_code is required'
      });
    }

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Check if product is favorited
    const favorite = await Favorite.isFavorited(userMobile, p_code.trim(), store_code.trim());

    res.status(200).json({
      success: true,
      message: favorite ? 'Product is favorited' : 'Product is not favorited',
      store_code: store_code.trim(),
      project_code: project_code,
      mobile_no: userMobile,
      p_code: p_code.trim(),
      isFavorited: !!favorite,
      data: favorite ? {
        id: favorite._id,
        mobile_no: favorite.mobile_no,
        p_code: favorite.p_code,
        store_code: favorite.store_code,
        createdAt: favorite.createdAt
      } : null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/favorites
 * @desc    Get all favorites (for testing purposes)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const favorites = await Favorite.find().sort({ createdAt: -1 });

    if (!favorites || favorites.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No favorites found',
        data: []
      });
    }

    const favoritesData = favorites.map(favorite => ({
      id: favorite._id,
      mobile_no: favorite.mobile_no,
      p_code: favorite.p_code,
      store_code: favorite.store_code,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: favoritesData.length,
      message: `Found ${favoritesData.length} favorite(s)`,
      data: favoritesData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
