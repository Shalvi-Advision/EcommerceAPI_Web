const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  mobile_outlet_name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  store_code: {
    type: String,
    required: [true, 'Store code is required'],
    trim: true,
    uppercase: true
  },
  is_enabled: {
    type: String,
    enum: ['Enabled', 'Disabled'],
    default: 'Enabled'
  },
  store_address: {
    type: String,
    required: [true, 'Store address is required'],
    trim: true
  },
  min_order_amount: {
    type: Number,
    default: 500,
    min: [0, 'Minimum order amount cannot be negative']
  },
  store_open_time: {
    type: String,
    default: '9 am to 10 pm'
  },
  store_delivery_time: {
    type: String,
    default: 'Day + 1 day'
  },
  store_offer_name: {
    type: String,
    trim: true
  },
  latitude: {
    type: String,
    trim: true
  },
  longitude: {
    type: String,
    trim: true
  },
  home_delivery: {
    type: String,
    enum: ['yes', 'no'],
    default: 'yes'
  },
  self_pickup: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  store_message: {
    type: String,
    trim: true
  },
  contact_number: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  whatsappnumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'pincodestoremasters'
});

// Indexes for better query performance
storeSchema.index({ pincode: 1 });
storeSchema.index({ store_code: 1 });
storeSchema.index({ is_enabled: 1 });
storeSchema.index({ pincode: 1, is_enabled: 1 });

// Static method to find stores by pincode
storeSchema.statics.findByPincode = function(pincode, includeDisabled = false) {
  const query = { pincode };
  
  if (!includeDisabled) {
    query.is_enabled = 'Enabled';
  }
  
  return this.find(query).sort({ mobile_outlet_name: 1 });
};

// Static method to find enabled stores only
storeSchema.statics.findEnabled = function() {
  return this.find({ is_enabled: 'Enabled' }).sort({ mobile_outlet_name: 1 });
};

// Instance method to check if store is enabled
storeSchema.methods.isEnabled = function() {
  return this.is_enabled === 'Enabled';
};

// Instance method to check if home delivery is available
storeSchema.methods.hasHomeDelivery = function() {
  return this.home_delivery === 'yes';
};

// Instance method to check if self pickup is available
storeSchema.methods.hasSelfPickup = function() {
  return this.self_pickup === 'yes';
};

module.exports = mongoose.model('Store', storeSchema);

