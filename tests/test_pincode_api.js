require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';
const API_URL = `${BASE_URL}/api/pincodes`;

// Test data
const testPincodes = {
  available: '421002',    // From the database
  unavailable: '123456'   // Not in the database
};

/**
 * Test 1: Get all pincodes
 */
async function testGetAllPincodes() {
  console.log('\n========================================');
  console.log('TEST 1: Get All Pincodes');
  console.log('========================================');
  
  try {
    const response = await axios.get(`${API_URL}`);
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Total pincodes:', response.data.total);
    console.log('Count in this page:', response.data.count);
    console.log('Page:', response.data.page);
    console.log('Total pages:', response.data.pages);
    console.log('\nFirst 3 pincodes:');
    response.data.data.slice(0, 3).forEach(p => {
      console.log(`  - ${p.pincode} (ID: ${p.idpincode_master}, Status: ${p.is_enabled})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 2: Get only enabled pincodes
 */
async function testGetEnabledPincodes() {
  console.log('\n========================================');
  console.log('TEST 2: Get Enabled Pincodes Only');
  console.log('========================================');
  
  try {
    const response = await axios.get(`${API_URL}?enabled=true`);
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Total enabled pincodes:', response.data.total);
    console.log('Count:', response.data.count);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 3: Search pincodes
 */
async function testSearchPincodes() {
  console.log('\n========================================');
  console.log('TEST 3: Search Pincodes (421)');
  console.log('========================================');
  
  try {
    const response = await axios.get(`${API_URL}?search=421`);
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Found:', response.data.count, 'pincodes');
    console.log('\nFirst 5 results:');
    response.data.data.slice(0, 5).forEach(p => {
      console.log(`  - ${p.pincode}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 4: Get enabled list (for dropdowns)
 */
async function testGetEnabledList() {
  console.log('\n========================================');
  console.log('TEST 4: Get Enabled List for Dropdown');
  console.log('========================================');
  
  try {
    const response = await axios.get(`${API_URL}/enabled/list`);
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Total enabled pincodes:', response.data.count);
    console.log('\nFirst 5 pincodes:');
    response.data.data.slice(0, 5).forEach(p => {
      console.log(`  - ${p.pincode} (ID: ${p.idpincode_master})`);
    });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 5: Check available pincode using GET
 */
async function testCheckAvailablePincodeGET() {
  console.log('\n========================================');
  console.log('TEST 5: Check Available Pincode (GET)');
  console.log('========================================');
  console.log('Checking pincode:', testPincodes.available);
  
  try {
    const response = await axios.get(`${API_URL}/check/${testPincodes.available}`);
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Serviceable:', response.data.serviceable);
    console.log('Message:', response.data.message);
    if (response.data.data) {
      console.log('Pincode details:', response.data.data.pincode);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 6: Check unavailable pincode using GET
 */
async function testCheckUnavailablePincodeGET() {
  console.log('\n========================================');
  console.log('TEST 6: Check Unavailable Pincode (GET)');
  console.log('========================================');
  console.log('Checking pincode:', testPincodes.unavailable);
  
  try {
    const response = await axios.get(`${API_URL}/check/${testPincodes.unavailable}`);
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Serviceable:', response.data.serviceable);
    console.log('Message:', response.data.message);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 7: Check available pincode using POST (NEW)
 */
async function testCheckAvailablePincodePOST() {
  console.log('\n========================================');
  console.log('TEST 7: Check Available Pincode (POST)');
  console.log('========================================');
  console.log('Checking pincode:', testPincodes.available);
  
  try {
    const response = await axios.post(`${API_URL}/check-availability`, {
      pincode: testPincodes.available
    });
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Available:', response.data.available);
    console.log('Serviceable:', response.data.serviceable);
    console.log('Message:', response.data.message);
    if (response.data.data) {
      console.log('Pincode details:');
      console.log('  - Pincode:', response.data.data.pincode);
      console.log('  - ID:', response.data.data.idpincode_master);
      console.log('  - Status:', response.data.data.is_enabled);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 8: Check unavailable pincode using POST (NEW)
 */
async function testCheckUnavailablePincodePOST() {
  console.log('\n========================================');
  console.log('TEST 8: Check Unavailable Pincode (POST)');
  console.log('========================================');
  console.log('Checking pincode:', testPincodes.unavailable);
  
  try {
    const response = await axios.post(`${API_URL}/check-availability`, {
      pincode: testPincodes.unavailable
    });
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Available:', response.data.available);
    console.log('Serviceable:', response.data.serviceable);
    console.log('Message:', response.data.message);
    console.log('Pincode checked:', response.data.pincode);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 9: POST with invalid pincode
 */
async function testInvalidPincodePOST() {
  console.log('\n========================================');
  console.log('TEST 9: Check Invalid Pincode (POST)');
  console.log('========================================');
  console.log('Checking invalid pincode: 12345 (5 digits)');
  
  try {
    const response = await axios.post(`${API_URL}/check-availability`, {
      pincode: '12345'
    });
    console.log('✅ Response received');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Error:', response.data.error);
  } catch (error) {
    console.error('❌ Error (Expected):', error.response?.data?.error || error.message);
  }
}

/**
 * Test 10: POST without pincode
 */
async function testMissingPincodePOST() {
  console.log('\n========================================');
  console.log('TEST 10: POST Without Pincode');
  console.log('========================================');
  
  try {
    const response = await axios.post(`${API_URL}/check-availability`, {});
    console.log('✅ Response received');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Error:', response.data.error);
  } catch (error) {
    console.error('❌ Error (Expected):', error.response?.data?.error || error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   PINCODE API TESTING                  ║');
  console.log('║   Testing Server:', BASE_URL.padEnd(20), '║');
  console.log('╚════════════════════════════════════════╝');
  
  await testGetAllPincodes();
  await testGetEnabledPincodes();
  await testSearchPincodes();
  await testGetEnabledList();
  await testCheckAvailablePincodeGET();
  await testCheckUnavailablePincodeGET();
  await testCheckAvailablePincodePOST();
  await testCheckUnavailablePincodePOST();
  await testInvalidPincodePOST();
  await testMissingPincodePOST();
  
  console.log('\n========================================');
  console.log('🎉 All tests completed!');
  console.log('========================================\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

