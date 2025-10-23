const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Product code cannot be more than 50 characters']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot be more than 300 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot be more than 100 characters']
  },
  sku: {
    type: String,
    trim: true,
    maxlength: [50, 'SKU cannot be more than 50 characters']
  },
  barcode: {
    type: String,
    trim: true,
    maxlength: [50, 'Barcode cannot be more than 50 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  price: {
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: [0, 'MRP must be positive']
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price must be positive']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount must be positive'],
      max: [100, 'Discount cannot exceed 100%']
    }
  },
  stock: {
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },
    minStockLevel: {
      type: Number,
      default: 5,
      min: [0, 'Minimum stock level cannot be negative']
    },
    maxStockLevel: {
      type: Number,
      min: [0, 'Maximum stock level cannot be negative']
    }
  },
  attributes: {
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'mm', 'in', 'ft'],
        default: 'cm'
      }
    },
    color: [String],
    size: [String],
    material: String,
    expiryDate: Date,
    manufacturingDate: Date
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title should not exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description should not exceed 160 characters']
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Slug cannot be more than 100 characters']
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  specifications: mongoose.Schema.Types.Mixed,
  variants: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    price: Number,
    stock: Number,
    sku: String
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upsellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ productCode: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ status: 1, isFeatured: 1 });
productSchema.index({ 'price.sellingPrice': 1 });
productSchema.index({ 'stock.quantity': 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for stock status
productSchema.virtual('isInStock').get(function() {
  return this.stock.quantity > 0;
});

productSchema.virtual('isLowStock').get(function() {
  return this.stock.quantity > 0 && this.stock.quantity <= this.stock.minStockLevel;
});

productSchema.virtual('discountPercentage').get(function() {
  if (this.price.mrp && this.price.sellingPrice) {
    return Math.round(((this.price.mrp - this.price.sellingPrice) / this.price.mrp) * 100);
  }
  return 0;
});

// Static methods
productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'active' }).populate('category');
};

productSchema.statics.findBySubcategory = function(subcategoryId) {
  return this.find({ subcategory: subcategoryId, status: 'active' }).populate('subcategory');
};

productSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ status: 'active', isFeatured: true })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit);
};

productSchema.statics.findNewArrivals = function(limit = 10) {
  return this.find({ status: 'active', isNewArrival: true })
    .sort({ createdAt: -1 })
    .limit(limit);
};

productSchema.statics.findBestSellers = function(limit = 10) {
  return this.find({ status: 'active', isBestSeller: true })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit);
};

productSchema.statics.searchProducts = function(query, limit = 20) {
  return this.find(
    {
      $text: { $search: query },
      status: 'active'
    },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

// Instance methods
productSchema.methods.updateStock = function(quantity) {
  this.stock.quantity = Math.max(0, this.stock.quantity + quantity);
  return this.save();
};

productSchema.methods.addReview = function(userId, rating, comment) {
  const review = {
    user: userId,
    rating,
    comment,
    createdAt: new Date()
  };

  this.reviews.push(review);

  // Update average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;

  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
