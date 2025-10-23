const mongoose = require('mongoose');

const deliverySlotSchema = new mongoose.Schema({
  iddelivery_slot: {
    type: Number,
    required: [true, 'Delivery slot ID is required'],
    unique: true
  },
  delivery_slot_from: {
    type: String,
    required: [true, 'Delivery slot from time is required'],
    trim: true
  },
  delivery_slot_to: {
    type: String,
    required: [true, 'Delivery slot to time is required'],
    trim: true
  },
  store_code: {
    type: String,
    required: [true, 'Store code is required'],
    trim: true
  },
  is_active: {
    type: String,
    enum: ['yes', 'no'],
    required: [true, 'Active status is required'],
    default: 'yes'
  }
}, {
  timestamps: true,
  collection: 'deliveryslots'
});

// Indexes for better query performance
// Note: iddelivery_slot field already has unique: true, so index is automatically created
deliverySlotSchema.index({ store_code: 1 });
deliverySlotSchema.index({ is_active: 1 });
deliverySlotSchema.index({ store_code: 1, is_active: 1 });

// Static method to find all delivery slots sorted by iddelivery_slot
deliverySlotSchema.statics.findAllSorted = function() {
  return this.find().sort({ iddelivery_slot: 1 });
};

// Static method to find delivery slots by store code
deliverySlotSchema.statics.findByStoreCode = function(storeCode) {
  return this.find({ store_code: storeCode }).sort({ iddelivery_slot: 1 });
};

// Static method to find active delivery slots by store code
deliverySlotSchema.statics.findActiveByStoreCode = function(storeCode) {
  return this.find({ store_code: storeCode, is_active: 'yes' }).sort({ iddelivery_slot: 1 });
};

module.exports = mongoose.model('DeliverySlot', deliverySlotSchema);
