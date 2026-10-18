const router = require('express').Router();
const { getDB } = require('../db/database');
const auth = require('../middleware/auth');

// ─── Public ──────────────────────────────────────────────────────────────────

// GET /api/products?category=slug&featured=true&search=q
router.get('/', (req, res) => {
  const db = getDB();
  const { category, featured, search } = req.query;

  let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (featured === 'true') {
    sql += ' AND p.is_featured = 1';
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.material LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY p.is_featured DESC, p.created_at DESC';

  try {
    const products = db.prepare(sql).all(...params);

    // Fetch all dimension options in a single batch query
    const allDims = db
      .prepare(
        'SELECT id, product_id, label, specs, price_delta, is_default, sort_order FROM product_dimensions ORDER BY sort_order ASC, id ASC'
      )
      .all();
    const dimsByPid = {};
    for (const d of allDims) {
      if (!dimsByPid[d.product_id]) dimsByPid[d.product_id] = [];
      dimsByPid[d.product_id].push(d);
    }

    products.forEach((p) => {
      p.images = JSON.parse(p.images || '[]');
      p.dimension_options = dimsByPid[p.id] || [];
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', (req, res) => {
  const db = getDB();
  const { idOrSlug } = req.params;
  const isId = /^\d+$/.test(idOrSlug);
  const field = isId ? 'p.id' : 'p.slug';

  try {
    const product = db
      .prepare(
        `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${field} = ?
    `
      )
      .get(idOrSlug);

    if (!product) return res.status(404).json({ error: 'Product not found' });
    product.images = JSON.parse(product.images || '[]');

    // Query dimensions for single product
    const dims = db
      .prepare(
        'SELECT id, label, specs, price_delta, is_default, sort_order FROM product_dimensions WHERE product_id = ? ORDER BY sort_order ASC, id ASC'
      )
      .all(product.id);
    product.dimension_options = dims;

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin ────────────────────────────────────────────────────────────────────

// POST /api/products
router.post('/', auth, (req, res) => {
  const db = getDB();
  const {
    name,
    slug,
    description,
    price,
    sale_price,
    category_id,
    images,
    dimensions,
    material,
    finish,
    is_featured,
    in_stock,
    dimension_options,
  } = req.body;

  try {
    const result = db
      .prepare(
        `
      INSERT INTO products (name, slug, description, price, sale_price, category_id, images, dimensions, material, finish, is_featured, in_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        name,
        slug,
        description || null,
        price,
        sale_price || null,
        category_id || null,
        JSON.stringify(images || []),
        dimensions || null,
        material || null,
        finish || null,
        is_featured ? 1 : 0,
        in_stock !== false ? 1 : 0
      );

    const productId = result.lastInsertRowid;

    if (Array.isArray(dimension_options) && dimension_options.length) {
      const insertDim = db.prepare(
        'INSERT INTO product_dimensions (product_id, label, specs, price_delta, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
      );
      dimension_options.forEach((d, idx) => {
        insertDim.run(
          productId,
          d.label,
          d.specs || null,
          d.price_delta || 0,
          d.is_default ? 1 : 0,
          d.sort_order ?? idx
        );
      });
    }

    res.status(201).json({ id: productId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', auth, (req, res) => {
  const db = getDB();
  const {
    name,
    slug,
    description,
    price,
    sale_price,
    category_id,
    images,
    dimensions,
    material,
    finish,
    is_featured,
    in_stock,
    dimension_options,
  } = req.body;

  try {
    db.prepare(
      `
      UPDATE products SET
        name=?, slug=?, description=?, price=?, sale_price=?, category_id=?,
        images=?, dimensions=?, material=?, finish=?, is_featured=?, in_stock=?
      WHERE id=?
    `
    ).run(
      name,
      slug,
      description || null,
      price,
      sale_price || null,
      category_id || null,
      JSON.stringify(images || []),
      dimensions || null,
      material || null,
      finish || null,
      is_featured ? 1 : 0,
      in_stock !== false ? 1 : 0,
      req.params.id
    );

    if (Array.isArray(dimension_options)) {
      db.prepare('DELETE FROM product_dimensions WHERE product_id = ?').run(req.params.id);
      const insertDim = db.prepare(
        'INSERT INTO product_dimensions (product_id, label, specs, price_delta, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
      );
      dimension_options.forEach((d, idx) => {
        insertDim.run(
          req.params.id,
          d.label,
          d.specs || null,
          d.price_delta || 0,
          d.is_default ? 1 : 0,
          d.sort_order ?? idx
        );
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
