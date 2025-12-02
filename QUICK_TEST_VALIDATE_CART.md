# Quick Test Guide - Validate Cart API

## Quick Start

### 1. Run All Scenarios
```bash
node test-validate-cart.js all
```

### 2. Run Specific Scenario
```bash
node test-validate-cart.js 1   # Empty Cart
node test-validate-cart.js 2   # Valid Cart
node test-validate-cart.js 3   # Product Not Found
node test-validate-cart.js 4   # Price Changed
node test-validate-cart.js 5   # Insufficient Stock
node test-validate-cart.js 6   # Max Quantity Exceeded
node test-validate-cart.js 7   # Multiple Issues
node test-validate-cart.js 8   # Missing Fields
node test-validate-cart.js 9   # Invalid Auth
node test-validate-cart.js 10  # Multiple Valid Items
```

## Available Test Scenarios

| # | Scenario | Description | Expected Result |
|---|----------|-------------|-----------------|
| 1 | Empty Cart | No items in cart | ✅ Valid (empty) |
| 2 | Valid Cart | All items valid | ✅ Valid |
| 3 | Product Not Found | Invalid product code | ❌ Invalid |
| 4 | Price Changed | Product price updated | ⚠️ Valid (price updated) |
| 5 | Insufficient Stock | Quantity > available stock | ❌ Invalid |
| 6 | Max Quantity Exceeded | Quantity > max allowed | ❌ Invalid |
| 7 | Multiple Issues | Mix of price/stock issues | ❌ Invalid |
| 8 | Missing Fields | Missing store_code/project_code | ❌ 400 Error |
| 9 | Invalid Auth | Wrong JWT token | ❌ 401 Error |
| 10 | Multiple Valid Items | Multiple valid products | ✅ Valid |

## Configuration

Edit these variables in `test-validate-cart.js`:

```javascript
const BASE_URL = 'http://localhost:5001';  // Your API URL
const TEST_MOBILE = '9876543210';           // Test user mobile
const TEST_STORE_CODE = 'AVB';              // Store code
const TEST_PROJECT_CODE = 'PROJ001';        // Project code
```

## Notes

- **Product Codes**: Update `p_code` values in scenarios to match your database
- **Test OTP**: Uses "0000" for testing (configured in User model)
- **Authentication**: Each scenario authenticates automatically
- **Cart Setup**: Some scenarios require cart setup before validation

## Expected Output

The script will show:
- ✅ Green: Success/Valid
- ❌ Red: Error/Invalid
- ⚠️ Yellow: Warning/Updated
- 🔵 Blue: Information

## Troubleshooting

1. **Connection Error**: Check if server is running on `BASE_URL`
2. **Authentication Failed**: Verify OTP is "0000" in User model
3. **Product Not Found**: Update `p_code` values to match your database
4. **Empty Cart**: Some scenarios require cart items - check setup step

