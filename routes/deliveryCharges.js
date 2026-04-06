const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const { calculateDistance, calculateDeliveryCharge, isValidCoordinate } = require('../utils/distanceCalculation');

// @route   POST /api/delivery-charges/calculate
// @desc    Calculate delivery distance and charges
// @access  Public
router.post('/calculate', async (req, res) => {
  try {
    const {
      store_code,
      address_latitude,
      address_longitude,
      order_amount = 0
    } = req.body;

    // Validate required fields
    if (!store_code) {
      return res.status(400).json({
        success: false,
        error: 'store_code is required'
      });
    }

    const addrLat = parseFloat(address_latitude);
    const addrLon = parseFloat(address_longitude);

    if (!isValidCoordinate(addrLat, addrLon)) {
      return res.status(400).json({
        success: false,
        error: 'Valid address coordinates (address_latitude, address_longitude) are required'
      });
    }

    // Get store coordinates from DB
    const store = await Store.findOne({ store_code: store_code.trim() }).lean();

    if (!store) {
      return res.status(404).json({
        success: false,
        error: `Store not found: ${store_code}`
      });
    }

    const storeLat = parseFloat(store.latitude);
    const storeLon = parseFloat(store.longitude);

    if (!isValidCoordinate(storeLat, storeLon)) {
      return res.status(400).json({
        success: false,
        error: 'Store does not have valid coordinates configured'
      });
    }

    // Calculate distance (OSRM road distance with Haversine fallback)
    const distanceResult = await calculateDistance(addrLat, addrLon, storeLat, storeLon);

    // Build store delivery config from store data (use defaults if not set)
    const storeConfig = {
      free_delivery_threshold: store.free_delivery_threshold || 6000,
      free_delivery_radius_km: store.free_delivery_radius_km || 0,
      max_delivery_radius_km: store.max_delivery_radius_km || 50,
      base_charge: store.delivery_base_charge || 30,
      per_km_charge: store.delivery_per_km_charge || 5,
      base_distance_km: store.delivery_base_distance_km || 3
    };

    // Calculate delivery charge
    const chargeResult = calculateDeliveryCharge(
      distanceResult.distance,
      parseFloat(order_amount) || 0,
      storeConfig
    );

    // Check if delivery is not available (beyond max radius)
    if (chargeResult.deliveryCharge === -1) {
      return res.status(200).json({
        success: true,
        data: {
          delivery_available: false,
          distance_km: parseFloat(distanceResult.distance.toFixed(1)),
          duration_minutes: parseFloat(distanceResult.duration.toFixed(0)),
          is_road_distance: distanceResult.isRoadDistance,
          delivery_charge: 0,
          free_delivery: false,
          reason: chargeResult.reason
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        delivery_available: true,
        distance_km: parseFloat(distanceResult.distance.toFixed(1)),
        duration_minutes: parseFloat(distanceResult.duration.toFixed(0)),
        is_road_distance: distanceResult.isRoadDistance,
        delivery_charge: chargeResult.deliveryCharge,
        free_delivery: chargeResult.freeDeliveryEligible,
        reason: chargeResult.reason,
        store_coordinates: {
          latitude: storeLat,
          longitude: storeLon
        }
      }
    });
  } catch (error) {
    console.error('Delivery charges calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate delivery charges',
      message: error.message
    });
  }
});

module.exports = router;
