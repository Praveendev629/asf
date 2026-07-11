"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Phone, PackageCheck } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading, getToken } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 29;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/?redirect=/checkout");
      return;
    }
    if (!profile?.phone || !profile?.address) {
      router.replace("/onboarding?redirect=/checkout");
    }
  }, [loading, firebaseUser, profile]);

  async function handlePlaceOrder() {
    setPlacing(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      clearCart();
      router.push(`/orders/${data.order._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return <div className="container-app py-20 text-center text-asf-slate">Your cart is empty.</div>;
  }

  if (!profile?.phone || !profile?.address) return null;

  return (
    <div className="container-app py-10 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-asf-slateDeep mb-8">Confirm your order</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-4">
        <div className="flex items-center gap-2 text-asf-slateDeep font-semibold mb-3">
          <MapPin size={18} /> Delivery Address
        </div>
        <p className="text-sm text-asf-slate leading-relaxed">
          {profile.address.line1}, {profile.address.line2 ? `${profile.address.line2}, ` : ""}
          {profile.address.city}, {profile.address.state} - {profile.address.pincode}
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-4">
        <div className="flex items-center gap-2 text-asf-slateDeep font-semibold mb-3">
          <Phone size={18} /> Delivery Contact
        </div>
        <p className="text-sm text-asf-slate">+91 {profile.phone}</p>
      </motion.div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-asf-slateDeep mb-4">Order Items</h2>
        <div className="space-y-2 mb-4">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-sm">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>₹{i.price * i.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-asf-mist pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-asf-slate">Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-asf-slate">Delivery</span>
            <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full flex items-center justify-center gap-2">
        <PackageCheck size={18} />
        {placing ? "Placing order..." : `Place Order · ₹${total}`}
      </button>
    </div>
  );
}
