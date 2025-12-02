# Validate Cart API - Test Scenarios

This document provides test scenarios for the **POST /api/cart/validate-cart** endpoint.

## Endpoint Details
- **URL**: `POST /api/cart/validate-cart`
- **Authentication**: Required (Bearer Token)
- **Content-Type**: `application/json`

## Prerequisites
1. User must be authenticated (get JWT token from `/api/auth/verify-otp`)
2. Cart must exist for the authenticated user

---

## Test Scenarios

### Scenario 1: Empty Cart ✅
**Description**: Validate an empty cart

**Setup**: Clear cart first or use a user with no cart items

**Request**:
```json
{
  "store_code": "AVB",
  "project_code": "PROJ001"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Cart is empty",
  "validation": {
    "valid": true,
    "totalItems": 0,
    "validItems": 0,
    "invalidItems": 0,
    "updatedItems": [],
    "invalidItems": []
  }
}
```

---

### Scenario 2: Valid Cart (All Items Valid) ✅
**Description**: Validate a cart with all valid items

**Setup**: Add valid products to cart using `/api/cart/save-cart`

**Request**:
```json
{
  "store_code": "AVB",
  "project_code": "PROJ001"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Cart validation successful",
  "validation": {
    "valid": true,
    "totalItems": 2,
    "validItems": 2,
    "invalidItems": 0,
    "updatedItems": [],
    "invalidItems": []
  }
}
```

---

### Scenario 3: Product Not Found/Inactive ❌
**Description**: Validate cart with non-existent or inactive product

**Setup**: Add product with invalid `p_code` or inactive product

**Cart Item**:
```json
{
  "p_code": "INVALID999",
  "product_name": "Non-existent Product",
  "quantity": 1,
  "unit_price": 100,
  "total_price": 100,
  "store_code": "AVB"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "1 product(s) need attention",
  "status": "invalid",
  "validation": {
    "valid": false,
    "totalItems": 1,
    "validItems": 0,
    "invalidItems": 1,
    "updatedItems": [],
    "invalidItems": [
      {
        "index": 0,
        "action": "remove",
        "actionType": "product_not_found",
        "message": "Product not found or inactive",
        "p_code": "INVALID999",
        "cartItem": {
          "p_code": "INVALID999",
          "product_name": "Non-existent Product",
          "quantity": 1,
          "unit_price": 100,
          "total_price": 100
        },
        "product": null,
        "suggestedAction": {
          "type": "remove",
          "message": "This product is no longer available. Please remove it from your cart."
        }
      }
    ],
    "summary": {
      "hasPriceChanges": false,
      "hasStockIssues": true,
      "hasOutOfStock": false,
      "requiresAction": true
    }
  }
}
```

---

### Scenario 4: Price Changed ⚠️
**Description**: Validate cart when product price has changed

**Setup**: Add product to cart with old price, then price changes in database

**Expected Response** (200):
```json
{
  "success": true,
  "message": "1 product(s) have price changes",
  "status": "price_updated",
  "validation": {
    "valid": true,
    "totalItems": 1,
    "validItems": 1,
    "invalidItems": 0,
    "updatedItems": [
      {
        "index": 0,
        "action": "update_price",
        "actionType": "price_changed",
        "message": "Price updated from ₹15 to ₹18",
        "p_code": "2390",
        "cartItem": {
          "p_code": "2390",
          "product_name": "SABUDANA 250 (N.W.)",
          "quantity": 2,
          "unit_price": 15,
          "total_price": 30
        },
        "product": {
          "p_code": "2390",
          "product_name": "SABUDANA 250 (N.W.)",
          "product_description": "...",
          "package_size": 250,
          "package_unit": "GM",
          "product_mrp": 20,
          "our_price": 18,
          "brand_name": "INDIAN CHASKA",
          "store_code": "AVB",
          "store_quantity": 50,
          "max_quantity_allowed": 10,
          "pcode_img": "https://example.com/image.jpg"
        },
        "price": {
          "old": 15,
          "new": 18,
          "difference": 3,
          "percentageChange": "20.00"
        },
        "stock": {
          "available": 50,
          "requested": 2,
          "status": "available"
        },
        "suggestedAction": {
          "type": "update_price",
          "message": "Price has changed. Update cart with new price ₹18?",
          "newTotalPrice": 36,
          "options": [
            { "action": "update", "label": "Update price", "newPrice": 18 },
            { "action": "remove", "label": "Remove from cart" }
          ]
        }
      }
    ],
    "invalidItems": [],
    "summary": {
      "hasPriceChanges": true,
      "hasStockIssues": false,
      "hasOutOfStock": false,
      "requiresAction": true
    }
  }
}
```

