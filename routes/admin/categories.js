const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const Department = require('../../models/Department');
const Subcategory = require('../../models/Subcategory');

// ==================== CATEGORY MANAGEMENT ====================

// @route   GET /api/admin/categories
// @desc    Get all categories with pagination and filters
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      storeCode = '',
      deptId = '',
      sortBy = 'sequence_id',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.category_name = { $regex: search, $options: 'i' };
    }

    if (storeCode) {
      query.store_code = storeCode;
    }

    if (deptId) {
      query.dept_id = deptId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const categories = await Category.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// @route   POST /api/admin/categories/by-store
// @desc    Get categories by store_code with filters
// @access  Admin
router.post('/by-store', async (req, res) => {
  try {
    const {
      store_code,
      search = '',
      deptId = '',
      page = 1,
      limit = 20,
      sortBy = 'sequence_id',
      sortOrder = 'asc'
    } = req.body;

    // Validate required fields
    if (!store_code || store_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'store_code is required'
      });
    }

    // Build query
    const query = {
      store_code: store_code.trim()
    };

    if (search) {
      query.category_name = { $regex: search, $options: 'i' };
    }

    if (deptId) {
      query.dept_id = deptId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const categories = await Category.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get categories by store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// @route   GET /api/admin/categories/:id
// @desc    Get single category by ID
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

// @route   POST /api/admin/categories
// @desc    Create new category
// @access  Admin
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete category
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

// ==================== DEPARTMENT MANAGEMENT ====================

// @route   GET /api/admin/categories/departments/all
// @desc    Get all departments with pagination and filters
// @access  Admin
router.get('/departments/all', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      storeCode = '',
      deptTypeId = '',
      sortBy = 'sequence_id',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.department_name = { $regex: search, $options: 'i' };
    }

    if (storeCode) {
      query.store_code = storeCode;
    }

    if (deptTypeId) {
      query.dept_type_id = deptTypeId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const departments = await Department.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Department.countDocuments(query);

    res.status(200).json({
      success: true,
      data: departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
});

// @route   GET /api/admin/categories/departments/:id
// @desc    Get single department by ID
// @access  Admin
router.get('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
});

// @route   POST /api/admin/categories/departments
// @desc    Create new department
// @access  Admin
router.post('/departments', async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/categories/departments/:id
// @desc    Update department
// @access  Admin
router.put('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/categories/departments/:id
// @desc    Delete department
// @access  Admin
router.delete('/departments/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
});

// @route   POST /api/admin/categories/departments/by-store
// @desc    Get departments by store_code with filters
// @access  Admin
router.post('/departments/by-store', async (req, res) => {
  try {
    const {
      store_code,
      search = '',
      deptTypeId = '',
      page = 1,
      limit = 20,
      sortBy = 'sequence_id',
      sortOrder = 'asc'
    } = req.body;

    // Validate required fields
    if (!store_code || store_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'store_code is required'
      });
    }

    // Build query
    const query = {};

    // Handle store_code - can be null or specific value
    if (store_code.trim().toLowerCase() === 'null') {
      query.store_code = null;
    } else {
      query.store_code = store_code.trim();
    }

    if (search) {
      query.department_name = { $regex: search, $options: 'i' };
    }

    if (deptTypeId) {
      query.dept_type_id = deptTypeId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const departments = await Department.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Department.countDocuments(query);

    res.status(200).json({
      success: true,
      data: departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get departments by store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
});

// ==================== SUBCATEGORY MANAGEMENT ====================

// @route   GET /api/admin/categories/subcategories/all
// @desc    Get all subcategories with pagination and filters
// @access  Admin
router.get('/subcategories/all', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      categoryId = '',
      sortBy = 'sequence_id',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.subcategory_name = { $regex: search, $options: 'i' };
    }

    if (categoryId) {
      query.category_id = categoryId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const subcategories = await Subcategory.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Subcategory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: subcategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories',
      error: error.message
    });
  }
});

// @route   POST /api/admin/categories/subcategories/by-store
// @desc    Get subcategories by store_code with filters
// @access  Admin
router.post('/subcategories/by-store', async (req, res) => {
  try {
    const {
      store_code,
      search = '',
      categoryId = '',
      page = 1,
      limit = 20,
      sortBy = 'idsub_category_master',
      sortOrder = 'asc'
    } = req.body;

    // Validate required fields
    if (!store_code || store_code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'store_code is required'
      });
    }

    // Build query - subcategories don't have store_code directly
    // We need to get categories for this store_code first, then get subcategories
    const categoryQuery = { store_code: store_code.trim() };
    const categories = await Category.find(categoryQuery).select('idcategory_master');
    const categoryIds = categories.map(cat => cat.idcategory_master);

    const query = {};

    // Filter by category IDs that belong to this store
    if (categoryIds.length > 0) {
      query.category_id = { $in: categoryIds };
    } else {
      // If no categories found for this store, return empty
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    if (search) {
      query.subcategory_name = { $regex: search, $options: 'i' };
    }

    if (categoryId) {
      query.category_id = categoryId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const subcategories = await Subcategory.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Subcategory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: subcategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get subcategories by store error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories',
      error: error.message
    });
  }
});

// @route   POST /api/admin/categories/subcategories
// @desc    Create new subcategory
// @access  Admin
router.post('/subcategories', async (req, res) => {
  try {
    const subcategory = await Subcategory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: subcategory
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subcategory',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/categories/subcategories/:id
// @desc    Update subcategory
// @access  Admin
router.put('/subcategories/:id', async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      data: subcategory
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subcategory',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/categories/subcategories/:id
// @desc    Delete subcategory
// @access  Admin
router.delete('/subcategories/:id', async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subcategory',
      error: error.message
    });
  }
});

module.exports = router;
