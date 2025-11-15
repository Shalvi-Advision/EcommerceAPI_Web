const express = require('express');
const router = express.Router();
const BestSeller = require('../../models/BestSeller');
const Advertisement = require('../../models/Advertisement');
const PopularCategory = require('../../models/PopularCategory');
const SeasonalCategory = require('../../models/SeasonalCategory');
const PaymentMode = require('../../models/PaymentMode');
const Pincode = require('../../models/Pincode');
const Store = require('../../models/Store');
const DeliverySlot = require('../../models/DeliverySlot');
const Banner = require('../../models/Banner');

// ==================== BEST SELLERS MANAGEMENT ====================

// @route   GET /api/admin/content/best-sellers
// @desc    Get all best sellers
// @access  Admin
router.get('/best-sellers', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'sequence',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bestSellers = await BestSeller.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await BestSeller.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bestSellers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get best sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching best sellers',
      error: error.message
    });
  }
});

// @route   GET /api/admin/content/best-sellers/:id
// @desc    Get single best seller by ID
// @access  Admin
router.get('/best-sellers/:id', async (req, res) => {
  try {
    const bestSeller = await BestSeller.findById(req.params.id);

    if (!bestSeller) {
      return res.status(404).json({
        success: false,
        message: 'Best seller not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bestSeller
    });
  } catch (error) {
    console.error('Get best seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching best seller',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/best-sellers
// @desc    Create best seller
// @access  Admin
router.post('/best-sellers', async (req, res) => {
  try {
    const bestSeller = await BestSeller.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Best seller created successfully',
      data: bestSeller
    });
  } catch (error) {
    console.error('Create best seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating best seller',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/best-sellers/:id
// @desc    Update best seller
// @access  Admin
router.put('/best-sellers/:id', async (req, res) => {
  try {
    const bestSeller = await BestSeller.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!bestSeller) {
      return res.status(404).json({
        success: false,
        message: 'Best seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Best seller updated successfully',
      data: bestSeller
    });
  } catch (error) {
    console.error('Update best seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating best seller',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/best-sellers/:id
// @desc    Delete best seller
// @access  Admin
router.delete('/best-sellers/:id', async (req, res) => {
  try {
    const bestSeller = await BestSeller.findByIdAndDelete(req.params.id);

    if (!bestSeller) {
      return res.status(404).json({
        success: false,
        message: 'Best seller not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Best seller deleted successfully'
    });
  } catch (error) {
    console.error('Delete best seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting best seller',
      error: error.message
    });
  }
});

// ==================== ADVERTISEMENTS MANAGEMENT ====================

// @route   GET /api/admin/content/advertisements
// @desc    Get all advertisements
// @access  Admin
router.get('/advertisements', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'sequence',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const advertisements = await Advertisement.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Advertisement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: advertisements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get advertisements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisements',
      error: error.message
    });
  }
});

// @route   GET /api/admin/content/advertisements/:id
// @desc    Get single advertisement by ID
// @access  Admin
router.get('/advertisements/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: advertisement
    });
  } catch (error) {
    console.error('Get advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advertisement',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/advertisements
// @desc    Create advertisement
// @access  Admin
router.post('/advertisements', async (req, res) => {
  try {
    const advertisement = await Advertisement.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: advertisement
    });
  } catch (error) {
    console.error('Create advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating advertisement',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/advertisements/:id
// @desc    Update advertisement
// @access  Admin
router.put('/advertisements/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement updated successfully',
      data: advertisement
    });
  } catch (error) {
    console.error('Update advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating advertisement',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/advertisements/:id
// @desc    Delete advertisement
// @access  Admin
router.delete('/advertisements/:id', async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Delete advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting advertisement',
      error: error.message
    });
  }
});

// ==================== POPULAR CATEGORIES MANAGEMENT ====================

// @route   GET /api/admin/content/popular-categories
// @desc    Get all popular categories
// @access  Admin
router.get('/popular-categories', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'sequence',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const popularCategories = await PopularCategory.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await PopularCategory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: popularCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get popular categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular categories',
      error: error.message
    });
  }
});

// @route   GET /api/admin/content/popular-categories/:id
// @desc    Get single popular category by ID
// @access  Admin
router.get('/popular-categories/:id', async (req, res) => {
  try {
    const popularCategory = await PopularCategory.findById(req.params.id);

    if (!popularCategory) {
      return res.status(404).json({
        success: false,
        message: 'Popular category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: popularCategory
    });
  } catch (error) {
    console.error('Get popular category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular category',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/popular-categories
// @desc    Create popular category
// @access  Admin
router.post('/popular-categories', async (req, res) => {
  try {
    const popularCategory = await PopularCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Popular category created successfully',
      data: popularCategory
    });
  } catch (error) {
    console.error('Create popular category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating popular category',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/popular-categories/:id
// @desc    Update popular category
// @access  Admin
router.put('/popular-categories/:id', async (req, res) => {
  try {
    const popularCategory = await PopularCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!popularCategory) {
      return res.status(404).json({
        success: false,
        message: 'Popular category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Popular category updated successfully',
      data: popularCategory
    });
  } catch (error) {
    console.error('Update popular category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating popular category',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/popular-categories/:id
// @desc    Delete popular category
// @access  Admin
router.delete('/popular-categories/:id', async (req, res) => {
  try {
    const popularCategory = await PopularCategory.findByIdAndDelete(req.params.id);

    if (!popularCategory) {
      return res.status(404).json({
        success: false,
        message: 'Popular category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Popular category deleted successfully'
    });
  } catch (error) {
    console.error('Delete popular category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting popular category',
      error: error.message
    });
  }
});

// ==================== SEASONAL CATEGORIES MANAGEMENT ====================

// @route   GET /api/admin/content/seasonal-categories
// @desc    Get all seasonal categories
// @access  Admin
router.get('/seasonal-categories', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'sequence',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const seasonalCategories = await SeasonalCategory.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SeasonalCategory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: seasonalCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get seasonal categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seasonal categories',
      error: error.message
    });
  }
});

// @route   GET /api/admin/content/seasonal-categories/:id
// @desc    Get single seasonal category by ID
// @access  Admin
router.get('/seasonal-categories/:id', async (req, res) => {
  try {
    const seasonalCategory = await SeasonalCategory.findById(req.params.id);

    if (!seasonalCategory) {
      return res.status(404).json({
        success: false,
        message: 'Seasonal category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: seasonalCategory
    });
  } catch (error) {
    console.error('Get seasonal category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seasonal category',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/seasonal-categories
// @desc    Create seasonal category
// @access  Admin
router.post('/seasonal-categories', async (req, res) => {
  try {
    const seasonalCategory = await SeasonalCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Seasonal category created successfully',
      data: seasonalCategory
    });
  } catch (error) {
    console.error('Create seasonal category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating seasonal category',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/seasonal-categories/:id
// @desc    Update seasonal category
// @access  Admin
router.put('/seasonal-categories/:id', async (req, res) => {
  try {
    const seasonalCategory = await SeasonalCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!seasonalCategory) {
      return res.status(404).json({
        success: false,
        message: 'Seasonal category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seasonal category updated successfully',
      data: seasonalCategory
    });
  } catch (error) {
    console.error('Update seasonal category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating seasonal category',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/seasonal-categories/:id
// @desc    Delete seasonal category
// @access  Admin
router.delete('/seasonal-categories/:id', async (req, res) => {
  try {
    const seasonalCategory = await SeasonalCategory.findByIdAndDelete(req.params.id);

    if (!seasonalCategory) {
      return res.status(404).json({
        success: false,
        message: 'Seasonal category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seasonal category deleted successfully'
    });
  } catch (error) {
    console.error('Delete seasonal category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting seasonal category',
      error: error.message
    });
  }
});

// ==================== PAYMENT MODES MANAGEMENT ====================

// @route   GET /api/admin/content/payment-modes
// @desc    Get all payment modes
// @access  Admin
router.get('/payment-modes', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'sequence_id',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paymentModes = await PaymentMode.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await PaymentMode.countDocuments(query);

    res.status(200).json({
      success: true,
      data: paymentModes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get payment modes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment modes',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/payment-modes
// @desc    Create payment mode
// @access  Admin
router.post('/payment-modes', async (req, res) => {
  try {
    const paymentMode = await PaymentMode.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Payment mode created successfully',
      data: paymentMode
    });
  } catch (error) {
    console.error('Create payment mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment mode',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/payment-modes/:id
// @desc    Update payment mode
// @access  Admin
router.put('/payment-modes/:id', async (req, res) => {
  try {
    const paymentMode = await PaymentMode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!paymentMode) {
      return res.status(404).json({
        success: false,
        message: 'Payment mode not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment mode updated successfully',
      data: paymentMode
    });
  } catch (error) {
    console.error('Update payment mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment mode',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/payment-modes/:id
// @desc    Delete payment mode
// @access  Admin
router.delete('/payment-modes/:id', async (req, res) => {
  try {
    const paymentMode = await PaymentMode.findByIdAndDelete(req.params.id);

    if (!paymentMode) {
      return res.status(404).json({
        success: false,
        message: 'Payment mode not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment mode deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment mode',
      error: error.message
    });
  }
});

// ==================== PINCODES MANAGEMENT ====================

// @route   GET /api/admin/content/pincodes
// @desc    Get all pincodes
// @access  Admin
router.get('/pincodes', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'pincode',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { pincode: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pincodes = await Pincode.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Pincode.countDocuments(query);

    res.status(200).json({
      success: true,
      data: pincodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get pincodes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pincodes',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/pincodes
// @desc    Create pincode
// @access  Admin
router.post('/pincodes', async (req, res) => {
  try {
    const pincode = await Pincode.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Pincode created successfully',
      data: pincode
    });
  } catch (error) {
    console.error('Create pincode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating pincode',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/pincodes/:id
// @desc    Update pincode
// @access  Admin
router.put('/pincodes/:id', async (req, res) => {
  try {
    const pincode = await Pincode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pincode) {
      return res.status(404).json({
        success: false,
        message: 'Pincode not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pincode updated successfully',
      data: pincode
    });
  } catch (error) {
    console.error('Update pincode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pincode',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/pincodes/:id
// @desc    Delete pincode
// @access  Admin
router.delete('/pincodes/:id', async (req, res) => {
  try {
    const pincode = await Pincode.findByIdAndDelete(req.params.id);

    if (!pincode) {
      return res.status(404).json({
        success: false,
        message: 'Pincode not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pincode deleted successfully'
    });
  } catch (error) {
    console.error('Delete pincode error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pincode',
      error: error.message
    });
  }
});

// ==================== STORES MANAGEMENT ====================

// @route   GET /api/admin/content/stores/codes
// @desc    Get all unique store codes with store names
// @access  Admin
router.get('/stores/codes', async (req, res) => {
  try {
    const stores = await Store.find({ is_enabled: 'Enabled' })
      .select('store_code mobile_outlet_name')
      .sort({ store_code: 1 });

    // Get unique store codes (use Map to deduplicate)
    const storeCodesMap = new Map();
    stores.forEach(store => {
      if (!storeCodesMap.has(store.store_code)) {
        storeCodesMap.set(store.store_code, {
          store_code: store.store_code,
          store_name: store.mobile_outlet_name
        });
      }
    });

    const storeCodes = Array.from(storeCodesMap.values());

    res.status(200).json({
      success: true,
      data: storeCodes
    });
  } catch (error) {
    console.error('Get store codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching store codes',
      error: error.message
    });
  }
});

// @route   GET /api/admin/content/stores
// @desc    Get all stores
// @access  Admin
router.get('/stores', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'store_code',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { store_code: { $regex: search, $options: 'i' } },
        { store_name: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const stores = await Store.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      data: stores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stores',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/stores
// @desc    Create store
// @access  Admin
router.post('/stores', async (req, res) => {
  try {
    const store = await Store.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating store',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/stores/:id
// @desc    Update store
// @access  Admin
router.put('/stores/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: store
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating store',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/stores/:id
// @desc    Delete store
// @access  Admin
router.delete('/stores/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting store',
      error: error.message
    });
  }
});

// ==================== DELIVERY SLOTS MANAGEMENT ====================

// @route   GET /api/admin/content/delivery-slots
// @desc    Get all delivery slots
// @access  Admin
router.get('/delivery-slots', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'sequence_id',
      sortOrder = 'asc'
    } = req.query;

    const query = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const deliverySlots = await DeliverySlot.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await DeliverySlot.countDocuments(query);

    res.status(200).json({
      success: true,
      data: deliverySlots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get delivery slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery slots',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/delivery-slots
// @desc    Create delivery slot
// @access  Admin
router.post('/delivery-slots', async (req, res) => {
  try {
    const deliverySlot = await DeliverySlot.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Delivery slot created successfully',
      data: deliverySlot
    });
  } catch (error) {
    console.error('Create delivery slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery slot',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/delivery-slots/:id
// @desc    Update delivery slot
// @access  Admin
router.put('/delivery-slots/:id', async (req, res) => {
  try {
    const deliverySlot = await DeliverySlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!deliverySlot) {
      return res.status(404).json({
        success: false,
        message: 'Delivery slot not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery slot updated successfully',
      data: deliverySlot
    });
  } catch (error) {
    console.error('Update delivery slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating delivery slot',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/delivery-slots/:id
// @desc    Delete delivery slot
// @access  Admin
router.delete('/delivery-slots/:id', async (req, res) => {
  try {
    const deliverySlot = await DeliverySlot.findByIdAndDelete(req.params.id);

    if (!deliverySlot) {
      return res.status(404).json({
        success: false,
        message: 'Delivery slot not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Delivery slot deleted successfully'
    });
  } catch (error) {
    console.error('Delete delivery slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting delivery slot',
      error: error.message
    });
  }
});

// ==================== BANNERS MANAGEMENT ====================

// @route   GET /api/admin/content/banners
// @desc    Get all banners
// @access  Admin
router.get('/banners', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      section_name = '',
      sortBy = 'sequence',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    if (section_name) {
      query.section_name = section_name;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const banners = await Banner.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Banner.countDocuments(query);

    res.status(200).json({
      success: true,
      data: banners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message
    });
  }
});

// @route   GET /api/admin/content/banners/:id
// @desc    Get single banner by ID
// @access  Admin
router.get('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching banner',
      error: error.message
    });
  }
});

// @route   POST /api/admin/content/banners
// @desc    Create banner
// @access  Admin
router.post('/banners', async (req, res) => {
  try {
    const banner = await Banner.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating banner',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/content/banners/:id
// @desc    Update banner
// @access  Admin
router.put('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating banner',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/content/banners/:id
// @desc    Delete banner
// @access  Admin
router.delete('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message
    });
  }
});

module.exports = router;
