const express = require('express');
const router = express.Router();
const PaymentMode = require('../models/PaymentMode');

/**
 * @route   POST /api/payment-modes/get-payment-modes
 * @desc    Get payment modes by store_code and project_code
 * @access  Public
 * @body    { "store_code": "AVB", "project_code": "PROJ001" }
 */
router.post('/get-payment-modes', async (req, res, next) => {
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
    
    // Find all payment modes (since payment modes are typically global, not store-specific)
    const paymentModes = await PaymentMode.findAllSorted();
    
    if (!paymentModes || paymentModes.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No payment modes found for store_code: ${store_code.trim()} and project_code: ${project_code}`,
        store_code: store_code.trim(),
        project_code: project_code,
        data: []
      });
    }
    
    // Format response data
    const paymentModesData = paymentModes.map(paymentMode => ({
      id: paymentMode._id,
      idpayment_mode: paymentMode.idpayment_mode,
      payment_mode_name: paymentMode.payment_mode_name,
      is_enabled: paymentMode.is_enabled
    }));
    
    res.status(200).json({
      success: true,
      count: paymentModesData.length,
      message: `Found ${paymentModesData.length} payment mode(s) for store_code: ${store_code.trim()} and project_code: ${project_code}`,
      store_code: store_code.trim(),
      project_code: project_code,
      data: paymentModesData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/payment-modes
 * @desc    Get all payment modes
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const paymentModes = await PaymentMode.findAllSorted();
    
    if (!paymentModes || paymentModes.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No payment modes found',
        data: []
      });
    }
    
    // Format response data
    const paymentModesData = paymentModes.map(paymentMode => ({
      id: paymentMode._id,
      idpayment_mode: paymentMode.idpayment_mode,
      payment_mode_name: paymentMode.payment_mode_name,
      is_enabled: paymentMode.is_enabled
    }));
    
    res.status(200).json({
      success: true,
      count: paymentModesData.length,
      message: `Found ${paymentModesData.length} payment mode(s)`,
      data: paymentModesData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/payment-modes/enabled
 * @desc    Get only enabled payment modes
 * @access  Public
 */
router.get('/enabled', async (req, res, next) => {
  try {
    const paymentModes = await PaymentMode.findEnabled();
    
    if (!paymentModes || paymentModes.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No enabled payment modes found',
        data: []
      });
    }
    
    // Format response data
    const paymentModesData = paymentModes.map(paymentMode => ({
      id: paymentMode._id,
      idpayment_mode: paymentMode.idpayment_mode,
      payment_mode_name: paymentMode.payment_mode_name,
      is_enabled: paymentMode.is_enabled
    }));
    
    res.status(200).json({
      success: true,
      count: paymentModesData.length,
      message: `Found ${paymentModesData.length} enabled payment mode(s)`,
      data: paymentModesData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
