const jwt = require('jsonwebtoken');
const User = require('./User'); // NOTE: authController.js imports this as '../Models/User.js' (capital M).
                                         // Pick ONE casing project-wide — a case-sensitive Linux server (most prod
                                         // hosts) will fail to resolve whichever one doesn't match the real folder
                                         // name, even though it works fine on Windows/Mac locally.

// ============================================================================
// protect — verifies the JWT from generateToken() and attaches the user.
//
// ASSUMPTION (please confirm against your actual utils/generateToken.js):
// that it signs `{ id: user._id }` with `process.env.JWT_SECRET`. If your
// payload key or secret name differs, adjust the two marked lines below.
// ============================================================================
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Not authenticated.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // <- confirm secret name matches generateToken.js
    const userId = decoded.id || decoded._id || decoded.userId; // <- confirm payload shape matches generateToken.js

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User no longer exists.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ============================================================================
// isAdmin — must run AFTER protect(). Requires an `isAdmin: Boolean` field on
// your User model — if it's not there yet, add:
//   isAdmin: { type: Boolean, default: false }
// and manually flip it to true on your own user document in the DB.
// ============================================================================
function isAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin access required.' });
  next();
}

module.exports = { protect, isAdmin };