const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'universal_jwt_secret_change_in_production_please';

/**
 * Verifies the Bearer JWT token from the Authorization header.
 * Attaches decoded payload to req.admin on success.
 */
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — token missing' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
  }
};
