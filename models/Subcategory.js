const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  idsub_category_master: {
    type: String,
    required: [true, 'Subcategory master ID is required'],
    trim: true
  },
  sub_category_name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true
  },
  category_id: {
    type: String,
    required: [true, 'Category ID is required'],
    trim: true
  },
  main_category_name: {
    type: String,
    required: [true, 'Main category name is required'],
    trim: true
  }
}, {
  timestamps: true,
  collection: 'subcategorymasters'
});

// Indexes for better query performance
subcategorySchema.index({ category_id: 1 });
subcategorySchema.index({ idsub_category_master: 1 });
subcategorySchema.index({ main_category_name: 1 });

// Static method to find subcategories by category ID
subcategorySchema.statics.findByCategoryId = function(categoryId) {
  return this.find({ category_id: categoryId }).sort({ idsub_category_master: 1 });
};

// Static method to find subcategories by multiple category IDs
subcategorySchema.statics.findByCategoryIds = function(categoryIds) {
  return this.find({ category_id: { $in: categoryIds } }).sort({ idsub_category_master: 1 });
};

// Static method to find all subcategories sorted
subcategorySchema.statics.findAllSorted = function() {
  return this.find().sort({ idsub_category_master: 1 });
};

module.exports = mongoose.model('Subcategory', subcategorySchema);
