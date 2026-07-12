"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { firebaseUser, signInWithGoogle } = useAuth();
  const router = useRouter();
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 29;

  async function handleCheckout() {
    if (!firebaseUser) await signInWithGoogle();
    router.push("/checkout");
  }

  if (items.length === 0) {
    return <div className="container-app py-20 text-center"><ShoppingBag className="mx-auto mb-4 text-asf-slate" size={48} /><p className="font-display text-2xl text-asf-slateDeep mb-2">Your cart is empty</p><Link href="/" className="text-asf-copper font-medium">Continue shopping</Link></div>;
  }

  return (
    <div className="container-app py-10 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="font-display text-2xl font-semibold text-asf-slateDeep mb-2">Your Cart</h1>
        {items.map((item) => (
          <div key={item.productId} className="card p-4 flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-asf-mist shrink-0"><Image src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"} alt={item.name} fill className="object-cover" /></div>
            <div className="flex-1"><p className="font-medium text-asf-slateDeep">{item.name}</p><p className="text-xs text-asf-slate mb-2">{item.unit}</p><p className="font-semibold text-asf-slateDeep">₹{item.price}</p></div>
            <div className="flex items-center border border-asf-mist rounded-xl">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2"><Minus size={14} /></button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))} className="p-2"><Plus size={14} /></button>
            </div>
            <button onClick={() => removeItem(item.productId)} className="text-asf-slate hover:text-red-500"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
      <div className="card p-6 h-fit sticky top-24">
        <h2 className="font-display text-xl font-semibold text-asf-slateDeep mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span className="text-asf-slate">Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span className="text-asf-slate">Delivery fee</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
        </div>
        <div className="flex justify-between font-semibold text-lg border-t border-asf-mist pt-4 mb-6"><span>Total</span><span>₹{subtotal + deliveryFee}</span></div>
        <button onClick={handleCheckout} className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-xl text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">Proceed to Checkout</button>
      </div>
    </div>
  );
}
