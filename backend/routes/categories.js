const router = require('express').Router();
const { getDB } = require('../db/database');
const auth = require('../middleware/auth');

// GET /api/categories
router.get('/', (req, res) => {
  const db = getDB();
  try {
    const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:slug  (with nested products)
router.get('/:slug', (req, res) => {
  const db = getDB();
  try {
    const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
    if (!cat) return res.status(404).json({ error: 'Category not found' });

    const products = db
      .prepare(
        'SELECT * FROM products WHERE category_id = ? AND in_stock = 1 ORDER BY is_featured DESC, created_at DESC'
      )
      .all(cat.id);
    products.forEach((p) => {
      p.images = JSON.parse(p.images || '[]');
    });

    res.json({ ...cat, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories
router.post('/', auth, (req, res) => {
  const db = getDB();
  const { name, slug, description, banner_image, sort_order } = req.body;
  try {
    const result = db
      .prepare(
        'INSERT INTO categories (name, slug, description, banner_image, sort_order) VALUES (?, ?, ?, ?, ?)'
      )
      .run(name, slug, description || null, banner_image || null, sort_order || 0);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', auth, (req, res) => {
  const db = getDB();
  const { name, slug, description, banner_image, sort_order } = req.body;
  try {
    db.prepare(
      'UPDATE categories SET name=?, slug=?, description=?, banner_image=?, sort_order=? WHERE id=?'
    ).run(name, slug, description || null, banner_image || null, sort_order || 0, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', auth, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
