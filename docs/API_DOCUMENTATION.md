# API Documentation with Swagger

This document explains the Swagger/OpenAPI documentation setup for the Patel E-commerce API.

## 🎯 Overview

The API documentation is automatically generated using **Swagger UI** and **swagger-jsdoc**. This provides an interactive, user-friendly interface to explore and test all API endpoints.

## 🔗 Access Documentation

Once the server is running, access the documentation at:

- **Swagger UI**: `http://localhost:5001/api-docs`
- **JSON Spec**: `http://localhost:5001/api-docs.json`

For production:
- **Swagger UI**: `https://api.patelecommerce.com/api-docs`

## 📚 Documentation Structure

### Configuration
- **`config/swagger.js`**: Main Swagger/OpenAPI configuration file
  - Defines API metadata (title, version, description)
  - Configures servers (development, production)
  - Defines reusable schemas and security schemes
  - Organizes endpoints by tags

### Endpoint Documentation
- **`docs/swagger/auth.js`**: Authentication endpoints documentation
- **`docs/swagger/endpoints.js`**: All other API endpoints documentation

## 🏷️ API Tags/Categories

The API endpoints are organized into the following categories:

### Public Endpoints
1. **Authentication** - OTP-based authentication and user profile
2. **Products** - Product catalog, search, and filtering
3. **Categories** - Product categories
4. **Subcategories** - Product subcategories
5. **Departments** - Department management
6. **Stores** - Store information
7. **Pincodes** - Pincode serviceability
8. **Payment Modes** - Available payment methods
9. **Delivery Slots** - Delivery time slots
10. **Best Sellers** - Top selling products
11. **Top Sellers** - Popular products
12. **Popular Categories** - Trending categories
13. **Seasonal Categories** - Seasonal offerings
14. **Advertisements** - Banners and promotions
15. **Banners** - Marketing banners

### Protected Endpoints (Require Authentication)
16. **Cart** - Shopping cart management
17. **Orders** - Order placement and history
18. **Favorites** - User wishlist
19. **Addresses** - Delivery address management
20. **Notifications** - User notifications
21. **Razorpay** - Payment gateway integration

### Admin Endpoints (Require Admin Role)
22. **Admin - Dashboard** - Analytics and metrics
23. **Admin - Users** - User management
24. **Admin - Products** - Product management
25. **Admin - Orders** - Order management
26. **Admin - Categories** - Category management
27. **Admin - Content** - Content management
28. **Admin - Notifications** - Notification management

## 🔐 Authentication

### Bearer Token Authentication

Most endpoints require JWT authentication. To use protected endpoints:

1. **Get a token**:
   ```bash
   # Step 1: Request OTP
   POST /api/auth/send-otp
   {
     "mobile": "9876543210"
   }

   # Step 2: Verify OTP and get token
   POST /api/auth/verify-otp
   {
     "mobile": "9876543210",
     "otp": "1234"
   }
   ```

2. **Use the token**: Copy the JWT token from the response

3. **Authorize in Swagger UI**: 
   - Click the "Authorize" button at the top
   - Enter: `Bearer <your-token>`
   - Click "Authorize"

4. **Make authenticated requests**: All protected endpoints will now include your token

## 📖 Key Endpoints

### Authentication Flow
```
POST /api/auth/send-otp          → Send OTP to mobile
POST /api/auth/verify-otp        → Verify OTP, get JWT token
GET  /api/auth/profile           → Get user profile (protected)
PUT  /api/auth/profile           → Update profile (protected)
POST /api/auth/save-fcm-token    → Save FCM token for notifications
```

### Product Discovery
```
GET  /api/products                          → Get all products
POST /api/products/search-products          → Search products by name
POST /api/products/get-products             → Get products by filters
POST /api/products/productdetails           → Get specific product
```

### Shopping Cart
```
POST   /api/cart/save-cart        → Save/update entire cart
POST   /api/cart/get-cart         → Get user's cart
POST   /api/cart/validate-cart    → Validate cart (stock, prices)
POST   /api/cart/add-item         → Add single item
POST   /api/cart/clear-cart       → Clear cart
```

