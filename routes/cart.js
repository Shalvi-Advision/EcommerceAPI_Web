const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/cart/save-cart
 * @desc    Save/update user's cart with all items
 * @access  Private (requires JWT token)
 * @body    {
 *   "store_code": "AVB",
 *   "project_code": "PROJ001",
 *   "items": [
 *     {
 *       "p_code": "2390",
 *       "product_name": "SABUDANA 250 (N.W.)",
 *       "quantity": 2,
 *       "unit_price": 18,
 *       "total_price": 36,
 *       "package_size": 250,
 *       "package_unit": "GM",
 *       "brand_name": "INDIAN CHASKA",
 *       "pcode_img": "https://example.com/image.jpg",
 *       "store_code": "AVB"
 *     }
 *   ]
 * }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/save-cart', protect, async (req, res, next) => {
  try {
    const { store_code, project_code, items } = req.body;

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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'items array is required and cannot be empty'
      });
    }

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Validate each cart item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.p_code || !item.product_name || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          success: false,
          error: `Item ${i + 1}: p_code, product_name, quantity, and unit_price are required`
        });
      }
      if (item.quantity < 1) {
        return res.status(400).json({
          success: false,
          error: `Item ${i + 1}: quantity must be at least 1`
        });
      }
      if (item.unit_price < 0) {
        return res.status(400).json({
          success: false,
          error: `Item ${i + 1}: unit_price cannot be negative`
        });
      }
      // Recalculate total_price to ensure consistency
      item.total_price = item.quantity * item.unit_price;
      item.store_code = store_code.trim();
    }

    // Calculate totals
    let subtotal = 0;
    let totalQuantity = 0;
    const totalItems = items.length;

    items.forEach(item => {
      subtotal += item.total_price;
      totalQuantity += item.quantity;
    });

    // Save or update cart
    const cart = await Cart.findOneAndUpdate(
      { mobile_no: userMobile },
      {
        mobile_no: userMobile,
        store_code: store_code.trim(),
        project_code: project_code.trim(),
        items: items,
        subtotal: subtotal,
        total_items: totalItems,
        total_quantity: totalQuantity,
        last_updated: new Date()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Cart saved successfully',
      store_code: store_code.trim(),
      project_code: project_code,
      data: {
        mobile_no: cart.mobile_no,
        items_count: cart.total_items,
        total_quantity: cart.total_quantity,
        subtotal: cart.subtotal,
        items: cart.items,
        last_updated: cart.last_updated
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/cart/validate-cart
 * @desc    Validate cart items against current product data, stock, and prices
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/validate-cart', protect, async (req, res, next) => {
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

    // Find user's cart
    const cart = await Cart.findByMobile(userMobile);

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        store_code: store_code.trim(),
        project_code: project_code,
        mobile_no: userMobile,
        validation: {
          valid: true,
          totalItems: 0,
          validItems: 0,
          invalidItems: 0,
          updatedItems: [],
          invalidItems: []
        }
      });
    }

    // Validate cart items
    const validationResults = await cart.validateItems();

    // Determine overall message and status
    let overallMessage = 'Cart validation successful';
    let overallStatus = 'valid';
    
    if (!validationResults.valid) {
      overallStatus = 'invalid';
      if (validationResults.invalidItems.length > 0) {
        const outOfStockCount = validationResults.invalidItems.filter(item => item.actionType === 'out_of_stock').length;
        const insufficientStockCount = validationResults.invalidItems.filter(item => item.actionType === 'insufficient_stock').length;
        
        if (outOfStockCount > 0) {
          overallMessage = `${outOfStockCount} product(s) out of stock`;
        } else if (insufficientStockCount > 0) {
          overallMessage = `${insufficientStockCount} product(s) have insufficient stock`;
        } else {
          overallMessage = `${validationResults.invalidItems.length} product(s) need attention`;
        }
      }
    } else if (validationResults.updatedItems.length > 0) {
      overallStatus = 'price_updated';
      overallMessage = `${validationResults.updatedItems.length} product(s) have price changes`;
    }

    res.status(200).json({
      success: true,
      message: overallMessage,
      status: overallStatus,
      store_code: store_code.trim(),
      project_code: project_code,
      mobile_no: userMobile,
      validation: {
        valid: validationResults.valid,
        totalItems: cart.items.length,
        validItems: validationResults.totalValidItems,
        invalidItems: validationResults.totalInvalidItems,
        updatedItems: validationResults.updatedItems,
        invalidItems: validationResults.invalidItems,
        // Summary for quick frontend checks
        summary: {
          hasPriceChanges: validationResults.updatedItems.length > 0,
          hasStockIssues: validationResults.invalidItems.length > 0,
          hasOutOfStock: validationResults.invalidItems.some(item => item.actionType === 'out_of_stock'),
          requiresAction: !validationResults.valid || validationResults.updatedItems.length > 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/cart/get-cart
 * @desc    Get user's current cart
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/get-cart', protect, async (req, res, next) => {
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

    // Find user's cart
    const cart = await Cart.findByMobile(userMobile);

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Cart is empty',
        store_code: store_code.trim(),
        project_code: project_code,
        mobile_no: userMobile,
        data: {
          items: [],
          subtotal: 0,
          total_items: 0,
          total_quantity: 0,
          last_updated: null
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${cart.total_items} item(s) in cart`,
      store_code: store_code.trim(),
      project_code: project_code,
      mobile_no: userMobile,
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
        total_items: cart.total_items,
        total_quantity: cart.total_quantity,
        last_updated: cart.last_updated
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/cart/clear-cart
 * @desc    Clear user's cart (typically called after successful order)
 * @access  Private (requires JWT token)
 * @body    { "store_code": "AVB", "project_code": "PROJ001" }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/clear-cart', protect, async (req, res, next) => {
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

    // Clear cart
    const clearedCart = await Cart.clearCart(userMobile);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      store_code: store_code.trim(),
      project_code: project_code,
      mobile_no: userMobile,
      data: {
        items: clearedCart.items,
        subtotal: clearedCart.subtotal,
        total_items: clearedCart.total_items,
        total_quantity: clearedCart.total_quantity,
        last_updated: clearedCart.last_updated
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/cart/add-item
 * @desc    Add a single item to cart (alternative to save-cart for incremental updates)
 * @access  Private (requires JWT token)
 * @body    {
 *   "store_code": "AVB",
 *   "project_code": "PROJ001",
 *   "p_code": "2390",
 *   "product_name": "SABUDANA 250 (N.W.)",
 *   "quantity": 2,
 *   "unit_price": 18,
 *   "package_size": 250,
 *   "package_unit": "GM",
 *   "brand_name": "INDIAN CHASKA",
 *   "pcode_img": "https://example.com/image.jpg"
 * }
 * @header  Authorization: Bearer <jwt_token>
 */
router.post('/add-item', protect, async (req, res, next) => {
  try {
    const {
      store_code,
      project_code,
      p_code,
      product_name,
      quantity,
      unit_price,
      package_size,
      package_unit,
      brand_name,
      pcode_img
    } = req.body;

    // Validate required fields
    if (!store_code || !project_code || !p_code || !product_name || !quantity || unit_price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'store_code, project_code, p_code, product_name, quantity, and unit_price are required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'quantity must be at least 1'
      });
    }

    if (unit_price < 0) {
      return res.status(400).json({
        success: false,
        error: 'unit_price cannot be negative'
      });
    }

    // Get mobile number from JWT token
    const userMobile = req.user.mobile;

    // Find or create cart
    let cart = await Cart.findOrCreateByMobile(userMobile, store_code.trim(), project_code.trim());

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.p_code === p_code);

    const totalPrice = quantity * unit_price;

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].unit_price = unit_price;
      cart.items[existingItemIndex].total_price = totalPrice;
      cart.items[existingItemIndex].product_name = product_name;
      cart.items[existingItemIndex].package_size = package_size;
      cart.items[existingItemIndex].package_unit = package_unit;
      cart.items[existingItemIndex].brand_name = brand_name;
      cart.items[existingItemIndex].pcode_img = pcode_img;
    } else {
      // Add new item
      cart.items.push({
        p_code: p_code,
        product_name: product_name,
        quantity: quantity,
        unit_price: unit_price,
        total_price: totalPrice,
        package_size: package_size,
        package_unit: package_unit,
        brand_name: brand_name,
        pcode_img: pcode_img,
        store_code: store_code.trim()
      });
    }

    // Save cart (pre-save middleware will recalculate totals)
    await cart.save();

    res.status(200).json({
      success: true,
      message: existingItemIndex >= 0 ? 'Cart item updated successfully' : 'Item added to cart successfully',
      store_code: store_code.trim(),
      project_code: project_code,
      data: {
        mobile_no: cart.mobile_no,
        items_count: cart.total_items,
        total_quantity: cart.total_quantity,
        subtotal: cart.subtotal,
        added_item: {
          p_code: p_code,
          product_name: product_name,
          quantity: quantity,
          unit_price: unit_price,
          total_price: totalPrice
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/cart
 * @desc    Get all carts (for testing purposes)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const carts = await Cart.find().sort({ last_updated: -1 });

    if (!carts || carts.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No carts found',
        data: []
      });
    }

    const cartsData = carts.map(cart => ({
      mobile_no: cart.mobile_no,
      store_code: cart.store_code,
      project_code: cart.project_code,
      items_count: cart.total_items,
      total_quantity: cart.total_quantity,
      subtotal: cart.subtotal,
      last_updated: cart.last_updated,
      items: cart.items.slice(0, 3) // Show first 3 items only
    }));

    res.status(200).json({
      success: true,
      count: cartsData.length,
      message: `Found ${cartsData.length} cart(s)`,
      data: cartsData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
