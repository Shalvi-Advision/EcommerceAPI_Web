# Banners & Seasonal Categories API Documentation

## Table of Contents
- [Overview](#overview)
- [Banners API](#banners-api)
  - [Banner Model](#banner-model)
  - [Admin Routes](#banner-admin-routes)
  - [Public Routes](#banner-public-routes)
- [Seasonal Categories API](#seasonal-categories-api)
  - [Seasonal Category Model](#seasonal-category-model)
  - [Admin Routes](#seasonal-category-admin-routes)
  - [Public Routes](#seasonal-category-public-routes)
- [Common Patterns](#common-patterns)
- [Error Responses](#error-responses)

---

## Overview

This document covers two powerful content management APIs:

1. **Banners API** - Manage promotional banners organized by sections (home_top, home_middle, etc.)
2. **Seasonal Categories API** - Manage seasonal category sections with subcategory enrichment

Both APIs support:
- ✅ Multi-store filtering
- ✅ Active/inactive status
- ✅ Sequence ordering
- ✅ Date-based activation
- ✅ Full CRUD operations for admins
- ✅ Optimized public endpoints for mobile/web apps

---

# Banners API

## Banner Model

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Banner title |
| `section_name` | String | Yes | Section identifier (e.g., home_top, home_middle) |
| `image_url` | String | Yes | Banner image URL |
| `action.type` | String | Yes | Action type: `category`, `product`, `url`, `none` |
| `action.value` | String | No | Action value (category ID, product SKU, URL, etc.) |
| `store_code` | String | No | Single store code |
| `store_codes` | Array | No | Multiple store codes |
| `is_active` | Boolean | No | Active status (default: true) |
| `sequence` | Number | No | Display order (default: 0) |
| `start_date` | Date | No | Activation date (default: now) |
| `end_date` | Date | No | Expiration date |
| `metadata` | Object | No | Additional custom data |

### Action Types

- **`category`** - Navigates to a category page
  - `value`: Category ID (e.g., "woodenware")
- **`product`** - Navigates to a product detail page
  - `value`: Product SKU (e.g., "SKU44112")
- **`url`** - Opens a custom URL
  - `value`: Full URL (e.g., "https://example.com/offers")
- **`none`** - No action (display only)

---

## Banner Admin Routes

**Base URL:** `/api/admin/content/banners`

**Authentication:** Required (Admin role)

### 1. Get All Banners

**Endpoint:** `GET /api/admin/content/banners`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 20 | Items per page |
| `section_name` | String | - | Filter by section |
| `sortBy` | String | sequence | Sort field |
| `sortOrder` | String | asc | Sort direction (asc/desc) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "New Arrivals",
      "section_name": "home_top",
      "image_url": "https://example.com/banners/home1.jpg",
      "action": {
        "type": "category",
        "value": "woodenware"
      },
      "store_codes": ["AVB", "MUM"],
      "is_active": true,
      "sequence": 1,
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T23:59:59.999Z",
      "metadata": {
        "campaign": "new-arrivals-2025"
      },
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 2. Get Banner by ID

**Endpoint:** `GET /api/admin/content/banners/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "New Arrivals",
    "section_name": "home_top",
    "image_url": "https://example.com/banners/home1.jpg",
    "action": {
      "type": "category",
      "value": "woodenware"
    },
    "store_codes": ["AVB", "MUM"],
    "is_active": true,
    "sequence": 1,
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.999Z",
    "metadata": {},
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Banner not found"
}
```

---

### 3. Create Banner

**Endpoint:** `POST /api/admin/content/banners`

**Request Body:**
```json
{
  "title": "Flash Sale",
  "section_name": "home_top",
  "image_url": "https://example.com/banners/flash-sale.jpg",
  "action": {
    "type": "url",
    "value": "https://example.com/flash-sale"
  },
  "store_codes": ["AVB", "MUM", "DEL"],
  "is_active": true,
  "sequence": 2,
  "start_date": "2025-01-20",
  "end_date": "2025-01-27",
  "metadata": {
    "campaign": "flash-sale-jan",
    "discount": "40%"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Banner created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Flash Sale",
    "section_name": "home_top",
    "image_url": "https://example.com/banners/flash-sale.jpg",
    "action": {
      "type": "url",
      "value": "https://example.com/flash-sale"
    },
    "store_codes": ["AVB", "MUM", "DEL"],
    "store_code": "AVB",
    "is_active": true,
    "sequence": 2,
    "start_date": "2025-01-20T00:00:00.000Z",
    "end_date": "2025-01-27T23:59:59.999Z",
    "metadata": {
      "campaign": "flash-sale-jan",
      "discount": "40%"
    },
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T11:00:00.000Z"
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Error creating banner",
  "error": "Banner validation failed: title: Title is required"
}
```

---

### 4. Update Banner

**Endpoint:** `PUT /api/admin/content/banners/:id`

**Request Body (Partial Update):**
```json
{
  "title": "Updated Flash Sale",
  "is_active": false,
  "end_date": "2025-01-30"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Banner updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "title": "Updated Flash Sale",
    "section_name": "home_top",
    "image_url": "https://example.com/banners/flash-sale.jpg",
    "action": {
      "type": "url",
      "value": "https://example.com/flash-sale"
    },
    "store_codes": ["AVB", "MUM", "DEL"],
    "is_active": false,
    "sequence": 2,
    "start_date": "2025-01-20T00:00:00.000Z",
    "end_date": "2025-01-30T23:59:59.999Z",
    "metadata": {
      "campaign": "flash-sale-jan",
      "discount": "40%"
    },
    "createdAt": "2025-01-15T11:00:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

---

### 5. Delete Banner

**Endpoint:** `DELETE /api/admin/content/banners/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Banner deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Banner not found"
}
```

---

## Banner Public Routes

**Base URL:** `/api/banners`

**Authentication:** Not required

### 1. Get Banners (POST - Recommended)

**Endpoint:** `POST /api/banners`

**Request Body:**
```json
{
  "store_code": "AVB",
  "section_name": "home_top"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `store_code` | String/Array | No | Filter by store code(s) |
| `section_name` | String | No | Filter by specific section |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "banner_sections": [
      {
        "section_name": "home_top",
        "banners": [
          {
            "id": "65a1b2c3d4e5f6g7h8i9j0k1",
            "title": "New Arrivals",
            "image_url": "https://example.com/banners/home1.jpg",
            "action": {
              "type": "category",
              "value": "woodenware"
            }
          },
          {
            "id": "65a1b2c3d4e5f6g7h8i9j0k2",
            "title": "Flat 40% Off",
            "image_url": "https://example.com/banners/home2.jpg",
            "action": {
              "type": "url",
              "value": "https://example.com/offers"
            }
          },
          {
            "id": "65a1b2c3d4e5f6g7h8i9j0k3",
            "title": "Top Rated Products",
            "image_url": "https://example.com/banners/home3.jpg",
            "action": {
              "type": "product",
              "value": "SKU44112"
            }
          }
        ]
      }
    ]
  }
}
```

**Get All Sections (Empty section_name):**
```json
{
  "store_code": "AVB"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "banner_sections": [
      {
        "section_name": "home_top",
        "banners": [...]
      },
      {
        "section_name": "home_middle",
        "banners": [...]
      },
      {
        "section_name": "category_banner",
        "banners": [...]
      }
    ]
  }
}
```

---

### 2. Get Banners (GET - Legacy)

**Endpoint:** `GET /api/banners`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `store_code` | String | Filter by store code |
| `section_name` | String | Filter by section |

**Example:**
```
GET /api/banners?store_code=AVB&section_name=home_top
```

**Response:** Same as POST endpoint

---

# Seasonal Categories API

## Seasonal Category Model

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Section title |
| `description` | String | No | Section description |
| `banner_urls.desktop` | String | Yes | Desktop banner URL |
| `banner_urls.mobile` | String | Yes | Mobile banner URL |
| `background_color` | String | Yes | Background color (hex) |
| `redirect_url` | String | No | Section redirect URL |
| `store_code` | String | No | Single store code |
| `store_codes` | Array | No | Multiple store codes |
| `season` | String | No | Season type (default: all) |
| `subcategories` | Array | Yes | Subcategory items (min: 1) |
| `is_active` | Boolean | No | Active status (default: true) |
| `sequence` | Number | No | Display order (default: 0) |
| `start_date` | Date | No | Activation date (default: now) |
| `end_date` | Date | No | Expiration date |

### Season Types

| Value | Description |
|-------|-------------|
| `spring` | Spring collection |
| `summer` | Summer collection |
| `autumn` / `fall` | Autumn/Fall collection |
| `winter` | Winter collection |
| `holiday` | Holiday specials |
| `festive` | Festive occasions |
| `all` | All seasons (default) |

### Subcategory Item Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sub_category_id` | String | Yes | Subcategory ID |
| `store_code` | String | No | Store code |
| `position` | Number | No | Display position |
| `redirect_url` | String | No | Custom redirect URL |
| `metadata` | Object | No | Additional data (e.g., badges) |

---

## Seasonal Category Admin Routes

**Base URL:** `/api/admin/content/seasonal-categories`

**Authentication:** Required (Admin role)

### 1. Get All Seasonal Categories

**Endpoint:** `GET /api/admin/content/seasonal-categories`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number |
| `limit` | Number | 20 | Items per page |
| `sortBy` | String | sequence | Sort field |
| `sortOrder` | String | asc | Sort direction |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "title": "Winter Collection",
      "description": "Stay warm with our winter essentials",
      "banner_urls": {
        "desktop": "https://example.com/winter-desktop.jpg",
        "mobile": "https://example.com/winter-mobile.jpg"
      },
      "background_color": "#E3F2FD",
      "redirect_url": "app://seasonal/winter",
      "store_codes": ["AVB", "MUM"],
      "season": "winter",
      "is_active": true,
      "sequence": 1,
      "start_date": "2025-11-01T00:00:00.000Z",
      "end_date": "2026-02-28T23:59:59.999Z",
      "subcategories": [
        {
          "sub_category_id": "349",
          "position": 1,
          "redirect_url": "app://subcategory/349",
          "metadata": {
            "badge": "Hot"
          }
        },
        {
          "sub_category_id": "350",
          "position": 2,
          "redirect_url": "app://subcategory/350",
          "metadata": {
            "badge": "Trending"
          }
        }
      ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

---

### 2. Get Seasonal Category by ID

**Endpoint:** `GET /api/admin/content/seasonal-categories/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "title": "Winter Collection",
    "description": "Stay warm with our winter essentials",
    "banner_urls": {
      "desktop": "https://example.com/winter-desktop.jpg",
      "mobile": "https://example.com/winter-mobile.jpg"
    },
    "background_color": "#E3F2FD",
    "redirect_url": "app://seasonal/winter",
    "store_codes": ["AVB", "MUM"],
    "store_code": "AVB",
    "season": "winter",
    "is_active": true,
    "sequence": 1,
    "start_date": "2025-11-01T00:00:00.000Z",
    "end_date": "2026-02-28T23:59:59.999Z",
    "subcategories": [
      {
        "sub_category_id": "349",
        "position": 1,
        "redirect_url": "app://subcategory/349",
        "metadata": {
          "badge": "Hot"
        }
      }
    ],
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Seasonal category not found"
}
```

---

### 3. Create Seasonal Category

**Endpoint:** `POST /api/admin/content/seasonal-categories`

**Request Body:**
```json
{
  "title": "Summer Specials",
  "description": "Cool off with summer essentials",
  "banner_urls": {
    "desktop": "https://example.com/summer-desktop.jpg",
    "mobile": "https://example.com/summer-mobile.jpg"
  },
  "background_color": "#FFF9C4",
  "redirect_url": "app://seasonal/summer",
  "store_codes": ["AVB", "MUM", "DEL"],
  "season": "summer",
  "is_active": true,
  "sequence": 2,
  "start_date": "2025-04-01",
  "end_date": "2025-08-31",
  "subcategories": [
    {
      "sub_category_id": "380",
      "position": 1,
      "redirect_url": "app://subcategory/380",
      "metadata": {
        "badge": "Cool Picks"
      }
    },
    {
      "sub_category_id": "381",
      "position": 2,
      "metadata": {
        "discount": "30%"
      }
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Seasonal category created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
    "title": "Summer Specials",
    "description": "Cool off with summer essentials",
    "banner_urls": {
      "desktop": "https://example.com/summer-desktop.jpg",
      "mobile": "https://example.com/summer-mobile.jpg"
    },
    "background_color": "#FFF9C4",
    "redirect_url": "app://seasonal/summer",
    "store_codes": ["AVB", "MUM", "DEL"],
    "store_code": "AVB",
    "season": "summer",
    "is_active": true,
    "sequence": 2,
    "start_date": "2025-04-01T00:00:00.000Z",
    "end_date": "2025-08-31T23:59:59.999Z",
    "subcategories": [
      {
        "sub_category_id": "380",
        "position": 1,
        "redirect_url": "app://subcategory/380",
        "metadata": {
          "badge": "Cool Picks"
        }
      },
      {
        "sub_category_id": "381",
        "position": 2,
        "metadata": {
          "discount": "30%"
        }
      }
    ],
    "createdAt": "2025-01-15T11:30:00.000Z",
    "updatedAt": "2025-01-15T11:30:00.000Z"
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Error creating seasonal category",
  "error": "Seasonal category validation failed: banner_urls.desktop: Desktop banner URL is required"
}
```

---

### 4. Update Seasonal Category

**Endpoint:** `PUT /api/admin/content/seasonal-categories/:id`

**Request Body (Partial Update):**
```json
{
  "title": "Updated Winter Collection",
  "end_date": "2026-03-15",
  "is_active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Seasonal category updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "title": "Updated Winter Collection",
    "description": "Stay warm with our winter essentials",
    "banner_urls": {
      "desktop": "https://example.com/winter-desktop.jpg",
      "mobile": "https://example.com/winter-mobile.jpg"
    },
    "background_color": "#E3F2FD",
    "redirect_url": "app://seasonal/winter",
    "store_codes": ["AVB", "MUM"],
    "season": "winter",
    "is_active": true,
    "sequence": 1,
    "start_date": "2025-11-01T00:00:00.000Z",
    "end_date": "2026-03-15T23:59:59.999Z",
    "subcategories": [...],
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T13:00:00.000Z"
  }
}
```

---

### 5. Delete Seasonal Category

**Endpoint:** `DELETE /api/admin/content/seasonal-categories/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Seasonal category deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Seasonal category not found"
}
```

---

## Seasonal Category Public Routes

**Base URL:** `/api/seasonal-categories`

**Authentication:** Not required

### 1. Create Seasonal Category

**Endpoint:** `POST /api/seasonal-categories`

Same as admin create endpoint, but accessible publicly for testing.

---

### 2. List Seasonal Categories

**Endpoint:** `POST /api/seasonal-categories/list`

**Request Body:**
```json
{
  "store_code": "AVB",
  "season": "winter",
  "enrich_subcategories": true,
  "include_inactive": false
}
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `store_code` | String | - | Filter by store code |
| `season` | String | - | Filter by season type |
| `enrich_subcategories` | Boolean | false | Include full category/subcategory details |
| `include_inactive` | Boolean | false | Include inactive sections |

**Response (200) - Without Enrichment:**
```json
{
  "success": true,
  "count": 2,
  "message": "Found 2 seasonal category section(s)",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "title": "Winter Collection",
      "description": "Stay warm with our winter essentials",
      "banner_urls": {
        "desktop": "https://example.com/winter-desktop.jpg",
        "mobile": "https://example.com/winter-mobile.jpg"
      },
      "background_color": "#E3F2FD",
      "redirect_url": "app://seasonal/winter",
      "store_codes": ["AVB"],
      "season": "winter",
      "is_active": true,
      "sequence": 1,
      "subcategories": [
        {
          "sub_category_id": "349",
          "position": 1,
          "redirect_url": "app://subcategory/349",
          "metadata": {
            "badge": "Hot"
          }
        }
      ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**Response (200) - With Enrichment:**
```json
{
  "success": true,
  "count": 1,
  "message": "Found 1 seasonal category section(s)",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "title": "Winter Collection",
      "description": "Stay warm with our winter essentials",
      "banner_urls": {
        "desktop": "https://example.com/winter-desktop.jpg",
        "mobile": "https://example.com/winter-mobile.jpg"
      },
      "background_color": "#E3F2FD",
      "redirect_url": "app://seasonal/winter",
      "store_codes": ["AVB"],
      "season": "winter",
      "is_active": true,
      "sequence": 1,
      "subcategories": [
        {
          "sub_category_id": "349",
          "position": 1,
          "redirect_url": "app://subcategory/349",
          "metadata": {
            "badge": "Hot"
          },
          "image_link": "https://example.com/subcategories/349.jpg",
          "category_url": "app://category/12",
          "subcategory_url": "app://subcategory/349",
          "subcategory_details": {
            "id": "65a1b2c3d4e5f6g7h8i9j0a1",
            "idsub_category_master": "349",
            "sub_category_name": "Winter Clothing",
            "category_id": "12",
            "main_category_name": "Apparel",
            "dept_id": "1",
            "store_code": "AVB",
            "sequence_id": 10,
            "image_link": "https://example.com/subcategories/349.jpg",
            "sub_category_bg_color": "#E3F2FD"
          },
          "category_details": {
            "id": "65a1b2c3d4e5f6g7h8i9j0b1",
            "idcategory_master": "12",
            "category_name": "Apparel",
            "dept_id": "1",
            "store_code": "AVB",
            "sequence_id": 5,
            "no_of_col": "2",
            "image_link": "https://example.com/categories/12.jpg",
            "category_bg_color": "#FFFFFF"
          }
        }
      ],
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**Empty Response:**
```json
{
  "success": true,
  "count": 0,
  "message": "No seasonal category sections found",
  "data": []
}
```

---

### 3. Get Seasonal Category by ID

**Endpoint:** `GET /api/seasonal-categories/:id`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `enrich_subcategories` | Boolean | Include full details |

**Example:**
```
GET /api/seasonal-categories/65a1b2c3d4e5f6g7h8i9j0k5?enrich_subcategories=true
```

**Response (200):** Same as list endpoint (single item)

---

### 4. Update Seasonal Category

**Endpoint:** `PUT /api/seasonal-categories/:id`

Same as admin update endpoint.

---

### 5. Delete Seasonal Category

**Endpoint:** `DELETE /api/seasonal-categories/:id`

Same as admin delete endpoint.

---

# Common Patterns

## Multi-Store Filtering

Both APIs support flexible store filtering:

**Single Store:**
```json
{
  "store_code": "AVB"
}
```

**Multiple Stores:**
```json
{
  "store_codes": ["AVB", "MUM", "DEL"]
}
```

**Internally stored as:**
```json
{
  "store_code": "AVB",        // First store in array
  "store_codes": ["AVB", "MUM", "DEL"]
}
```

## Date-Based Filtering

Both APIs automatically filter by active dates:

```javascript
// Active records must meet:
is_active = true
start_date <= currentDate
(end_date is null OR end_date >= currentDate)
```

## Sequence Ordering

Records are sorted by:
1. `sequence` (ascending)
2. `createdAt` (descending for ties)

## Metadata Usage

The `metadata` field allows custom data storage:

```json
{
  "metadata": {
    "campaign": "flash-sale-jan",
    "discount": "40%",
    "cta_text": "Shop Now",
    "analytics_tag": "homepage_banner_1"
  }
}
```

---

# Error Responses

## Common Error Codes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Error creating banner",
  "error": "Banner validation failed: action.type: `invalid` is not a valid enum value for path `action.type`."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Banner not found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching banners",
  "error": "Database connection failed"
}
```

## Validation Errors

### Missing Required Fields
```json
{
  "success": false,
  "message": "Error creating seasonal category",
  "error": "Seasonal category validation failed: title: Title is required, banner_urls.desktop: Desktop banner URL is required"
}
```

### Invalid Enum Values
```json
{
  "success": false,
  "message": "Error creating seasonal category",
  "error": "Seasonal category validation failed: season: `invalid_season` is not a valid enum value for path `season`."
}
```

### Array Validation
```json
{
  "success": false,
  "message": "Error creating seasonal category",
  "error": "Seasonal category validation failed: subcategories: At least one subcategory is required"
}
```

---

## Best Practices

### Banners

1. **Use descriptive section names:**
   - `home_top`, `home_middle`, `category_banner`, `product_detail_banner`

2. **Set appropriate dates:**
   - Always set `end_date` for time-limited promotions
   - Use `start_date` for scheduled campaigns

3. **Action types:**
   - Use `category` for navigation to category pages
   - Use `product` for specific product promotions
   - Use `url` for external links or special pages
   - Use `none` for informational banners

4. **Metadata for analytics:**
   - Store campaign IDs, tracking codes, and custom attributes

### Seasonal Categories

1. **Season planning:**
   - Set `start_date` and `end_date` for seasonal relevance
   - Use `season` field for filtering

2. **Subcategory enrichment:**
   - Use `enrich_subcategories=true` in production for complete data
   - Disable for faster responses when full details aren't needed

3. **Banner URLs:**
   - Always provide both desktop and mobile versions
   - Use responsive images for better performance

4. **Store filtering:**
   - Use `store_codes` array for multi-store campaigns
   - Filter by `store_code` in list requests

---

## Migration Notes

### From Advertisements to Banners

If migrating from the Advertisements API:

| Advertisement Field | Banner Field |
|-------------------|--------------|
| `banner_url` | `image_url` |
| `category` | `section_name` |
| `products` | Use `action.type: 'product'` |
| `redirect_url` | `action.value` (if type='url') |

### From Popular Categories to Seasonal Categories

Similar structure, but Seasonal Categories add:
- `season` field for seasonal filtering
- `start_date` and `end_date` for time-based activation

---

## Support & Contact

For API support or questions:
- **Documentation:** Check this guide
- **Postman Collection:** Version 3.2.0 includes all endpoints
- **Issues:** Report at GitHub repository

---

**Last Updated:** January 2025
**API Version:** 3.2.0
