const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Offer = require('../models/Offer');
const Cart = require('../models/Cart');

// @route   GET /api/offers/for-cart
// @desc    Get applicable offers (cart discounts + product deals) for the user's current cart
// @access  Private (authenticated user)
router.get('/for-cart', protect, async (req, res) => {
  try {
    const { store_code, cart_total } = req.query;

    // Use client-provided cart total if available, otherwise read from DB
    let cartSubtotal = 0;
    if (cart_total !== undefined && cart_total !== '') {
      cartSubtotal = parseFloat(cart_total) || 0;
    } else {
      const cart = await Cart.findOne({ mobile_no: req.user.mobile });
      cartSubtotal = cart ? cart.subtotal : 0;
    }

    // Get active offers (global + store-specific)
    const now = new Date();
    const query = {
      is_active: true,
      valid_from: { $lte: now },
      $or: [
        { valid_until: null },
        { valid_until: { $gte: now } }
      ]
    };

    if (store_code) {
      query.$and = [
        { $or: [{ store_codes: { $size: 0 } }, { store_codes: store_code }] }
      ];
    }

    const offers = await Offer.find(query).sort({ min_cart_value: 1, priority: 1 });

    // Partition by offer type
    const cartDiscountOffers = offers.filter(o => (o.offer_type || 'cart_discount') === 'cart_discount');
    const productDealOffers = offers.filter(o => o.offer_type === 'product_deal');

    // --- Cart Discounts (existing logic) ---
    const cartDiscountsWithStatus = cartDiscountOffers.map((offer) => {
      const unlocked = cartSubtotal >= offer.min_cart_value;
      const remaining_amount = Math.max(0, offer.min_cart_value - cartSubtotal);

      let effective_discount = offer.discount_amount;
      if (offer.discount_type === 'percentage') {
        effective_discount = Math.round(cartSubtotal * offer.discount_amount / 100);
        if (offer.max_discount && effective_discount > offer.max_discount) {
          effective_discount = offer.max_discount;
        }
      }

      return {
        _id: offer._id,
        offer_type: 'cart_discount',
        title: offer.title,
        description: offer.description,
        discount_amount: offer.discount_amount,
        discount_type: offer.discount_type,
        min_cart_value: offer.min_cart_value,
        max_discount: offer.max_discount,
        effective_discount,
        remaining_amount,
        unlocked,
        progress: Math.min(100, Math.round((cartSubtotal / offer.min_cart_value) * 100))
      };
    });

    // Best applicable cart discount
    const unlockedDiscounts = cartDiscountsWithStatus.filter(o => o.unlocked);
    const bestOffer = unlockedDiscounts.length > 0
      ? unlockedDiscounts.reduce((best, curr) =>
          curr.effective_discount > best.effective_discount ? curr : best
        )
      : null;

    // --- Product Deals (new) ---
    const productDealsWithStatus = productDealOffers.map((offer) => {
      const unlocked = cartSubtotal >= offer.min_cart_value;
      const remaining_amount = Math.max(0, offer.min_cart_value - cartSubtotal);

      return {
        _id: offer._id,
        offer_type: 'product_deal',
        title: offer.title,
        description: offer.description,
        min_cart_value: offer.min_cart_value,
        remaining_amount,
        unlocked,
        progress: Math.min(100, Math.round((cartSubtotal / offer.min_cart_value) * 100)),
        deal_products: (offer.deal_products || []).map(dp => ({
          p_code: dp.p_code,
          product_name: dp.product_name,
          deal_price: dp.deal_price,
          original_price: dp.original_price,
          pcode_img: dp.pcode_img,
          max_quantity: dp.max_quantity
        }))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        cart_subtotal: cartSubtotal,
        offers: cartDiscountsWithStatus,
        best_offer: bestOffer,
        product_deals: productDealsWithStatus
      }
    });
  } catch (error) {
    console.error('Get offers for cart error:', error);
    res.status(500).json({ success: false, message: 'Error fetching offers', error: error.message });
  }
});

module.exports = router;
