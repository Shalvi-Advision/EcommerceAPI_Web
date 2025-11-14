# Admin Routes Documentation

All admin routes are prefixed with `/api/admin` and require authentication with admin role.

**Base URL:** `/api/admin`

---

## 📊 Dashboard Routes (`/api/admin/dashboard`)

### Overview & Statistics
- `GET /api/admin/dashboard/overview` - Get overall dashboard statistics (users, products, orders, revenue)
- `GET /api/admin/dashboard/sales-trend` - Get sales trend data (last 30 days, customizable)
- `GET /api/admin/dashboard/top-products` - Get top selling products
- `GET /api/admin/dashboard/top-categories` - Get top categories by sales
- `GET /api/admin/dashboard/recent-orders` - Get recent orders
- `GET /api/admin/dashboard/order-status-distribution` - Get order distribution by status
- `GET /api/admin/dashboard/payment-status-distribution` - Get payment distribution by status
- `GET /api/admin/dashboard/user-activity` - Get user activity statistics

---

## 👥 User Management Routes (`/api/admin/users`)

### User CRUD Operations
- `GET /api/admin/users` - Get all users with pagination, search, and filters
  - Query params: `page`, `limit`, `search`, `role`, `sortBy`, `sortOrder`
- `GET /api/admin/users/:id` - Get single user by ID with detailed information
- `PUT /api/admin/users/:id` - Update user details (name, email, mobile, role, isVerified)
- `DELETE /api/admin/users/:id` - Delete user (soft delete by deactivating)
- `PATCH /api/admin/users/:id/role` - Change user role (user/admin)

### User Statistics
- `GET /api/admin/users/stats/overview` - Get user statistics overview

---

## 📦 Product Management Routes (`/api/admin/products`)

### Product CRUD Operations
- `GET /api/admin/products` - Get all products with advanced filtering and pagination
  - Query params: `page`, `limit`, `search`, `category`, `subcategory`, `status`, `stockStatus`, `sortBy`, `sortOrder`
- `GET /api/admin/products/:id` - Get single product by ID
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Product Management Operations
- `PATCH /api/admin/products/:id/stock` - Update product stock (add/subtract/set)
- `PATCH /api/admin/products/:id/status` - Update product status (active/inactive/out_of_stock/discontinued)
- `PATCH /api/admin/products/:id/price` - Update product pricing (mrp, sellingPrice, discount)

### Product Statistics & Bulk Operations
- `GET /api/admin/products/stats/overview` - Get product statistics overview
- `POST /api/admin/products/bulk-update-status` - Bulk update product status

---

## 🛒 Order Management Routes (`/api/admin/orders`)

### Order CRUD Operations
- `GET /api/admin/orders` - Get all orders with filtering and pagination
  - Query params: `page`, `limit`, `search`, `status`, `paymentStatus`, `startDate`, `endDate`, `sortBy`, `sortOrder`
- `GET /api/admin/orders/:id` - Get single order by ID
- `PUT /api/admin/orders/:id` - Update order details
- `DELETE /api/admin/orders/:id` - Delete order (only if not processed)

### Order Status Management
- `PATCH /api/admin/orders/:id/status` - Update order status (placed/confirmed/processing/packed/shipped/delivered/cancelled/refunded)
- `PATCH /api/admin/orders/:id/payment-status` - Update payment status (pending/processing/completed/failed/cancelled)

### Order Statistics & Bulk Operations
- `GET /api/admin/orders/stats/overview` - Get order statistics overview
- `GET /api/admin/orders/stats/revenue` - Get revenue statistics by date range
- `POST /api/admin/orders/bulk-update-status` - Bulk update order status

---

## 📁 Category Management Routes (`/api/admin/categories`)

### Category CRUD Operations
- `GET /api/admin/categories` - Get all categories with pagination and filters
  - Query params: `page`, `limit`, `search`, `storeCode`, `deptId`, `sortBy`, `sortOrder`
- `GET /api/admin/categories/:id` - Get single category by ID
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Department Management
- `GET /api/admin/categories/departments/all` - Get all departments with pagination and filters
  - Query params: `page`, `limit`, `search`, `storeCode`, `deptTypeId`, `sortBy`, `sortOrder`
- `GET /api/admin/categories/departments/:id` - Get single department by ID
- `POST /api/admin/categories/departments` - Create new department
- `PUT /api/admin/categories/departments/:id` - Update department
- `DELETE /api/admin/categories/departments/:id` - Delete department

