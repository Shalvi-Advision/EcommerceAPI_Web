const mongoose = require('mongoose');

const dealProductSchema = new mongoose.Schema({
  p_code: {
    type: String,
    required: [true, 'Product code is required'],
    trim: true
  },
  product_name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  deal_price: {
    type: Number,
    required: [true, 'Deal price is required'],
    min: [0, 'Deal price cannot be negative']
  },
  original_price: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Original price cannot be negative']
  },
  pcode_img: {
    type: String,
    trim: true
  },
  max_quantity: {
    type: Number,
    default: 1,
    min: [1, 'Max quantity must be at least 1']
  }
}, { _id: false });

const offerSchema = new mongoose.Schema({
  offer_type: {
    type: String,
    enum: ['cart_discount', 'product_deal'],
    default: 'cart_discount'
  },
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  discount_type: {
    type: String,
    enum: ['flat', 'percentage'],
    default: 'flat'
  },
  min_cart_value: {
    type: Number,
    required: [true, 'Minimum cart value is required'],
    min: [0, 'Minimum cart value cannot be negative']
  },
  max_discount: {
    type: Number,
    min: [0, 'Max discount cannot be negative'],
    default: null
  },
  deal_products: [dealProductSchema],
  store_codes: {
    type: [String],
    default: []
  },
  is_active: {
    type: Boolean,
    default: true
  },
  valid_from: {
    type: Date,
    default: Date.now
  },
  valid_until: {
    type: Date,
    default: null
  },
  priority: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Conditional validation based on offer_type
offerSchema.pre('validate', function (next) {
  if (this.offer_type === 'cart_discount' && (!this.discount_amount || this.discount_amount <= 0)) {
    this.invalidate('discount_amount', 'Discount amount is required for cart discount offers');
  }
  if (this.offer_type === 'product_deal' && (!this.deal_products || this.deal_products.length === 0)) {
    this.invalidate('deal_products', 'At least one deal product is required for product deal offers');
  }
  next();
});

offerSchema.index({ is_active: 1, store_codes: 1, min_cart_value: 1 });
offerSchema.index({ priority: 1, min_cart_value: 1 });
offerSchema.index({ offer_type: 1, is_active: 1, store_codes: 1 });

module.exports = mongoose.model('Offer', offerSchema);
