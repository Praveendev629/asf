const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order  { amount (paise), receipt }
router.post("/create-order", requireAuth, async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/verify  -> verifies Razorpay signature after payment
router.post("/verify", requireAuth, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const valid = expected === razorpay_signature;
  res.json({ valid });
});

module.exports = router;
