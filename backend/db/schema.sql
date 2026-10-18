-- ─────────────────────────────────────────────
--  Universal Int Studio — Database Schema
--  All statements use IF NOT EXISTS (idempotent)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT,
  banner_image TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name        TEXT    NOT NULL,
  slug        TEXT    NOT NULL UNIQUE,
  description TEXT,
  price       REAL    NOT NULL,
  sale_price  REAL,
  images      TEXT    DEFAULT '[]',   -- JSON array of image URLs
  dimensions  TEXT,
  material    TEXT,
  finish      TEXT,
  is_featured INTEGER DEFAULT 0,
  in_stock    INTEGER DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_dimensions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       TEXT    NOT NULL,       -- e.g. "4-Seater Standard", "Set of 6", "Compact"
  specs       TEXT,                   -- e.g. "W 310 × D 180 × H 82 cm"
  price_delta REAL    DEFAULT 0,      -- Price difference relative to base price (+15000, 0, etc.)
  is_default  INTEGER DEFAULT 0,      -- 1 if default selection
  sort_order  INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_dimensions_pid ON product_dimensions(product_id);

CREATE TABLE IF NOT EXISTS inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  phone      TEXT,
  message    TEXT,
  cart_items TEXT    NOT NULL,  -- JSON snapshot of cart at checkout
  status     TEXT    DEFAULT 'new',  -- new | contacted | closed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL
);

-- Auto-update updated_at on product edits
CREATE TRIGGER IF NOT EXISTS trg_products_updated_at
AFTER UPDATE ON products
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
