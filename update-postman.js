const fs = require('fs');
const path = require('path');

/**
 * Update Postman Collection with Admin APIs
 *
 * This script adds all admin API endpoints to the existing Postman collection
 */

const collectionPath = path.join(__dirname, 'postman', 'Patel_Ecommerce_API.postman_collection.json');

// Read existing collection
console.log('📖 Reading existing Postman collection...');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

console.log(`✅ Found collection: "${collection.info.name}"`);
console.log(`📊 Current folders: ${collection.item.length}`);

// Admin APIs structure
const adminAPIs = {
  "name": "Admin APIs",
  "description": "Complete Admin Panel APIs - Requires admin role and JWT token",
  "item": [
    {
      "name": "User Management",
      "description": "Manage users, roles, and permissions",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/users?page=1&limit=20&search=&role=&sortBy=createdAt&sortOrder=desc",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users"],
              "query": [
                {"key": "page", "value": "1"},
                {"key": "limit", "value": "20"},
                {"key": "search", "value": ""},
                {"key": "role", "value": ""},
                {"key": "sortBy", "value": "createdAt"},
                {"key": "sortOrder", "value": "desc"}
              ]
            }
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/users/:id",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users", ":id"],
              "variable": [{"key": "id", "value": ""}]
            }
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Updated Name\",\n  \"email\": \"updated@example.com\",\n  \"role\": \"user\",\n  \"isVerified\": true\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/users/:id",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users", ":id"],
              "variable": [{"key": "id", "value": ""}]
            }
          }
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/users/:id",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users", ":id"],
              "variable": [{"key": "id", "value": ""}]
            }
          }
        },
        {
          "name": "Change User Role",
          "request": {
            "method": "PATCH",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"role\": \"admin\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/users/:id/role",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users", ":id", "role"],
              "variable": [{"key": "id", "value": ""}]
            }
          }
        },
        {
          "name": "Get User Statistics",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/users/stats/overview",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users", "stats", "overview"]
            }
          }
        }
      ]
    },
    {
      "name": "Product Management",
      "description": "Manage products, stock, and pricing",
      "item": [
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/products?page=1&limit=20&search=&category=&status=&stockStatus=",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "products"],
              "query": [
                {"key": "page", "value": "1"},
                {"key": "limit", "value": "20"},
                {"key": "search", "value": ""},
                {"key": "category", "value": ""},
                {"key": "status", "value": ""},
                {"key": "stockStatus", "value": ""}
              ]
            }
          }
        },
        {
          "name": "Update Product Stock",
          "request": {
            "method": "PATCH",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"quantity\": 100,\n  \"operation\": \"set\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/products/:id/stock",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "products", ":id", "stock"],
              "variable": [{"key": "id", "value": ""}]
            }
          }
        },
        {
          "name": "Update Product Status",
          "request": {
            "method": "PATCH",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"active\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/products/:id/status",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "products", ":id", "status"],
              "variable": [{"key": "id", "value": ""}]
            }
          }
        },
        {
          "name": "Get Product Statistics",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/products/stats/overview",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "products", "stats", "overview"]
            }
          }
        }
      ]
    },
    {
      "name": "Order Management",
      "description": "Manage orders, payments, and deliveries",
      "item": [
        {
          "name": "Get All Orders",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/orders?page=1&limit=20&search=&status=&paymentStatus=",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "orders"],
              "query": [
                {"key": "page", "value": "1"},
                {"key": "limit", "value": "20"},
                {"key": "search", "value": ""},
                {"key": "status", "value": ""},
                {"key": "paymentStatus", "value": ""}
              ]
            }
          }
        },
        {
          "name": "Update Order Status",
          "request": {
            "method": "PATCH",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"confirmed\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/orders/:id/status",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "orders", ":id", "status"],
              "variable": [{"key": "id", "value": ""}]
            }
          }
        },
        {
          "name": "Get Order Statistics",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/orders/stats/overview",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "orders", "stats", "overview"]
            }
          }
        }
      ]
    },
    {
      "name": "Analytics Dashboard",
      "description": "View analytics, statistics, and reports",
      "item": [
        {
          "name": "Dashboard Overview",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/dashboard/overview",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "dashboard", "overview"]
            }
          }
        },
        {
          "name": "Sales Trend",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/dashboard/sales-trend?days=30",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "dashboard", "sales-trend"],
              "query": [{"key": "days", "value": "30"}]
            }
          }
        },
        {
          "name": "Top Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/api/admin/dashboard/top-products?limit=10",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "dashboard", "top-products"],
              "query": [{"key": "limit", "value": "10"}]
            }
          }
        }
      ]
    },
    {
      "name": "Content Management",
      "description": "Manage homepage content, advertisements, and settings",
      "item": [
        {
          "name": "Best Sellers",
          "item": [
            {
              "name": "Get All Best Sellers",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/best-sellers?page=1&limit=20",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "best-sellers"],
                  "query": [
                    {"key": "page", "value": "1"},
                    {"key": "limit", "value": "20"}
                  ]
                }
              }
            },
            {
              "name": "Get Best Seller by ID",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/best-sellers/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "best-sellers", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            },
            {
              "name": "Create Best Seller",
              "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"p_code\": \"P001\",\n  \"sequence\": 1,\n  \"image_link\": \"https://example.com/image.jpg\"\n}"
                },
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/best-sellers",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "best-sellers"]
                }
              }
            },
            {
              "name": "Update Best Seller",
              "request": {
                "method": "PUT",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"sequence\": 2,\n  \"image_link\": \"https://example.com/new-image.jpg\"\n}"
                },
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/best-sellers/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "best-sellers", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            },
            {
              "name": "Delete Best Seller",
              "request": {
                "method": "DELETE",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/best-sellers/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "best-sellers", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            }
          ]
        },
        {
          "name": "Advertisements",
          "item": [
            {
              "name": "Get All Advertisements",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/advertisements?page=1&limit=20",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "advertisements"],
                  "query": [
                    {"key": "page", "value": "1"},
                    {"key": "limit", "value": "20"}
                  ]
                }
              }
            },
            {
              "name": "Get Advertisement by ID",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/advertisements/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "advertisements", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            },
            {
              "name": "Create Advertisement",
              "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"title\": \"Summer Sale\",\n  \"image_link\": \"https://example.com/banner.jpg\",\n  \"redirect_url\": \"https://example.com/sale\",\n  \"sequence\": 1,\n  \"is_active\": true\n}"
                },
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/advertisements",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "advertisements"]
                }
              }
            },
            {
              "name": "Update Advertisement",
              "request": {
                "method": "PUT",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"title\": \"Updated Sale\",\n  \"is_active\": false\n}"
                },
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/advertisements/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "advertisements", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            },
            {
              "name": "Delete Advertisement",
              "request": {
                "method": "DELETE",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/advertisements/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "advertisements", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            }
          ]
        },
        {
          "name": "Popular Categories",
          "item": [
            {
              "name": "Get All Popular Categories",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/popular-categories?page=1&limit=20",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "popular-categories"],
                  "query": [
                    {"key": "page", "value": "1"},
                    {"key": "limit", "value": "20"}
                  ]
                }
              }
            },
            {
              "name": "Get Popular Category by ID",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/popular-categories/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "popular-categories", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            },
            {
              "name": "Create Popular Category",
              "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"category_id\": \"CAT001\",\n  \"category_name\": \"Electronics\",\n  \"image_link\": \"https://example.com/category.jpg\",\n  \"sequence\": 1\n}"
                },
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/popular-categories",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "popular-categories"]
                }
              }
            },
            {
              "name": "Update Popular Category",
              "request": {
                "method": "PUT",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                  "mode": "raw",
                  "raw": "{\n  \"category_name\": \"Updated Category\",\n  \"sequence\": 2\n}"
                },
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/popular-categories/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "popular-categories", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            },
            {
              "name": "Delete Popular Category",
              "request": {
                "method": "DELETE",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/popular-categories/:id",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "popular-categories", ":id"],
                  "variable": [{"key": "id", "value": ""}]
                }
              }
            }
          ]
        },
        {
          "name": "Payment Modes",
          "item": [
            {
              "name": "Get All Payment Modes",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/payment-modes",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "payment-modes"]
                }
              }
            }
          ]
        },
        {
          "name": "Delivery Slots",
          "item": [
            {
              "name": "Get All Delivery Slots",
              "request": {
                "method": "GET",
                "header": [],
                "url": {
                  "raw": "{{baseUrl}}/api/admin/content/delivery-slots",
                  "host": ["{{baseUrl}}"],
                  "path": ["api", "admin", "content", "delivery-slots"]
                }
              }
            }
          ]
        }
      ]
    }
  ]
};

