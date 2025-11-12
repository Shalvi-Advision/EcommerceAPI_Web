# Frontend Integration Guide (React)

This document outlines how to consume the **Best Sellers**, **Popular Categories**, and **Advertisements** APIs from a React-based frontend. It assumes you are using a modern toolchain (React 18+, TypeScript or JavaScript, axios/fetch) and have network access to the deployed Ecommerce API.

---

## 1. Prerequisites

- Environment variable for API base URL, e.g.:
  ```bash
  REACT_APP_API_BASE_URL=https://api.example.com
  ```
- HTTP client (axios, fetch, or React Query) configured to prepend the base URL and handle JSON.
- Optional but recommended: centralized API layer for re-use and caching.

```ts
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});
```

---

## 2. API Overview

| Feature              | Endpoint                              | Method | Notes                                                                                 |
|----------------------|----------------------------------------|--------|---------------------------------------------------------------------------------------|
| Best Sellers         | `/api/best-sellers`                   | GET    | `enrich_products=true` adds live SKU data                                            |
|                      | `/api/best-sellers`                   | POST   | Admin-only creation                                                                  |
|                      | `/api/best-sellers/:id`               | GET    | `enrich_products=true` supported                                                      |
|                      | `/api/best-sellers/:id`               | PUT    | Admin-only update                                                                     |
| Popular Categories   | `/api/popular-categories`             | GET    | Use `store_code`, `enrich_subcategories=true`                                         |
|                      | `/api/popular-categories/:id`         | GET    | `enrich_subcategories=true` supported                                                 |
| Advertisements       | `/api/advertisements`                 | GET    | Defaults to include expired; pass `include_expired=false` for current/future only     |
|                      | `/api/advertisements/active`          | GET    | Always filters by schedule; support `category`, `limit`, `enrich_products=true`       |
|                      | `/api/advertisements/:id`             | GET    | `enrich_products=true` supported                                                      |

> For protected routes (POST/PUT/DELETE), follow existing auth conventions (JWT).

---

## 3. Data Shapes

### 3.1 Best Seller Section
```json
{
  "_id": "6740bd...",
  "title": "This Week's Best Sellers",
  "background_color": "#F4F4F4",
  "description": "Handpicked hits",
  "redirect_url": "app://best-sellers",
  "banner_urls": {
    "desktop": ".../best-sellers-desktop.jpg",
    "mobile": ".../best-sellers-mobile.jpg"
  },
  "products": [
    {
      "p_code": "2390",
      "position": 0,
      "redirect_url": "app://product/2390",
      "metadata": { "badge": "🔥" },
      "product_details": {
        "product_name": "Sabudana",
        "our_price": 18,
        "pcode_img": "https://..."
      }
    }
  ]
}
```

### 3.2 Popular Category Section
```json
{
  "_id": "6740c0...",
  "title": "Popular in Home Decor",
  "background_color": "#FFFFFF",
  "redirect_url": "https://example.com/categories/popular",
  "banner_urls": { "desktop": "...", "mobile": "..." },
  "subcategories": [
    {
      "sub_category_id": "350",
      "position": 1,
      "redirect_url": "app://category/350",
      "metadata": { "badge": "Hot" },
      "subcategory_details": {
        "sub_category_name": "Wooden Decor",
        "image_link": "https://..."
      }
    }
  ]
}
```

### 3.3 Advertisement (with products)
```json
{
  "_id": "6740c5...",
  "title": "Diwali Mega Sale",
  "banner_url": "https://.../diwali-sale.jpg",
  "redirect_url": "https://bulkbeyond.in/sale",
  "category": "homepage",
  "is_active": true,
  "start_date": "2025-10-20T00:00:00.000Z",
  "end_date": "2025-11-10T23:59:59.999Z",
  "sequence": 1,
  "products": [
    {
      "p_code": "2390",
      "position": 0,
      "redirect_url": "app://product/2390",
      "metadata": { "tag": "Top Pick" },
      "product_details": {
        "product_name": "Sabudana 250 GM",
        "our_price": 18
      }
    }
  ]
}
```

---

## 4. Fetching Data in React

### 4.1 Reusable Fetchers
```ts
// src/api/bestSellers.ts
import { apiClient } from './client';

export const fetchBestSellers = async (params: { storeCode?: string } = {}) => {
  const response = await apiClient.get('/api/best-sellers', {
    params: {
      ...params,
      enrich_products: true,
    },
  });
  return response.data.data;
};

export const fetchPopularCategories = async (params: { storeCode?: string } = {}) => {
  const response = await apiClient.get('/api/popular-categories', {
    params: {
      store_code: params.storeCode,
      enrich_subcategories: true,
    },
  });
  return response.data.data;
};

export const fetchActiveAdvertisements = async (params: { category?: string; limit?: number } = {}) => {
  const response = await apiClient.get('/api/advertisements/active', {
    params: {
      ...params,
      enrich_products: true,
    },
  });
  return response.data.data;
};
```

