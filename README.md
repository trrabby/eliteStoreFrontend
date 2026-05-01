# Elite Store — Frontend

### "Feel the elegance" — Next.js 15 storefront for Bangladesh's premium e-commerce platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**Live:** [elitestore.com.bd](https://elitestore.com.bd) &nbsp;|&nbsp;
**API:** [api.elitestore.com.bd](https://api.elitestore.com.bd)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Design System](#design-system)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages & Routing](#pages--routing)
- [State Management](#state-management)
- [Rendering Strategy](#rendering-strategy)
- [Internationalization](#internationalization)
- [Real-time Features](#real-time-features)
- [PWA & Push Notifications](#pwa--push-notifications)
- [Scripts](#scripts)

---

## Overview

Elite Store frontend is a **Next.js 15 App Router** application serving a multi-vendor e-commerce experience for the Bangladesh market. It features:

- **Bilingual UI** — English and Bengali, switchable at runtime
- **Multi-step flows** — Cart → Checkout → Payment → Confirmation
- **Three dashboards** — Customer, Vendor, Admin
- **Real-time notifications** — Socket.io + Web Push
- **Payment integration** — SSLCommerz, bKash, Nagad, Cash on Delivery
- **BD-specific** — BDT currency, 48hr delivery promise, COD support
- **PWA-ready** — Installable, offline fallback, service worker

---

## Design System

### Color Palette

| Token           | Hex       | Usage                              |
| --------------- | --------- | ---------------------------------- |
| `primary`       | `#FF3E9B` | CTAs, badges, active states, links |
| `primary-light` | `#FF88BA` | Hover states, secondary buttons    |
| `primary-pale`  | `#FFEDFA` | Section backgrounds, card accents  |
| `primary-dark`  | `#D4006F` | Pressed state, deep accents        |
| White           | `#FFFFFF` | Page background                    |
| Gray-900        | `#171717` | Body text                          |

### Typography

| Font             | Usage                        | Variable               |
| ---------------- | ---------------------------- | ---------------------- |
| Playfair Display | Headings, logo, display text | `--font-playfair`      |
| DM Sans          | Body text, UI, buttons       | `--font-dm-sans`       |
| Hind Siliguri    | Bengali language mode        | `--font-hind-siliguri` |

### Gradients

```css
--gradient-primary: linear-gradient(135deg, #ff3e9b 0%, #ff88ba 100%);
--gradient-pale: linear-gradient(135deg, #ffedfa 0%, #fff5fb 100%);
--gradient-hero: linear-gradient(135deg, #ff3e9b 0%, #ff88ba 50%, #ffedfa 100%);
```

---

## Tech Stack

| Concern       | Technology                      |
| ------------- | ------------------------------- |
| Framework     | Next.js 15 (App Router)         |
| Language      | TypeScript 5                    |
| Styling       | Tailwind CSS v4 + CSS Variables |
| UI Components | shadcn/ui                       |
| State         | Redux Toolkit                   |
| Server State  | RTK Query                       |
| HTTP Client   | Axios (with interceptors)       |
| Forms         | React Hook Form + Zod           |
| Animation     | Framer Motion                   |
| Icons         | Lucide React                    |
| Charts        | Recharts                        |
| Tables        | TanStack Table v8               |
| Carousel      | Embla Carousel                  |
| Socket        | socket.io-client                |
| i18n          | next-intl                       |
| Dates         | date-fns (with bn locale)       |
| Images        | next/image + Cloudinary         |
| Push          | Web Push (service worker)       |

---

## Project Structure

```
elite-store/
├── src/
│   ├── app/
│   │   ├── layout.tsx                       ← Root layout (fonts, providers, metadata)
│   │   ├── globals.css                      ← Design tokens, utility classes
│   │   │
│   │   ├── (public)/                        ← Public storefront
│   │   │   ├── layout.tsx                   ← Header + Footer + MobileNav
│   │   │   ├── page.tsx                     ← Home page (SSG + ISR)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                 ← Product listing (SSR)
│   │   │   │   └── [slug]/page.tsx          ← Product detail (SSR)
│   │   │   ├── category/[slug]/page.tsx     ← Category page (SSG + ISR)
│   │   │   ├── brand/[slug]/page.tsx        ← Brand page (SSG + ISR)
│   │   │   ├── store/[slug]/page.tsx        ← Vendor store (SSR)
│   │   │   └── search/page.tsx             ← Search results (SSR)
│   │   │
│   │   ├── (auth)/                          ← Auth pages (no header/footer)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (shop)/                          ← Multi-step shopping flows
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx                 ← Step 1: Address
│   │   │   │   ├── payment/page.tsx         ← Step 2: Payment
│   │   │   │   └── review/page.tsx          ← Step 3: Review & Place
│   │   │   └── payment/
│   │   │       ├── success/page.tsx
│   │   │       ├── failed/page.tsx
│   │   │       └── cancelled/page.tsx
│   │   │
│   │   ├── (account)/                       ← Customer dashboard (CSR)
│   │   │   ├── layout.tsx                   ← Sidebar + auth guard
│   │   │   ├── account/page.tsx
│   │   │   ├── account/addresses/page.tsx
│   │   │   ├── account/orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── account/returns/page.tsx
│   │   │   ├── account/reviews/page.tsx
│   │   │   ├── account/wishlist/page.tsx
│   │   │   ├── account/wallet/page.tsx
│   │   │   └── account/notifications/page.tsx
│   │   │
│   │   ├── (vendor)/                        ← Vendor dashboard (CSR)
│   │   │   ├── layout.tsx
│   │   │   ├── vendor/dashboard/page.tsx
│   │   │   ├── vendor/products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── vendor/orders/page.tsx
│   │   │   ├── vendor/inventory/page.tsx
│   │   │   ├── vendor/reviews/page.tsx
│   │   │   └── vendor/store/page.tsx
│   │   │
│   │   └── (admin)/                         ← Admin dashboard (CSR)
│   │       ├── layout.tsx
│   │       ├── admin/dashboard/page.tsx
│   │       ├── admin/users/page.tsx
│   │       ├── admin/vendors/page.tsx
│   │       ├── admin/products/page.tsx
│   │       ├── admin/categories/page.tsx
│   │       ├── admin/brands/page.tsx
│   │       ├── admin/orders/page.tsx
│   │       ├── admin/shipments/page.tsx
│   │       ├── admin/payments/page.tsx
│   │       ├── admin/returns/page.tsx
│   │       ├── admin/reviews/page.tsx
│   │       ├── admin/coupons/page.tsx
│   │       ├── admin/wallet/page.tsx
│   │       └── admin/notifications/page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx                   ← Sticky header with search + cart + notifications
│   │   │   ├── MobileNav.tsx                ← Bottom 5-icon navigation
│   │   │   ├── Footer.tsx                   ← Links + payment methods + social
│   │   │   ├── CategoryBar.tsx              ← Scrollable category pills
│   │   │   └── Sidebar.tsx                  ← Dashboard sidebar
│   │   ├── shared/
│   │   │   ├── Logo.tsx                     ← "Elite Store" Playfair text logo
│   │   │   ├── SearchBar.tsx
│   │   │   ├── LanguageSwitcher.tsx         ← EN ↔ বাংলা toggle
│   │   │   ├── NotificationBell.tsx         ← Dropdown with unread badge
│   │   │   ├── NotificationToast.tsx        ← Animated popup notification
│   │   │   └── CurrencyDisplay.tsx          ← BDT formatter
│   │   ├── providers/
│   │   │   ├── ReduxProvider.tsx
│   │   │   └── SocketProvider.tsx           ← Socket.io + Redux wired
│   │   ├── home/
│   │   │   ├── HeroBanner.tsx               ← Embla carousel, auto-play
│   │   │   ├── CategoryScroll.tsx           ← Horizontal category circles
│   │   │   ├── TrustBadges.tsx              ← COD, Return, Delivery, Price
│   │   │   ├── FeaturedProducts.tsx         ← Tabbed product section
│   │   │   ├── BrandSection.tsx             ← Brand logos grid
│   │   │   ├── PriceRangeCards.tsx          ← "Shop Under ৳999"
│   │   │   ├── NewArrivals.tsx              ← Carousel
│   │   │   └── PromoBanners.tsx             ← 2-col promo images
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductImageGallery.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   ├── ReviewSection.tsx
│   │   │   └── RatingBreakdown.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── checkout/
│   │       ├── CheckoutSteps.tsx
│   │       ├── AddressStep.tsx
│   │       ├── PaymentStep.tsx
│   │       └── ReviewStep.tsx
│   │
│   ├── store/
│   │   ├── index.ts                         ← Store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.ts                 ← User + token
│   │   │   ├── cartSlice.ts                 ← Cart with auto-totals
│   │   │   ├── wishlistSlice.ts
│   │   │   ├── notificationSlice.ts         ← Real-time + toast
│   │   │   └── uiSlice.ts                   ← Locale, drawers, search
│   │   └── api/
│   │       ├── productApi.ts                ← RTK Query endpoints
│   │       ├── orderApi.ts
│   │       ├── userApi.ts
│   │       └── cartApi.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios.ts                     ← Axios with silent token refresh
│   │   │   └── endpoints.ts
│   │   ├── utils/
│   │   │   ├── cn.ts                        ← clsx + tailwind-merge
│   │   │   ├── currency.ts                  ← BDT formatter + discount %
│   │   │   └── date.ts                      ← BD timezone formatters
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useCart.ts
│   │       ├── useSocket.ts
│   │       └── useNotifications.ts
│   │
│   └── messages/
│       ├── en.json                          ← English strings
│       └── bn.json                          ← Bengali strings
│
├── public/
│   ├── sw.js                                ← Service worker (push notifications)
│   ├── manifest.json                        ← PWA manifest
│   └── icons/
│
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Elite Store backend running (see backend README)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/elite-store-frontend.git
cd elite-store-frontend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local
# Fill in your values

# 4. Run development server
npm run dev
```

The app will be at `http://localhost:3000`

### shadcn/ui setup (first time only)

```bash
npx shadcn@latest init
# Choose: New York style, Zinc base, CSS variables: yes
```

---

## Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudinary (for direct uploads if needed)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# VAPID (for push notifications — get from backend)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

---

## Pages & Routing

### Route Groups

| Group       | Path prefix          | Auth Required              | Rendering |
| ----------- | -------------------- | -------------------------- | --------- |
| `(public)`  | `/`                  | No                         | SSG / SSR |
| `(auth)`    | `/login` etc.        | No (redirect if logged in) | CSR       |
| `(shop)`    | `/cart`, `/checkout` | Checkout: Yes              | CSR       |
| `(account)` | `/account/*`         | Yes — CUSTOMER+            | CSR       |
| `(vendor)`  | `/vendor/*`          | Yes — VENDOR+              | CSR       |
| `(admin)`   | `/admin/*`           | Yes — ADMIN+               | CSR       |

### Multi-step Pages (Govaly-style)

Multi-step flows use URL-based navigation with Redux persisting state:

```
/cart
  └── /checkout            Step 1 — Select address
        └── /checkout/payment    Step 2 — Choose payment
              └── /checkout/review     Step 3 — Review & place

/payment/success
/payment/failed
/payment/cancelled
```

A `CheckoutSteps` progress indicator sits at the top of all checkout pages. Redux holds the checkout state between steps. Back navigation never loses data.

---

## State Management

### Redux Store Structure

```typescript
store: {
  auth: {
    user: User | null,
    accessToken: string | null,
    isLoading: boolean
  },
  cart: {
    items: CartItem[],
    subtotal: number,
    savings: number
  },
  wishlist: {
    productIds: number[]
  },
  notification: {
    items: Notification[],
    unreadCount: number,
    showToast: Notification | null
  },
  ui: {
    locale: "en" | "bn",
    isMobileMenuOpen: boolean,
    isSearchOpen: boolean,
    isCartOpen: boolean
  },
  productApi: RTKQueryState,
  orderApi:   RTKQueryState,
  userApi:    RTKQueryState,
  cartApi:    RTKQueryState
}
```

### RTK Query

Server state is managed by RTK Query. Each API slice handles caching, invalidation, and loading states automatically.

```typescript
// Example usage in component
const { data, isLoading, error } = useGetProductsQuery({
  page: 1,
  limit: 20,
  status: "ACTIVE",
});
```

### Axios Instance

The Axios instance auto-attaches the JWT token and handles **silent token refresh** on 401 responses using a queue pattern — multiple simultaneous requests wait for a single refresh, then retry.

---

## Rendering Strategy

| Page                   | Strategy  | Revalidation | Reason                              |
| ---------------------- | --------- | ------------ | ----------------------------------- |
| Home                   | SSG + ISR | 300s (5min)  | Mostly static, changes infrequently |
| Category page          | SSG + ISR | 600s         | Slug-based, stable content          |
| Brand page             | SSG + ISR | 600s         | Stable                              |
| Product listing        | SSR       | —            | Dynamic filters and sorting         |
| Product detail         | SSR       | —            | Price and stock change frequently   |
| Vendor store           | SSR       | —            | Product list is dynamic             |
| Search results         | SSR       | —            | Query-dependent                     |
| Cart, Checkout         | CSR       | —            | User-specific                       |
| Account, Vendor, Admin | CSR       | —            | User-specific, auth-gated           |

---

## Internationalization

The app supports **English (en)** and **Bengali (bn)** using `next-intl`.

### Switching language

Users click the language toggle in the header (EN ↔ বাংলা). The locale is:

1. Saved to `localStorage`
2. Stored in Redux (`uiSlice.locale`)
3. Passed to `NextIntlClientProvider`

### Adding a new string

1. Add to `messages/en.json`
2. Add to `messages/bn.json`
3. Use in component:

```typescript
import { useTranslations } from "next-intl";

const t = useTranslations("cart");
return <button>{t("checkout")}</button>;
```

### Bengali number formatting

```typescript
import { formatBDT } from "@/lib/utils/currency";

formatBDT(1500); // → ৳1,500
formatBDT(1500, true, true); // → ৳১,৫০০  (Bengali numerals)
```

### Fonts switch automatically

When locale is `bn`, `font-bengali` (Hind Siliguri) is applied via:

```css
[lang="bn"] body {
  font-family: var(--font-hind-siliguri);
}
```

---

## Real-time Features

### Socket.io Client

The `SocketProvider` component establishes a socket connection when the user is logged in:

```typescript
// Automatic connection on login
const socket = io(SOCKET_URL, {
  auth: { token: accessToken },
});
```

### Notification Flow

```
Backend emits "notification:new"
  → SocketProvider catches it
  → Dispatches pushNotification to Redux
  → NotificationBell badge increments
  → NotificationToast popup appears for 5s
  → Auto-dismisses with progress bar animation
```

### Mark as Read

```typescript
// Via socket (instant UI update)
socket.emit("notification:markRead", notificationId);

// Via HTTP (fallback)
PATCH /api/notifications/:id/read
PATCH /api/notifications/mark-all-read
```

---

## PWA & Push Notifications

### Service Worker

Located at `public/sw.js`. Handles:

- Push notification display
- Notification click → open link
- Basic offline fallback

### Push Subscription Flow

```
1. User clicks "Enable Notifications"
2. Browser requests permission
3. Service worker registers
4. Subscribe with VAPID public key
5. POST /api/notifications/push/subscribe with subscription data
6. Backend sends push when user is offline/background
```

### Manifest

`public/manifest.json` makes the app installable on Android and iOS.

---

## Component Patterns

### Server Components (default in App Router)

Used for pages with SSR/SSG — no interactivity, no hooks.

```typescript
// app/(public)/products/[slug]/page.tsx
export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.slug); // direct API call
  return <ProductDetail product={product} />;
}
```

### Client Components (`"use client"`)

Used for interactive UI — Redux, hooks, animations, event handlers.

```typescript
"use client";
import { useSelector } from "react-redux";
```

### Skeleton Loading

Every page has a skeleton variant:

```typescript
import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <div className="card p-3">
      <div className="skeleton h-48 rounded-xl mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
}
```

---

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Analyze bundle
npm run analyze
```

---

## Mobile-First Notes

This app is built **mobile-first** for the Bangladesh market:

- **Bottom navigation** — 5 icons (Home, Categories, Search, Wishlist, Account)
- **Sticky "Add to Cart"** bar at bottom of product detail page
- **Full-screen filter drawer** on mobile product listing
- **Large touch targets** — minimum 44×44px on all interactive elements
- **Swipeable carousels** — Embla Carousel with touch support
- **Skeleton loaders** — every list/page shows skeleton while loading
- **Offline fallback** — service worker serves cached shell when offline

---

## SEO

Every public page has:

```typescript
export const metadata: Metadata = {
  title: "Product Name | Elite Store",
  description: "Product description...",
  openGraph: {
    title: "Product Name",
    images: [productImage],
  },
};
```

Product pages include **JSON-LD structured data**:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "offers": {
    "@type": "Offer",
    "price": "999",
    "priceCurrency": "BDT",
    "availability": "InStock"
  }
}
```

---

## License

MIT — Elite Store Team
