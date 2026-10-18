# 🛋️ Universal Int Studio — Luxury Furniture & Interior Architecture Storefront

A modern, full-stack furniture portfolio, e-commerce catalog, and bespoke inquiry platform built with **Next.js 16 (React 19)**, **Express**, and **Node.js Native SQLite (`node:sqlite`)**.

---

## 📋 Prerequisites & Required Package Versions

Ensure your development environment meets the following requirements:

| Component             | Required Version                                  | Notes                                                                                                                                 |
| :-------------------- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Node.js**           | `>= 22.5.0` (Recommended: **v22.x** or **v24.x**) | **Crucial**: Uses Node.js native `node:sqlite` (DatabaseSync) which requires Node.js v22.5.0+ with zero C++ compilation dependencies. |
| **npm**               | `>= 10.x` (Tested on **v11.19.1**)                | Package manager for root, backend, and frontend.                                                                                      |
| **Next.js**           | `16.4.2`                                          | React framework using Turbopack and App Router.                                                                                       |
| **React / React-DOM** | `19.3.0`                                          | Latest React 19 component runtime.                                                                                                    |
| **Express**           | `^4.19.2`                                         | Backend REST API server on port `4000`.                                                                                               |
| **Prettier**          | `^3.x`                                            | Code formatter configured across the workspace.                                                                                       |

---

## 🚀 Setup & Installation

### Option A: One-Command Automated Setup (From Workspace Root)

From the project root directory, run:

```bash
npm run setup
```

This single command will:

1. Install all backend dependencies (`npm install --prefix backend`)
2. Install all frontend dependencies (`npm install --prefix frontend`)
3. Initialize and seed the SQLite database with 24 catalog products, categories, dimensions, and multi-angle galleries (`node backend/db/seed.js`)

---

### Option B: Step-by-Step Manual Setup

If you prefer installing and seeding individually:

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install

# 3. Seed Database & Create Admin Account
cd ../backend
npm run seed

# 4. Return to Root
cd ..
```

---

## 🏃‍♂️ How to Run the Project

You can run both servers simultaneously using separate terminals or root npm scripts:

### Terminal 1: Backend API Server (Port `4000`)

```bash
# Option 1: From project root
npm run dev:backend

# Option 2: Directly inside backend/
cd backend
npm run dev
# Or for standard execution without watcher:
npm start
```

_Server boots at: `http://localhost:4000`_

---

### Terminal 2: Frontend Web App (Port `3000`)

```bash
# Option 1: From project root
npm run dev:frontend

# Option 2: Directly inside frontend/
cd frontend
npm run dev
```

_Storefront boots at: `http://localhost:3000`_

---

### Production Build & Deployment Check

To verify and run an optimized production build:

```bash
cd frontend
npm run build
npm start
```

---

## 🔗 Important URLs

### 🛍️ Storefront (Customer Facing)

- **Home Page**: [http://localhost:3000](http://localhost:3000)
- **Furniture Catalog / Shop**: [http://localhost:3000/shop](http://localhost:3000/shop)
- **Living Room Collection**: [http://localhost:3000/shop?category=living-room](http://localhost:3000/shop?category=living-room)
- **Dining Room Collection**: [http://localhost:3000/shop?category=dining-room](http://localhost:3000/shop?category=dining-room)
- **Bedroom Collection**: [http://localhost:3000/shop?category=bedroom](http://localhost:3000/shop?category=bedroom)
- **Product Detail Example (Dune Coffee Table)**: [http://localhost:3000/shop/dune-coffee-table](http://localhost:3000/shop/dune-coffee-table)
- **Product Detail Example (Arc Dining Chair)**: [http://localhost:3000/shop/arc-dining-chair-set](http://localhost:3000/shop/arc-dining-chair-set)
- **Cart View**: [http://localhost:3000/cart](http://localhost:3000/cart)
- **Bespoke Quote / Checkout**: [http://localhost:3000/checkout](http://localhost:3000/checkout)

### 🔐 Admin Panel (Staff & Management)

- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Product Management**: [http://localhost:3000/admin/products](http://localhost:3000/admin/products)
- **Add New Product**: [http://localhost:3000/admin/products/new](http://localhost:3000/admin/products/new)
- **Category Management**: [http://localhost:3000/admin/categories](http://localhost:3000/admin/categories)
- **Customer Inquiries & Quotes**: [http://localhost:3000/admin/inquiries](http://localhost:3000/admin/inquiries)

### ⚙️ Backend REST Endpoints

- **API Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **Products API**: [http://localhost:4000/api/products](http://localhost:4000/api/products)
- **Categories API**: [http://localhost:4000/api/categories](http://localhost:4000/api/categories)

---

## 🔑 Admin Credentials & Configuration

Administrative credentials are configured securely via the backend environment (`backend/.env`) and ingested by the database seeder during application setup. Credentials are never hardcoded or exposed in the client UI:

| Setting Variable | Default Value in `.env` | Purpose                                                |
| :--------------- | :---------------------- | :----------------------------------------------------- |
| `ADMIN_USERNAME` | `admin`                 | Administrator username used to access the staff portal |
| `ADMIN_PASSWORD` | `admin123`              | Bcrypt-hashed during seeding; required for signing in  |

> [!NOTE]
> To change the administrative credentials, simply update `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `backend/.env` before running `npm run seed`.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

```ini
PORT=4000
JWT_SECRET=universal_jwt_secret_change_in_production_please
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:4000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Frontend (`frontend/.env.local`)

```ini
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🗄️ Database Architecture (`universal.db`)

The database uses SQLite located at `backend/db/universal.db`.

1. **`categories`**: Room collections (Entry Way, Living Room, Dining Room, Bedroom, Home Office, Storage).
2. **`products`**: Product specifications, descriptions, prices, sale pricing, stock status, and multi-angle JSON image galleries.
3. **`product_dimensions`**: Dedicated dimensional variants table (e.g. 3-Seater vs 4-Seater vs Modular) with individual dimension specifications and optional `price_delta` adjustments.
4. **`inquiries`**: Submitted customer checkout inquiries containing customer details, notes, and a complete snapshot of selected cart items (with chosen dimensions, materials, and finishes).
5. **`admin_users`**: Bcrypt-hashed credentials for administrative access.

To reset or re-seed the sample database at any time:

```bash
npm run seed
```

---

## 🛠️ Formatting & Code Quality

The codebase enforces clean, standard formatting via Prettier:

```bash
# Format all frontend, backend, and documentation files
npm run format

# Verify formatting without writing changes
npm run format:check
```

---

## ✨ Notable Features

- **Theme Switcher**: Instant light / dark mode switching with zero-flash inline bootstrap and `localStorage` persistence.
- **QuickView Carousel Modal**: Click any product card on the shop page to browse gallery photos, toggle dimensions, and add directly to cart.
- **IKEA-Style Technical Dossier**: On `/shop/[slug]`, view interactive tabs for Dimensions & Blueprint, Materials & Joinery, Care & Maintenance, Packaging & Flat-Pack Specs, and 10-Year Warranty.
- **Dynamic Dimension Variants**: Seamless multi-size selection (e.g. Set of 4 / 6 / 8, Compact / Standard / Grand) with real-time price delta calculations.
- **Non-Intrusive Cart Experience**: Toast notification on item addition with sliding cart drawer and quick checkout.
