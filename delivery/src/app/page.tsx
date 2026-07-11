"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, LogOut, MapPin, Phone, Navigation, CheckCircle2, Package, Clock, User } from "lucide-react";

interface DeliveryPartnerInfo { _id: string; name: string; phone: string; email: string; }
interface Order { _id: string; orderNumber: string; userName: string; userPhone: string; total: number; status: string; deliveryAddress: { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number }; deliveryPartner?: { name: string; phone: string; eta: string }; createdAt: string; }
const STATUS_LABELS: Record<string, string> = { placed: "New Order", confirmed: "Confirmed", packed: "Packed", dispatched: "Dispatched", out_for_delivery: "Out for Delivery", delivered: "Delivered" };

export default function DeliveryDashboard() {
  const router = useRouter();
  const [partner, setPartner] = useState<DeliveryPartnerInfo | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"available" | "my">("available");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("delivery_token");
    const stored = localStorage.getItem("delivery_partner");
    if (!token || !stored) { router.push("/login"); return; }
    setPartner(JSON.parse(stored)); loadOrders(token);
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        fetch("/api/delivery/location", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }) });
      }, () => {}, { enableHighAccuracy: true });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  async function loadOrders(token: string) {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        fetch("/api/delivery/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/delivery/orders?filter=my", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (availRes.ok) { const data = await availRes.json(); setAvailableOrders(data.orders || []); }
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

  function handleLogout() { localStorage.removeItem("delivery_token"); localStorage.removeItem("delivery_partner"); router.push("/login"); }
  function openNavigation(destLat: number, destLng: number) {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => { window.open(`https://www.google.com/maps/dir/?api=1&origin=${pos.coords.latitude},${pos.coords.longitude}&destination=${destLat},${destLng}&travelmode=driving`, "_blank"); });
  }

  const displayOrders = activeTab === "available" ? availableOrders : myOrders;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-4 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3"><Truck size={24} /><div><h1 className="font-semibold text-lg">ASF Delivery</h1>{partner && <p className="text-white/60 text-xs">{partner.name}</p>}</div></div>
          <button onClick={handleLogout} className="text-white/60 hover:text-white"><LogOut size={20} /></button>
        </div>
      </header>
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
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{STATUS_LABELS[order.status] || order.status}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700"><User size={14} className="text-gray-400" /><span className="font-medium">{order.userName}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400" /><a href={`tel:${order.userPhone}`} className="text-blue-600 font-medium">+91 {order.userPhone}</a></div>
                  <div className="flex items-start gap-2 text-sm text-gray-700"><MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" /><span>{order.deliveryAddress.line1}{order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</span></div>
                  {order.deliveryPartner?.eta && <div className="flex items-center gap-2 text-sm text-gray-700"><Clock size={14} className="text-gray-400" /><span className="font-medium text-amber-600">ETA: {order.deliveryPartner.eta}</span></div>}
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
