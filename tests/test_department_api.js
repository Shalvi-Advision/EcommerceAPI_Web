/**
 * Test script for Department API
 * Tests all department endpoints
 * 
 * Run this script with: node tests/test_department_api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`)
};

/**
 * Test 1: Get departments by store code
 */
async function testGetDepartmentsByStoreCode() {
  log.header('TEST 1: Get Departments by Store Code');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/departments/by-store`, {
      store_code: 'null'
    });
    
    if (response.data.success) {
      log.success(`Found ${response.data.count} departments for store code: ${response.data.store_code}`);
      log.info(`Message: ${response.data.message}`);
      
      if (response.data.data.length > 0) {
        console.log('\nDepartments:');
        response.data.data.forEach((dept, index) => {
          console.log(`  ${index + 1}. ${dept.department_name}`);
          console.log(`     - ID: ${dept.department_id}`);
          console.log(`     - Type: ${dept.dept_type_id}`);
          console.log(`     - Sequence: ${dept.sequence_id}`);
          if (dept.image_link) {
            console.log(`     - Image: ${dept.image_link.substring(0, 50)}...`);
          }
        });
      }
      
      return true;
    } else {
      log.error('Request failed');
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
    return false;
  }
}

/**
 * Test 2: Get departments by type
 */
async function testGetDepartmentsByType() {
  log.header('TEST 2: Get Departments by Type');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/departments/by-type`, {
      dept_type_id: '1',
      store_code: 'null'
    });
    
    if (response.data.success) {
      log.success(`Found ${response.data.count} departments for type: ${response.data.dept_type_id}`);
      log.info(`Message: ${response.data.message}`);
      
      if (response.data.data.length > 0) {
        console.log('\nType 1 Departments:');
        response.data.data.forEach((dept, index) => {
          console.log(`  ${index + 1}. ${dept.department_name} (Seq: ${dept.sequence_id})`);
        });
      }
      
      return true;
    } else {
      log.error('Request failed');
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
    return false;
  }
}

/**
 * Test 3: Get all departments
 */
async function testGetAllDepartments() {
  log.header('TEST 3: Get All Departments');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/departments`);
    
    if (response.data.success) {
      log.success(`Found ${response.data.count} total departments`);
      log.info(`Message: ${response.data.message}`);
      
      if (response.data.data.length > 0) {
        console.log('\nAll Departments:');
        response.data.data.forEach((dept, index) => {
          console.log(`  ${index + 1}. ${dept.department_name} (Type: ${dept.dept_type_id}, Store: ${dept.store_code})`);
        });
      }
      
      return true;
    } else {
      log.error('Request failed');
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    if (error.response) {
      console.log('Response:', error.response.data);
    }
    return false;
  }
}

/**
 * Test 4: Test with missing dept_type_id (should fail)
 */
async function testMissingDeptTypeId() {
  log.header('TEST 4: Missing dept_type_id (Expected to Fail)');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/departments/by-type`, {
      store_code: 'null'
    });
    
    log.error('Test should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Correctly rejected request with missing dept_type_id');
      log.info(`Error message: ${error.response.data.error}`);
      return true;
    } else {
      log.error(`Unexpected error: ${error.message}`);
      return false;
    }
  }
}

/**
 * Test 5: Test with non-existent store code
 */
async function testNonExistentStoreCode() {
  log.header('TEST 5: Non-existent Store Code');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/departments/by-store`, {
      store_code: 'STORE999'
    });
    
    if (response.data.success && response.data.count === 0) {
      log.success('Correctly returned empty result for non-existent store');
      log.info(`Message: ${response.data.message}`);
      return true;
    } else {
      log.warning(`Unexpected result: found ${response.data.count} departments`);
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Test seasonal departments (Type 2)
 */
async function testSeasonalDepartments() {
  log.header('TEST 6: Get Seasonal Departments (Type 2)');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/departments/by-type`, {
      dept_type_id: '2'
    });
    
    if (response.data.success) {
      log.success(`Found ${response.data.count} seasonal departments`);
      log.info(`Message: ${response.data.message}`);
      
      if (response.data.data.length > 0) {
        console.log('\nSeasonal Departments:');
        response.data.data.forEach((dept, index) => {
          console.log(`  ${index + 1}. ${dept.department_name}`);
        });
      }
      
      return true;
    } else {
      log.error('Request failed');
      return false;
    }
  } catch (error) {
    log.error(`Test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n🚀 Starting Department API Tests...\n');
  
  const tests = [
    { name: 'Get Departments by Store Code', fn: testGetDepartmentsByStoreCode },
    { name: 'Get Departments by Type', fn: testGetDepartmentsByType },
    { name: 'Get All Departments', fn: testGetAllDepartments },
    { name: 'Missing dept_type_id', fn: testMissingDeptTypeId },
    { name: 'Non-existent Store Code', fn: testNonExistentStoreCode },
    { name: 'Seasonal Departments', fn: testSeasonalDepartments }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between tests
  }
  
  // Summary
  log.header('TEST SUMMARY');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.error(`${failed} test(s) failed`);
  }
  
  console.log('\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  testGetDepartmentsByStoreCode,
  testGetDepartmentsByType,
  testGetAllDepartments,
  testMissingDeptTypeId,
  testNonExistentStoreCode,
  testSeasonalDepartments,
  runAllTests
};

