const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  p_code: {
    type: String,
    required: [true, 'Product code is required'],
    trim: true
  },
  product_name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unit_price: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  package_size: {
    type: Number,
    trim: true
  },
  package_unit: {
    type: String,
    trim: true
  },
  brand_name: {
    type: String,
    trim: true
  },
  pcode_img: {
    type: String,
    trim: true
  },
  store_code: {
    type: String,
    required: [true, 'Store code is required'],
    trim: true
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  mobile_no: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  store_code: {
    type: String,
    required: [true, 'Store code is required'],
    trim: true
  },
  project_code: {
    type: String,
    required: [true, 'Project code is required'],
    trim: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative'],
    default: 0
  },
  total_items: {
    type: Number,
    required: [true, 'Total items count is required'],
    min: [0, 'Total items cannot be negative'],
    default: 0
  },
  total_quantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [0, 'Total quantity cannot be negative'],
    default: 0
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'carts'
});

// Indexes for better query performance
cartSchema.index({ mobile_no: 1 }, { unique: true }); // One cart per user
cartSchema.index({ mobile_no: 1, store_code: 1 });
cartSchema.index({ last_updated: -1 });
cartSchema.index({ 'items.p_code': 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  let subtotal = 0;
  let totalQuantity = 0;
  let totalItems = this.items.length;

  this.items.forEach(item => {
    subtotal += item.total_price;
    totalQuantity += item.quantity;
  });

  this.subtotal = subtotal;
  this.total_items = totalItems;
  this.total_quantity = totalQuantity;
  this.last_updated = new Date();

  next();
});

// Static method to find cart by mobile number
cartSchema.statics.findByMobile = function(mobileNo) {
  return this.findOne({ mobile_no: mobileNo });
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateByMobile = function(mobileNo, storeCode, projectCode) {
  return this.findOneAndUpdate(
    { mobile_no: mobileNo },
    {
      store_code: storeCode,
      project_code: projectCode,
      last_updated: new Date()
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
};

// Static method to clear cart
cartSchema.statics.clearCart = function(mobileNo) {
  return this.findOneAndUpdate(
    { mobile_no: mobileNo },
    {
      items: [],
      subtotal: 0,
      total_items: 0,
      total_quantity: 0,
      last_updated: new Date()
    },
    { new: true }
  );
};

// Instance method to validate cart items against current product data
cartSchema.methods.validateItems = async function() {
  const ProductMaster = require('./ProductMaster');
  const validationResults = {
    valid: true,
    invalidItems: [],
    updatedItems: [],
    totalValidItems: 0,
    totalInvalidItems: 0
  };

  for (let i = 0; i < this.items.length; i++) {
    const cartItem = this.items[i];

    try {
      // Find current product data
      const currentProduct = await ProductMaster.findOne({
        p_code: cartItem.p_code,
        store_code: cartItem.store_code,
        pcode_status: 'Y'
      });

      if (!currentProduct) {
        // Product not found or inactive
        validationResults.valid = false;
        validationResults.invalidItems.push({
          index: i,
          p_code: cartItem.p_code,
          reason: 'Product not found or inactive',
          cartItem: cartItem
        });
        validationResults.totalInvalidItems++;
        continue;
      }

      // Check if price has changed
      const currentPrice = parseFloat(currentProduct.our_price?.toString() || '0');
      if (currentPrice !== cartItem.unit_price) {
        validationResults.updatedItems.push({
          index: i,
          p_code: cartItem.p_code,
          oldPrice: cartItem.unit_price,
          newPrice: currentPrice,
          priceDifference: currentPrice - cartItem.unit_price,
          cartItem: cartItem,
          currentProduct: {
            product_name: currentProduct.product_name,
            brand_name: currentProduct.brand_name,
            package_size: currentProduct.package_size,
            package_unit: currentProduct.package_unit,
            pcode_img: currentProduct.pcode_img,
            store_quantity: currentProduct.store_quantity,
            max_quantity_allowed: currentProduct.max_quantity_allowed
          }
        });
      }

      // Check stock availability
      if (currentProduct.store_quantity < cartItem.quantity) {
        validationResults.valid = false;
        validationResults.invalidItems.push({
          index: i,
          p_code: cartItem.p_code,
          reason: `Insufficient stock. Available: ${currentProduct.store_quantity}, Requested: ${cartItem.quantity}`,
          cartItem: cartItem,
          availableQuantity: currentProduct.store_quantity
        });
        validationResults.totalInvalidItems++;
        continue;
      }

      // Check max quantity allowed
      if (currentProduct.max_quantity_allowed && cartItem.quantity > currentProduct.max_quantity_allowed) {
        validationResults.valid = false;
        validationResults.invalidItems.push({
          index: i,
          p_code: cartItem.p_code,
          reason: `Quantity exceeds maximum allowed. Max: ${currentProduct.max_quantity_allowed}, Requested: ${cartItem.quantity}`,
          cartItem: cartItem,
          maxAllowed: currentProduct.max_quantity_allowed
        });
        validationResults.totalInvalidItems++;
        continue;
      }

      validationResults.totalValidItems++;

    } catch (error) {
      validationResults.valid = false;
      validationResults.invalidItems.push({
        index: i,
        p_code: cartItem.p_code,
        reason: `Validation error: ${error.message}`,
        cartItem: cartItem
      });
      validationResults.totalInvalidItems++;
    }
  }

  return validationResults;
};

module.exports = mongoose.model('Cart', cartSchema);
