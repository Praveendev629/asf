const express = require("express");
const { db } = require("../config/firebase");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const COLLECTION = "products";

// GET /api/products  -> list (public, used by website + customer app)
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = db.collection(COLLECTION);
    if (category) query = query.where("category", "==", category);
    const snap = await query.get();
    let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((p) => p.name?.toLowerCase().includes(s));
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const doc = await db.collection(COLLECTION).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: "Product not found" });
  res.json({ id: doc.id, ...doc.data() });
});

// POST /api/products  (Shop Owner app only)
router.post("/", requireAuth, requireRole("shopOwner", "admin"), async (req, res) => {
  const data = { ...req.body, createdAt: new Date().toISOString(), ownerId: req.user.uid };
  const ref = await db.collection(COLLECTION).add(data);
  res.status(201).json({ id: ref.id, ...data });
});

// PUT /api/products/:id
router.put("/:id", requireAuth, requireRole("shopOwner", "admin"), async (req, res) => {
  await db.collection(COLLECTION).doc(req.params.id).update(req.body);
  res.json({ success: true });
});

// DELETE /api/products/:id
router.delete("/:id", requireAuth, requireRole("shopOwner", "admin"), async (req, res) => {
  await db.collection(COLLECTION).doc(req.params.id).delete();
  res.json({ success: true });
});

module.exports = router;
