const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

/**
 * @route   POST /api/stores/by-pincode
 * @desc    Get all stores by pincode
 * @access  Public
 * @body    { "pincode": "421002" }
 */
router.post('/by-pincode', async (req, res, next) => {
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
    
    // Find stores by pincode (only enabled stores)
    const stores = await Store.findByPincode(pincode);
    
    if (!stores || stores.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No stores found for this pincode',
        pincode: pincode,
        data: []
      });
    }
    
    // Format response data
    const storesData = stores.map(store => ({
      id: store._id,
      pincode: store.pincode,
      store_name: store.mobile_outlet_name,
      store_code: store.store_code,
      address: store.store_address,
      min_order_amount: store.min_order_amount,
      store_open_time: store.store_open_time,
      delivery_time: store.store_delivery_time,
      offer: store.store_offer_name,
      location: {
        latitude: store.latitude,
        longitude: store.longitude
      },
      delivery_options: {
        home_delivery: store.home_delivery === 'yes',
        self_pickup: store.self_pickup === 'yes'
      },
      contact: {
        phone: store.contact_number,
        email: store.email,
        whatsapp: store.whatsappnumber
      },
      message: store.store_message,
      is_enabled: store.is_enabled
    }));
    
    res.status(200).json({
      success: true,
      count: storesData.length,
      message: `Found ${storesData.length} store(s) for pincode ${pincode}`,
      pincode: pincode,
      data: storesData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

