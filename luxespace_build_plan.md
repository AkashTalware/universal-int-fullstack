# 🛋️ Universal Int Studio — Full-Stack Build Plan

> **Stack:** Next.js (React) · Node.js + Express · SQLite · Vanilla CSS

---

## Project Overview

A furniture portfolio + shopping webapp for a modern furniture business, featuring:

- Public-facing storefront with browsable product catalogue
- Shopping cart with inquiry/quote checkout (owner contacts customer)
- Admin panel for managing products, categories, prices, and orders

---

## Project Structure

```
ag-universal-int-studio/
├── frontend/                  # Next.js storefront + admin panel
│   ├── pages/
│   │   ├── index.js           # Home page (hero, featured products, categories)
│   │   ├── shop/
│   │   │   ├── index.js       # All products / category browse
│   │   │   └── [slug].js      # Individual product detail page
│   │   ├── cart.js            # Shopping cart page
│   │   ├── checkout.js        # Inquiry/quote form checkout
│   │   └── admin/
│   │       ├── index.js       # Admin dashboard (overview)
│   │       ├── login.js       # Admin login (simple password)
│   │       ├── products/
│   │       │   ├── index.js   # Product list + CRUD table
│   │       │   ├── new.js     # Add new product
│   │       │   └── [id].js    # Edit product
│   │       ├── categories.js  # Manage categories
│   │       └── inquiries.js   # View submitted cart inquiries
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js      # Nav with cart icon + badge
│   │   │   ├── Footer.js      # Footer with links
│   │   │   └── AdminLayout.js # Sidebar layout for admin
│   │   ├── product/
│   │   │   ├── ProductCard.js # Card used on listing pages
│   │   │   ├── ProductGrid.js # Responsive grid of cards
│   │   │   └── ProductDetail.js # Full product detail view
│   │   ├── cart/
│   │   │   ├── CartDrawer.js  # Slide-in cart sidebar
│   │   │   └── CartItem.js    # Individual cart row
│   │   └── ui/
│   │       ├── CategoryFilter.js # Filter bar (tabs/chips)
│   │       ├── HeroSection.js    # Landing hero banner
│   │       └── Toast.js          # Notification toasts
│   ├── context/
│   │   └── CartContext.js     # React Context for cart state (localStorage)
│   ├── styles/
│   │   ├── globals.css        # Design tokens, resets, typography
│   │   ├── components.css     # Component-level styles
│   │   └── admin.css          # Admin panel specific styles
│   ├── lib/
│   │   └── api.js             # Fetch helpers to call backend
│   └── public/
│       └── images/            # Product images (uploaded via admin)
│
├── backend/                   # Express REST API
│   ├── server.js              # Entry point, middleware setup
│   ├── routes/
│   │   ├── products.js        # GET /products, GET /products/:id, POST, PUT, DELETE
│   │   ├── categories.js      # GET /categories, POST, PUT, DELETE
│   │   ├── inquiries.js       # POST /inquiries, GET /inquiries (admin)
│   │   ├── upload.js          # POST /upload (image upload via multer)
│   │   └── auth.js            # POST /auth/login (admin password check)
│   ├── middleware/
│   │   ├── auth.js            # JWT token verification for admin routes
│   │   └── cors.js            # CORS setup
│   ├── db/
│   │   ├── database.js        # SQLite connection (better-sqlite3)
│   │   ├── schema.sql         # DB schema
│   │   └── seed.js            # Seed script with sample furniture data
│   └── uploads/               # Stored product images (served statically)
│
└── README.md
```

---

## Database Schema

```sql
-- Categories (entryway, living, dining, bedroom, office, storage)
CREATE TABLE categories (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  slug      TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_image TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  price         REAL NOT NULL,
  sale_price    REAL,             -- optional discounted price
  images        TEXT,             -- JSON array of image paths
  dimensions    TEXT,             -- e.g. "W120 × D60 × H75 cm"
  material      TEXT,             -- e.g. "Solid Teak + Brushed Steel"
  finish        TEXT,             -- e.g. "Matte Walnut"
  is_featured   INTEGER DEFAULT 0, -- show on homepage
  in_stock      INTEGER DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries (cart checkout submissions)
CREATE TABLE inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT,
  cart_items  TEXT NOT NULL,  -- JSON snapshot of cart at time of submission
  status      TEXT DEFAULT 'new',  -- new | contacted | closed
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users (simple single-admin for now)
CREATE TABLE admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
```

---

## Backend API Endpoints

### Public Endpoints

| Method | Endpoint                | Description                                                          |
| ------ | ----------------------- | -------------------------------------------------------------------- |
| GET    | `/api/products`         | List all products (supports `?category=slug&featured=true&search=q`) |
| GET    | `/api/products/:id`     | Single product by ID or slug                                         |
| GET    | `/api/categories`       | List all categories                                                  |
| GET    | `/api/categories/:slug` | Category with products                                               |
| POST   | `/api/inquiries`        | Submit cart inquiry (checkout)                                       |

### Admin Endpoints (JWT protected)

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| POST   | `/api/auth/login`           | Admin login → returns JWT            |
| GET    | `/api/admin/inquiries`      | List all inquiries                   |
| PATCH  | `/api/admin/inquiries/:id`  | Update inquiry status                |
| POST   | `/api/admin/products`       | Create product                       |
| PUT    | `/api/admin/products/:id`   | Update product (price, images, etc.) |
| DELETE | `/api/admin/products/:id`   | Delete product                       |
| POST   | `/api/admin/categories`     | Create category                      |
| PUT    | `/api/admin/categories/:id` | Update category                      |
| DELETE | `/api/admin/categories/:id` | Delete category                      |
| POST   | `/api/upload`               | Upload product image → returns URL   |

---

