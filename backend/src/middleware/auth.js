const { admin } = require("../config/firebase");

// Verifies a Firebase ID token sent as "Authorization: Bearer <token>".
// All apps (website, customer, admin, shop-owner) authenticate via
// Firebase Auth on the client, then attach the ID token to backend calls.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing auth token" });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role || req.headers["x-user-role"];
    if (!roles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
