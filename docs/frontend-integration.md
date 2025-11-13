# Frontend Integration Guide (React Customer App)

This guide summarizes how the customer-facing React app can consume the new merchandising APIs. All endpoints are read-only—no create/update/delete calls are required within the app.

Use the base URL configured for your environment (e.g. `https://api.example.com`). The examples below assume the API is reachable at `https://api.example.com`.

---

## 1. Best Seller Sections

### List Sections
- **Method:** `POST`
- **URL:** `/api/best-sellers/list`
- **Request Body:**
  - `store_code`: (optional) Single store identifier to filter sections for a specific store.
  - `include_inactive`: (optional, default: `false`) Include inactive sections.
  - `enrich_products`: (optional, default: `false`) Returns embedded product snapshots for rendering.
- **Example Request:**
  ```bash
  POST https://api.example.com/api/best-sellers/list
  Content-Type: application/json

  {
    "store_code": "AVB",
    "enrich_products": true
  }
  ```
- **Note:** This endpoint returns sections matching the provided store code. Sections can be associated with multiple stores, and will be returned if any of their store codes match.
- **Sample Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "message": "Found 1 best seller section(s)",
    "data": [
      {
        "_id": "672c1c6c96faa2cc94351f20",
        "title": "Best Sellers This Week",
        "background_color": "#F5F5F5",
        "banner_urls": {
          "desktop": "https://cdn.example.com/banners/best-sellers-desktop.jpg",
          "mobile": "https://cdn.example.com/banners/best-sellers-mobile.jpg"
        },
        "redirect_url": "app://best-sellers",
        "products": [
          {
            "p_code": "2390",
            "position": 0,
            "redirect_url": "app://product/2390",
            "product_details": {
              "p_code": "2390",
              "product_name": "Sabudana 250g",
              "our_price": 18,
              "product_mrp": 22,
              "pcode_img": "https://cdn.example.com/products/2390.png",
              "store_quantity": 128
            }
          }
        ]
      }
    ]
  }
  ```

### Fetch a Single Section
- **Method:** `GET`
- **URL:** `/api/best-sellers/:id`
- **Query Params:** `enrich_products=true`
- **Example:**
  ```
  GET https://api.example.com/api/best-sellers/672c1c6c96faa2cc94351f20?enrich_products=true
  ```

---

## 2. Popular Categories

### List Sections
- **Method:** `POST`
- **URL:** `/api/popular-categories/list`
- **Request Body:**
  - `store_code`: (optional) Single store identifier to filter sections for a specific store.
  - `include_inactive`: (optional, default: `false`) Include inactive sections.
  - `enrich_subcategories`: (optional, default: `false`) Returns embedded subcategory details.
- **Example Request:**
  ```bash
  POST https://api.example.com/api/popular-categories/list
  Content-Type: application/json

  {
    "store_code": "AVB",
    "enrich_subcategories": true
  }
  ```
- **Note:** This endpoint returns sections matching the provided store code. Sections can be associated with multiple stores.
- **Sample Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "message": "Found 1 popular category section(s)",
    "data": [
      {
        "_id": "672c1ce296faa2cc94352001",
        "title": "Popular Categories",
        "background_color": "#EFEFEF",
        "banner_urls": {
          "desktop": "https://cdn.example.com/banners/popular-categories-desktop.jpg",
          "mobile": "https://cdn.example.com/banners/popular-categories-mobile.jpg"
        },
        "redirect_url": "app://categories/popular",
        "subcategories": [
          {
            "sub_category_id": "349",
            "position": 0,
            "redirect_url": "app://category/349",
            "subcategory_details": {
              "idsub_category_master": "349",
              "sub_category_name": "Snacks",
              "image_link": "https://cdn.example.com/category/snacks.png"
            }
          }
        ]
      }
    ]
  }
  ```

### Fetch a Single Section
- **Method:** `GET`
- **URL:** `/api/popular-categories/:id`
- **Query Params:** `enrich_subcategories=true`

---

## 3. Advertisements

Use advertisements to show banner creatives with deep links and associated product highlights.

### List Advertisements
- **Method:** `POST`
- **URL:** `/api/advertisements/list`
- **Request Body:**
  - `store_code`: (optional) Single store identifier to filter advertisements for a specific store.
  - `category`: (optional) Filter by category (e.g., `homepage`, `offers`).
  - `active_only`: (optional, default: `false`) Return only active advertisements.
  - `active_on`: (optional) ISO date to check advertisement active status.
  - `include_expired`: (optional, default: `true`) Include expired advertisements.
  - `limit`: (optional) Maximum number of results to return.
  - `enrich_products`: (optional, default: `false`) Embed product snapshots.
