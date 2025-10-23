const mongoose = require('mongoose');

const addressBookSchema = new mongoose.Schema({
  idaddress_book: {
    type: String,
    required: [true, 'Address book ID is required'],
    unique: true
  },
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  mobile_number: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  email_id: {
    type: String,
    required: [true, 'Email ID is required'],
    trim: true,
    lowercase: true
  },
  delivery_addr_line_1: {
    type: String,
    required: [true, 'Delivery address line 1 is required'],
    trim: true
  },
  delivery_addr_line_2: {
    type: String,
    trim: true
  },
  delivery_addr_city: {
    type: String,
    required: [true, 'Delivery address city is required'],
    trim: true
  },
  delivery_addr_pincode: {
    type: String,
    required: [true, 'Delivery address pincode is required'],
    trim: true
  },
  is_default: {
    type: String,
    enum: ['Yes', 'No'],
    required: [true, 'Default status is required'],
    default: 'No'
  },
  latitude: {
    type: String,
    trim: true
  },
  longitude: {
    type: String,
    trim: true
  },
  area_id: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'addressbooks'
});

// Indexes for better query performance
// Note: idaddress_book field already has unique: true, so index is automatically created
addressBookSchema.index({ mobile_number: 1 });
addressBookSchema.index({ email_id: 1 });
addressBookSchema.index({ is_default: 1 });
addressBookSchema.index({ delivery_addr_pincode: 1 });

// Static method to find all addresses sorted by idaddress_book
addressBookSchema.statics.findAllSorted = function() {
  return this.find().sort({ idaddress_book: 1 });
};

// Static method to find addresses by mobile number
addressBookSchema.statics.findByMobileNumber = function(mobileNumber) {
  return this.find({ mobile_number: mobileNumber }).sort({ idaddress_book: 1 });
};

// Static method to find default address by mobile number
addressBookSchema.statics.findDefaultByMobileNumber = function(mobileNumber) {
  return this.findOne({ mobile_number: mobileNumber, is_default: 'Yes' });
};

// Static method to generate next address book ID using counter
addressBookSchema.statics.generateNextId = async function() {
  const Counter = require('./Counter');
  const nextSequence = await Counter.getNextSequence('address_book_id');
  return nextSequence.toString();
};

module.exports = mongoose.model('AddressBook', addressBookSchema);
