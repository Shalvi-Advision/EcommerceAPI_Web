# Validate Cart API - Enhanced Response Format

## Overview

The validate cart API now returns **detailed product information** and **actionable messages** so the frontend can automatically update the cart based on validation results.

## Key Features

✅ **Complete Product Data** - Full product information included in response  
✅ **Action Types** - Clear action types for frontend handling  
✅ **Suggested Actions** - Pre-defined actions with options  
✅ **Price Information** - Old/new prices with difference calculations  
✅ **Stock Information** - Available stock, requested quantity, status  
✅ **Summary Flags** - Quick checks for frontend conditional rendering  

---

## Response Structure

### Top Level
```json
{
  "success": true,
  "message": "1 product(s) have price changes",
  "status": "price_updated",  // "valid" | "invalid" | "price_updated"
  "store_code": "AVB",
  "project_code": "PROJ001",
  "mobile_no": "9876543210",
  "validation": { ... }
}
```

### Validation Object
```json
{
  "validation": {
    "valid": true,
    "totalItems": 2,
    "validItems": 1,
    "invalidItems": 1,
    "updatedItems": [...],      // Price changed items
    "invalidItems": [...],      // Items with issues
    "summary": {                // Quick summary flags
      "hasPriceChanges": true,
      "hasStockIssues": true,
      "hasOutOfStock": false,
      "requiresAction": true
    }
  }
}
```

---

## Updated Items (Price Changed)

### Structure
```json
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
    "pcode_img": "https://example.com/image.jpg",
    "barcode": "..."
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
```

### Frontend Handling
```javascript
// Auto-update price
if (item.actionType === 'price_changed') {
  updateCartItem(item.index, {
    unit_price: item.price.new,
    total_price: item.suggestedAction.newTotalPrice
  });
  
  // Show notification
  showNotification(item.message);
}
```

---

## Invalid Items - Out of Stock

### Structure
```json
{
  "index": 1,
  "action": "update_quantity",
  "actionType": "out_of_stock",
  "message": "Product is out of stock",
  "p_code": "2390",
  "cartItem": { ... },
  "product": {
    "p_code": "2390",
    "product_name": "SABUDANA 250 (N.W.)",
    "our_price": 18,
    "store_quantity": 0,  // Out of stock
    "max_quantity_allowed": 10,
    "pcode_img": "..."
  },
  "stock": {
    "available": 0,
    "requested": 2,
    "status": "out_of_stock"
  },
  "price": {
    "old": 18,
    "new": 18,
    "changed": false
  },
  "suggestedAction": {
    "type": "update_quantity",
    "message": "This product is out of stock. Please remove it or wait for restock.",
    "options": [
      { "action": "remove", "label": "Remove from cart" },
      { "action": "keep", "label": "Keep for later (will notify when available)" }
    ]
  }
}
```

### Frontend Handling
```javascript
// Show alert and offer options
if (item.actionType === 'out_of_stock') {
  showAlert({
    title: 'Out of Stock',
    message: item.message,
    options: item.suggestedAction.options.map(opt => ({
      label: opt.label,
      onClick: () => {
        if (opt.action === 'remove') {
          removeCartItem(item.index);
        } else if (opt.action === 'keep') {
          markItemUnavailable(item.index);
        }
      }
    }))
  });
}
```

---

## Invalid Items - Insufficient Stock

### Structure
```json
{
  "index": 2,
  "action": "update_quantity",
  "actionType": "insufficient_stock",
  "message": "Only 50 item(s) available. You requested 100.",
  "p_code": "2390",
  "cartItem": { ... },
  "product": {
    "p_code": "2390",
    "our_price": 18,
    "store_quantity": 50
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
```

### Frontend Handling
```javascript
// Auto-update quantity or show dialog
if (item.actionType === 'insufficient_stock') {
  // Option 1: Auto-update
  updateCartItem(item.index, {
    quantity: item.suggestedAction.newQuantity,
    total_price: item.product.our_price * item.suggestedAction.newQuantity
  });
  
  // Option 2: Show dialog
  showDialog({
    message: item.suggestedAction.message,
    options: item.suggestedAction.options
  });
}
```

---

## Invalid Items - Max Quantity Exceeded

### Structure
```json
{
  "index": 3,
  "action": "update_quantity",
  "actionType": "max_quantity_exceeded",
  "message": "Maximum 10 item(s) allowed per order. You requested 15.",
  "p_code": "2390",
  "product": {
    "max_quantity_allowed": 10
  },
  "stock": {
    "available": 100,
    "requested": 15,
    "status": "available",
    "maxAllowed": 10
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
```

---

## Invalid Items - Product Not Found

### Structure
```json
{
  "index": 4,
  "action": "remove",
  "actionType": "product_not_found",
  "message": "Product not found or inactive",
  "p_code": "INVALID999",
  "cartItem": { ... },
  "product": null,
  "suggestedAction": {
    "type": "remove",
    "message": "This product is no longer available. Please remove it from your cart."
  }
}
```

---

## Action Types Reference

| Action Type | Action | Description | Frontend Behavior |
|------------|--------|-------------|-------------------|
| `price_changed` | `update_price` | Price updated | Update price, show notification |
| `out_of_stock` | `update_quantity` | Product out of stock | Remove or keep for later |
| `insufficient_stock` | `update_quantity` | Not enough stock | Reduce quantity to available |
| `max_quantity_exceeded` | `update_quantity` | Exceeds max allowed | Reduce to max allowed |
| `product_not_found` | `remove` | Product doesn't exist | Remove from cart |

---

## Frontend Integration Example

```javascript
async function validateAndUpdateCart() {
  const response = await fetch('/api/cart/validate-cart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      store_code: 'AVB',
      project_code: 'PROJ001'
    })
  });
  
  const data = await response.json();
  const { validation } = data;
  
  // Check summary flags
  if (validation.summary.requiresAction) {
    // Handle price changes
    if (validation.summary.hasPriceChanges) {
      validation.updatedItems.forEach(item => {
        updateCartPrice(item.index, item.price.new);
        showNotification(item.message);
      });
    }
    
    // Handle stock issues
    if (validation.summary.hasStockIssues) {
      validation.invalidItems.forEach(item => {
        switch (item.actionType) {
          case 'out_of_stock':
            showOutOfStockDialog(item);
            break;
          case 'insufficient_stock':
            autoUpdateQuantity(item.index, item.suggestedAction.newQuantity);
            break;
          case 'max_quantity_exceeded':
            autoUpdateQuantity(item.index, item.suggestedAction.newQuantity);
            break;
          case 'product_not_found':
            removeCartItem(item.index);
            break;
        }
      });
    }
  }
  
  // Refresh cart display
  refreshCartDisplay();
}
```

---

## Benefits

1. **Complete Product Data**: Frontend has all product info to update UI
2. **Clear Actions**: Action types tell frontend exactly what to do
3. **User-Friendly Messages**: Human-readable messages for notifications
4. **Suggested Actions**: Pre-defined options reduce frontend logic
5. **Summary Flags**: Quick checks without iterating through arrays
6. **Price Calculations**: New total prices pre-calculated
7. **Stock Status**: Clear stock status for UI indicators

---

## Testing

Run the test script to see all scenarios:
```bash
node test-validate-cart.js all
```

Each scenario will show:
- Product details
- Price information
- Stock information
- Suggested actions
- Complete JSON response

