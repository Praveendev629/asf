const express = require("express");
const { db, messaging } = require("../config/firebase");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const COLLECTION = "orders";

const STATUSES = ["pending", "confirmed", "picked", "outForDelivery", "delivered", "cancelled"];

// GET /api/orders  (own orders for customer, all for admin)
router.get("/", requireAuth, async (req, res) => {
  const isAdmin = req.user.role === "admin";
  let query = db.collection(COLLECTION);
  if (!isAdmin) query = query.where("userId", "==", req.user.uid);
  const snap = await query.orderBy("createdAt", "desc").get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
});

// POST /api/orders  -> create order after checkout
router.post("/", requireAuth, async (req, res) => {
  const order = {
    ...req.body,
    userId: req.user.uid,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const ref = await db.collection(COLLECTION).add(order);

  // Notify admin app
  await db.collection("notifications").add({
    type: "newOrder",
    orderId: ref.id,
    title: "New Order",
    audience: "admin",
    read: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ id: ref.id, ...order });
});

// PATCH /api/orders/:id/status  (Admin app updates order lifecycle)
router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const { status, deliveryPartner } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const update = { status, updatedAt: new Date().toISOString() };
  if (deliveryPartner) update.deliveryPartner = deliveryPartner;

  await db.collection(COLLECTION).doc(req.params.id).update(update);

  const orderDoc = await db.collection(COLLECTION).doc(req.params.id).get();
  const order = orderDoc.data();

  // Push notification to the customer via FCM
  if (order?.fcmToken && messaging) {
    await messaging.send({
      token: order.fcmToken,
      notification: {
        title: "Order Update",
        body: `Your order is now: ${status}`,
      },
    });
  }

  res.json({ success: true });
});

// PATCH /api/orders/:id/location  (Delivery partner live GPS update)
router.patch("/:id/location", requireAuth, async (req, res) => {
  const { lat, lng } = req.body;
  await db.collection(COLLECTION).doc(req.params.id).update({
    currentLocation: { lat, lng, updatedAt: new Date().toISOString() },
  });
  res.json({ success: true });
});

module.exports = router;
