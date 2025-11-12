const mongoose = require('mongoose');

const bannerUrlsSchema = new mongoose.Schema({
  desktop: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  }
}, { _id: false });

const advertisementProductSchema = new mongoose.Schema({
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
  redirect_url: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  banner_url: {
    type: String,
    required: [true, 'Banner URL is required'],
    trim: true
  },
  banner_urls: {
    type: bannerUrlsSchema,
    default: undefined
  },
  redirect_url: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end_date: {
    type: Date
  },
  sequence: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  products: {
    type: [advertisementProductSchema],
    default: [],
    validate: [
      {
        validator: function(products) {
          return Array.isArray(products) && products.length > 0;
        },
        message: 'At least one product is required'
      }
    ]
  }
}, {
  timestamps: true,
  collection: 'advertisements'
});

advertisementSchema.index({ category: 1, is_active: 1, start_date: 1 });
advertisementSchema.index({ is_active: 1, start_date: 1, end_date: 1 });
advertisementSchema.index({ sequence: 1 });

advertisementSchema.statics.findActive = function({ category = null, activeOn = new Date(), limit = null } = {}) {
  const query = {
    is_active: true,
    start_date: { $lte: activeOn }
  };

  query.$or = [
    { end_date: { $exists: false } },
    { end_date: null },
    { end_date: { $gte: activeOn } }
  ];

  if (category) {
    query.category = category;
  }

  const cursor = this.find(query).sort({ sequence: 1, start_date: -1 });

  if (limit && Number.isFinite(Number(limit))) {
    cursor.limit(Number(limit));
  }

  return cursor;
};

module.exports = mongoose.model('Advertisement', advertisementSchema);

