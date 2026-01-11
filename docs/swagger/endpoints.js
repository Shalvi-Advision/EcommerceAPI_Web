/**
 * COMPLETE SWAGGER DOCUMENTATION FOR ALL API ENDPOINTS
 * This file contains comprehensive JSDoc Swagger documentation for all endpoints
 * Import this in the swagger config to generate complete API documentation
 */


/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Retrieves all products in the system
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *
 * @swagger
 * /api/products/productdetails:
 *   post:
 *     tags:
 *       - Products
 *     summary: Get product by store code and product code
 *     description: Retrieves a specific product using store_code and p_code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - p_code
 *             properties:
 *               store_code:
 *                 type: string
 *                 example: 'AVB'
 *               p_code:
 *                 type: string
 *                 example: '2390'
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *
 * @swagger
 * /api/products/search-products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Search products by name
 *     description: Search products using partial name matching with optional filters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - search_term
 *               - store_code
 *             properties:
 *               search_term:
 *                 type: string
 *                 example: 'Amu'
 *               store_code:
 *                 type: string
 *                 example: 'AVB'
 *               dept_id:
 *                 type: string
 *                 example: '2'
 *               category_id:
 *                 type: string
 *                 example: '89'
 *               sub_category_id:
 *                 type: string
 *                 example: '349'
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *
 * @swagger
 * /api/products/get-products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Get products by filters
 *     description: Retrieves products filtered by store_code, dept_id, category_id, and sub_category_id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - dept_id
 *               - category_id
 *               - sub_category_id
 *             properties:
 *               store_code:
 *                 type: string
 *                 example: 'AME'
 *               dept_id:
 *                 type: string
 *                 example: '1'
 *               category_id:
 *                 type: string
 *                 example: '1'
 *               sub_category_id:
 *                 type: string
 *                 example: '272'
 *     responses:
 *       200:
 *         description: Filtered products retrieved
 *
 * @swagger
 * /api/products/get-product-by-pcode:
 *   post:
 *     tags:
 *       - Products
 *     summary: Get product by complete filters including pcode
 *     description: Get a specific product using all filters including product code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - dept_id
 *               - category_id
 *               - sub_category_id
 *               - pcode
 *             properties:
 *               store_code:
 *                 type: string
 *               dept_id:
 *                 type: string
 *               category_id:
 *                 type: string
 *               sub_category_id:
 *                 type: string
 *               pcode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *
 *
 * @swagger
 * /api/cart/save-cart:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Save/update user cart
 *     description: Saves or updates the entire cart with all items for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *               - items
 *             properties:
 *               store_code:
 *                 type: string
 *                 example: 'AVB'
 *               project_code:
 *                 type: string
 *                 example: 'PROJ001'
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Cart saved successfully
 *
 * @swagger
 * /api/cart/get-cart:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Get user cart
 *     description: Retrieves the current cart for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *
 * @swagger
 * /api/cart/validate-cart:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Validate cart items
 *     description: Validates cart items against current product data, stock availability, and prices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *               autoFix:
 *                 type: boolean
 *                 description: Automatically fix cart issues if true
 *     responses:
 *       200:
 *         description: Cart validation results
 *
 * @swagger
 * /api/cart/add-item:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add single item to cart
 *     description: Adds or updates a single item in the user's cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *               - p_code
 *               - product_name
 *               - quantity
 *               - unit_price
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *               p_code:
 *                 type: string
 *               product_name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit_price:
 *                 type: number
 *               package_size:
 *                 type: number
 *               package_unit:
 *                 type: string
 *               brand_name:
 *                 type: string
 *               pcode_img:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *
 * @swagger
 * /api/cart/clear-cart:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Clear user cart
 *     description: Removes all items from the user's cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *
 * @swagger
 * /api/cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Get all carts (testing)
 *     description: Retrieves all carts in the system (for testing purposes)
 *     responses:
 *       200:
 *         description: All carts retrieved
 *
 *
 * @swagger
 * /api/orders/place-order:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Place a new order
 *     description: Places a new order with validated cart, delivery slot, and payment information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *               - cart_validated
 *               - delivery_slot_id
 *               - delivery_date
 *               - address_id
 *               - payment_mode_id
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *               cart_validated:
 *                 type: boolean
 *                 description: Must be true - cart must be validated before placing order
 *               delivery_slot_id:
 *                 type: number
 *               delivery_date:
 *                 type: string
 *                 format: date
 *               address_id:
 *                 type: string
 *               payment_mode_id:
 *                 type: number
 *               order_notes:
 *                 type: string
 *               payment_details:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get user order history
 *     description: Retrieves order history for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Maximum number of orders to return
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *
 * @swagger
 * /api/orders/{orderNumber}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order details by order number
 *     description: Retrieves detailed information about a specific order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The order number
 *     responses:
 *       200:
 *         description: Order details retrieved
 *       404:
 *         description: Order not found
 *
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders (admin/testing)
 *     description: Retrieves all orders in the system
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *
 *
 * @swagger
 * /api/categories/get-categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Get categories by filters
 *     description: Retrieves categories by dept_id, store_code, and project_code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dept_id
 *               - store_code
 *               - project_code
 *             properties:
 *               dept_id:
 *                 type: string
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Retrieves all categories in the system
 *     responses:
 *       200:
 *         description: All categories retrieved
 *
 *
 * @swagger
 * /api/favorites/add-to-favorites:
 *   post:
 *     tags:
 *       - Favorites
 *     summary: Add product to favorites
 *     description: Adds a product to user's favorites/wishlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *               - p_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *               p_code:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product added to favorites
 *       400:
 *         description: Product already in favorites
 *
 * @swagger
 * /api/favorites/remove-from-favorites:
 *   delete:
 *     tags:
 *       - Favorites
 *     summary: Remove product from favorites
 *     description: Removes a product from user's favorites
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *               - p_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *               p_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product removed from favorites
 *       404:
 *         description: Product not found in favorites
 *
 * @swagger
 * /api/favorites/get-favorites:
 *   post:
 *     tags:
 *       - Favorites
 *     summary: Get user favorites
 *     description: Retrieves all favorites for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *
 * @swagger
 * /api/favorites/is-favorited:
 *   post:
 *     tags:
 *       - Favorites
 *     summary: Check if product is favorited
 *     description: Checks whether a specific product is in user's favorites
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *               - p_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *               p_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorite status checked
 *
 *
 * @swagger
 * /api/address-crud/add-address:
 *   post:
 *     tags:
 *       - Addresses
 *     summary: Add new delivery address
 *     description: Adds a new delivery address for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - mobile_number
 *               - delivery_addr_line_1
 *               - delivery_addr_city
 *               - delivery_addr_pincode
 *             properties:
 *               full_name:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *               email_id:
 *                 type: string
 *               delivery_addr_line_1:
 *                 type: string
 *               delivery_addr_line_2:
 *                 type: string
 *               delivery_addr_city:
 *                 type: string
 *               delivery_addr_pincode:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Address added successfully
 *
 * @swagger
 * /api/address-crud/update-address/{id}:
 *   put:
 *     tags:
 *       - Addresses
 *     summary: Update delivery address
 *     description: Updates an existing delivery address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *     responses:
 *       200:
 *         description: Address updated successfully
 *
 * @swagger
 * /api/address-crud/delete-address/{id}:
 *   delete:
 *     tags:
 *       - Addresses
 *     summary: Delete delivery address
 *     description: Deletes a delivery address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *
 * @swagger
 * /api/address-crud/get-addresses:
 *   post:
 *     tags:
 *       - Addresses
 *     summary: Get all user addresses
 *     description: Retrieves all delivery addresses for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *
 *
 * @swagger
 * /api/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get user notifications
 *     description: Retrieves all notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get unread notification count
 *     description: Retrieves the count of unread notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved
 *
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     description: Marks all user notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *
 *
 * @swagger
 * /api/razorpay/order:
 *   post:
 *     tags:
 *       - Razorpay
 *     summary: Create Razorpay order
 *     description: Creates a new Razorpay order for payment processing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in rupees
 *     responses:
 *       200:
 *         description: Razorpay order created
 *
 * @swagger
 * /api/razorpay/verify:
 *   post:
 *     tags:
 *       - Razorpay
 *     summary: Verify Razorpay payment
 *     description: Verifies the Razorpay payment signature
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *
 *
 * @swagger
 * /api/admin/dashboard/overview:
 *   get:
 *     tags:
 *       - Admin - Dashboard
 *     summary: Get dashboard overview
 *     description: Retrieves key metrics and statistics for the admin dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved
 *
 * @swagger
 * /api/admin/dashboard/sales-trend:
 *   get:
 *     tags:
 *       - Admin - Dashboard
 *     summary: Get sales trend data
 *     description: Retrieves sales trend data for analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales trend data retrieved
 *
 * @swagger
 * /api/admin/dashboard/top-products:
 *   get:
 *     tags:
 *       - Admin - Dashboard
 *     summary: Get top selling products
 *     description: Retrieves list of top selling products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products retrieved
 *
 * @swagger
 * /api/admin/dashboard/recent-orders:
 *   get:
 *     tags:
 *       - Admin - Dashboard
 *     summary: Get recent orders
 *     description: Retrieves list of recent orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent orders retrieved
 *
 *
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get all users
 *     description: Retrieves all users with pagination and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get user by ID
 *     description: Retrieves detailed information about a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved
 *
 *   put:
 *     tags:
 *       - Admin - Users
 *     summary: Update user
 *     description: Updates user information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *
 *   delete:
 *     tags:
 *       - Admin - Users
 *     summary: Delete user
 *     description: Deletes a user from the system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *
 *
 * @swagger
 * /api/departments/get-departments:
 *   post:
 *     tags:
 *       - Departments
 *     summary: Get departments
 *     description: Retrieves departments by store_code and project_code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *
 * @swagger
 * /api/subcategories/get-subcategories:
 *   post:
 *     tags:
 *       - Subcategories
 *     summary: Get subcategories
 *     description: Retrieves subcategories by category_id, store_code, and project_code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - store_code
 *               - project_code
 *             properties:
 *               category_id:
 *                 type: string
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subcategories retrieved successfully
 *
 * @swagger
 * /api/delivery-slots/get-delivery-slots:
 *   post:
 *     tags:
 *       - Delivery Slots
 *     summary: Get delivery slots
 *     description: Retrieves available delivery slots for a store
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *             properties:
 *               store_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery slots retrieved successfully
 *
 * @swagger
 * /api/payment-modes/get-payment-modes:
 *   post:
 *     tags:
 *       - Payment Modes
 *     summary: Get payment modes
 *     description: Retrieves available payment modes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - store_code
 *               - project_code
 *             properties:
 *               store_code:
 *                 type: string
 *               project_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment modes retrieved successfully
 *
 * @swagger
 * /api/stores:
 *   get:
 *     tags:
 *       - Stores
 *     summary: Get all stores
 *     description: Retrieves all available stores
 *     responses:
 *       200:
 *         description: Stores retrieved successfully
 *
 * @swagger
 * /api/pincodes/check-serviceability:
 *   post:
 *     tags:
 *       - Pincodes
 *     summary: Check pincode serviceability
 *     description: Checks if delivery is available for a specific pincode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pincode
 *             properties:
 *               pincode:
 *                 type: string
 *                 example: '400001'
 *     responses:
 *       200:
 *         description: Serviceability checked
 *
 * @swagger
 * /api/best-sellers:
 *   get:
 *     tags:
 *       - Best Sellers
 *     summary: Get best selling products
 *     description: Retrieves list of best selling products
 *     responses:
 *       200:
 *         description: Best sellers retrieved
 *
 * @swagger
 * /api/advertisements:
 *   get:
 *     tags:
 *       - Advertisements
 *     summary: Get all advertisements
 *     description: Retrieves all active advertisements/banners
 *     responses:
 *       200:
 *         description: Advertisements retrieved successfully
 */
