const mongoose = require('mongoose');

const bestSellerProductSchema = new mongoose.Schema({
  p_code: {
    type: String,
    required: [true, 'Product code is required'],
    trim: true
  },
  store_code: {
    type: String,
    trim: true
  },
  position: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  redirect_url: {
    type: String,
    trim: true
  }
}, { _id: false });

const bestSellerSchema = new mongoose.Schema({
  store_code: {
    type: String,
    trim: true,
    default: null
  },
  banner_urls: {
    desktop: {
      type: String,
      required: [true, 'Desktop banner URL is required'],
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile banner URL is required'],
      trim: true
    }
  },
  background_color: {
    type: String,
    required: [true, 'Background color is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  redirect_url: {
    type: String,
    trim: true
  },
  products: {
    type: [bestSellerProductSchema],
    default: [],
    validate: [
      {
        validator: function(products) {
          return Array.isArray(products) && products.length > 0;
        },
        message: 'At least one product is required'
      }
    ]
  },
  is_active: {
    type: Boolean,
    default: true
  },
  sequence: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'best_sellers'
});

bestSellerSchema.index({ store_code: 1, is_active: 1, sequence: 1 });

bestSellerSchema.statics.findActiveByStore = function(storeCode) {
  const query = { is_active: true };

  if (storeCode) {
    query.store_code = storeCode.trim();
  }

  return this.find(query).sort({ sequence: 1, createdAt: -1 });
};

bestSellerSchema.statics.findByStore = function(storeCode) {
  const query = {};

  if (storeCode) {
    query.store_code = storeCode.trim();
  }

  return this.find(query).sort({ sequence: 1, createdAt: -1 });
};

module.exports = mongoose.model('BestSeller', bestSellerSchema);

