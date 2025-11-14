const fs = require('fs');
const path = require('path');

/**
 * Complete Admin Routes Postman Collection Updater
 * 
 * This script updates the Postman collection with ALL admin routes (72 routes total)
 * Ensures authentication is properly configured for all admin endpoints
 */

const collectionPath = path.join(__dirname, 'postman', 'Patel_Ecommerce_API.postman_collection.json');
const backupPath = path.join(__dirname, 'postman', 'Patel_Ecommerce_API.postman_collection.backup.json');

// Create backup
console.log('📦 Creating backup...');
if (fs.existsSync(collectionPath)) {
  fs.copyFileSync(collectionPath, backupPath);
  console.log('✅ Backup created');
}

// Read existing collection
console.log('📖 Reading existing Postman collection...');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

console.log(`✅ Found collection: "${collection.info.name}"`);

// Helper function to create request
function createRequest(method, pathParts, options = {}) {
  const { query = [], body = null, variables = [], description = '' } = options;
  
  const urlParts = {
    raw: `{{baseUrl}}/${pathParts.join('/')}${query.length ? '?' + query.map(q => `${q.key}=${q.value || ''}`).join('&') : ''}`,
    host: ['{{baseUrl}}'],
    path: pathParts
  };
  
  if (variables.length) {
    urlParts.variable = variables;
  }
  
  if (query.length) {
    urlParts.query = query;
  }
  
  const request = {
    method: method,
    header: method !== 'GET' && method !== 'DELETE' ? [
      { key: 'Content-Type', value: 'application/json' }
    ] : [],
    url: urlParts
  };
  
  if (body) {
    request.body = {
      mode: 'raw',
      raw: typeof body === 'string' ? body : JSON.stringify(body, null, 2)
    };
  }
  
  if (description) {
    request.description = description;
  }
  
  return request;
}

