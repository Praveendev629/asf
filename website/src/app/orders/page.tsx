"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Clock, Truck, CheckCircle2, Home, ChevronRight, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

const STAGE_META: Record<string, { label: string; icon: any; color: string }> = {
  placed: { label: "Placed", icon: Package, color: "text-blue-500 bg-blue-50" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-indigo-500 bg-indigo-50" },
  packed: { label: "Packed", icon: Package, color: "text-amber-500 bg-amber-50" },
  dispatched: { label: "Dispatched", icon: Truck, color: "text-purple-500 bg-purple-50" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-orange-500 bg-orange-50" },
  delivered: { label: "Delivered", icon: Home, color: "text-green-500 bg-green-50" },
};
const STAGE_ORDER = ["placed", "confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: { name: string; image: string; price: number; quantity: number }[];
  deliveryPartner?: { name: string; phone: string; eta: string };
  createdAt: string;
}

export default function OrdersPage() {
  const { firebaseUser, getToken, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (loading || !firebaseUser) return;
    async function fetchOrders() {
      const token = await getToken();
      if (!token) return;
      const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
      setLoadingOrders(false);
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [firebaseUser, loading]);

  if (loading || loadingOrders) {
    return (
      <div className="container-app py-20 text-center text-asf-slate">
        <div className="animate-pulse">Loading your orders...</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="container-app py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 text-asf-slate" size={48} />
        <p className="font-display text-2xl text-asf-slateDeep mb-2">Sign in to view orders</p>
        <Link href="/" className="text-asf-copper font-medium">Go to home</Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 text-asf-slate" size={48} />
        <p className="font-display text-2xl text-asf-slateDeep mb-2">No orders yet</p>
        <Link href="/" className="text-asf-copper font-medium">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-10 max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-asf-slateDeep mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const currentIndex = STAGE_ORDER.indexOf(order.status);
          const stageMeta = STAGE_META[order.status] || STAGE_META.placed;
          const StageIcon = stageMeta.icon;

          return (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <div className="card p-5 hover:shadow-premium transition-shadow cursor-pointer">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-asf-slateDeep">#{order.orderNumber}</p>
                    <p className="text-xs text-asf-slate flex items-center gap-1">
                      <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${stageMeta.color}`}>
                      <StageIcon size={12} /> {stageMeta.label}
                    </span>
                    <ChevronRight size={16} className="text-asf-slate" />
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-[11px] bg-asf-mist text-asf-slateDeep px-2 py-0.5 rounded-full">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <span className="text-[11px] bg-asf-mist text-asf-slate px-2 py-0.5 rounded-full">
                      +{order.items.length - 3} more
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-asf-slateDeep">₹{order.total}</p>
                  {order.deliveryPartner && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Truck size={12} /> {order.deliveryPartner.name}
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3 flex gap-1">
                  {STAGE_ORDER.map((stage, i) => (
                    <div key={stage} className={`h-1 flex-1 rounded-full ${i <= currentIndex ? "bg-asf-copper" : "bg-asf-mist"}`} />
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