---

### Scenario 5: Insufficient Stock ❌
**Description**: Validate cart when requested quantity exceeds available stock

**Setup**: Add product with quantity > `store_quantity`

**Cart Item**:
```json
{
  "p_code": "2390",
  "quantity": 100,  // If available stock is only 50
  "unit_price": 18,
  "total_price": 1800
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "1 product(s) have insufficient stock",
  "status": "invalid",
  "validation": {
    "valid": false,
    "totalItems": 1,
    "validItems": 0,
    "invalidItems": 1,
    "updatedItems": [],
    "invalidItems": [
      {
        "index": 0,
        "action": "update_quantity",
        "actionType": "insufficient_stock",
        "message": "Only 50 item(s) available. You requested 100.",
        "p_code": "2390",
        "cartItem": {
          "p_code": "2390",
          "product_name": "SABUDANA 250 (N.W.)",
          "quantity": 100,
          "unit_price": 18,
          "total_price": 1800
        },
        "product": {
          "p_code": "2390",
          "product_name": "SABUDANA 250 (N.W.)",
          "our_price": 18,
          "product_mrp": 20,
          "store_quantity": 50,
          "max_quantity_allowed": 10,
          "pcode_img": "https://example.com/image.jpg",
          "brand_name": "INDIAN CHASKA",
          "package_size": 250,
          "package_unit": "GM"
        },
        "stock": {
          "available": 50,
          "requested": 100,
          "status": "insufficient",
          "maxAvailable": 50
        },
        "price": {
          "old": 18,
          "new": 18,
          "changed": false
        },
        "suggestedAction": {
          "type": "update_quantity",
          "message": "Only 50 item(s) available. Update quantity to 50?",
          "newQuantity": 50,
          "options": [
            { "action": "update", "label": "Update to 50", "quantity": 50 },
            { "action": "remove", "label": "Remove from cart" }
          ]
        }
      }
    ],
    "summary": {
      "hasPriceChanges": false,
      "hasStockIssues": true,
      "hasOutOfStock": false,
      "requiresAction": true
    }
  }
}
```

---

### Scenario 6: Quantity Exceeds Max Allowed ❌
**Description**: Validate cart when quantity exceeds `max_quantity_allowed`

**Setup**: Add product with quantity > `max_quantity_allowed`

**Cart Item**:
```json
{
  "p_code": "2390",
  "quantity": 15,  // If max_quantity_allowed is 10
  "unit_price": 18,
  "total_price": 270
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "1 product(s) need attention",
  "status": "invalid",
  "validation": {
    "valid": false,
    "totalItems": 1,
    "validItems": 0,
    "invalidItems": 1,
    "updatedItems": [],
    "invalidItems": [
      {
        "index": 0,
        "action": "update_quantity",
        "actionType": "max_quantity_exceeded",
        "message": "Maximum 10 item(s) allowed per order. You requested 15.",
        "p_code": "2390",
        "cartItem": { ... },
        "product": {
          "p_code": "2390",
          "product_name": "SABUDANA 250 (N.W.)",
          "our_price": 18,
          "store_quantity": 100,
          "max_quantity_allowed": 10
        },
        "stock": {
          "available": 100,
          "requested": 15,
          "status": "available",
          "maxAllowed": 10
        },
        "price": {
          "old": 18,
          "new": 18,
          "changed": false
        },
        "suggestedAction": {
          "type": "update_quantity",
          "message": "Maximum 10 item(s) allowed. Update quantity to 10?",
          "newQuantity": 10,
          "options": [
            { "action": "update", "label": "Update to 10", "quantity": 10 },
            { "action": "remove", "label": "Remove from cart" }
          ]
        }
      }
    ],
    "summary": {
      "hasPriceChanges": false,
      "hasStockIssues": true,
      "hasOutOfStock": false,
      "requiresAction": true
    }
  }
}
```