- **Example Request:**
  ```bash
  POST https://api.example.com/api/advertisements/list
  Content-Type: application/json

  {
    "store_code": "AVB",
    "category": "homepage",
    "active_only": true,
    "enrich_products": true,
    "limit": 10
  }
  ```

### Fetch Only Active Advertisements
- **Method:** `POST`
- **URL:** `/api/advertisements/active`
- **Request Body:**
  - `store_code`: (optional) Single store identifier to filter advertisements.
  - `category`: (optional) Filter by category.
  - `active_on`: (optional) ISO date to check active status (defaults to current date).
  - `limit`: (optional) Maximum number of results.
  - `enrich_products`: (optional, default: `false`) Embed product snapshots.
- **Example Request:**
  ```bash
  POST https://api.example.com/api/advertisements/active
  Content-Type: application/json

  {
    "store_code": "AVB",
    "category": "homepage",
    "enrich_products": true
  }
  ```

### Sample Response (Active Ads)
```json
{
  "success": true,
  "count": 1,
  "message": "Found 1 active advertisement(s)",
  "data": [
    {
      "_id": "672c1d6c96faa2cc94354ab3",
      "title": "Diwali Mega Sale",
      "description": "Up to 70% off on kitchenware and home decor!",
      "banner_url": "https://cdn.example.com/banners/diwali-sale.jpg",
      "redirect_url": "https://bulkbeyond.in/sale",
      "category": "homepage",
      "start_date": "2025-10-20T00:00:00.000Z",
      "end_date": "2025-11-10T23:59:59.999Z",
      "products": [
        {
          "p_code": "2390",
          "position": 0,
          "redirect_url": "app://product/2390",
          "product_details": {
            "p_code": "2390",
            "product_name": "Sabudana 250g",
            "our_price": 18,
            "pcode_img": "https://cdn.example.com/products/2390.png"
          }
        }
      ]
    }
  ]
}
```

### Fetch Advertisement by ID
- **Method:** `GET`
- **URL:** `/api/advertisements/:id`
- **Query Params:** `enrich_products=true`
- **Example:**
  ```
  GET https://api.example.com/api/advertisements/672c1d6c96faa2cc94354ab3?enrich_products=true
  ```

---

## Implementation Notes (React)

1. **HTTP Client**: Use `fetch` or a wrapper (`axios`) to call the endpoints from React.
2. **Data Caching**: Sections and ads change infrequently—cache results (e.g., React Query, SWR) to reduce API churn.
3. **Product Details**: When using `enrich_*` flags, each item includes a `product_details` object. Use these fields directly for rendering product name, price, stock, and images.
4. **Redirect Handling**:
   - `redirect_url` values may be standard web URLs or app deep links (`app://`).
   - Implement a helper that checks the scheme and chooses between `window.location`, React Router navigation, or deep-link handlers.
5. **Scheduling Logic**: `start_date`/`end_date` are already filtered in `/active`. If you list all ads, ensure you respect those dates on the client when necessary.

---

## Summary

### Available Endpoints
- **Best Sellers**: `POST /api/best-sellers/list` with optional `store_code`
- **Popular Categories**: `POST /api/popular-categories/list` with optional `store_code`
- **Advertisements**: `POST /api/advertisements/list` or `POST /api/advertisements/active` with optional `store_code`
- **Individual Items**: `GET /api/best-sellers/:id`, `GET /api/popular-categories/:id`, `GET /api/advertisements/:id`

### Key Features
- **Store Filtering**: All POST endpoints accept an optional single `store_code` to filter content for a specific store
- **Multi-Store Support**: Sections can be associated with multiple store codes in the backend. When you provide a `store_code`, any section where that code matches will be returned
- **Enrichment**: Include `enrich_products=true` or `enrich_subcategories=true` when you need product/category metadata in a single payload
- **Flexible Filtering**: Filter by store code, category, active status, and date ranges
- **POST Only**: All list endpoints use POST method to accept filtering parameters in the request body

This setup provides all data required to power the home page merchandising, category highlights, and promotional banners in the React customer app with store-specific filtering support.

