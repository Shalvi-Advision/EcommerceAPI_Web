const mongoose = require('mongoose');

const paymentModeSchema = new mongoose.Schema({
  idpayment_mode: {
    type: Number,
    required: [true, 'Payment mode ID is required'],
    unique: true
  },
  payment_mode_name: {
    type: String,
    required: [true, 'Payment mode name is required'],
    trim: true
  },
  is_enabled: {
    type: String,
    enum: ['Yes', 'No'],
    required: [true, 'Enabled status is required'],
    default: 'No'
  }
}, {
  timestamps: true,
  collection: 'paymentmodes'
});

// Indexes for better query performance
// Note: idpayment_mode field already has unique: true, so index is automatically created
paymentModeSchema.index({ is_enabled: 1 });
paymentModeSchema.index({ payment_mode_name: 1 });

// Static method to find all payment modes sorted by idpayment_mode
paymentModeSchema.statics.findAllSorted = function() {
  return this.find().sort({ idpayment_mode: 1 });
};

// Static method to find enabled payment modes
paymentModeSchema.statics.findEnabled = function() {
  return this.find({ is_enabled: 'Yes' }).sort({ idpayment_mode: 1 });
};

module.exports = mongoose.model('PaymentMode', paymentModeSchema);
