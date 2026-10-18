const router = require('express').Router();
const { getDB } = require('../db/database');
const auth = require('../middleware/auth');

// POST /api/inquiries  (public — cart checkout)
router.post('/', (req, res) => {
  const { name, email, phone, message, cart_items } = req.body;

  if (!name || !email || !cart_items || !cart_items.length) {
    return res.status(400).json({ error: 'Name, email and cart items are required' });
  }

  const db = getDB();
  try {
    const result = db
      .prepare(
        'INSERT INTO inquiries (name, email, phone, message, cart_items) VALUES (?, ?, ?, ?, ?)'
      )
      .run(name, email, phone || null, message || null, JSON.stringify(cart_items));

    res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Your inquiry has been submitted. We will contact you shortly!',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inquiries  (admin)
router.get('/', auth, (req, res) => {
  const db = getDB();
  try {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
    inquiries.forEach((i) => {
      i.cart_items = JSON.parse(i.cart_items || '[]');
    });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/inquiries/:id  (admin — update status)
router.patch('/:id', auth, (req, res) => {
  const { status } = req.body;
  const valid = ['new', 'contacted', 'closed'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Status must be one of: new, contacted, closed' });
  }
  const db = getDB();
  db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

module.exports = router;
