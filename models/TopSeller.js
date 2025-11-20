const mongoose = require('mongoose');

const topSellerProductSchema = new mongoose.Schema({
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

const topSellerSchema = new mongoose.Schema({
  store_code: {
    type: String,
    trim: true,
    default: null
  },
  store_codes: {
    type: [String],
    default: undefined,
    validate: {
      validator: function(codes) {
        return !codes || (Array.isArray(codes) && codes.length > 0 && codes.every(code => code && code.trim() !== ''));
      },
      message: 'store_codes must be a non-empty array of valid store codes'
    }
  },
  bg_color: {
    type: String,
    required: [true, 'Background color is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  products: {
    type: [topSellerProductSchema],
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
  collection: 'top_sellers'
});

topSellerSchema.index({ store_code: 1, is_active: 1, sequence: 1 });
topSellerSchema.index({ store_codes: 1, is_active: 1, sequence: 1 });

topSellerSchema.statics.findActiveByStore = function(storeCode) {
  const query = { is_active: true };

  if (storeCode) {
    query.store_code = storeCode.trim();
  }

  return this.find(query).sort({ sequence: 1, createdAt: -1 });
};

topSellerSchema.statics.findByStore = function(storeCode) {
  const query = {};

  if (storeCode) {
    query.store_code = storeCode.trim();
  }

  return this.find(query).sort({ sequence: 1, createdAt: -1 });
};

topSellerSchema.statics.findByStoreCodes = function(storeCodes, activeOnly = false) {
  const query = {};

  if (activeOnly) {
    query.is_active = true;
  }

  if (storeCodes && Array.isArray(storeCodes) && storeCodes.length > 0) {
    query.$or = [
      { store_codes: { $in: storeCodes } },
      { store_code: { $in: storeCodes } }
    ];
  }

  return this.find(query).sort({ sequence: 1, createdAt: -1 });
};

module.exports = mongoose.model('TopSeller', topSellerSchema);