### Subcategory Management
- `GET /api/admin/categories/subcategories/all` - Get all subcategories with pagination and filters
  - Query params: `page`, `limit`, `search`, `categoryId`, `sortBy`, `sortOrder`
- `POST /api/admin/categories/subcategories` - Create new subcategory
- `PUT /api/admin/categories/subcategories/:id` - Update subcategory
- `DELETE /api/admin/categories/subcategories/:id` - Delete subcategory

---

## 📝 Content Management Routes (`/api/admin/content`)

### Best Sellers Management
- `GET /api/admin/content/best-sellers` - Get all best sellers
  - Query params: `page`, `limit`, `sortBy`, `sortOrder`
- `GET /api/admin/content/best-sellers/:id` - Get single best seller by ID
- `POST /api/admin/content/best-sellers` - Create best seller
- `PUT /api/admin/content/best-sellers/:id` - Update best seller
- `DELETE /api/admin/content/best-sellers/:id` - Delete best seller

### Advertisements Management
- `GET /api/admin/content/advertisements` - Get all advertisements
  - Query params: `page`, `limit`, `sortBy`, `sortOrder`
- `GET /api/admin/content/advertisements/:id` - Get single advertisement by ID
- `POST /api/admin/content/advertisements` - Create advertisement
- `PUT /api/admin/content/advertisements/:id` - Update advertisement
- `DELETE /api/admin/content/advertisements/:id` - Delete advertisement

### Popular Categories Management
- `GET /api/admin/content/popular-categories` - Get all popular categories
  - Query params: `page`, `limit`, `sortBy`, `sortOrder`
- `GET /api/admin/content/popular-categories/:id` - Get single popular category by ID
- `POST /api/admin/content/popular-categories` - Create popular category
- `PUT /api/admin/content/popular-categories/:id` - Update popular category
- `DELETE /api/admin/content/popular-categories/:id` - Delete popular category

### Payment Modes Management
- `GET /api/admin/content/payment-modes` - Get all payment modes
  - Query params: `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/admin/content/payment-modes` - Create payment mode
- `PUT /api/admin/content/payment-modes/:id` - Update payment mode
- `DELETE /api/admin/content/payment-modes/:id` - Delete payment mode

### Pincodes Management
- `GET /api/admin/content/pincodes` - Get all pincodes
  - Query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- `POST /api/admin/content/pincodes` - Create pincode
- `PUT /api/admin/content/pincodes/:id` - Update pincode
- `DELETE /api/admin/content/pincodes/:id` - Delete pincode

### Stores Management
- `GET /api/admin/content/stores` - Get all stores
  - Query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- `POST /api/admin/content/stores` - Create store
- `PUT /api/admin/content/stores/:id` - Update store
- `DELETE /api/admin/content/stores/:id` - Delete store

### Delivery Slots Management
- `GET /api/admin/content/delivery-slots` - Get all delivery slots
  - Query params: `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/admin/content/delivery-slots` - Create delivery slot
- `PUT /api/admin/content/delivery-slots/:id` - Update delivery slot
- `DELETE /api/admin/content/delivery-slots/:id` - Delete delivery slot

---

## 🔐 Authentication & Authorization

All admin routes require:
1. **Authentication**: Valid JWT token in Authorization header
2. **Authorization**: User must have `role: 'admin'`

**Middleware Applied:**
- `protect` - Verifies JWT token
- `authorize('admin')` - Verifies admin role

**Example Request Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## 📊 Route Summary

| Category | Total Routes | Main Operations |
|----------|--------------|-----------------|
| Dashboard | 8 | Statistics, trends, analytics |
| Users | 6 | CRUD, role management, stats |
| Products | 10 | CRUD, stock, pricing, bulk operations |
| Orders | 9 | CRUD, status management, revenue stats |
| Categories | 11 | Categories, departments, subcategories |
| Content | 28 | Best sellers, ads, popular categories, payment modes, pincodes, stores, delivery slots |
| **TOTAL** | **72** | Complete admin management system |

---

## 📝 Notes

- All routes support pagination with `page` and `limit` query parameters
- Most list endpoints support search functionality
- Sorting is available on most endpoints via `sortBy` and `sortOrder` parameters
- All routes return JSON responses with `success` boolean and `data` fields
- Error responses include `success: false`, `message`, and `error` fields

