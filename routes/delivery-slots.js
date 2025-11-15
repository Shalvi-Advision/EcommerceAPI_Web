const express = require('express');
const router = express.Router();
const DeliverySlot = require('../models/DeliverySlot');

/**
 * @route   POST /api/delivery-slots/get-delivery-slots
 * @desc    Get delivery slots by store_code and project_code (includes both active and inactive)
 * @access  Public
 * @body    { "store_code": "KALYANEAST", "project_code": "PROJ001" }
 * @response Returns delivery slots with is_active field indicating status ("yes" or "no")
 */
router.post('/get-delivery-slots', async (req, res, next) => {
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
    
    // Find delivery slots for the specific store code
    const deliverySlots = await DeliverySlot.findByStoreCode(store_code.trim());
    
    if (!deliverySlots || deliverySlots.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No delivery slots found for store_code: ${store_code.trim()} and project_code: ${project_code}`,
        store_code: store_code.trim(),
        project_code: project_code,
        data: []
      });
    }
    
    // Format response data
    const deliverySlotsData = deliverySlots.map(slot => ({
      id: slot._id,
      iddelivery_slot: slot.iddelivery_slot,
      delivery_slot_from: slot.delivery_slot_from,
      delivery_slot_to: slot.delivery_slot_to,
      store_code: slot.store_code,
      is_active: slot.is_active
    }));
    
    res.status(200).json({
      success: true,
      count: deliverySlotsData.length,
      message: `Found ${deliverySlotsData.length} delivery slot(s) for store_code: ${store_code.trim()} and project_code: ${project_code}`,
      store_code: store_code.trim(),
      project_code: project_code,
      data: deliverySlotsData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/delivery-slots
 * @desc    Get all delivery slots (includes both active and inactive)
 * @access  Public
 * @response Returns delivery slots with is_active field indicating status ("yes" or "no")
 */
router.get('/', async (req, res, next) => {
  try {
    const deliverySlots = await DeliverySlot.findAllSorted();
    
    if (!deliverySlots || deliverySlots.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No delivery slots found',
        data: []
      });
    }
    
    // Format response data
    const deliverySlotsData = deliverySlots.map(slot => ({
      id: slot._id,
      iddelivery_slot: slot.iddelivery_slot,
      delivery_slot_from: slot.delivery_slot_from,
      delivery_slot_to: slot.delivery_slot_to,
      store_code: slot.store_code,
      is_active: slot.is_active
    }));
    
    res.status(200).json({
      success: true,
      count: deliverySlotsData.length,
      message: `Found ${deliverySlotsData.length} delivery slot(s)`,
      data: deliverySlotsData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/delivery-slots/active/:storeCode
 * @desc    Get only active delivery slots for a specific store
 * @access  Public
 */
router.get('/active/:storeCode', async (req, res, next) => {
  try {
    const { storeCode } = req.params;
    
    if (!storeCode || storeCode.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Store code is required'
      });
    }
    
    const deliverySlots = await DeliverySlot.findActiveByStoreCode(storeCode.trim());
    
    if (!deliverySlots || deliverySlots.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No active delivery slots found for store_code: ${storeCode.trim()}`,
        store_code: storeCode.trim(),
        data: []
      });
    }
    
    // Format response data
    const deliverySlotsData = deliverySlots.map(slot => ({
      id: slot._id,
      iddelivery_slot: slot.iddelivery_slot,
      delivery_slot_from: slot.delivery_slot_from,
      delivery_slot_to: slot.delivery_slot_to,
      store_code: slot.store_code,
      is_active: slot.is_active
    }));
    
    res.status(200).json({
      success: true,
      count: deliverySlotsData.length,
      message: `Found ${deliverySlotsData.length} active delivery slot(s) for store_code: ${storeCode.trim()}`,
      store_code: storeCode.trim(),
      data: deliverySlotsData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