### Orders
```
POST /api/orders/place-order      → Place new order
GET  /api/orders/my-orders        → Get order history
GET  /api/orders/:orderNumber     → Get order details
```

### Categories & Navigation
```
POST /api/departments/get-departments           → Get departments
POST /api/categories/get-categories             → Get categories
POST /api/subcategories/get-subcategories       → Get subcategories
```

### Favorites/Wishlist
```
POST   /api/favorites/add-to-favorites         → Add to favorites
DELETE /api/favorites/remove-from-favorites    → Remove from favorites
POST   /api/favorites/get-favorites            → Get all favorites
POST   /api/favorites/is-favorited             → Check if favorited
```

### Address Management
```
POST   /api/address-crud/add-address      → Add new address
PUT    /api/address-crud/update-address/:id    → Update address
DELETE /api/address-crud/delete-address/:id    → Delete address
POST   /api/address-crud/get-addresses         → Get all addresses
```

### Payment
```
POST /api/razorpay/order          → Create Razorpay order
POST /api/razorpay/verify         → Verify payment
POST /api/payment-modes/get-payment-modes     → Get available payment modes
```

### Admin Dashboard
```
GET /api/admin/dashboard/overview              → Dashboard overview
GET /api/admin/dashboard/sales-trend           → Sales analytics
GET /api/admin/dashboard/top-products          → Top products
GET /api/admin/dashboard/recent-orders         → Recent orders
```

## 📝 Common Request/Response Patterns

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 25,
  "message": "Found 25 items",
  "data": [ ... ]
}
```

## 🔧 Schema Definitions

Key schemas defined in the Swagger configuration:

- **User**: User profile structure
- **Product**: Product catalog item
- **CartItem**: Shopping cart item
- **Order**: Order information
- **Category**: Product category
- **Address**: Delivery address
- **Error**: Standard error response

## 🚀 Testing Endpoints

### Using Swagger UI
1. Navigate to `http://localhost:5001/api-docs`
2. Expand any endpoint
3. Click "Try it out"
4. Fill in required parameters
5. Click "Execute"
6. View the response

### Using curl
```bash
# Get all products
curl -X GET http://localhost:5001/api/products

# Search products
curl -X POST http://localhost:5001/api/products/search-products \
  -H "Content-Type: application/json" \
  -d '{"search_term": "rice", "store_code": "AVB"}'

# Get cart (with authentication)
curl -X POST http://localhost:5001/api/cart/get-cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"store_code": "AVB", "project_code": "PROJ001"}'
```

## 📦 Dependencies

- `swagger-ui-express`: ^5.0.0 - Serves Swagger UI
- `swagger-jsdoc`: ^6.2.8 - Generates OpenAPI spec from JSDoc comments

## 🛠️ Maintenance

### Adding New Endpoints

To document new endpoints:

1. Add JSDoc comments in the route file or create new documentation file in `docs/swagger/`
2. Follow the Swagger/OpenAPI 3.0 specification
3. Use existing schemas when possible
4. Tag appropriately for organization
5. Document all parameters, request bodies, and responses

Example:
```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     tags:
 *       - YourTag
 *     summary: Brief description
 *     description: Detailed description
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
```

### Updating Configuration

To modify API metadata or add new schemas:
1. Edit `config/swagger.js`
2. Update the `definition` object
3. Restart the server to see changes

## 🌐 Production Considerations

For production deployment:

1. **Update server URLs** in `config/swagger.js`:
   ```javascript
   servers: [
     {
       url: 'https://api.yourproductiondomain.com',
       description: 'Production server'
     }
   ]
   ```

2. **Secure the documentation** (optional):
   - Add authentication middleware to `/api-docs` route
   - Or disable Swagger UI in production if not needed

3. **CORS Configuration**: Ensure CORS allows access to documentation

## 📞 Support

For questions about the API or documentation:
- Email: support@patelecommerce.com
- Developer: Gaurav Pawar

## 📄 License

ISC License - See package.json for details
