const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  idcategory_master: {
    type: String,
    required: [true, 'Category master ID is required'],
    trim: true
  },
  category_name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  dept_id: {
    type: String,
    required: [true, 'Department ID is required'],
    trim: true
  },
  sequence_id: {
    type: Number,
    required: [true, 'Sequence ID is required']
  },
  store_code: {
    type: String,
    required: [true, 'Store code is required'],
    trim: true
  },
  no_of_col: {
    type: String,
    trim: true
  },
  image_link: {
    type: String,
    trim: true
  },
  category_bg_color: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'categorymasters'
});

// Indexes for better query performance
categorySchema.index({ store_code: 1 });
categorySchema.index({ dept_id: 1 });
categorySchema.index({ idcategory_master: 1 });
categorySchema.index({ sequence_id: 1 });
categorySchema.index({ store_code: 1, dept_id: 1 });
categorySchema.index({ store_code: 1, sequence_id: 1 });

// Static method to find categories by store code and department ID
categorySchema.statics.findByStoreAndDepartment = function(storeCode, deptId) {
  const query = { store_code: storeCode };
  
  if (deptId) {
    query.dept_id = deptId;
  }
  
  return this.find(query).sort({ sequence_id: 1 });
};

// Static method to find categories by store code only
categorySchema.statics.findByStoreCode = function(storeCode) {
  return this.find({ store_code: storeCode }).sort({ sequence_id: 1 });
};

// Static method to find all categories sorted by sequence
categorySchema.statics.findAllSorted = function() {
  return this.find().sort({ sequence_id: 1 });
};

module.exports = mongoose.model('Category', categorySchema);
