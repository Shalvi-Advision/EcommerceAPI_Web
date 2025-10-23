const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  mobile_no: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  p_code: {
    type: String,
    required: [true, 'Product code is required'],
    trim: true
  },
  store_code: {
    type: String,
    required: [true, 'Store code is required'],
    trim: true
  }
}, {
  timestamps: true,
  collection: 'favoritemasters'
});

// Compound index to ensure unique favorites per user per product per store
favoriteSchema.index({ mobile_no: 1, p_code: 1, store_code: 1 }, { unique: true });

// Indexes for better query performance
favoriteSchema.index({ mobile_no: 1 });
favoriteSchema.index({ p_code: 1 });
favoriteSchema.index({ store_code: 1 });
favoriteSchema.index({ mobile_no: 1, store_code: 1 });

// Static method to find all favorites for a user
favoriteSchema.statics.findByMobile = function(mobileNo) {
  return this.find({ mobile_no: mobileNo }).sort({ createdAt: -1 });
};

// Static method to find favorites for a user in a specific store
favoriteSchema.statics.findByMobileAndStore = function(mobileNo, storeCode) {
  return this.find({ mobile_no: mobileNo, store_code: storeCode }).sort({ createdAt: -1 });
};

// Static method to check if a product is favorited by a user
favoriteSchema.statics.isFavorited = function(mobileNo, pCode, storeCode) {
  return this.findOne({ mobile_no: mobileNo, p_code: pCode, store_code: storeCode });
};

// Static method to remove a favorite
favoriteSchema.statics.removeFavorite = function(mobileNo, pCode, storeCode) {
  return this.findOneAndDelete({ mobile_no: mobileNo, p_code: pCode, store_code: storeCode });
};

module.exports = mongoose.model('Favorite', favoriteSchema);
