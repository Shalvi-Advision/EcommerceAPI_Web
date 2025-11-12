const mongoose = require('mongoose');

const popularCategoryItemSchema = new mongoose.Schema({
  sub_category_id: {
    type: String,
    required: [true, 'Sub category ID is required'],
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

const popularCategorySchema = new mongoose.Schema({
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
  subcategories: {
    type: [popularCategoryItemSchema],
    default: [],
    validate: [
      {
        validator: function(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'At least one subcategory is required'
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
  collection: 'popular_categories'
});

popularCategorySchema.index({ store_code: 1, is_active: 1, sequence: 1 });

popularCategorySchema.statics.findActiveByStore = function(storeCode) {
  const query = { is_active: true };

  if (storeCode) {
    query.store_code = storeCode.trim();
  }

  return this.find(query).sort({ sequence: 1, createdAt: -1 });
};

popularCategorySchema.statics.findByStore = function(storeCode) {
  const query = {};

  if (storeCode) {
    query.store_code = storeCode.trim();
  }

  return this.find(query).sort({ sequence: 1, createdAt: -1 });
};

module.exports = mongoose.model('PopularCategory', popularCategorySchema);

