const express = require('express');
const router = express.Router();
const Pincode = require('../models/Pincode');

/**
 * @route   GET /api/pincodes
 * @desc    Get all pincodes
 * @access  Public
 * @query   ?enabled=true - Filter only enabled pincodes
 * @query   ?page=1&limit=10 - Pagination
 * @query   ?search=421 - Search pincodes
 */
router.get('/', async (req, res, next) => {
  try {
    const { enabled, page = 1, limit = 50, search } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by enabled status
    if (enabled === 'true') {
      query.is_enabled = 'Enabled';
    } else if (enabled === 'false') {
      query.is_enabled = 'Disabled';
    }
    
    // Search by pincode
    if (search) {
      query.pincode = { $regex: search, $options: 'i' };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const pincodes = await Pincode.find(query)
      .sort({ pincode: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Pincode.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: pincodes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: pincodes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/pincodes/enabled/list
 * @desc    Get all enabled pincodes (optimized for dropdown/autocomplete)
 * @access  Public
 */
router.get('/enabled/list', async (req, res, next) => {
  try {
    const pincodes = await Pincode.findEnabled();
    
    // Return simplified data for frontend dropdowns
    const pincodeList = pincodes.map(p => ({
      id: p._id,
      pincode: p.pincode,
      idpincode_master: p.idpincode_master
    }));
    
    res.status(200).json({
      success: true,
      count: pincodeList.length,
      data: pincodeList
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/pincodes/check-availability
 * @desc    Check if a pincode is available/serviceable (POST method)
 * @access  Public
 * @body    { "pincode": "421002" }
 */
router.post('/check-availability', async (req, res, next) => {
  try {
    const { pincode } = req.body;
    
    // Validate pincode is provided
    if (!pincode) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a pincode'
      });
    }
    
    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 6-digit pincode'
      });
    }
    
    // Check if pincode exists and is enabled
    const pincodeData = await Pincode.isServiceable(pincode);
    
    if (!pincodeData) {
      return res.status(200).json({
        success: true,
        available: false,
        serviceable: false,
        message: 'Sorry, we do not deliver to this pincode yet',
        pincode: pincode
      });
    }
    
    res.status(200).json({
      success: true,
      available: true,
      serviceable: true,
      message: 'Great! We deliver to this pincode',
      pincode: pincode,
      data: {
        id: pincodeData._id,
        pincode: pincodeData.pincode,
        idpincode_master: pincodeData.idpincode_master,
        is_enabled: pincodeData.is_enabled
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