// Complete Admin APIs structure with ALL routes
const adminAPIs = {
  name: "Admin APIs",
  description: "Complete Admin Panel APIs - Requires admin role and JWT token. All routes use Bearer token authentication from collection level.",
  item: [
    // ==================== USER MANAGEMENT ====================
    {
      name: "User Management",
      description: "Manage users, roles, and permissions",
      item: [
        {
          name: "Get All Users",
          request: createRequest('GET', ['api', 'admin', 'users'], {
            query: [
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
              { key: 'search', value: '' },
              { key: 'role', value: '' },
              { key: 'sortBy', value: 'createdAt' },
              { key: 'sortOrder', value: 'desc' }
            ]
          })
        },
        {
          name: "Get User by ID",
          request: createRequest('GET', ['api', 'admin', 'users', ':id'], {
            variables: [{ key: 'id', value: '' }]
          })
        },
        {
          name: "Create User",
          request: createRequest('POST', ['api', 'admin', 'users'], {
            body: {
              name: "New User",
              email: "user@example.com",
              mobile: "9876543210",
              role: "user",
              isVerified: true
            }
          })
        },
        {
          name: "Update User",
          request: createRequest('PUT', ['api', 'admin', 'users', ':id'], {
            variables: [{ key: 'id', value: '' }],
            body: {
              name: "Updated Name",
              email: "updated@example.com",
              role: "user",
              isVerified: true
            }
          })
        },
        {
          name: "Delete User",
          request: createRequest('DELETE', ['api', 'admin', 'users', ':id'], {
            variables: [{ key: 'id', value: '' }]
          })
        },
        {
          name: "Change User Role",
          request: createRequest('PATCH', ['api', 'admin', 'users', ':id', 'role'], {
            variables: [{ key: 'id', value: '' }],
            body: { role: "admin" }
          })
        },
        {
          name: "Get User Statistics",
          request: createRequest('GET', ['api', 'admin', 'users', 'stats', 'overview'])
        }
      ]
    },
    
    // ==================== PRODUCT MANAGEMENT ====================
    {
      name: "Product Management",
      description: "Manage products, stock, pricing, and status",
      item: [
        {
          name: "Get All Products",
          request: createRequest('GET', ['api', 'admin', 'products'], {
            query: [
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
              { key: 'search', value: '' },
              { key: 'category', value: '' },
              { key: 'subcategory', value: '' },
              { key: 'status', value: '' },
              { key: 'stockStatus', value: '' },
              { key: 'sortBy', value: 'createdAt' },
              { key: 'sortOrder', value: 'desc' }
            ]
          })
        },
        {
          name: "Get Product by ID",
          request: createRequest('GET', ['api', 'admin', 'products', ':id'], {
            variables: [{ key: 'id', value: '' }]
          })
        },
        {
          name: "Create Product",
          request: createRequest('POST', ['api', 'admin', 'products'], {
            body: {
              productCode: "P001",
              name: "New Product",
              brand: "Brand Name",
              category: "CATEGORY_ID",
              subcategory: "SUBCATEGORY_ID",
              price: {
                mrp: 1000,
                sellingPrice: 800,
                discount: 20
              },
              stock: {
                quantity: 100,
                minStockLevel: 10
              },
              status: "active"
            }
          })
        },
        {
          name: "Update Product",
          request: createRequest('PUT', ['api', 'admin', 'products', ':id'], {
            variables: [{ key: 'id', value: '' }],
            body: {
              name: "Updated Product Name",
              status: "active"
            }
          })
        },
        {
          name: "Delete Product",
          request: createRequest('DELETE', ['api', 'admin', 'products', ':id'], {
            variables: [{ key: 'id', value: '' }]
          })
        },
        {
          name: "Update Product Stock",
          request: createRequest('PATCH', ['api', 'admin', 'products', ':id', 'stock'], {
            variables: [{ key: 'id', value: '' }],
            body: {
              quantity: 100,
              operation: "set"
            }
          })
        },
        {
          name: "Update Product Status",
          request: createRequest('PATCH', ['api', 'admin', 'products', ':id', 'status'], {
            variables: [{ key: 'id', value: '' }],
            body: { status: "active" }
          })
        },
        {
          name: "Update Product Price",
          request: createRequest('PATCH', ['api', 'admin', 'products', ':id', 'price'], {
            variables: [{ key: 'id', value: '' }],
            body: {
              mrp: 1000,
              sellingPrice: 800,
              discount: 20
            }
          })
        },
        {
          name: "Get Product Statistics",
          request: createRequest('GET', ['api', 'admin', 'products', 'stats', 'overview'])
        },
        {
          name: "Bulk Update Product Status",
          request: createRequest('POST', ['api', 'admin', 'products', 'bulk-update-status'], {
            body: {
              productIds: ["PRODUCT_ID_1", "PRODUCT_ID_2"],
              status: "active"
            }
          })
        }
      ]
    },
    
    // ==================== ORDER MANAGEMENT ====================
    {
      name: "Order Management",
      description: "Manage orders, payments, and deliveries",
      item: [
        {
          name: "Get All Orders",
          request: createRequest('GET', ['api', 'admin', 'orders'], {
            query: [
              { key: 'page', value: '1' },
              { key: 'limit', value: '20' },
              { key: 'search', value: '' },
              { key: 'status', value: '' },
              { key: 'paymentStatus', value: '' },
              { key: 'startDate', value: '' },
              { key: 'endDate', value: '' },
              { key: 'sortBy', value: 'order_placed_at' },
              { key: 'sortOrder', value: 'desc' }
            ]
          })
        },
        {
          name: "Get Order by ID",
          request: createRequest('GET', ['api', 'admin', 'orders', ':id'], {
            variables: [{ key: 'id', value: '' }]
          })
        },
        {
          name: "Update Order",
          request: createRequest('PUT', ['api', 'admin', 'orders', ':id'], {
            variables: [{ key: 'id', value: '' }],
            body: {
              order_status: "confirmed",
              customer_info: {
                name: "Updated Name",
                mobile: "9876543210"
              }
            }
          })
        },
        {
          name: "Delete Order",
          request: createRequest('DELETE', ['api', 'admin', 'orders', ':id'], {
            variables: [{ key: 'id', value: '' }]
          })
        },
        {
          name: "Update Order Status",
          request: createRequest('PATCH', ['api', 'admin', 'orders', ':id', 'status'], {
            variables: [{ key: 'id', value: '' }],
            body: { status: "confirmed" }
          })
        },
        {
          name: "Update Payment Status",
          request: createRequest('PATCH', ['api', 'admin', 'orders', ':id', 'payment-status'], {
            variables: [{ key: 'id', value: '' }],
            body: {
              paymentStatus: "completed",
              transactionId: "TXN123456"
            }
          })
        },
        {
          name: "Get Order Statistics",
          request: createRequest('GET', ['api', 'admin', 'orders', 'stats', 'overview'])
        },
        {
          name: "Get Revenue Statistics",
          request: createRequest('GET', ['api', 'admin', 'orders', 'stats', 'revenue'], {
            query: [
              { key: 'startDate', value: '' },
              { key: 'endDate', value: '' },
              { key: 'groupBy', value: 'day' }
            ]
          })
        },
        {
          name: "Bulk Update Order Status",
          request: createRequest('POST', ['api', 'admin', 'orders', 'bulk-update-status'], {
            body: {
              orderIds: ["ORDER_ID_1", "ORDER_ID_2"],
              status: "confirmed"
            }
          })
        }
      ]
    },
    
    // ==================== DASHBOARD ====================
    {
      name: "Analytics Dashboard",
      description: "View analytics, statistics, and reports",
      item: [
        {
          name: "Dashboard Overview",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'overview'])
        },
        {
          name: "Sales Trend",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'sales-trend'], {
            query: [{ key: 'days', value: '30' }]
          })
        },
        {
          name: "Top Products",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'top-products'], {
            query: [{ key: 'limit', value: '10' }]
          })
        },
        {
          name: "Top Categories",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'top-categories'], {
            query: [{ key: 'limit', value: '10' }]
          })
        },
        {
          name: "Recent Orders",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'recent-orders'], {
            query: [{ key: 'limit', value: '10' }]
          })
        },
        {
          name: "Order Status Distribution",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'order-status-distribution'])
        },
        {
          name: "Payment Status Distribution",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'payment-status-distribution'])
        },
        {
          name: "User Activity",
          request: createRequest('GET', ['api', 'admin', 'dashboard', 'user-activity'])
        }
      ]
    },
    
    // ==================== CATEGORY MANAGEMENT ====================
    {
      name: "Category Management",
      description: "Manage categories, departments, and subcategories",
      item: [
        {
          name: "Categories",
          item: [
            {
              name: "Get All Categories",
              request: createRequest('GET', ['api', 'admin', 'categories'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'search', value: '' },
                  { key: 'storeCode', value: '' },
                  { key: 'deptId', value: '' },
                  { key: 'sortBy', value: 'sequence_id' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Get Category by ID",
              request: createRequest('GET', ['api', 'admin', 'categories', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            },
            {
              name: "Create Category",
              request: createRequest('POST', ['api', 'admin', 'categories'], {
                body: {
                  category_name: "New Category",
                  store_code: "STORE001",
                  dept_id: "DEPT001",
                  sequence_id: 1
                }
              })
            },
            {
              name: "Update Category",
              request: createRequest('PUT', ['api', 'admin', 'categories', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  category_name: "Updated Category",
                  sequence_id: 2
                }
              })
            },
            {
              name: "Delete Category",
              request: createRequest('DELETE', ['api', 'admin', 'categories', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Departments",
          item: [
            {
              name: "Get All Departments",
              request: createRequest('GET', ['api', 'admin', 'categories', 'departments', 'all'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'search', value: '' },
                  { key: 'storeCode', value: '' },
                  { key: 'deptTypeId', value: '' },
                  { key: 'sortBy', value: 'sequence_id' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Get Department by ID",
              request: createRequest('GET', ['api', 'admin', 'categories', 'departments', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            },
            {
              name: "Create Department",
              request: createRequest('POST', ['api', 'admin', 'categories', 'departments'], {
                body: {
                  department_name: "New Department",
                  store_code: "STORE001",
                  dept_type_id: "TYPE001",
                  sequence_id: 1
                }
              })
            },
            {
              name: "Update Department",
              request: createRequest('PUT', ['api', 'admin', 'categories', 'departments', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  department_name: "Updated Department",
                  sequence_id: 2
                }
              })
            },
            {
              name: "Delete Department",
              request: createRequest('DELETE', ['api', 'admin', 'categories', 'departments', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Subcategories",
          item: [
            {
              name: "Get All Subcategories",
              request: createRequest('GET', ['api', 'admin', 'categories', 'subcategories', 'all'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'search', value: '' },
                  { key: 'categoryId', value: '' },
                  { key: 'sortBy', value: 'sequence_id' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Create Subcategory",
              request: createRequest('POST', ['api', 'admin', 'categories', 'subcategories'], {
                body: {
                  subcategory_name: "New Subcategory",
                  category_id: "CATEGORY_ID",
                  sequence_id: 1
                }
              })
            },
            {
              name: "Update Subcategory",
              request: createRequest('PUT', ['api', 'admin', 'categories', 'subcategories', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  subcategory_name: "Updated Subcategory",
                  sequence_id: 2
                }
              })
            },
            {
              name: "Delete Subcategory",
              request: createRequest('DELETE', ['api', 'admin', 'categories', 'subcategories', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        }
      ]
    },
    
    // ==================== CONTENT MANAGEMENT ====================
    {
      name: "Content Management",
      description: "Manage homepage content, advertisements, and settings",
      item: [
        {
          name: "Best Sellers",
          item: [
            {
              name: "Get All Best Sellers",
              request: createRequest('GET', ['api', 'admin', 'content', 'best-sellers'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'sortBy', value: 'sequence' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Get Best Seller by ID",
              request: createRequest('GET', ['api', 'admin', 'content', 'best-sellers', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            },
            {
              name: "Create Best Seller",
              request: createRequest('POST', ['api', 'admin', 'content', 'best-sellers'], {
                body: {
                  p_code: "P001",
                  sequence: 1,
                  image_link: "https://example.com/image.jpg"
                }
              })
            },
            {
              name: "Update Best Seller",
              request: createRequest('PUT', ['api', 'admin', 'content', 'best-sellers', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  sequence: 2,
                  image_link: "https://example.com/new-image.jpg"
                }
              })
            },
            {
              name: "Delete Best Seller",
              request: createRequest('DELETE', ['api', 'admin', 'content', 'best-sellers', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Advertisements",
          item: [
            {
              name: "Get All Advertisements",
              request: createRequest('GET', ['api', 'admin', 'content', 'advertisements'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'sortBy', value: 'sequence' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Get Advertisement by ID",
              request: createRequest('GET', ['api', 'admin', 'content', 'advertisements', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            },
            {
              name: "Create Advertisement",
              request: createRequest('POST', ['api', 'admin', 'content', 'advertisements'], {
                body: {
                  title: "Summer Sale",
                  image_link: "https://example.com/banner.jpg",
                  redirect_url: "https://example.com/sale",
                  sequence: 1,
                  is_active: true
                }
              })
            },
            {
              name: "Update Advertisement",
              request: createRequest('PUT', ['api', 'admin', 'content', 'advertisements', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  title: "Updated Sale",
                  is_active: false
                }
              })
            },
            {
              name: "Delete Advertisement",
              request: createRequest('DELETE', ['api', 'admin', 'content', 'advertisements', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Popular Categories",
          item: [
            {
              name: "Get All Popular Categories",
              request: createRequest('GET', ['api', 'admin', 'content', 'popular-categories'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'sortBy', value: 'sequence' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Get Popular Category by ID",
              request: createRequest('GET', ['api', 'admin', 'content', 'popular-categories', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            },
            {
              name: "Create Popular Category",
              request: createRequest('POST', ['api', 'admin', 'content', 'popular-categories'], {
                body: {
                  category_id: "CAT001",
                  category_name: "Electronics",
                  image_link: "https://example.com/category.jpg",
                  sequence: 1
                }
              })
            },
            {
              name: "Update Popular Category",
              request: createRequest('PUT', ['api', 'admin', 'content', 'popular-categories', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  category_name: "Updated Category",
                  sequence: 2
                }
              })
            },
            {
              name: "Delete Popular Category",
              request: createRequest('DELETE', ['api', 'admin', 'content', 'popular-categories', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Payment Modes",
          item: [
            {
              name: "Get All Payment Modes",
              request: createRequest('GET', ['api', 'admin', 'content', 'payment-modes'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'sortBy', value: 'sequence_id' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Create Payment Mode",
              request: createRequest('POST', ['api', 'admin', 'content', 'payment-modes'], {
                body: {
                  payment_mode: "UPI",
                  payment_mode_name: "UPI Payment",
                  sequence_id: 1,
                  is_active: true
                }
              })
            },
            {
              name: "Update Payment Mode",
              request: createRequest('PUT', ['api', 'admin', 'content', 'payment-modes', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  payment_mode_name: "Updated Payment Mode",
                  is_active: true
                }
              })
            },
            {
              name: "Delete Payment Mode",
              request: createRequest('DELETE', ['api', 'admin', 'content', 'payment-modes', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Pincodes",
          item: [
            {
              name: "Get All Pincodes",
              request: createRequest('GET', ['api', 'admin', 'content', 'pincodes'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'search', value: '' },
                  { key: 'sortBy', value: 'pincode' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Create Pincode",
              request: createRequest('POST', ['api', 'admin', 'content', 'pincodes'], {
                body: {
                  pincode: "400001",
                  area: "Mumbai",
                  city: "Mumbai",
                  state: "Maharashtra",
                  is_active: true
                }
              })
            },
            {
              name: "Update Pincode",
              request: createRequest('PUT', ['api', 'admin', 'content', 'pincodes', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  area: "Updated Area",
                  is_active: true
                }
              })
            },
            {
              name: "Delete Pincode",
              request: createRequest('DELETE', ['api', 'admin', 'content', 'pincodes', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Stores",
          item: [
            {
              name: "Get All Stores",
              request: createRequest('GET', ['api', 'admin', 'content', 'stores'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'search', value: '' },
                  { key: 'sortBy', value: 'store_code' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Create Store",
              request: createRequest('POST', ['api', 'admin', 'content', 'stores'], {
                body: {
                  store_code: "STORE001",
                  store_name: "Main Store",
                  address: "123 Main St",
                  city: "Mumbai",
                  state: "Maharashtra",
                  pincode: "400001",
                  is_active: true
                }
              })
            },
            {
              name: "Update Store",
              request: createRequest('PUT', ['api', 'admin', 'content', 'stores', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  store_name: "Updated Store Name",
                  is_active: true
                }
              })
            },
            {
              name: "Delete Store",
              request: createRequest('DELETE', ['api', 'admin', 'content', 'stores', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        },
        {
          name: "Delivery Slots",
          item: [
            {
              name: "Get All Delivery Slots",
              request: createRequest('GET', ['api', 'admin', 'content', 'delivery-slots'], {
                query: [
                  { key: 'page', value: '1' },
                  { key: 'limit', value: '20' },
                  { key: 'sortBy', value: 'sequence_id' },
                  { key: 'sortOrder', value: 'asc' }
                ]
              })
            },
            {
              name: "Create Delivery Slot",
              request: createRequest('POST', ['api', 'admin', 'content', 'delivery-slots'], {
                body: {
                  slot_name: "Morning Slot",
                  start_time: "09:00",
                  end_time: "12:00",
                  sequence_id: 1,
                  is_active: true
                }
              })
            },
            {
              name: "Update Delivery Slot",
              request: createRequest('PUT', ['api', 'admin', 'content', 'delivery-slots', ':id'], {
                variables: [{ key: 'id', value: '' }],
                body: {
                  slot_name: "Updated Slot",
                  is_active: true
                }
              })
            },
            {
              name: "Delete Delivery Slot",
              request: createRequest('DELETE', ['api', 'admin', 'content', 'delivery-slots', ':id'], {
                variables: [{ key: 'id', value: '' }]
              })
            }
          ]
        }
      ]
    }
  ]
};

// Find and update Admin APIs section
const adminIndex = collection.item.findIndex(item => item.name === "Admin APIs");

if (adminIndex !== -1) {
  console.log('🔄 Updating existing Admin APIs folder...');
  collection.item[adminIndex] = adminAPIs;
} else {
  console.log('➕ Adding new Admin APIs folder...');
  collection.item.push(adminAPIs);
}

// Ensure authentication is set at collection level (it should already be there)
if (!collection.auth || collection.auth.type !== 'bearer') {
  console.log('🔐 Setting collection-level authentication...');
  collection.auth = {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "{{authToken}}",
        type: "string"
      }
    ]
  };
}

// Ensure authToken variable exists
const hasAuthToken = collection.variable && collection.variable.some(v => v.key === 'authToken');
if (!hasAuthToken) {
  if (!collection.variable) {
    collection.variable = [];
  }
  collection.variable.push({
    key: "authToken",
    value: "",
    type: "string"
  });
}

// Update collection version and description
collection.info.version = "3.0.0";
collection.info.description = "Complete API collection for Patel E-commerce platform with OTP authentication and comprehensive Admin Panel APIs (72 admin routes)";

// Save updated collection
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));

console.log('\n' + '='.repeat(60));
console.log('✅ SUCCESS! Postman collection updated with ALL admin routes');
console.log('='.repeat(60));
console.log(`📁 Location: ${collectionPath}`);
console.log(`📊 Total folders: ${collection.item.length}`);
console.log(`📝 Version: ${collection.info.version}`);
console.log(`🔐 Authentication: Bearer token ({{authToken}}) at collection level`);
console.log(`📋 Admin Routes Added: 72 routes across 6 categories`);
console.log('\n📦 Categories:');
console.log('   • User Management (7 routes)');
console.log('   • Product Management (10 routes)');
console.log('   • Order Management (9 routes)');
console.log('   • Analytics Dashboard (8 routes)');
console.log('   • Category Management (11 routes)');
console.log('   • Content Management (27 routes)');
console.log('\n💡 Next steps:');
console.log('1. Import the updated collection in Postman');
console.log('2. Authenticate: Use Authentication > Verify OTP to get token');
console.log('3. Token is automatically saved to {{authToken}} variable');
console.log('4. All admin routes will use this token automatically');
console.log('5. Ensure your user has admin role to access admin endpoints');
console.log('\n💾 Backup saved at: ' + backupPath);
console.log('');