### 4.2 Using React Query (Recommended)
```ts
// src/hooks/useBestSellers.ts
import { useQuery } from '@tanstack/react-query';
import { fetchBestSellers } from '../api/bestSellers';

export const useBestSellers = (storeCode?: string) =>
  useQuery({
    queryKey: ['best-sellers', storeCode],
    queryFn: () => fetchBestSellers({ storeCode }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
```

```tsx
// src/components/BestSellerCarousel.tsx
import { useBestSellers } from '../hooks/useBestSellers';

export const BestSellerCarousel = ({ storeCode }: { storeCode?: string }) => {
  const { data = [], isLoading, error } = useBestSellers(storeCode);

  if (isLoading) return <div>Loading best sellers…</div>;
  if (error) return <div>Failed to load best sellers.</div>;

  return (
    <div className="best-seller-carousel">
      {data.map((section) => (
        <section key={section._id} style={{ backgroundColor: section.background_color }}>
          <a href={section.redirect_url ?? '#'} target="_blank" rel="noreferrer">
            <picture>
              <source media="(max-width: 767px)" srcSet={section.banner_urls.mobile} />
              <img src={section.banner_urls.desktop} alt={section.title} />
            </picture>
          </a>
          <div className="products">
            {section.products.map((product) => (
              <a key={product.p_code} href={product.redirect_url ?? '#'} className="product-card">
                <img src={product.product_details?.pcode_img} alt={product.product_details?.product_name} />
                <div>{product.product_details?.product_name}</div>
                <div>₹{product.product_details?.our_price?.toFixed(2)}</div>
                {product.metadata?.badge && <span className="badge">{product.metadata.badge}</span>}
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
```

> Apply similar patterns for `PopularCategoryGrid` and `AdvertisementBanner` components.

---

## 5. UI/UX Recommendations

1. **Responsive Images**: Use `picture` and `source` to serve `banner_urls.desktop` / `banner_urls.mobile`. Fallback to `banner_url` if separate assets are unavailable.
2. **Dynamic Theming**: Apply `background_color` to section wrappers for visual consistency.
3. **Redirect URLs**: Respect `redirect_url` fields. For mobile apps (React Native / deep linking), ensure proper scheme handling.
4. **Product Badges**: Surface metadata (e.g., `badge`, `tagline`) for promotional callouts.
5. **Ordering**: Use `position` to sort arrays before rendering (e.g., `products.sort((a,b)=>a.position-b.position)`).
6. **Graceful Degradation**:
   - If `product_details` is `null`, fallback to a generic card or omit the item.
   - If `subcategory_details` is missing, display the raw `sub_category_id`.
7. **Caching Strategy**:
   - Cache responses locally (React Query, SWR, Zustand, Redux Toolkit Query).
   - Prefetch on route transitions to avoid layout shifts.
8. **Skeleton Loading**: Provide skeletons/shimmers for carousels/grids to keep the UI engaging while data resolves.

---

## 6. Error Handling & Edge Cases

- Network failures: surface toast/snackbar with retry option.
- Empty responses: show curated fallback copy (“No best sellers this week”).
- Date-bound ads: call `/api/advertisements/active` for only currently valid banners; the endpoint handles `start_date`/`end_date` checks.
- Compatibility with SSR/Streaming:
  - When server-rendering, ensure `fetchBestSellers` et al. work outside browser (avoid window-specific APIs).

---

## 7. Example Integration Flow

1. **Home Page**
   - Fetch Active Advertisements (`category=homepage`, `limit=5`).
   - Fetch Best Sellers for user’s `storeCode`.
   - Fetch Popular Categories (same `storeCode`).
2. **Category Page**
   - Use `category`-specific advertisements (e.g., `category=product_page`).
   - Fetch relevant popular categories or best sellers for cross-selling.
3. **Analytics**
   - Track impressions/clicks using `redirect_url` as the canonical identifier.
   - Attach `section._id` / `ad._id` to analytics payloads.

---

## 8. Testing Checklist

- [ ] API base URL configured for all environments.
- [ ] Components render fallback state when arrays are empty.
- [ ] Desktop/mobile banners swap correctly at breakpoints.
- [ ] Redirects open expected destinations (web, app deep links).
- [ ] Product data visible (name, price, image). Validate behavior when product is inactive (`product_details = null`).
- [ ] Advertisements respect schedule boundaries (create with past/future dates to test).
- [ ] Lighthouse/CLS checks to ensure lazy loading and skeletons avoid layout shifts.

---

## 9. Extending Further

- **A/B Testing**: Wrap hooks/components with feature flag checks to experiment with layout variations.
- **Personalisation**: Filter best sellers/products client-side by user preferences (e.g., pinned categories).
- **Offline Support**: Persist latest payloads in IndexedDB for repeat visits.
- **Accessibility**: Label banners and product cards with `aria-label`/`aria-describedby`.

---

Need help? Reach out to the backend team with the endpoint, payload, and relevant request IDs when raising issues.


