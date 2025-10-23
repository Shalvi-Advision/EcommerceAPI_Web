const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

/**
 * @route   POST /api/departments/by-store
 * @desc    Get all departments by store code
 * @access  Public
 * @body    { "store_code": "STORE001" } or { "store_code": "null" } or { "store_code": "" }
 */
router.post('/by-store', async (req, res, next) => {
  try {
    const { store_code } = req.body;
    
    // If store_code is not provided or is empty/null, default to "null"
    const queryStoreCode = !store_code || store_code.trim() === '' || store_code === 'null' 
      ? 'null' 
      : store_code.trim();
    
    // Find departments by store code
    const departments = await Department.findByStoreCode(queryStoreCode);
    
    if (!departments || departments.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No departments found for store code: ${queryStoreCode}`,
        store_code: queryStoreCode,
        data: []
      });
    }
    
    // Format response data
    const departmentsData = departments.map(dept => ({
      id: dept._id,
      department_id: dept.department_id,
      department_name: dept.department_name,
      dept_type_id: dept.dept_type_id,
      dept_no_of_col: dept.dept_no_of_col,
      store_code: dept.store_code,
      image_link: dept.image_link,
      sequence_id: dept.sequence_id
    }));
    
    res.status(200).json({
      success: true,
      count: departmentsData.length,
      message: `Found ${departmentsData.length} department(s) for store code: ${queryStoreCode}`,
      store_code: queryStoreCode,
      data: departmentsData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/departments/by-type
 * @desc    Get all departments by department type and optionally by store code
 * @access  Public
 * @body    { "dept_type_id": "1", "store_code": "STORE001" }
 */
router.post('/by-type', async (req, res, next) => {
  try {
    const { dept_type_id, store_code } = req.body;
    
    // Validate dept_type_id is provided
    if (!dept_type_id) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a dept_type_id'
      });
    }
    
    // If store_code is provided, use it; otherwise, search all stores
    const queryStoreCode = store_code && store_code.trim() !== '' 
      ? (store_code === 'null' ? 'null' : store_code.trim())
      : null;
    
    // Find departments by type and optionally by store code
    const departments = await Department.findByType(dept_type_id, queryStoreCode);
    
    if (!departments || departments.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: queryStoreCode 
          ? `No departments found for type ${dept_type_id} and store code: ${queryStoreCode}`
          : `No departments found for type ${dept_type_id}`,
        dept_type_id: dept_type_id,
        store_code: queryStoreCode,
        data: []
      });
    }
    
    // Format response data
    const departmentsData = departments.map(dept => ({
      id: dept._id,
      department_id: dept.department_id,
      department_name: dept.department_name,
      dept_type_id: dept.dept_type_id,
      dept_no_of_col: dept.dept_no_of_col,
      store_code: dept.store_code,
      image_link: dept.image_link,
      sequence_id: dept.sequence_id
    }));
    
    res.status(200).json({
      success: true,
      count: departmentsData.length,
      message: queryStoreCode
        ? `Found ${departmentsData.length} department(s) for type ${dept_type_id} and store code: ${queryStoreCode}`
        : `Found ${departmentsData.length} department(s) for type ${dept_type_id}`,
      dept_type_id: dept_type_id,
      store_code: queryStoreCode,
      data: departmentsData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/departments/get-departments
 * @desc    Get departments by store_code and project_code
 * @access  Public
 * @body    { "store_code": "STORE001", "project_code": "PROJ001" }
 */
router.post('/get-departments', async (req, res, next) => {
  try {
    const { store_code, project_code } = req.body;
    
    // Validate required fields
    if (store_code === undefined || store_code === null) {
      return res.status(400).json({
        success: false,
        error: 'store_code is required'
      });
    }
    
    if (!project_code || project_code.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'project_code is required'
      });
    }
    
    // Handle store_code normalization (null, empty string, or actual store code)
    const queryStoreCode = !store_code || store_code.trim() === '' || store_code === 'null' 
      ? 'null' 
      : store_code.trim();
    
    // Find departments by store code
    const departments = await Department.findByStoreCode(queryStoreCode);
    
    if (!departments || departments.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: `No departments found for store code: ${queryStoreCode} and project code: ${project_code}`,
        store_code: queryStoreCode,
        project_code: project_code,
        data: []
      });
    }
    
    // Format response data
    const departmentsData = departments.map(dept => ({
      id: dept._id,
      department_id: dept.department_id,
      department_name: dept.department_name,
      dept_type_id: dept.dept_type_id,
      dept_no_of_col: dept.dept_no_of_col,
      store_code: dept.store_code,
      image_link: dept.image_link,
      sequence_id: dept.sequence_id
    }));
    
    res.status(200).json({
      success: true,
      count: departmentsData.length,
      message: `Found ${departmentsData.length} department(s) for store code: ${queryStoreCode} and project code: ${project_code}`,
      store_code: queryStoreCode,
      project_code: project_code,
      data: departmentsData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.findAllSorted();
    
    if (!departments || departments.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No departments found',
        data: []
      });
    }
    
    // Format response data
    const departmentsData = departments.map(dept => ({
      id: dept._id,
      department_id: dept.department_id,
      department_name: dept.department_name,
      dept_type_id: dept.dept_type_id,
      dept_no_of_col: dept.dept_no_of_col,
      store_code: dept.store_code,
      image_link: dept.image_link,
      sequence_id: dept.sequence_id
    }));
    
    res.status(200).json({
      success: true,
      count: departmentsData.length,
      message: `Found ${departmentsData.length} department(s)`,
      data: departmentsData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

