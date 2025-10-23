const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  idpincode_master: {
    type: Number,
    required: [true, 'Pincode master ID is required'],
    unique: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  is_enabled: {
    type: String,
    enum: ['Enabled', 'Disabled'],
    default: 'Enabled'
  }
}, {
  timestamps: true,
  collection: 'pincodemasters'
});

// Indexes for better query performance
pincodeSchema.index({ pincode: 1 });
// Note: idpincode_master field already has unique: true, so index is automatically created
pincodeSchema.index({ is_enabled: 1 });

// Static method to find enabled pincodes
pincodeSchema.statics.findEnabled = function() {
  return this.find({ is_enabled: 'Enabled' }).sort({ pincode: 1 });
};

// Static method to check if pincode is serviceable
pincodeSchema.statics.isServiceable = function(pincode) {
  return this.findOne({ pincode: pincode, is_enabled: 'Enabled' });
};

// Instance method to check if enabled
pincodeSchema.methods.isEnabled = function() {
  return this.is_enabled === 'Enabled';
};

module.exports = mongoose.model('Pincode', pincodeSchema);