## Frontend Pages & Features

### 🏠 Home Page (`/`)

- Full-screen hero banner with tagline + CTA button
- "Shop by Room" grid of 6 category cards with hover animations
- "Featured Products" horizontal scroll carousel
- About / Brand story section
- Footer with newsletter + links

### 🛍️ Shop Page (`/shop`)

- Left sidebar or top filter: category chips, price range slider, material filter
- Masonry/grid product cards with: image, name, price, "Add to Cart" button
- Sort by: Price ↑, Price ↓, Newest
- Pagination or infinite scroll

### 📦 Product Detail (`/shop/[slug]`)

- Full-width hero image gallery (click to zoom lightbox)
- Product name, price (with sale price if applicable)
- Description, material, dimensions, finish
- "Add to Cart" button with quantity selector
- "Related Products" from same category

### 🛒 Cart (`/cart`)

- Table of cart items (image, name, quantity +/-, price)
- Subtotal, note about pricing being estimates
- "Proceed to Inquiry" button

### 📋 Checkout/Inquiry (`/checkout`)

- Name, Email, Phone, Message fields
- Cart summary snapshot
- On submit: sends to backend, shows confirmation page
- Backend sends owner an email (optional: nodemailer)

### 🔐 Admin Panel (`/admin`)

- **Login**: simple username/password → JWT stored in cookie
- **Dashboard**: counts (products, categories, new inquiries)
- **Products**: sortable table, search, edit/delete, add new
- **Product Form**: name, category, price, sale_price, images (drag-drop upload), description, dimensions, material, finish, featured toggle
- **Categories**: table with name, slug, edit
- **Inquiries**: table with customer info, cart JSON, status badge, status updater

---

## Design System

### Color Palette

```css
--color-bg: #0e0e10; /* near-black background */
--color-surface: #1a1a1e; /* card/panel surface */
--color-surface-2: #242428; /* elevated surfaces */
--color-border: #2e2e34; /* subtle borders */
--color-accent: #c8a96e; /* warm gold — luxury feel */
--color-accent-dim: #a88848; /* hover state */
--color-text: #f0ede8; /* warm off-white text */
--color-text-muted: #8a8880; /* secondary text */
--color-success: #4caf6e;
--color-danger: #e05555;
```

### Typography

- **Display font**: `Playfair Display` (Google Fonts) — elegant serif for headings
- **Body font**: `Inter` (Google Fonts) — clean sans for UI text
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64px

### Key UI Patterns

- Dark luxury theme (inspired by high-end furniture brands like Minotti, Ligne Roset)
- Gold accent on CTAs, highlights, and hover states
- Glassmorphism cards with subtle blur + border
- Smooth page transitions (Next.js router)
- Micro-animations: card hover lift, button shimmer, drawer slide-in

---

## Pre-seeded Categories (6 rooms)

| Slug          | Display Name      |
| ------------- | ----------------- |
| `entryway`    | Entry Way         |
| `living-room` | Living Room       |
| `dining-room` | Dining Room       |
| `bedroom`     | Bedroom           |
| `home-office` | Home Office       |
| `storage`     | Storage & Modular |

---

## Sample Seed Products (per category)

Each category will have 4–6 sample products seeded with:

- Realistic furniture names (e.g. "Sable Console Table", "Oslo Sectional Sofa")
- Placeholder prices (₹ INR)
- Material/dimension details
- Placeholder images (generated or from public Unsplash URLs)

---

## Dev Setup Instructions (post Node upgrade)

### 1. Initialize frontend

```bash
cd frontend
npx create-next-app@latest ./ --js --no-tailwind --eslint --no-app --no-src-dir --use-npm
```

### 2. Install frontend deps

```bash
npm install swr react-hot-toast lucide-react
```

### 3. Initialize backend

```bash
cd backend
npm init -y
npm install express better-sqlite3 cors multer bcryptjs jsonwebtoken dotenv
npm install --save-dev nodemon
```

### 4. Run both

```bash
# Terminal 1
cd backend && npm run dev   # runs on port 4000

# Terminal 2
cd frontend && npm run dev  # runs on port 3000
```

---

## Build Order

1. **Backend first**:
   - [ ] `server.js` + middleware
   - [ ] `db/schema.sql` + `db/database.js`
   - [ ] `db/seed.js` with all 6 categories + sample products
   - [ ] All API route files
   - [ ] Auth middleware (JWT)

2. **Frontend design system**:
   - [ ] `styles/globals.css` — design tokens + resets
   - [ ] Layout components (Header, Footer)

3. **Public storefront**:
   - [ ] Home page
   - [ ] Shop/listing page
   - [ ] Product detail page
   - [ ] Cart (Context + UI)
   - [ ] Checkout/inquiry form

4. **Admin panel**:
   - [ ] Login page
   - [ ] Dashboard
   - [ ] Products CRUD
   - [ ] Categories CRUD
   - [ ] Inquiries viewer

---

## Deployment Options (when ready)

| Service                | Cost              | Notes                                 |
| ---------------------- | ----------------- | ------------------------------------- |
| **Vercel**             | Free tier         | Frontend (Next.js) — zero config      |
| **Railway**            | Free tier / $5/mo | Backend (Express + SQLite file)       |
| **Render**             | Free tier         | Alternative to Railway                |
| **VPS (DigitalOcean)** | $4/mo             | Full control, both frontend + backend |

> **Recommended**: Vercel for frontend + Railway for backend. Total cost: $0–$5/month.

---

## Notes & Future Enhancements

- Payment gateway (Razorpay) can be added once checkout flow is validated
- Email notifications via Nodemailer (SMTP) when inquiry is submitted
- Multi-image product gallery with lightbox
- Product variants (color, size)
- Wishlist feature
- Customer accounts (Phase 2)
