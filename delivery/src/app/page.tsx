"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Truck, LogOut, MapPin, Phone, Navigation, CheckCircle2, Package, Clock, User, Mail, Lock, Eye, EyeOff, Bell, X } from "lucide-react";

interface DeliveryPartnerInfo { _id: string; name: string; phone: string; email: string; }
interface Order { _id: string; orderNumber: string; userName: string; userPhone: string; total: number; status: string; items: { name: string; quantity: number; price: number }[]; deliveryAddress: { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number }; deliveryPartner?: { name: string; phone: string; eta: string }; createdAt: string; }
const STATUS_LABELS: Record<string, string> = { placed: "New Order", confirmed: "Confirmed", packed: "Packed", dispatched: "Dispatched", out_for_delivery: "Out for Delivery", delivered: "Delivered" };
const STATUS_COLORS: Record<string, string> = { placed: "bg-blue-100 text-blue-700", confirmed: "bg-indigo-100 text-indigo-700", packed: "bg-amber-100 text-amber-700", dispatched: "bg-purple-100 text-purple-700", out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-green-100 text-green-700" };

// Simple notification beep using Web Audio API
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/delivery/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("delivery_token", data.token);
      localStorage.setItem("delivery_partner", JSON.stringify(data.partner));
      window.location.reload();
    } catch (err: any) { setError(err.message); } finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4"><Truck size={32} className="text-white" /></div>
          <h1 className="font-display text-3xl font-semibold text-white">Delivery Partner</h1><p className="text-white/60 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-xl space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3"><Mail size={18} className="text-gray-400 mr-3" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 outline-none text-sm" required /></div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3"><Lock size={18} className="text-gray-400 mr-3" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="flex-1 outline-none text-sm" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50">{submitting ? "Signing in..." : "Sign In"}</button>
          <p className="text-center text-sm text-gray-500">Don&apos;t have an account? <Link href="/register" className="text-gray-900 font-medium hover:underline">Register</Link></p>
        </form>
      </div>
    </div>
  );
}

export default function DeliveryDashboard() {
  const [partner, setPartner] = useState<DeliveryPartnerInfo | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "my">("available");
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const prevAvailableIds = useRef<Set<string>>(new Set());

  const playSoundAndAlert = useCallback((newOrders: Order[]) => {
    if (newOrders.length > 0) {
      playNotificationSound();
      setNewOrderAlert(newOrders[0]);
      setActiveTab("available");
      // Auto-dismiss after 8 seconds
      setTimeout(() => setNewOrderAlert(null), 8000);
    }
  }, []);

  const ts = () => `_t=${Date.now()}`;

  async function loadOrders(token: string) {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        fetch("/api/delivery/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/delivery/orders?filter=my", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (availRes.ok) {
        const data = await availRes.json();
        const newOrders: Order[] = data.orders || [];
        // Detect new orders that weren't in the previous poll
        const currentIds = new Set(newOrders.map((o) => o._id));
        if (prevAvailableIds.current.size > 0) {
          const freshOrders = newOrders.filter((o) => !prevAvailableIds.current.has(o._id));
          if (freshOrders.length > 0) playSoundAndAlert(freshOrders);
        }
        prevAvailableIds.current = currentIds;
        setAvailableOrders(newOrders);
      }
      if (myRes.ok) { const data = await myRes.json(); setMyOrders(data.orders || []); }
    } finally { setLoading(false); }
  }

  async function handleAcceptOrder(orderId: string) {
    const token = localStorage.getItem("delivery_token"); if (!token) return;
    await fetch(`/api/delivery/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "accept" }) });
    loadOrders(token);
  }

  async function handleUpdateStatus(orderId: string, status: string) {
    const token = localStorage.getItem("delivery_token"); if (!token) return;
    let body: Record<string, unknown> = { status };
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => { navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 }); });
        body.lat = pos.coords.latitude; body.lng = pos.coords.longitude;
      } catch {}
    }
    await fetch(`/api/delivery/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    loadOrders(token);
  }

  function handleLogout() { localStorage.removeItem("delivery_token"); localStorage.removeItem("delivery_partner"); window.location.reload(); }

  function openNavigation(destLat: number, destLng: number) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${destLat},${destLng}&travelmode=driving`;
          window.open(url, "_blank");
        },
        () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
          window.open(url, "_blank");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
      window.open(url, "_blank");
    }
  }

  // Not logged in — show login form directly (no redirect)
  const token = typeof window !== "undefined" ? localStorage.getItem("delivery_token") : null;
  if (!partner && !loading && !token) {
    return <LoginForm />;
  }

  if (!partner) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;
  }

  const displayOrders = activeTab === "available" ? availableOrders : myOrders;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><Truck size={24} /><div><h1 className="font-semibold text-lg">ASF Delivery</h1>{partner && <p className="text-white/60 text-xs">{partner.name}</p>}</div></div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span>
            <button onClick={handleLogout} className="text-white/60 hover:text-white"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-lg animate-bounce-once">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><Bell size={20} /></div>
              <div className="flex-1">
                <p className="font-bold text-sm">New Order Available!</p>
                <p className="text-white/90 text-xs mt-0.5">#{newOrderAlert.orderNumber} — ₹{newOrderAlert.total}</p>
              </div>
              <button onClick={() => setNewOrderAlert(null)} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("available")} className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === "available" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border border-gray-200"}`}><Package size={16} /> Available ({availableOrders.length})</button>
          <button onClick={() => setActiveTab("my")} className={`flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ${activeTab === "my" ? "bg-gray-900 text-white" : "bg-white text-gray-700 border border-gray-200"}`}><Truck size={16} /> My Orders ({myOrders.length})</button>
        </div>
        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl p-5 h-40 animate-pulse" />)}</div>
        ) : displayOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400"><Package size={48} className="mx-auto mb-4" /><p className="font-medium">{activeTab === "available" ? "No available orders" : "No orders assigned yet"}</p></div>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div><p className="font-semibold text-gray-900">#{order.orderNumber}</p><p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p></div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>{STATUS_LABELS[order.status] || order.status}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700"><User size={14} className="text-gray-400" /><span className="font-medium">{order.userName}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400" /><a href={`tel:${order.userPhone}`} className="text-blue-600 font-medium">+91 {order.userPhone}</a></div>
                  <div className="flex items-start gap-2 text-sm text-gray-700"><MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" /><span>{order.deliveryAddress.line1}{order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</span></div>
                  {order.deliveryPartner?.eta && <div className="flex items-center gap-2 text-sm text-gray-700"><Clock size={14} className="text-gray-400" /><span className="font-medium text-amber-600">ETA: {order.deliveryPartner.eta}</span></div>}
                </div>
                <div className="mb-3 space-y-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Items to deliver:</p>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <p className="font-semibold text-gray-900 mb-3">Total: ₹{order.total}</p>
                <div className="flex gap-2">
                  {activeTab === "available" ? (
                    <button onClick={() => handleAcceptOrder(order._id)} className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition"><CheckCircle2 size={16} /> Accept Order</button>
                  ) : (
                    <>
                      {order.deliveryAddress.lat && order.deliveryAddress.lng && <button onClick={() => openNavigation(order.deliveryAddress.lat!, order.deliveryAddress.lng!)} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition"><Navigation size={16} /> Navigate</button>}
                      {order.status !== "delivered" && <select value={order.status} onChange={(e) => handleUpdateStatus(order._id, e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm"><option value="confirmed">Confirmed</option><option value="packed">Packed</option><option value="dispatched">Dispatched</option><option value="out_for_delivery">Out for Delivery</option><option value="delivered">Delivered</option></select>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