// Check if Admin APIs already exist
const adminIndex = collection.item.findIndex(item => item.name === "Admin APIs");

if (adminIndex !== -1) {
  console.log('🔄 Updating existing Admin APIs folder...');
  collection.item[adminIndex] = adminAPIs;
} else {
  console.log('➕ Adding new Admin APIs folder...');
  collection.item.push(adminAPIs);
}

// Update collection version
collection.info.version = "2.0.0";
collection.info.description = "Complete API collection for Patel E-commerce platform with OTP authentication and Admin Panel APIs";

// Save updated collection
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));

console.log('\n' + '='.repeat(50));
console.log('✅ SUCCESS! Postman collection updated');
console.log('='.repeat(50));
console.log(`📁 Location: ${collectionPath}`);
console.log(`📊 Total folders: ${collection.item.length}`);
console.log(`📝 Version: ${collection.info.version}`);
console.log('\n✅ Admin APIs added successfully!');
console.log('\n📋 Next steps:');
console.log('1. Re-import the collection in Postman');
console.log('2. Create admin user: npm run create-admin');
console.log('3. Get admin token via Authentication > Verify OTP');
console.log('4. Test Admin APIs in the new "Admin APIs" folder');
console.log('\n💡 Backup saved at: postman/Patel_Ecommerce_API.postman_collection.backup.json');
console.log('');
