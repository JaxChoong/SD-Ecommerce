# OpenCode Ecommerce Platform - Frontend Design Document

**Version:** 1.2  
**Date:** June 2026  
**Stack:** React 19 + TypeScript + Next.js 16 + Tailwind CSS + shadcn/ui

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design System](#2-design-system)
3. [Component Architecture](#3-component-architecture)
4. [Page Structure](#4-page-structure)
5. [Feature Specifications](#5-feature-specifications)
6. [Responsive Design Strategy](#6-responsive-design-strategy)
7. [State Management](#7-state-management)
8. [API Contracts](#8-api-contracts)
9. [Accessibility Guidelines](#9-accessibility-guidelines)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Project Overview

### 1.1 Objectives

OpenCode is a modern ecommerce platform prototype focused on delivering an exceptional shopping experience with:

- **Seamless product discovery** through intuitive listings and search
- **Flexible checkout flow** with discount coupon support
- **Multiple payment options** catering to Malaysian market (DuitNow, e-wallets, credit cards)
- **Mobile-first responsive design** for optimal cross-device experience

### 1.2 Target Users

- Primary: Malaysian consumers aged 18-45
- Secondary: Southeast Asian market expansion
- Device split: 70% mobile, 30% desktop (estimated)

### 1.3 Key Features

| Feature | Priority | Description |
|---------|----------|-------------|
| Product Listing | P0 | Grid/list view with filtering and sorting |
| Shopping Cart | P0 | Add, remove, update quantities |
| Coupon System | P0 | Search, validate, and apply discount codes |
| Payment Methods | P0 | E-wallets, DuitNow QR, Credit/Debit cards |
| Checkout Flow | P0 | Multi-step with address and payment selection |
| Order Confirmation | P1 | Success page with order summary |
| User Authentication | P1 | Sign in/up for saved preferences |

---

## 2. Design System

### 2.0 Minimalist Design Philosophy

The OpenCode UI is built on a **strict minimalist foundation**. Every element must justify its presence. When in doubt, remove it.

#### Core Principles

| Principle | Rule |
|-----------|------|
| **Whitespace is structure** | Generous padding and margins create visual hierarchy — not borders or decorative dividers |
| **One action per screen section** | Each section presents exactly one primary action. No competing CTAs |
| **Typography over decoration** | Weight, size, and spacing carry meaning. Avoid icons, badges, and labels where text suffices |
| **No visual noise** | No background patterns, no decorative gradients, no drop shadows on flat surfaces |
| **Colour is intentional** | Beige/cream is the neutral canvas. Colour appears only on interactive CTAs and status states |
| **Borders are last resort** | Use whitespace and background contrast to separate elements before reaching for a border |

#### What This Means in Practice

- **Cards:** Flat `cream-50` background on `cream-100` page background. No border, no shadow unless the element is floating (modal, drawer).
- **Forms:** Minimal underline-style or very subtle filled inputs. No heavy outlines.
- **Navigation:** Clean header with only essential items — logo, search, cart count, account.
- **Product grid:** Clean image, name, price. No star ratings or review counts on the card itself — these live on the detail page.
- **Checkout:** Single-column on mobile, two-column (form + summary) on desktop. No visual steps with big icons.
- **Payment selection:** Radio-card pattern — clean bordered cards that activate on selection. No logos in heavy boxes.

#### Typography Hierarchy (Minimalist)

```
Page title       — 24–32px, font-semibold, text-foreground
Section heading  — 18–20px, font-medium, text-foreground
Body text        — 15–16px, font-normal, text-foreground, leading-relaxed
Supporting text  — 13–14px, font-normal, text-muted-foreground
Micro labels     — 12px, font-medium, tracking-wide, uppercase
```

---

### 2.1 Color Palette

The design uses a warm, restrained palette — cream/beige as the neutral foundation, with colour reserved exclusively for interactive elements.

#### Token Map (globals.css — Tailwind v4 inline theme)

All tokens are static hex values. `@theme inline` in Tailwind v4 resolves these at build time, not at runtime, so CSS variables cannot be chained through `var()` inside the `@theme` block.

```css
@theme inline {
  /* ─── Neutral Foundation ─── */
  --color-background:         #FDFBF7;   /* Warm off-white — page canvas */
  --color-surface:            #F7F3ED;   /* Cream — card / section fill */
  --color-surface-raised:     #FFFFFF;   /* Pure white — modals, drawers */
  --color-foreground:         #1C1917;   /* Near-black — primary text */
  --color-muted-foreground:   #78716C;   /* Warm grey — supporting text */

  /* ─── Borders (use sparingly) ─── */
  --color-border:             #E7E0D5;   /* Subtle warm border */
  --color-input:              #F2EDE4;   /* Soft input fill */
  --color-ring:               #6B4C35;   /* Focus ring — warm brown */

  /* ─── Primary CTA — Espresso/Coffee Brown ─── */
  --color-primary:            #4A3728;
  --color-primary-hover:      #2F2218;
  --color-primary-foreground: #FAF7F4;

  /* ─── Secondary CTA — Teal ─── */
  --color-secondary:            #10B981;
  --color-secondary-hover:      #059669;
  --color-secondary-foreground: #FFFFFF;

  /* ─── Status ─── */
  --color-success:   #10B981;
  --color-warning:   #F59E0B;
  --color-error:     #EF4444;

  /* ─── Border radius ─── */
  --radius: 0.5rem;          /* Base — buttons, inputs, cards */
}
```

#### Hover Accent — Claude Red

Interactive hover states use Claude's signature terracotta-red **`#DA3A2F`** as an accent colour. This is applied via Tailwind arbitrary-value classes (`text-[#DA3A2F]`) rather than a design token, because it is used exclusively as a transient hover colour and never as a fill or background.

| Surface | Default state | Hovered state |
|---------|--------------|---------------|
| Product name on listing card | `text-foreground` | `text-[#DA3A2F]` via `group-hover:` |
| CTA button text ("Add to Cart", "Place Order") | `text-primary-foreground` | `text-[#DA3A2F]` via `hover:` |

**Colour usage rules:**
- `background` — html, body, page
- `surface` — product cards, section backgrounds, filter panels
- `surface-raised` — floating UI only (modals, cart drawer, tooltips)
- `primary` — CTA buttons only (espresso brown); never decorative
- `secondary` — confirmation / success actions only
- `border` — maximum once per component; prefer background contrast instead
- Status colours — only for feedback states (success toast, error message, etc.)
- `#DA3A2F` — hover text transitions only; never used as a background or fill

#### Payment Method Brand Colors

```css
/* E-Wallet Colors (for recognition) */
--touch-n-go:    198 100% 44%;   /* #00A8E8 - Touch 'n Go */
--grabpay:       145 100% 39%;   /* #00B14F - GrabPay */
--boost:         346 100% 50%;   /* #FF0055 - Boost */
--shopeepay:     14 100% 50%;    /* #FF5722 - ShopeePay */

/* DuitNow */
--duitnow:       348 83% 47%;    /* #DA1D52 - DuitNow Pink */

/* Card Networks */
--visa:          220 100% 45%;   /* #1A1F71 - Visa Blue */
--mastercard:    24 100% 50%;    /* #FF5F00 - Mastercard Orange */
```

### 2.2 Typography

Two fonts only. No decorative type. No custom headline font.

```css
/* In globals.css @theme inline block */
--font-sans: 'Inter', 'Inter Fallback', sans-serif;  /* All UI text */
--font-mono: 'JetBrains Mono', monospace;             /* Card numbers, codes */
```

**Scale (Tailwind standard classes):**

| Class | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Micro labels, legal |
| `text-sm` | 14px | Supporting text, captions |
| `text-base` | 16px | Body copy, form labels |
| `text-lg` | 18px | Card headings, section intros |
| `text-xl` | 20px | Page sub-headings |
| `text-2xl` | 24px | Page titles (mobile) |
| `text-3xl` | 30px | Page titles (desktop) |

**Rules:**
- Body text: always `leading-relaxed` (1.625)
- Never use `font-bold` (700) in product UI — `font-semibold` (600) is the maximum
- Price figures: `font-semibold`, `text-foreground`
- Struck-through original price: `text-muted-foreground`, `line-through`, `text-sm`

### 2.3 Spacing System

```css
/* Base unit: 4px */
--space-0:   0;
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
--space-20:  5rem;      /* 80px */
```

### 2.4 Border Radius

```css
--radius-sm:   0.25rem;   /* 4px - Small elements */
--radius-md:   0.5rem;    /* 8px - Buttons, inputs */
--radius-lg:   0.75rem;   /* 12px - Cards */
--radius-xl:   1rem;      /* 16px - Modals */
--radius-2xl:  1.5rem;    /* 24px - Large cards */
--radius-full: 9999px;    /* Pills, avatars */
```

### 2.5 Shadows

```css
/* Subtle, warm-tinted shadows */
--shadow-sm:  0 1px 2px 0 rgba(42, 38, 34, 0.05);
--shadow-md:  0 4px 6px -1px rgba(42, 38, 34, 0.07), 
              0 2px 4px -2px rgba(42, 38, 34, 0.05);
--shadow-lg:  0 10px 15px -3px rgba(42, 38, 34, 0.08), 
              0 4px 6px -4px rgba(42, 38, 34, 0.05);
--shadow-xl:  0 20px 25px -5px rgba(42, 38, 34, 0.1), 
              0 8px 10px -6px rgba(42, 38, 34, 0.05);
```

### 2.6 Component Tokens

```css
/* Buttons */
--btn-height-sm:  2rem;     /* 32px */
--btn-height-md:  2.5rem;   /* 40px */
--btn-height-lg:  3rem;     /* 48px */
--btn-padding-x:  1rem;     /* 16px */

/* Inputs */
--input-height:   2.75rem;  /* 44px - Touch friendly */
--input-padding:  0.75rem;  /* 12px */

/* Cards */
--card-padding:   1.5rem;   /* 24px */
--card-gap:       1rem;     /* 16px */
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/                # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── sidebar.tsx
│   │   └── container.tsx
│   │
│   ├── product/               # Product-related components
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-filters.tsx
│   │   ├── product-sort.tsx
│   │   ├── product-gallery.tsx
│   │   ├── product-info.tsx
│   │   ├── product-reviews.tsx
│   │   └── product-skeleton.tsx
│   │
│   ├── cart/                  # Cart components
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   ├── cart-summary.tsx
│   │   ├── cart-empty.tsx
│   │   └── mini-cart.tsx
│   │
│   ├── checkout/              # Checkout components
│   │   ├── checkout-steps.tsx
│   │   ├── shipping-form.tsx
│   │   ├── order-summary.tsx
│   │   └── checkout-complete.tsx
│   │
│   ├── coupon/                # Coupon/Discount components
│   │   ├── coupon-input.tsx
│   │   ├── coupon-search.tsx
│   │   ├── coupon-card.tsx
│   │   ├── coupon-list.tsx
│   │   ├── applied-coupon.tsx
│   │   └── coupon-modal.tsx
│   │
│   ├── payment/               # Payment method components
│   │   ├── payment-selector.tsx
│   │   ├── payment-method-card.tsx
│   │   ├── ewallet-options.tsx
│   │   ├── duitnow-qr.tsx
│   │   ├── credit-card-form.tsx
│   │   └── saved-cards.tsx
│   │
│   └── common/                # Shared components
│       ├── price-display.tsx
│       ├── quantity-selector.tsx
│       ├── rating-stars.tsx
│       ├── image-with-fallback.tsx
│       ├── loading-spinner.tsx
│       └── empty-state.tsx
```

### 3.2 Key Component Specifications

#### ProductCard

```typescript
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  badge?: 'sale' | 'new' | 'bestseller';
  isWishlisted?: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}
```

**Visual Specifications (Minimalist):**
- Card background: `surface` (`#F7F3ED`) on `background` page — no border, no shadow
- Hover: Very subtle background shift to `surface-raised`. No scale transform.
- Image: Square aspect ratio (1:1), fill, rounded top corners only
- No badge system on cards — sale price is shown via struck-through original price
- "Add to Cart" button: Full-width, primary CTA (espresso brown), sits below the price line
- Wishlist: Small ghost icon-button in top-right corner of image area only
- **Product name hover:** On card hover (`group-hover:`), the product name transitions from `text-foreground` to `text-[#DA3A2F]` (Claude red). Transition duration: default (150ms).
- **"Add to Cart" button hover:** Button background stays espresso brown; text transitions from `text-primary-foreground` to `text-[#DA3A2F]`. Background does not change on hover.

#### CouponSearch

```typescript
interface CouponSearchProps {
  onCouponSelect: (coupon: Coupon) => void;
  appliedCoupon?: Coupon;
  cartTotal: number;
}

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt: Date;
  isValid: boolean;
}
```

**Visual Specifications:**
- Search input with magnifying glass icon
- Dropdown/modal with available coupons
- Each coupon card shows: code, description, savings amount
- Applied coupon: Green success state with remove option
- Invalid coupon: Red error state with explanation

#### PaymentSelector

```typescript
interface PaymentSelectorProps {
  selectedMethod?: PaymentMethod;
  onMethodSelect: (method: PaymentMethod) => void;
  savedCards?: SavedCard[];
  amount: number;
}

type PaymentMethod = 
  | { type: 'ewallet'; provider: 'tng' | 'grabpay' | 'boost' | 'shopeepay' }
  | { type: 'duitnow'; subtype: 'qr' | 'online' }
  | { type: 'card'; cardId?: string };
```

**Visual Specifications (Minimalist):**
- Three sections separated by whitespace only — no tab bar UI
- Section labels: small, uppercase, `text-muted-foreground`, `text-xs tracking-widest`
- E-wallet options: clean radio-cards in a 2-column grid. Provider name as text, no heavy logo box.
- DuitNow: QR in a centered white card with countdown below it in `text-muted-foreground`
- Credit card form: Ghost/minimal inputs with bottom border style only. No heavy outlined inputs.
- Selected state: `border-foreground` with a small filled `bg-foreground` circle indicator in the top-right corner. No checkmark icon — the filled dot is the only selection affordance. Unselected state uses `border-border`, hover uses `border-muted-foreground`.

---

## 4. Page Structure

### 4.1 Route Map

```
/                           # Home - Featured products, categories
/products                   # Product listing with filters
/products/[slug]            # Product detail page
/cart                       # Shopping cart (full page mobile)
/checkout                   # Multi-step checkout
/checkout/success           # Order confirmation
/coupons                    # Browse available coupons
/account                    # User account dashboard
/account/orders             # Order history
/account/addresses          # Saved addresses
/account/payment-methods    # Saved payment methods
```

### 4.2 Page Layouts

#### Home Page Layout

```
┌─────────────────────────────────────────┐
│              HEADER                      │
│  Logo    Search    Cart(n)   Account    │
├─────────────────────────────────────────┤
│                                         │
│         HERO BANNER / CAROUSEL          │
│         (Current promotions)            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         CATEGORY QUICK LINKS            │
│    [Icon] [Icon] [Icon] [Icon]          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         FEATURED PRODUCTS               │
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│    │     │ │     │ │     │ │     │     │
│    └─────┘ └─────┘ └─────┘ └─────┘     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│         PROMOTIONAL BANNER              │
│         (Coupon code highlight)         │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                      │
└─────────────────────────────────────────┘
```

#### Product Listing Page

```
┌─────────────────────────────────────────┐
│              HEADER                      │
├─────────────────────────────────────────┤
│  Breadcrumb: Home > Category            │
├─────────────────────────────────────────┤
│                                         │
│  FILTERS        │    PRODUCT GRID       │
│  ┌───────────┐  │    ┌─────┐ ┌─────┐   │
│  │ Category  │  │    │     │ │     │   │
│  │ Price     │  │    └─────┘ └─────┘   │
│  │ Rating    │  │    ┌─────┐ ┌─────┐   │
│  │ Brand     │  │    │     │ │     │   │
│  └───────────┘  │    └─────┘ └─────┘   │
│                 │    ┌─────┐ ┌─────┐   │
│  Mobile:        │    │     │ │     │   │
│  Filters in     │    └─────┘ └─────┘   │
│  bottom sheet   │                       │
│                 │    [Load More]        │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                      │
└─────────────────────────────────────────┘
```

#### Checkout Page

```
┌─────────────────────────────────────────┐
│  ← Back to Cart        CHECKOUT         │
├─────────────────��───────────────────────┤
│                                         │
│  PROGRESS: ①Shipping → ②Payment → ③Done │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  MAIN FORM              │ ORDER SUMMARY │
│  ┌────────────────────┐ │ ┌───────────┐ │
│  │                    │ │ │ Items (3) │ │
│  │  Step Content      │ │ │           │ │
│  │                    │ │ │ Subtotal  │ │
│  │  - Shipping info   │ │ │ Shipping  │ │
│  │  - Payment method  │ │ │ Discount  │ │
│  │  - Review order    │ │ │ ────────  │ │
│  │                    │ │ │ TOTAL     │ │
│  └────────────────────┘ │ └───────────┘ │
│                         │               │
│  Mobile: Summary        │ [APPLY CODE]  │
│  collapsible at top     │               │
│                                         │
├─────────────────────────────────────────┤
│         [Continue / Place Order]        │
└─────────────────────────────────────────┘
```

---

## 5. Feature Specifications

### 5.1 Product Listing

#### Toolbar Layout

The listings toolbar sits below the page title and above the product grid. It is divided into two rows:

1. **Category chips row** — horizontally scrollable pill buttons. "All" is always first. Active category uses `bg-foreground text-background`; inactive uses `bg-surface text-muted-foreground`.
2. **Controls row** — right-aligned. Contains a "Sort" dropdown button and a "Filters" toggle button. When active filters exist, the Filters button shows a count badge and stays visually active.

Active filter pills appear as a third row beneath the controls, each removable individually. A "Clear all" link appears at the end of the pill row when any filter is active. The result count label ("N products found") updates live as filters are applied.

#### Categories

The following categories are supported. New categories are added to the chip row as they appear in the product data:

`All` `Lighting` `Home` `Electronics` `Stationery` `Accessories` `Kitchen`

#### Filter Panel

Triggered by the "Filters" button. Expands inline below the toolbar (not a drawer or modal). Collapses on a second press or when "Close" is clicked.

| Filter Group | UI | Options |
|-------------|-----|---------|
| **Price** | 5 radio buttons | Under RM 50 / RM 50–100 / RM 100–200 / RM 200–500 / Over RM 500 |
| **Availability** | Single checkbox | In stock only |
| **Promotions** | Single checkbox | On sale only |

Panel layout: three columns on desktop, single column on mobile. Background: `bg-surface`. No border — sits on the cream background using whitespace separation. Active filter selections are reflected immediately in the product grid (no "Apply" button required).

#### Sorting Options

A dropdown anchored to the "Sort" button. Closes when an option is selected or when the user clicks outside.

| Value | Label |
|-------|-------|
| `featured` | Featured (default) |
| `price-asc` | Price: Low to High |
| `price-desc` | Price: High to Low |
| `name-asc` | Name: A to Z |

Sorting is applied client-side on the already-filtered product list.

#### Empty State

When no products match the active filters, display a centred message:

```
No products found
Try adjusting your filters or browse all products.
[Clear all filters]  ← text link, not a button
```

#### Pagination

- **Current implementation:** All matching products rendered in a single grid (static prototype).
- **Production target:** Infinite scroll with "Load more" on mobile; 24 items/page with numeric pagination on desktop.

### 5.2 Coupon System

#### Coupon Discovery Flow

```
┌─────────────────────────────────────────────┐
│                                             │
│  User Entry Points:                         │
│  1. "Have a code?" input at checkout        │
│  2. "Browse Coupons" link → Coupon modal    │
│  3. Banner promotions on homepage           │
│                                             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│                                             │
│  Coupon Search Modal:                       │
│  ┌─────────────────────────────────────┐   │
│  │ 🔍 Search coupons...                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Available for your cart:                   │
│  ┌─────────────────────────────────────┐   │
│  │ SAVE20         -20%                 │   │
│  │ Save 20% on orders over RM100       │   │
│  │ [Apply]                             │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ FREESHIP       Free Delivery        │   │
│  │ Free shipping on orders over RM50   │   │
│  │ [Apply]                             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Not yet eligible:                          │
│  ┌─────────────────────────────────────┐   │
│  │ BULK30         -30%      🔒         │   │
│  │ Spend RM50 more to unlock           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

#### Coupon Validation Rules

```typescript
interface CouponValidation {
  isValid: boolean;
  errors?: {
    code: 'EXPIRED' | 'MIN_PURCHASE' | 'MAX_USES' | 'NOT_FOUND' | 'NOT_APPLICABLE';
    message: string;
    requirement?: number; // e.g., minimum purchase amount
  };
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    appliedAmount: number; // Actual discount after caps
  };
}
```

#### Applied Coupon Display

```
┌─────────────────────────────────────────┐
│  ✓ SAVE20 applied                       │
│  You're saving RM20.00!         [Remove]│
└─────────────────────────────────────────┘
```

### 5.3 Payment Methods

#### E-Wallet Integration

| Provider | Logo Color | Status |
|----------|------------|--------|
| Touch 'n Go eWallet | Blue (#00A8E8) | Primary |
| GrabPay | Green (#00B14F) | Primary |
| Boost | Pink (#FF0055) | Primary |
| ShopeePay | Orange (#FF5722) | Primary |

**Flow:**
1. User selects e-wallet provider
2. Redirect to provider app/page
3. User authenticates and confirms
4. Redirect back to success/failure page

#### DuitNow

**QR Payment Flow:**
1. User selects "DuitNow QR"
2. Generate dynamic QR code with amount
3. Display QR with 15-minute timer
4. User scans with banking app
5. Real-time payment status polling
6. Success confirmation

**Online Banking Flow:**
1. User selects "DuitNow Online"
2. Display list of participating banks
3. Redirect to selected bank
4. User authenticates and confirms
5. Redirect back with payment status

#### Credit/Debit Card

**Form Fields:**
- Card number (with card type detection)
- Cardholder name
- Expiry date (MM/YY)
- CVV/CVC
- Save card checkbox (optional)

**Saved Cards Display:**
```
┌─────────────────────────────────────────┐
│  💳 •••• •••• •••• 4242     [Selected]  │
│  Visa ending in 4242                    │
│  Expires 12/27                          │
└────────────────────────────���────────────┘
┌─────────────────────────────────────────┐
│  💳 •••• •••• •••• 8888                 │
│  Mastercard ending in 8888              │
│  Expires 08/26                          │
└─────────────────────────────────────────┘
│  + Add new card                         │
└─────────────────────────────────────────┘
```

#### Payment Method Selection UI

```
┌─────────────────────────────────────────────┐
│  SELECT PAYMENT METHOD                      │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  📱 E-Wallets                        │   │
│  │                                      │   │
│  │  [TnG]  [Grab]  [Boost]  [Shopee]   │   │
│  │                                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🏦 DuitNow                          │   │
│  │                                      │   │
│  │  ○ Scan QR Code                      │   │
│  │  ○ Online Banking                    │   │
│  │                                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💳 Credit/Debit Card                │   │
│  │                                      │   │
│  │  [Saved: •••• 4242]                  │   │
│  │  [+ Add new card]                    │   │
│  │                                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 6. Responsive Design Strategy

### 6.1 Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm:  640px;   /* Small tablets */
--breakpoint-md:  768px;   /* Tablets */
--breakpoint-lg:  1024px;  /* Laptops */
--breakpoint-xl:  1280px;  /* Desktops */
--breakpoint-2xl: 1536px;  /* Large screens */
```

### 6.2 Layout Adaptations

| Component | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|-----------|-----------------|---------------------|-------------------|
| Header | Hamburger menu, compact | Partial nav visible | Full navigation |
| Product Grid | 2 columns | 3 columns | 4 columns |
| Filters | Bottom sheet | Collapsible sidebar | Fixed sidebar |
| Cart | Full page | Drawer from right | Drawer from right |
| Checkout | Single column, stacked | Single column | Two columns |
| Payment Methods | Stacked cards | 2-column grid | 3-column grid |

### 6.3 Touch Considerations

- **Minimum touch target:** 44x44px
- **Spacing between targets:** 8px minimum
- **Swipe gestures:** 
  - Product images: Swipe gallery
  - Cart items: Swipe to delete
  - Categories: Horizontal scroll
- **Pull to refresh:** Product listings

### 6.4 Mobile-Specific Components

#### Bottom Navigation Bar
```
┌────────────────────────────────────────┐
│  🏠      🔍      🛒(2)    👤           │
│  Home   Search   Cart   Account        │
└────────────────────────────────────────┘
```

#### Mobile Filter Sheet
```
┌────────────────────────────────────────┐
│  ────────────                          │
│                                        │
│  FILTERS                    [Clear All]│
│                                        │
│  Category ▼                            │
│  ├─ Electronics                        │
│  ├─ Fashion                            │
│  └─ Home & Living                      │
│                                        │
│  Price Range                           │
│  RM [0] ─────●───── [500]             │
│                                        │
│  [Show 42 Results]                     │
└────────────────────────────────────────┘
```

---

## 7. State Management

### 7.1 Global State (SWR / React Context)

```typescript
// Cart State
interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

// User State
interface UserState {
  isAuthenticated: boolean;
  user: User | null;
  addresses: Address[];
  savedPaymentMethods: PaymentMethod[];
}

// UI State
interface UIState {
  isCartOpen: boolean;
  isFilterOpen: boolean;
  isCouponModalOpen: boolean;
  toasts: Toast[];
}
```

### 7.2 SWR Data Fetching

```typescript
// Products
const { data: products } = useSWR(
  `/api/products?${searchParams}`,
  fetcher
);

// Cart (with optimistic updates)
const { data: cart, mutate: mutateCart } = useSWR(
  '/api/cart',
  fetcher
);

// Available Coupons
const { data: coupons } = useSWR(
  `/api/coupons?cartTotal=${cartTotal}`,
  fetcher
);
```

### 7.3 Form State (React Hook Form)

```typescript
// Checkout Form
interface CheckoutForm {
  shipping: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
  };
  payment: {
    method: PaymentMethodType;
    ewallet?: EWalletProvider;
    duitnow?: DuitNowType;
    card?: {
      number: string;
      name: string;
      expiry: string;
      cvv: string;
      saveCard: boolean;
    };
  };
}
```

---

## 8. API Contracts

### 8.1 Products API

```typescript
// GET /api/products
interface ProductsRequest {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brand?: string[];
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'bestselling' | 'rating';
  page?: number;
  limit?: number;
  search?: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRange: { min: number; max: number };
  };
}
```

### 8.2 Cart API

```typescript
// POST /api/cart/items
interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

// PATCH /api/cart/items/:itemId
interface UpdateCartItemRequest {
  quantity: number;
}

// GET /api/cart
interface CartResponse {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
```

### 8.3 Coupon API

```typescript
// GET /api/coupons
interface CouponsRequest {
  search?: string;
  cartTotal?: number;
}

interface CouponsResponse {
  available: Coupon[];
  notEligible: CouponWithReason[];
}

// POST /api/coupons/validate
interface ValidateCouponRequest {
  code: string;
  cartTotal: number;
  items: { productId: string; quantity: number }[];
}

interface ValidateCouponResponse {
  isValid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: {
    code: string;
    message: string;
  };
}
```

### 8.4 Checkout API

```typescript
// POST /api/checkout
interface CheckoutRequest {
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

interface CheckoutResponse {
  orderId: string;
  status: 'pending_payment' | 'processing' | 'confirmed';
  paymentRedirectUrl?: string; // For e-wallets/DuitNow
  qrCode?: string; // For DuitNow QR
  qrExpiry?: Date;
}

// GET /api/checkout/:orderId/status
interface OrderStatusResponse {
  orderId: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  paidAt?: Date;
}
```

---

## 9. Accessibility Guidelines

### 9.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color Contrast | Minimum 4.5:1 for text, 3:1 for large text |
| Focus Indicators | Visible focus ring using `--ring` color |
| Keyboard Navigation | Full tab navigation, arrow keys for grids |
| Screen Reader | ARIA labels, live regions for updates |
| Touch Targets | Minimum 44x44px |
| Error Messages | Associated with inputs, announced |

### 9.2 ARIA Implementation

```tsx
// Product Card
<article 
  aria-label={`${product.name}, ${formatPrice(product.price)}`}
  role="listitem"
>
  {/* ... */}
</article>

// Cart Update
<div 
  role="status" 
  aria-live="polite"
  className="sr-only"
>
  {cartMessage}
</div>

// Payment Selection
<fieldset role="radiogroup" aria-label="Payment method">
  <legend className="sr-only">Select payment method</legend>
  {/* ... */}
</fieldset>
```

### 9.3 Focus Management

- Modal open: Focus first focusable element
- Modal close: Return focus to trigger
- Form errors: Focus first invalid field
- Cart update: Announce change to screen readers
- Page navigation: Focus main content

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

| Task | Priority | Estimate |
|------|----------|----------|
| Setup Next.js 16 project with TypeScript | P0 | 2h |
| Configure Tailwind with design tokens | P0 | 4h |
| Install and configure shadcn/ui | P0 | 2h |
| Create base layout components | P0 | 8h |
| Implement responsive header/footer | P0 | 8h |
| Setup SWR and API structure | P0 | 4h |

### Phase 2: Product Features (Week 2-3)

| Task | Priority | Estimate |
|------|----------|----------|
| Product card component | P0 | 4h |
| Product grid with responsive layout | P0 | 6h |
| Filter sidebar/sheet | P0 | 8h |
| Sort dropdown | P0 | 2h |
| Product detail page | P0 | 8h |
| Search functionality | P1 | 6h |

### Phase 3: Cart & Checkout (Week 3-4)

| Task | Priority | Estimate |
|------|----------|----------|
| Cart drawer component | P0 | 6h |
| Cart item management | P0 | 4h |
| Checkout multi-step form | P0 | 12h |
| Shipping address form | P0 | 4h |
| Order summary component | P0 | 4h |

### Phase 4: Coupon System (Week 4-5)

| Task | Priority | Estimate |
|------|----------|----------|
| Coupon input component | P0 | 4h |
| Coupon search modal | P0 | 6h |
| Coupon validation logic | P0 | 4h |
| Applied coupon display | P0 | 2h |
| Coupon browse page | P1 | 6h |

### Phase 5: Payment Integration (Week 5-6)

| Task | Priority | Estimate |
|------|----------|----------|
| Payment selector UI | P0 | 6h |
| E-wallet provider cards | P0 | 4h |
| DuitNow QR display | P0 | 6h |
| Credit card form | P0 | 6h |
| Payment status polling | P0 | 4h |
| Order confirmation page | P0 | 4h |

### Phase 6: Polish & Testing (Week 6-7)

| Task | Priority | Estimate |
|------|----------|----------|
| Accessibility audit & fixes | P0 | 8h |
| Mobile responsiveness testing | P0 | 6h |
| Loading states & skeletons | P1 | 4h |
| Error handling & toasts | P1 | 4h |
| Animation & micro-interactions | P2 | 6h |
| Performance optimization | P1 | 4h |

---

## Appendix A: Component Examples

### A.1 Product Card Mockup

```
┌─────────────────────────┐
│  [SALE]                 │
│  ┌───────────────────┐  │
│  │                   │  │
│  │      IMAGE        │  │
│  │                   │  │
│  └───────────────────┘  │
│  ♡                      │
│                         │
│  Product Name Here      │
│  ★★★★☆ (128)           │
│                         │
│  RM 89.00  RM 129.00    │
│            ̶R̶M̶ ̶1̶2̶9̶.̶0̶0̶    │
│                         │
│  [   Add to Cart   ]    │ ← Primary CTA (Coral)
└─────────────────────────┘
```

### A.2 Coupon Card Mockup

```
┌─────────────────────────────────────────┐
│  ┌─────────┐                            │
│  │  20%    │  SAVE20                    │
│  │  OFF    │  Save 20% on orders        │
│  └─────────┘  over RM100                │
│                                         │
│  Min. spend RM100 • Expires 30 Jun      │
│                                         │
│  [        Apply Code        ]           │ ← Secondary CTA (Teal)
└─────────────────────────────────────────┘
```

### A.3 Payment Method Card Mockup

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────┐  Touch 'n Go eWallet     ○    │
│  │ TnG │  Pay with your TnG            │
│  └─────┘  eWallet balance              │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐ ← Selected state
│  ╔═══════════════════════════════════╗  │
│  ║                                   ║  │
│  ║ ┌─────┐  DuitNow QR         ◉    ║  │
│  ║ │ DN  │  Scan with any      ✓    ║  │
│  ║ └─────┘  banking app             ║  │
│  ║                                   ║  │
│  ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘
```

---

## Appendix B: Animation Specifications

### B.1 Transitions

```css
/* Default transition */
--transition-fast:   150ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow:   300ms ease-out;

/* Specific animations */
--transition-color:    color 150ms ease-out;
--transition-bg:       background-color 150ms ease-out;
--transition-transform: transform 200ms ease-out;
--transition-opacity:  opacity 200ms ease-out;
--transition-shadow:   box-shadow 200ms ease-out;
```

### B.2 Micro-interactions

| Interaction | Animation |
|-------------|-----------|
| Button hover | Scale 1.02, shadow increase |
| Button press | Scale 0.98 |
| Card hover | Translate Y -2px, shadow increase |
| Add to cart | Button pulse, cart icon bounce |
| Coupon apply | Success checkmark animation |
| Page transition | Fade in (200ms) |
| Modal open | Fade + scale from 0.95 |
| Sheet open | Slide from bottom/right |

---

## Appendix C: Error States

### C.1 Form Validation Messages

| Field | Validation | Error Message |
|-------|------------|---------------|
| Card Number | Invalid format | "Please enter a valid card number" |
| Card Number | Expired | "This card has expired" |
| CVV | Invalid | "Please enter a valid CVV" |
| Coupon | Not found | "Coupon code not found" |
| Coupon | Expired | "This coupon has expired" |
| Coupon | Min purchase | "Add RM{x} more to use this coupon" |

### C.2 Payment Errors

| Error | User Message | Action |
|-------|--------------|--------|
| Payment declined | "Payment was declined. Please try another method." | Show payment selector |
| Network error | "Connection lost. Please check your internet." | Retry button |
| QR expired | "QR code expired. Generate a new one?" | Refresh button |
| Timeout | "Payment session timed out." | Start over |

---

*Document End*

