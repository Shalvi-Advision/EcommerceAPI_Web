/**
 * Test Validate Cart API with Different Scenarios
 * 
 * This script tests the POST /api/cart/validate-cart endpoint
 * with various scenarios including valid carts, invalid products,
 * price changes, stock issues, and more.
 * 
 * Usage:
 *   node test-validate-cart.js <scenario_number>
 * 
 * Scenarios:
 *   1. Empty Cart
 *   2. Valid Cart (All items valid)
 *   3. Product Not Found/Inactive
 *   4. Price Changed
 *   5. Insufficient Stock
 *   6. Quantity Exceeds Max Allowed
 *   7. Multiple Issues (Price + Stock)
 *   8. Missing Required Fields
 *   9. Invalid Authentication Token
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5001';
const TEST_MOBILE = '9876543210';
const TEST_STORE_CODE = 'AVB';
const TEST_PROJECT_CODE = 'PROJ001';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let authToken = null;

/**
 * Helper function to print colored output
 */
function print(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Step 1: Authenticate and get JWT token
 */
async function authenticate() {
  try {
    print('cyan', '\n=== Step 1: Authenticating User ===');
    
    // Send OTP
    const otpResponse = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
      mobile: TEST_MOBILE
    });
    
    print('green', `✓ OTP sent: ${otpResponse.data.otp || 'Check console'}`);
    
    // Verify OTP (using test OTP "0000")
    const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
      mobile: TEST_MOBILE,
      otp: '0000'
    });
    
    authToken = verifyResponse.data.data.token;
    print('green', `✓ Authentication successful!`);
    print('blue', `  Token: ${authToken.substring(0, 20)}...`);
    
    return authToken;
  } catch (error) {
    print('red', `✗ Authentication failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

/**
 * Step 2: Setup cart with items
 */
async function setupCart(items) {
  try {
    print('cyan', '\n=== Step 2: Setting up Cart ===');
    
    const response = await axios.post(
      `${BASE_URL}/api/cart/save-cart`,
      {
        store_code: TEST_STORE_CODE,
        project_code: TEST_PROJECT_CODE,
        items: items
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    print('green', `✓ Cart setup successful!`);
    print('blue', `  Items: ${items.length}`);
    print('blue', `  Subtotal: ₹${response.data.data.subtotal}`);
    
    return response.data;
  } catch (error) {
    print('red', `✗ Cart setup failed: ${error.response?.data?.error || error.message}`);
    throw error;
  }
}

/**
 * Step 3: Validate cart
 */
async function validateCart(storeCode = TEST_STORE_CODE, projectCode = TEST_PROJECT_CODE) {
  try {
    print('cyan', '\n=== Step 3: Validating Cart ===');
    
    const response = await axios.post(
      `${BASE_URL}/api/cart/validate-cart`,
      {
        store_code: storeCode,
        project_code: projectCode
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    return {
      error: true,
      status: error.response?.status,
      data: error.response?.data || { message: error.message }
    };
  }
}

/**
 * Display validation results with enhanced product information
 */
function displayResults(results) {
  if (results.error) {
    print('red', `\n✗ Validation Error (Status: ${results.status})`);
    console.log(JSON.stringify(results.data, null, 2));
    return;
  }
  
  const validation = results.validation;
  
  print('cyan', '\n=== Validation Results ===');
  print('blue', `Status: ${results.status || (validation.valid ? 'valid' : 'invalid')}`);
  print(validation.valid ? 'green' : 'yellow', 
    `Valid: ${validation.valid ? 'YES ✓' : 'NO ✗'}`);
  print('blue', `Total Items: ${validation.totalItems}`);
  print('green', `Valid Items: ${validation.validItems}`);
  print('red', `Invalid Items: ${validation.totalInvalidItems}`);
  
  // Display summary
  if (validation.summary) {
    print('cyan', '\n=== Summary ===');
    print('yellow', `Has Price Changes: ${validation.summary.hasPriceChanges ? 'YES ⚠️' : 'NO'}`);
    print('yellow', `Has Stock Issues: ${validation.summary.hasStockIssues ? 'YES ⚠️' : 'NO'}`);
    print('red', `Has Out of Stock: ${validation.summary.hasOutOfStock ? 'YES ✗' : 'NO'}`);
    print('blue', `Requires Action: ${validation.summary.requiresAction ? 'YES' : 'NO'}`);
  }
  
  // Display price updated items with product details
  if (validation.updatedItems && validation.updatedItems.length > 0) {
    print('yellow', `\n⚠️ Price Updated Items (${validation.updatedItems.length}):`);
    validation.updatedItems.forEach((item, idx) => {
      print('yellow', `\n  Item ${idx + 1}:`);
      print('yellow', `    Product: ${item.product?.product_name || item.p_code}`);
      print('yellow', `    Code: ${item.p_code}`);
      print('yellow', `    Price: ₹${item.price?.old} → ₹${item.price?.new}`);
      print('yellow', `    Difference: ₹${item.price?.difference} (${item.price?.percentageChange}%)`);
      print('yellow', `    Action: ${item.action} (${item.actionType})`);
      print('yellow', `    Message: ${item.message}`);
      if (item.suggestedAction) {
        print('cyan', `    Suggested: ${item.suggestedAction.message}`);
        if (item.suggestedAction.options) {
          item.suggestedAction.options.forEach(opt => {
            print('cyan', `      - ${opt.label}`);
          });
        }
      }
      if (item.product) {
        print('blue', `    Stock Available: ${item.stock?.available || item.product.store_quantity}`);
        print('blue', `    Max Allowed: ${item.product.max_quantity_allowed || 'N/A'}`);
      }
    });
  }
  
  // Display invalid items with detailed product information
  if (validation.invalidItems && validation.invalidItems.length > 0) {
    print('red', `\n✗ Invalid Items (${validation.invalidItems.length}):`);
    validation.invalidItems.forEach((item, idx) => {
      print('red', `\n  Item ${idx + 1}:`);
      print('red', `    Product: ${item.product?.product_name || item.p_code || 'Unknown'}`);
      print('red', `    Code: ${item.p_code}`);
      print('red', `    Action Type: ${item.actionType}`);
      print('red', `    Action: ${item.action}`);
      print('red', `    Message: ${item.message}`);
      
      if (item.product) {
        print('blue', `    Current Price: ₹${item.product.our_price}`);
        print('blue', `    MRP: ₹${item.product.product_mrp}`);
        print('blue', `    Brand: ${item.product.brand_name || 'N/A'}`);
        print('blue', `    Package: ${item.product.package_size} ${item.product.package_unit}`);
        if (item.product.pcode_img) {
          print('blue', `    Image: ${item.product.pcode_img}`);
        }
      }
      
      if (item.stock) {
        print('yellow', `    Stock Status: ${item.stock.status}`);
        print('yellow', `    Available: ${item.stock.available}`);
        print('yellow', `    Requested: ${item.stock.requested}`);
        if (item.stock.maxAvailable !== undefined) {
          print('yellow', `    Max Available: ${item.stock.maxAvailable}`);
        }
        if (item.stock.maxAllowed !== undefined) {
          print('yellow', `    Max Allowed: ${item.stock.maxAllowed}`);
        }
      }
      
      if (item.price) {
        print('yellow', `    Price Changed: ${item.price.changed ? 'YES' : 'NO'}`);
        if (item.price.changed) {
          print('yellow', `    Old Price: ₹${item.price.old}`);
          print('yellow', `    New Price: ₹${item.price.new}`);
        }
      }
      
      if (item.suggestedAction) {
        print('cyan', `    Suggested Action: ${item.suggestedAction.type}`);
        print('cyan', `    Message: ${item.suggestedAction.message}`);
        if (item.suggestedAction.newQuantity !== undefined) {
          print('cyan', `    New Quantity: ${item.suggestedAction.newQuantity}`);
        }
        if (item.suggestedAction.options) {
          print('cyan', `    Options:`);
          item.suggestedAction.options.forEach(opt => {
            print('cyan', `      - ${opt.action}: ${opt.label}`);
            if (opt.quantity !== undefined) {
              print('cyan', `        Quantity: ${opt.quantity}`);
            }
          });
        }
      }
    });
  }
  
  // Display full JSON for reference
  print('cyan', '\n=== Full Response JSON ===');
  console.log(JSON.stringify(results, null, 2));
}

// ==================== TEST SCENARIOS ====================

/**
 * Scenario 1: Empty Cart
 */
async function scenario1_EmptyCart() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 1: Empty Cart');
  print('bright', '========================================');
  
  await authenticate();
  
  // Clear cart first
  try {
    await axios.post(
      `${BASE_URL}/api/cart/clear-cart`,
      {
        store_code: TEST_STORE_CODE,
        project_code: TEST_PROJECT_CODE
      },
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );
    print('green', '✓ Cart cleared');
  } catch (error) {
    // Cart might not exist, that's okay
  }
  
  const results = await validateCart();
  displayResults(results);
}

/**
 * Scenario 2: Valid Cart (All items valid)
 */
async function scenario2_ValidCart() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 2: Valid Cart (All items valid)');
  print('bright', '========================================');
  
  await authenticate();
  
  // Setup cart with valid items (adjust p_code based on your database)
  const validItems = [
    {
      p_code: '2390', // Replace with actual product code from your DB
      product_name: 'SABUDANA 250 (N.W.)',
      quantity: 2,
      unit_price: 18,
      total_price: 36,
      package_size: 250,
      package_unit: 'GM',
      brand_name: 'INDIAN CHASKA',
      pcode_img: 'https://example.com/image.jpg',
      store_code: TEST_STORE_CODE
    }
  ];
  
  await setupCart(validItems);
  
  const results = await validateCart();
  displayResults(results);
}

/**
 * Scenario 3: Product Not Found/Inactive
 */
async function scenario3_ProductNotFound() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 3: Product Not Found/Inactive');
  print('bright', '========================================');
  
  await authenticate();
  
  // Setup cart with non-existent product code
  const invalidItems = [
    {
      p_code: 'INVALID999',
      product_name: 'Non-existent Product',
      quantity: 1,
      unit_price: 100,
      total_price: 100,
      store_code: TEST_STORE_CODE
    }
  ];
  
  await setupCart(invalidItems);
  
  const results = await validateCart();
  displayResults(results);
}

/**
 * Scenario 4: Price Changed
 */
async function scenario4_PriceChanged() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 4: Price Changed');
  print('bright', '========================================');
  
  await authenticate();
  
  // Setup cart with old price (price will be different in database)
  // First, get actual product to see current price
  try {
    const productResponse = await axios.post(`${BASE_URL}/api/products/productdetails`, {
      store_code: TEST_STORE_CODE,
      p_code: '2390' // Replace with actual product code
    });
    
    const currentPrice = productResponse.data.data?.our_price || 18;
    const oldPrice = currentPrice - 5; // Use lower price to simulate price increase
    
    const priceChangedItems = [
      {
        p_code: '2390',
        product_name: 'SABUDANA 250 (N.W.)',
        quantity: 2,
        unit_price: oldPrice, // Old price
        total_price: oldPrice * 2,
        package_size: 250,
        package_unit: 'GM',
        brand_name: 'INDIAN CHASKA',
        store_code: TEST_STORE_CODE
      }
    ];
    
    await setupCart(priceChangedItems);
    
    const results = await validateCart();
    displayResults(results);
  } catch (error) {
    print('red', `✗ Could not fetch product: ${error.message}`);
    print('yellow', '  Note: Adjust product code in the script');
  }
}

/**
 * Scenario 5: Insufficient Stock
 */
async function scenario5_InsufficientStock() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 5: Insufficient Stock');
  print('bright', '========================================');
  
  await authenticate();
  
  // Setup cart with quantity exceeding available stock
  try {
    const productResponse = await axios.post(`${BASE_URL}/api/products/productdetails`, {
      store_code: TEST_STORE_CODE,
      p_code: '2390' // Replace with actual product code
    });
    
    const availableStock = productResponse.data.data?.store_quantity || 0;
    const requestedQuantity = availableStock + 10; // Request more than available
    
    const stockItems = [
      {
        p_code: '2390',
        product_name: 'SABUDANA 250 (N.W.)',
        quantity: requestedQuantity,
        unit_price: 18,
        total_price: 18 * requestedQuantity,
        store_code: TEST_STORE_CODE
      }
    ];
    
    await setupCart(stockItems);
    
    const results = await validateCart();
    displayResults(results);
  } catch (error) {
    print('red', `✗ Could not fetch product: ${error.message}`);
  }
}

/**
 * Scenario 6: Quantity Exceeds Max Allowed
 */
async function scenario6_MaxQuantityExceeded() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 6: Quantity Exceeds Max Allowed');
  print('bright', '========================================');
  
  await authenticate();
  
  // Setup cart with quantity exceeding max_quantity_allowed
  try {
    const productResponse = await axios.post(`${BASE_URL}/api/products/productdetails`, {
      store_code: TEST_STORE_CODE,
      p_code: '2390' // Replace with actual product code
    });
    
    const maxAllowed = productResponse.data.data?.max_quantity_allowed || 10;
    const requestedQuantity = maxAllowed + 5; // Exceed max allowed
    
    const maxQuantityItems = [
      {
        p_code: '2390',
        product_name: 'SABUDANA 250 (N.W.)',
        quantity: requestedQuantity,
        unit_price: 18,
        total_price: 18 * requestedQuantity,
        store_code: TEST_STORE_CODE
      }
    ];
    
    await setupCart(maxQuantityItems);
    
    const results = await validateCart();
    displayResults(results);
  } catch (error) {
    print('red', `✗ Could not fetch product: ${error.message}`);
  }
}

/**
 * Scenario 7: Multiple Issues (Price + Stock)
 */
async function scenario7_MultipleIssues() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 7: Multiple Issues');
  print('bright', '========================================');
  
  await authenticate();
  
  // Setup cart with multiple items having different issues
  try {
    const productResponse = await axios.post(`${BASE_URL}/api/products/productdetails`, {
      store_code: TEST_STORE_CODE,
      p_code: '2390'
    });
    
    const currentPrice = productResponse.data.data?.our_price || 18;
    const availableStock = productResponse.data.data?.store_quantity || 0;
    
    const multipleIssuesItems = [
      {
        p_code: '2390',
        product_name: 'SABUDANA 250 (N.W.)',
        quantity: availableStock + 5, // Insufficient stock
        unit_price: currentPrice - 3, // Price changed
        total_price: (currentPrice - 3) * (availableStock + 5),
        store_code: TEST_STORE_CODE
      },
      {
        p_code: 'INVALID999',
        product_name: 'Non-existent Product',
        quantity: 1,
        unit_price: 100,
        total_price: 100,
        store_code: TEST_STORE_CODE
      }
    ];
    
    await setupCart(multipleIssuesItems);
    
    const results = await validateCart();
    displayResults(results);
  } catch (error) {
    print('red', `✗ Error: ${error.message}`);
  }
}

/**
 * Scenario 8: Missing Required Fields
 */
async function scenario8_MissingFields() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 8: Missing Required Fields');
  print('bright', '========================================');
  
  await authenticate();
  
  // Test without store_code
  print('yellow', '\n--- Test 1: Missing store_code ---');
  let results = await axios.post(
    `${BASE_URL}/api/cart/validate-cart`,
    {
      project_code: TEST_PROJECT_CODE
      // Missing store_code
    },
    {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }
  ).catch(error => ({
    error: true,
    status: error.response?.status,
    data: error.response?.data
  }));
  
  if (results.error) {
    print('red', `✗ Expected error (Status: ${results.status})`);
    console.log(JSON.stringify(results.data, null, 2));
  }
  
  // Test without project_code
  print('yellow', '\n--- Test 2: Missing project_code ---');
  results = await axios.post(
    `${BASE_URL}/api/cart/validate-cart`,
    {
      store_code: TEST_STORE_CODE
      // Missing project_code
    },
    {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }
  ).catch(error => ({
    error: true,
    status: error.response?.status,
    data: error.response?.data
  }));
  
  if (results.error) {
    print('red', `✗ Expected error (Status: ${results.status})`);
    console.log(JSON.stringify(results.data, null, 2));
  }
}

/**
 * Scenario 9: Invalid Authentication Token
 */
async function scenario9_InvalidAuth() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 9: Invalid Authentication Token');
  print('bright', '========================================');
  
  // Use invalid token
  authToken = 'invalid_token_12345';
  
  const results = await validateCart();
  
  if (results.error) {
    print('red', `✗ Expected authentication error (Status: ${results.status})`);
    console.log(JSON.stringify(results.data, null, 2));
  } else {
    print('yellow', '⚠ Unexpected success - authentication might not be enforced');
  }
}

/**
 * Scenario 10: Valid Cart with Multiple Items
 */
async function scenario10_MultipleValidItems() {
  print('bright', '\n\n========================================');
  print('bright', 'SCENARIO 10: Valid Cart with Multiple Items');
  print('bright', '========================================');
  
  await authenticate();
  
  // Setup cart with multiple valid items
  const multipleItems = [
    {
      p_code: '2390',
      product_name: 'SABUDANA 250 (N.W.)',
      quantity: 2,
      unit_price: 18,
      total_price: 36,
      package_size: 250,
      package_unit: 'GM',
      brand_name: 'INDIAN CHASKA',
      store_code: TEST_STORE_CODE
    },
    {
      p_code: '2390', // Same product, different quantity
      product_name: 'SABUDANA 250 (N.W.)',
      quantity: 1,
      unit_price: 18,
      total_price: 18,
      package_size: 250,
      package_unit: 'GM',
      brand_name: 'INDIAN CHASKA',
      store_code: TEST_STORE_CODE
    }
  ];
  
  await setupCart(multipleItems);
  
  const results = await validateCart();
  displayResults(results);
}

// ==================== MAIN EXECUTION ====================

const scenarios = {
  1: scenario1_EmptyCart,
  2: scenario2_ValidCart,
  3: scenario3_ProductNotFound,
  4: scenario4_PriceChanged,
  5: scenario5_InsufficientStock,
  6: scenario6_MaxQuantityExceeded,
  7: scenario7_MultipleIssues,
  8: scenario8_MissingFields,
  9: scenario9_InvalidAuth,
  10: scenario10_MultipleValidItems
};

async function runAllScenarios() {
  print('bright', '\n\n╔════════════════════════════════════════╗');
  print('bright', '║  VALIDATE CART API - ALL SCENARIOS   ║');
  print('bright', '╚════════════════════════════════════════╝');
  
  for (const [num, scenario] of Object.entries(scenarios)) {
    try {
      await scenario();
      // Wait a bit between scenarios
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      print('red', `\n✗ Scenario ${num} failed: ${error.message}`);
    }
  }
  
  print('bright', '\n\n✅ All scenarios completed!');
}

// Run specific scenario or all
const scenarioNum = process.argv[2];

if (scenarioNum && scenarios[scenarioNum]) {
  scenarios[scenarioNum]().catch(error => {
    print('red', `\n✗ Error: ${error.message}`);
    process.exit(1);
  });
} else if (scenarioNum === 'all') {
  runAllScenarios().catch(error => {
    print('red', `\n✗ Error: ${error.message}`);
    process.exit(1);
  });
} else {
  print('yellow', '\nUsage:');
  print('yellow', '  node test-validate-cart.js <scenario_number>');
  print('yellow', '  node test-validate-cart.js all');
  print('yellow', '\nAvailable scenarios:');
  Object.keys(scenarios).forEach(num => {
    print('cyan', `  ${num}. ${scenarios[num].name.replace('scenario', '').replace(/_/g, ' ')}`);
  });
  process.exit(0);
}

