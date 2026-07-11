"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Truck, Home, Phone, Clock, MapPin, Navigation } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

const STAGE_META: Record<string, { label: string; icon: any }> = {
  placed: { label: "Order Placed", icon: CheckCircle2 },
  confirmed: { label: "Confirmed", icon: CheckCircle2 },
  packed: { label: "Packed", icon: Package },
  dispatched: { label: "Dispatched", icon: Truck },
  out_for_delivery: { label: "Out for Delivery", icon: Truck },
  delivered: { label: "Delivered", icon: Home },
};
const STAGE_ORDER = ["placed", "confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];

interface Order {
  _id: string; orderNumber: string; status: string; total: number;
  items: { name: string; image: string; price: number; quantity: number }[];
  deliveryAddress: { line1: string; city: string; state: string; pincode: string; lat?: number; lng?: number };
  deliveryPartner?: { name: string; phone: string; eta: string; lat?: number; lng?: number };
  createdAt: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const { getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchOrder() {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/orders/${params.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setOrder(data.order); }
    }
    fetchOrder(); interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (!order) return <div className="container-app py-20 text-center text-asf-slate">Loading order...</div>;
  const currentIndex = STAGE_ORDER.indexOf(order.status);

  return (
    <div className="container-app py-10 max-w-2xl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
        <CheckCircle2 className="mx-auto text-asf-copper mb-3" size={56} />
        <h1 className="font-display text-2xl font-semibold text-asf-slateDeep">Order Confirmed!</h1>
        <p className="text-asf-slate text-sm mt-1">Order #{order.orderNumber}</p>
      </motion.div>

      {order.deliveryPartner?.eta && order.status !== "delivered" && (
        <div className="card p-5 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"><Clock size={24} className="text-amber-600" /></div>
            <div><p className="text-sm text-amber-700 font-medium">Estimated Delivery</p><p className="text-2xl font-bold text-amber-900">{order.deliveryPartner.eta}</p></div>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-asf-slateDeep mb-6">Order Progress</h2>
        <div className="space-y-0">
          {STAGE_ORDER.map((stage, i) => {
            const meta = STAGE_META[stage]; const Icon = meta.icon; const done = i <= currentIndex;
            return (
              <div key={stage} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? "bg-asf-copper text-white" : "bg-asf-mist text-asf-slate"}`}><Icon size={18} /></div>
                  {i < STAGE_ORDER.length - 1 && <div className={`w-0.5 flex-1 min-h-[24px] ${i < currentIndex ? "bg-asf-copper" : "bg-asf-mist"}`} />}
                </div>
                <div className="pb-6"><p className={`font-medium ${done ? "text-asf-slateDeep" : "text-asf-slate"}`}>{meta.label}</p></div>
              </div>
            );
          })}
        </div>
      </div>

      {order.deliveryPartner && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-asf-slateDeep mb-3 flex items-center gap-2"><Truck size={18} /> Delivery Partner</h2>
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-asf-slateDeep">{order.deliveryPartner.name}</p>
              {order.deliveryPartner.eta && <p className="text-sm text-asf-slate flex items-center gap-1"><Clock size={14} /> ETA: {order.deliveryPartner.eta}</p>}
            </div>
            <a href={`tel:${order.deliveryPartner.phone}`} className="btn-primary text-sm py-2 px-4 flex items-center gap-1"><Phone size={14} /> Call</a>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-asf-slateDeep mb-4">Items</h2>
        <div className="space-y-2 text-sm">
          {order.items.map((item, i) => <div key={i} className="flex justify-between"><span>{item.name} x {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>)}
        </div>
        <div className="border-t border-asf-mist mt-4 pt-3 flex justify-between font-semibold"><span>Total</span><span>₹{order.total}</span></div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-asf-slateDeep mb-2 flex items-center gap-2"><MapPin size={18} /> Delivering to</h2>
        <p className="text-sm text-asf-slate">{order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
      </div>
    </div>
  );
}