---

### Scenario 7: Multiple Issues (Price + Stock) ❌
**Description**: Validate cart with multiple items having different issues

**Setup**: Add multiple items with various issues

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Cart validation found issues",
  "validation": {
    "valid": false,
    "totalItems": 3,
    "validItems": 1,
    "invalidItems": 2,
    "updatedItems": [
      {
        "index": 0,
        "p_code": "2390",
        "oldPrice": 15,
        "newPrice": 18,
        "priceDifference": 3
      }
    ],
    "invalidItems": [
      {
        "index": 1,
        "p_code": "2390",
        "reason": "Insufficient stock. Available: 50, Requested: 100"
      },
      {
        "index": 2,
        "p_code": "INVALID999",
        "reason": "Product not found or inactive"
      }
    ]
  }
}
```

---

### Scenario 8: Missing Required Fields ❌
**Description**: Test validation with missing required fields

**Test 8a: Missing store_code**
```json
{
  "project_code": "PROJ001"
}
```

**Expected Response** (400):
```json
{
  "success": false,
  "error": "store_code is required"
}
```

**Test 8b: Missing project_code**
```json
{
  "store_code": "AVB"
}
```

**Expected Response** (400):
```json
{
  "success": false,
  "error": "project_code is required"
}
```

---

### Scenario 9: Invalid Authentication Token ❌
**Description**: Test with invalid or missing JWT token

**Request**: Same as Scenario 2, but with invalid token

**Headers**:
```
Authorization: Bearer invalid_token_12345
```

**Expected Response** (401):
```json
{
  "success": false,
  "message": "Token is not valid."
}
```

---

### Scenario 10: Valid Cart with Multiple Items ✅
**Description**: Validate cart with multiple different valid items

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Cart validation successful",
  "validation": {
    "valid": true,
    "totalItems": 3,
    "validItems": 3,
    "invalidItems": 0,
    "updatedItems": [],
    "invalidItems": []
  }
}
```

---

## Validation Logic Summary

The API validates each cart item against:

1. **Product Existence**: Product must exist and have `pcode_status: 'Y'`
2. **Price Check**: Current price vs cart price (reports as `updatedItems` if different)
3. **Stock Availability**: `quantity` <= `store_quantity`
4. **Max Quantity**: `quantity` <= `max_quantity_allowed`

## Response Structure

