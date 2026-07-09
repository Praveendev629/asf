"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { CreditCard, Wallet, Truck, MapPin } from "lucide-react";

export default function CheckoutPage() {
  const [method, setMethod] = useState<"cod" | "upi" | "card">("upi");

  const actualPrice = 2499;
  const discount = 300;
  const gst = Math.round((actualPrice - discount) * 0.18);
  const delivery = 40;
  const total = actualPrice - discount + gst + delivery;

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold mb-6">Checkout</h1>

        <div className="bg-card rounded-xl p-5 border border-white/5 space-y-2 text-sm">
          <div className="flex justify-between"><span>Actual Price</span><span>₹{actualPrice}</span></div>
          <div className="flex justify-between text-success"><span>Discount</span><span>-₹{discount}</span></div>
          <div className="flex justify-between"><span>GST (18%)</span><span>₹{gst}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>₹{delivery}</span></div>
          <hr className="border-white/10 my-2" />
          <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-secondary">₹{total}</span></div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-secondary" /> Delivery Address
          </h2>
          <div className="bg-card rounded-xl p-4 border border-white/5 text-sm text-white/70">
            Set from Map selection during onboarding.
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-3">Payment Method</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "cod", label: "Cash on Delivery", icon: Truck },
              { id: "upi", label: "UPI", icon: Wallet },
              { id: "card", label: "Card", icon: CreditCard },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id as any)}
                className={`flex flex-col items-center gap-2 rounded-xl py-4 border ${
                  method === id ? "border-secondary bg-secondary/10" : "border-white/10 bg-card"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="w-full mt-8 bg-secondary hover:bg-secondary/80 rounded-lg py-3 font-semibold">
          Place Order — ₹{total}
        </button>
      </div>
    </>
  );
}
