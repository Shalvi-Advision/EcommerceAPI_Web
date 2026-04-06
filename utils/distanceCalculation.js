const https = require('https');
const http = require('http');

/**
 * Calculate Haversine distance between two coordinates.
 * Always available as the last-resort fallback.
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees) => degrees * (Math.PI / 180);

/**
 * Get road distance from OSRM (Open Source Routing Machine).
 * Free, no API key required. Returns actual driving distance.
 * @returns {Promise<{distance: number, duration: number, isRoadDistance: boolean}>}
 */
const getOSRMDistance = (lat1, lon1, lat2, lon2, timeoutMs = 8000) => {
  return new Promise((resolve, reject) => {
    // OSRM expects lon,lat order
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.code === 'Ok' && parsed.routes && parsed.routes.length > 0) {
            const route = parsed.routes[0];
            resolve({
              distance: route.distance / 1000, // meters to km
              duration: route.duration / 60,    // seconds to minutes
              isRoadDistance: true
            });
          } else {
            reject(new Error('No route found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('OSRM request timed out'));
    });
  });
};

/**
 * Calculate distance with three-tier fallback:
 * 1. OSRM road distance (accurate driving distance)
 * 2. Haversine straight-line distance (always works)
 *
 * @param {number} lat1 - Origin latitude
 * @param {number} lon1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lon2 - Destination longitude
 * @returns {Promise<{distance: number, duration: number, isRoadDistance: boolean}>}
 */
const calculateDistance = async (lat1, lon1, lat2, lon2) => {
  // Validate coordinates
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error('Invalid coordinates provided');
  }

  // Tier 1: Try OSRM road distance
  try {
    const result = await getOSRMDistance(lat1, lon1, lat2, lon2);
    console.log(`[Distance] OSRM road distance: ${result.distance.toFixed(2)} km`);
    return result;
  } catch (osrmError) {
    console.warn(`[Distance] OSRM failed: ${osrmError.message}, falling back to Haversine`);
  }

  // Tier 2: Haversine straight-line distance
  const distance = haversineDistance(lat1, lon1, lat2, lon2);
  const duration = (distance / 30) * 60; // Estimate: 30 km/h average city speed
  console.log(`[Distance] Haversine straight-line distance: ${distance.toFixed(2)} km`);

  return {
    distance,
    duration,
    isRoadDistance: false
  };
};

const isValidCoordinate = (lat, lon) => {
  return (
    typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90 &&
    typeof lon === 'number' && !isNaN(lon) && lon >= -180 && lon <= 180 &&
    !(lat === 0 && lon === 0)
  );
};

/**
 * Calculate delivery charges based on distance and order amount.
 * Business rules:
 * - Free delivery for orders above a threshold (configurable per store, default ₹500)
 * - Distance-based tiers for delivery fee
 *
 * @param {number} distanceKm - Distance in km
 * @param {number} orderAmount - Order total in ₹
 * @param {object} storeConfig - Store-specific delivery config (optional)
 * @returns {{deliveryCharge: number, freeDeliveryEligible: boolean, reason: string}}
 */
const calculateDeliveryCharge = (distanceKm, orderAmount, storeConfig = {}) => {
  const {
    free_delivery_threshold = 6000,  // Free delivery above this order amount
    free_delivery_radius_km = 0,     // Free delivery within this radius (0 = disabled)
    max_delivery_radius_km = 50,     // Max delivery distance
    base_charge = 30,                // Base delivery fee
    per_km_charge = 5,               // Per km charge after base distance
    base_distance_km = 3             // Distance covered by base charge
  } = storeConfig;

  // Beyond max delivery radius
  if (distanceKm > max_delivery_radius_km) {
    return {
      deliveryCharge: -1,
      freeDeliveryEligible: false,
      reason: `Delivery not available beyond ${max_delivery_radius_km} km`
    };
  }

  // Free delivery for high-value orders
  if (orderAmount >= free_delivery_threshold) {
    return {
      deliveryCharge: 0,
      freeDeliveryEligible: true,
      reason: `Free delivery for orders above ₹${free_delivery_threshold}`
    };
  }

  // Free delivery within radius
  if (distanceKm <= free_delivery_radius_km) {
    return {
      deliveryCharge: 0,
      freeDeliveryEligible: true,
      reason: `Free delivery within ${free_delivery_radius_km} km`
    };
  }

  // Calculate distance-based charge
  const extraDistance = Math.max(0, distanceKm - base_distance_km);
  const charge = Math.round(base_charge + (extraDistance * per_km_charge));

  return {
    deliveryCharge: charge,
    freeDeliveryEligible: false,
    reason: `₹${base_charge} base + ₹${per_km_charge}/km for ${extraDistance.toFixed(1)} km extra`
  };
};

module.exports = {
  calculateDistance,
  calculateDeliveryCharge,
  haversineDistance,
  isValidCoordinate
};