```typescript
{
  success: boolean;
  message: string;              // Human-readable message
  status: 'valid' | 'invalid' | 'price_updated';  // Overall status
  store_code: string;
  project_code: string;
  mobile_no: string;
  validation: {
    valid: boolean;              // Overall validation status
    totalItems: number;          // Total items in cart
    validItems: number;          // Count of valid items
    invalidItems: number;        // Count of invalid items
    updatedItems: Array<{         // Items with price changes
      index: number;
      action: 'update_price';    // Frontend action type
      actionType: 'price_changed';
      message: string;           // Human-readable message
      p_code: string;
      cartItem: object;          // Current cart item
      product: {                 // Complete product data for frontend
        p_code: string;
        product_name: string;
        product_description: string;
        package_size: number;
        package_unit: string;
        product_mrp: number;
        our_price: number;
        brand_name: string;
        store_code: string;
        store_quantity: number;
        max_quantity_allowed: number;
        pcode_img: string;
        barcode: string;
      };
      price: {
        old: number;
        new: number;
        difference: number;
        percentageChange: string;
      };
      stock: {
        available: number;
        requested: number;
        status: 'available';
      };
      suggestedAction: {
        type: 'update_price';
        message: string;
        newTotalPrice: number;
        options: Array<{
          action: 'update' | 'remove';
          label: string;
          newPrice?: number;
        }>;
      };
    }>;
    invalidItems: Array<{         // Items with validation issues
      index: number;
      action: 'remove' | 'update_quantity';  // Frontend action type
      actionType: 'product_not_found' | 'out_of_stock' | 'insufficient_stock' | 'max_quantity_exceeded' | 'validation_error';
      message: string;           // Human-readable message
      p_code: string;
      cartItem: object;          // Current cart item
      product: object | null;     // Complete product data (null if not found)
      stock?: {
        available: number;
        requested: number;
        status: 'out_of_stock' | 'insufficient' | 'available';
        maxAvailable?: number;
        maxAllowed?: number;
      };
      price?: {
        old: number;
        new: number;
        changed: boolean;
      };
      suggestedAction: {
        type: 'remove' | 'update_quantity';
        message: string;
        newQuantity?: number;
        options: Array<{
          action: 'update' | 'remove' | 'keep';
          label: string;
          quantity?: number;
        }>;
      };
    }>;
    summary: {                    // Quick summary for frontend
      hasPriceChanges: boolean;
      hasStockIssues: boolean;
      hasOutOfStock: boolean;
      requiresAction: boolean;
    };
  };
}
```

## Frontend Integration Guide

### Handling Price Changes
```javascript
validation.updatedItems.forEach(item => {
  // Show notification
  showNotification(item.message);
  
  // Update cart item with new price
  if (userChoosesUpdate) {
    updateCartItem(item.index, {
      unit_price: item.price.new,
      total_price: item.suggestedAction.newTotalPrice
    });
  }
});
```

### Handling Out of Stock
```javascript
validation.invalidItems
  .filter(item => item.actionType === 'out_of_stock')
  .forEach(item => {
    // Show alert
    showAlert(item.suggestedAction.message);
    
    // Offer options
    if (userChoosesRemove) {
      removeCartItem(item.index);
    } else if (userChoosesKeep) {
      // Keep item but mark as unavailable
      markItemUnavailable(item.index);
    }
  });
```

### Handling Insufficient Stock
```javascript
validation.invalidItems
  .filter(item => item.actionType === 'insufficient_stock')
  .forEach(item => {
    // Show notification
    showNotification(item.message);
    
    // Auto-update or ask user
    if (autoUpdate) {
      updateCartItem(item.index, {
        quantity: item.suggestedAction.newQuantity,
        total_price: item.product.our_price * item.suggestedAction.newQuantity
      });
    } else {
      // Show dialog with options
      showDialog(item.suggestedAction.options);
    }
  });
```

### Handling Max Quantity Exceeded
```javascript
validation.invalidItems
  .filter(item => item.actionType === 'max_quantity_exceeded')
  .forEach(item => {
    // Update to max allowed
    updateCartItem(item.index, {
      quantity: item.suggestedAction.newQuantity,
      total_price: item.product.our_price * item.suggestedAction.newQuantity
    });
  });
```

## Testing with cURL

```bash
# 1. Authenticate and get token
curl -X POST http://localhost:5001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'

curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "otp": "0000"}'

# 2. Save cart (setup)
curl -X POST http://localhost:5001/api/cart/save-cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "store_code": "AVB",
    "project_code": "PROJ001",
    "items": [
      {
        "p_code": "2390",
        "product_name": "SABUDANA 250 (N.W.)",
        "quantity": 2,
        "unit_price": 18,
        "total_price": 36,
        "store_code": "AVB"
      }
    ]
  }'

# 3. Validate cart
curl -X POST http://localhost:5001/api/cart/validate-cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "store_code": "AVB",
    "project_code": "PROJ001"
  }'
```

## Testing with Postman

1. Import the Postman collection
2. Set up environment variables:
   - `base_url`: `http://localhost:5001`
   - `auth_token`: (from verify-otp response)
3. Run the "Validate Cart" request with different payloads

