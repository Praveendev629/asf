"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package, ClipboardList, Users, Truck, MapPin, Phone, Mail, ChevronDown, ChevronUp, RefreshCw, Image as ImageIcon, Upload, FileText, Bell, X } from "lucide-react";
import ProductForm from "@/components/ProductForm";

interface Product { _id: string; name: string; slug: string; images: string[]; category: string; unit: string; unitType: string; unitOptions: { label: string; price: number; mrp: number; stock: number }[]; mrp: number; price: number; stock: number; description: string; variants: { name: string; slug: string; price: number; mrp: number; stock: number; image: string; attributes: Record<string, string> }[]; relatedProducts: string[]; specifications: { label: string; value: string; icon: string }[]; productType: string; }
interface Order { _id: string; orderNumber: string; userName: string; userPhone: string; userEmail: string; total: number; status: string; items: { product: string; name: string; image: string; price: number; quantity: number }[]; deliveryAddress: { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number }; deliveryPartner?: { name: string; phone: string; eta: string; email?: string }; createdAt: string; }
interface UserData { _id: string; name: string; email: string; phone?: string; address?: { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number }; createdAt: string; }
interface DeliveryPartnerData { _id: string; name: string; phone: string; email: string; isAvailable: boolean; currentLocation?: { lat: number; lng: number }; createdAt: string; }
interface UpdateData { _id: string; title: string; description: string; imageUrl: string; link: string; isActive: boolean; order: number; createdAt: string; }
const STAGES = ["placed", "confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];
const STAGE_COLORS: Record<string, string> = { placed: "bg-blue-100 text-blue-700", confirmed: "bg-indigo-100 text-indigo-700", packed: "bg-amber-100 text-amber-700", dispatched: "bg-purple-100 text-purple-700", out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-green-100 text-green-700" };

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

export default function AdminPage() {
  const [tab, setTab] = useState<"products" | "orders" | "users" | "partners" | "updates">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [partners, setPartners] = useState<DeliveryPartnerData[]>([]);
  const [updates, setUpdates] = useState<UpdateData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const prevOrderIds = useRef<Set<string>>(new Set());

  const playSoundAndAlert = useCallback((newOrders: Order[]) => {
    if (newOrders.length > 0) {
      playNotificationSound();
      setNewOrderAlert(newOrders[0]);
      setTimeout(() => setNewOrderAlert(null), 10000);
    }
  }, []);

  useEffect(() => {
    loadAll();
    const interval = setInterval(() => loadAll(), 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() { await Promise.all([loadProducts(), loadOrders(), loadUsers(), loadPartners(), loadUpdates()]); }
  async function handleRefresh() { setRefreshing(true); await loadAll(); setRefreshing(false); }
  async function loadProducts() { const res = await fetch("/api/products"); const data = await res.json(); setProducts(data.products || []); }
  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      const newOrders: Order[] = data.orders || [];
      const currentIds = new Set(newOrders.map((o) => o._id));
      if (prevOrderIds.current.size > 0) {
        const freshOrders = newOrders.filter((o) => !prevOrderIds.current.has(o._id) && o.status === "placed");
        if (freshOrders.length > 0) playSoundAndAlert(freshOrders);
      }
      prevOrderIds.current = currentIds;
      setOrders(newOrders);
    }
  }
  async function loadUsers() { const res = await fetch("/api/admin/users"); if (res.ok) { const data = await res.json(); setUsers(data.users || []); } }
  async function loadPartners() { const res = await fetch("/api/admin/delivery-partners"); if (res.ok) { const data = await res.json(); setPartners(data.partners || []); } }
  async function loadUpdates() { const res = await fetch("/api/updates"); if (res.ok) { const data = await res.json(); setUpdates(data.updates || []); } }
  async function handleDelete(id: string) { if (!confirm("Delete this product?")) return; await fetch(`/api/products/${id}`, { method: "DELETE" }); loadProducts(); }
  async function handleStatusChange(orderId: string, status: string) { await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); loadOrders(); }
  async function handlePhoneUpdate(orderId: string, phone: string) { await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userPhone: phone }) }); loadOrders(); }
  async function handleAssignPartner(orderId: string, partnerId: string) {
    const partner = partners.find((p) => p._id === partnerId);
    if (!partner) return;
    await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deliveryPartner: { name: partner.name, phone: partner.phone, email: partner.email, eta: "" }, status: "confirmed" }) });
    loadOrders();
  }
  async function handleTogglePartner(partnerId: string, isAvailable: boolean) { await fetch("/api/admin/delivery-partners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: partnerId, isAvailable }) }); loadPartners(); }
  async function handleDeleteOrder(orderId: string) { if (!confirm("Delete this order? This cannot be undone.")) return; await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" }); loadOrders(); }
  async function handleDeletePartner(partnerId: string) { if (!confirm("Delete this delivery partner? This cannot be undone.")) return; await fetch(`/api/admin/delivery-partners?id=${partnerId}`, { method: "DELETE" }); loadPartners(); }
  async function handleDeleteUser(userId: string) { if (!confirm("Delete this user and all their data? This cannot be undone.")) return; await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" }); loadUsers(); }
  function handleDownloadInvoice(o: Order) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${o.orderNumber}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;background:#f9fafb;color:#111827}.inv{max-width:700px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.hdr{background:linear-gradient(135deg,#059669,#047857);color:#fff;padding:28px}.hdr h1{font-size:22px;font-weight:700}.hdr p{font-size:12px;opacity:.8;margin-top:2px}.badge{display:inline-block;background:rgba(255,255,255,.2);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;margin-top:8px;text-transform:uppercase}.ct{padding:28px}.g{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.ib{background:#f9fafb;border-radius:10px;padding:14px}.ib h3{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:6px}.ib p{font-size:13px;color:#111827}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{background:#f9fafb;padding:8px 10px;font-size:10px;text-transform:uppercase;color:#6b7280;text-align:left;border-bottom:2px solid #e5e7eb}td{padding:8px 10px;font-size:13px;border-bottom:1px solid #e5e7eb}.r{text-align:right}.tot td{font-weight:700;border-top:2px solid #111827;padding-top:10px;font-size:16px}.ft{background:#f9fafb;padding:16px 28px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb}@media print{body{background:#fff}.inv{box-shadow:none;margin:0}}</style></head><body><div class="inv"><div class="hdr"><h1>ASF Shopee</h1><p>Order Invoice</p><div class="badge">${o.status}</div></div><div class="ct"><div class="g"><div class="ib"><h3>Order</h3><p><strong>#${o.orderNumber}</strong></p><p>${new Date(o.createdAt).toLocaleDateString("en-IN")}</p></div><div class="ib"><h3>Customer</h3><p><strong>${o.userName}</strong></p><p>+91 ${o.userPhone}</p></div></div><table><thead><tr><th>#</th><th>Item</th><th class="r">Qty</th><th class="r">Total</th></tr></thead><tbody>${o.items.map((it,i)=>`<tr><td>${i+1}</td><td>${it.name}</td><td class="r">${it.quantity}</td><td class="r">₹${it.price*it.quantity}</td></tr>`).join("")}</tbody></table><table style="width:250px;margin-left:auto"><tr><td>Subtotal</td><td class="r">₹${o.items.reduce((s,i)=>s+i.price*i.quantity,0)}</td></tr><tr><td>Delivery</td><td class="r">₹${o.total-o.items.reduce((s,i)=>s+i.price*i.quantity,0)}</td></tr><tr class="tot"><td>Total</td><td class="r">₹${o.total}</td></tr></table></div><div class="ft">ASF Shopee — Premium Grocery Delivery</div></div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = window.open(url, "_blank");
    if (a) a.onload = () => a.print();
  }

  const tabs = [
    { key: "products" as const, label: "Products", icon: Package },
    { key: "orders" as const, label: "Orders", icon: ClipboardList },
    { key: "users" as const, label: "Users", icon: Users },
    { key: "partners" as const, label: "Partners", icon: Truck },
    { key: "updates" as const, label: "Updates", icon: ImageIcon },
  ];

  return (
    <div className="container-app py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-asf-slateDeep">ASF Admin Dashboard</h1>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 text-sm font-medium text-asf-slate hover:text-asf-copper transition bg-white border border-asf-mist rounded-xl px-4 py-2">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-lg animate-bounce">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><Bell size={20} /></div>
              <div className="flex-1">
                <p className="font-bold text-sm">New Order Received!</p>
                <p className="text-white/90 text-xs mt-0.5">#{newOrderAlert.orderNumber} — {newOrderAlert.userName} — ₹{newOrderAlert.total}</p>
                <p className="text-white/70 text-xs mt-0.5">{newOrderAlert.items.map((i) => i.name).join(", ")}</p>
              </div>
              <button onClick={() => setNewOrderAlert(null)} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition ${tab === t.key ? "bg-asf-slateDeep text-white" : "bg-white border border-asf-mist text-asf-slate hover:border-asf-copper"}`}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {/* Products */}
      {tab === "products" && (
        <div>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary mb-6 flex items-center gap-2 w-fit"><Plus size={18} /> Add Product</button>
          {showForm && <ProductForm product={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); loadProducts(); }} />}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p._id} className="card p-4 flex gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-asf-mist shrink-0">{p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}</div>
                <div className="flex-1"><p className="font-medium text-asf-slateDeep text-sm">{p.name}</p><p className="text-xs text-asf-slate">{p.category}</p><p className="text-sm font-semibold">₹{p.price} <span className="text-xs text-asf-slate font-normal">Stock: {p.stock}</span></p></div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-asf-slate hover:text-asf-copper"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p._id)} className="text-asf-slate hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="card p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-asf-slateDeep">#{o.orderNumber}</p>
                  <p className="text-xs text-asf-slate">{o.userName} · +91 {o.userPhone}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {o.items?.map((item, i) => (
                      <span key={i} className="text-[11px] bg-asf-mist text-asf-slateDeep px-2 py-0.5 rounded-full">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                  {o.deliveryPartner && <p className="text-xs text-green-600 flex items-center gap-1 mt-1"><Truck size={12} /> {o.deliveryPartner.name} · +91 {o.deliveryPartner.phone}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">₹{o.total}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[o.status] || "bg-gray-100 text-gray-700"}`}>{o.status.replace(/_/g, " ")}</span>
                  {expandedOrder === o._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expandedOrder === o._id && (
                <div className="mt-4 pt-4 border-t border-asf-mist space-y-4">
                  <div>
                    <p className="text-sm font-medium text-asf-slateDeep mb-2 flex items-center gap-1"><Package size={14} /> Items Ordered</p>
                    <div className="bg-asf-mist/30 rounded-xl p-3 space-y-1">
                      {o.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-asf-slateDeep">{item.name} <span className="text-asf-slate">× {item.quantity}</span></span>
                          <span className="font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-semibold border-t border-asf-mist pt-1 mt-1">
                        <span>Total</span><span>₹{o.total}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-asf-slateDeep mb-1 flex items-center gap-1"><MapPin size={14} /> Delivery Address</p>
                    <p className="text-sm text-asf-slate">{o.deliveryAddress.line1}{o.deliveryAddress.line2 ? `, ${o.deliveryAddress.line2}` : ""}, {o.deliveryAddress.city}, {o.deliveryAddress.state} - {o.deliveryAddress.pincode}</p>
                    {o.deliveryAddress.lat && o.deliveryAddress.lng && <a href={`https://www.google.com/maps?q=${o.deliveryAddress.lat},${o.deliveryAddress.lng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">View on Google Maps</a>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-asf-slateDeep mb-1 flex items-center gap-1"><Phone size={14} /> Customer Phone</p>
                    <input defaultValue={o.userPhone} onBlur={(e) => handlePhoneUpdate(o._id, e.target.value)} className="border border-asf-mist rounded-xl px-3 py-2 text-sm w-full" placeholder="Phone number" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-asf-slateDeep mb-1 flex items-center gap-1"><Truck size={14} /> Assign Delivery Partner</p>
                    <select value={partners.find((p) => p.name === o.deliveryPartner?.name)?._id || ""} onChange={(e) => { if (e.target.value) handleAssignPartner(o._id, e.target.value); }} className="border border-asf-mist rounded-xl px-3 py-2 text-sm w-full">
                      <option value="">Select partner...</option>
                      {partners.filter((p) => p.isAvailable).map((p) => <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>)}
                    </select>
                  </div>
                  <div className="pt-2 border-t border-asf-mist flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(o._id); }} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"><Trash2 size={12} /> Delete</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(o); }} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"><FileText size={12} /> Invoice</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && <p className="text-asf-slate text-sm">No orders yet.</p>}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-sm text-asf-slateDeep"><Users size={14} className="text-asf-slate" /><span className="font-medium">{u.name}</span></div>
                  <div className="flex items-center gap-2 text-sm text-asf-slate"><Mail size={14} />{u.email}</div>
                  {u.phone && <div className="flex items-center gap-2 text-sm text-asf-slate"><Phone size={14} />+91 {u.phone}</div>}
                  {u.address && <div className="flex items-start gap-2 text-sm text-asf-slate"><MapPin size={14} className="mt-0.5 shrink-0" /><span>{u.address.line1}{u.address.line2 ? `, ${u.address.line2}` : ""}, {u.address.city}, {u.address.state} - {u.address.pincode}</span></div>}
                </div>
                {u.address?.lat && u.address?.lng && <a href={`https://www.google.com/maps?q=${u.address.lat},${u.address.lng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0 flex items-center gap-1"><MapPin size={12} /> Map</a>}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-asf-slate">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                <button onClick={() => handleDeleteUser(u._id)} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-asf-slate text-sm">No registered users yet.</p>}
        </div>
      )}

      {/* Partners */}
      {tab === "partners" && (
        <div className="space-y-3">
          {partners.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-sm text-asf-slateDeep"><Truck size={14} className="text-asf-slate" /><span className="font-medium">{p.name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.isAvailable ? "Available" : "Unavailable"}</span></div>
                  <div className="flex items-center gap-2 text-sm text-asf-slate"><Phone size={14} />+91 {p.phone}</div>
                  <div className="flex items-center gap-2 text-sm text-asf-slate"><Mail size={14} />{p.email}</div>
                </div>
                <button onClick={() => handleTogglePartner(p._id, !p.isAvailable)} className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition ${p.isAvailable ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                  {p.isAvailable ? "Set Unavailable" : "Set Available"}
                </button>
              </div>
              {p.currentLocation && <a href={`https://www.google.com/maps?q=${p.currentLocation.lat},${p.currentLocation.lng}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center gap-1"><MapPin size={12} /> View current location</a>}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-asf-slate">Registered {new Date(p.createdAt).toLocaleDateString()}</p>
                <button onClick={() => handleDeletePartner(p._id)} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
          {partners.length === 0 && <p className="text-asf-slate text-sm">No delivery partners registered yet.</p>}
        </div>
      )}

      {/* Updates */}
      {tab === "updates" && (
        <UpdatesTab updates={updates} loadUpdates={loadUpdates} />
      )}
    </div>
  );
}

function UpdatesTab({ updates, loadUpdates }: { updates: UpdateData[]; loadUpdates: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const formData = new FormData(); formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      // If replacing, delete old image
      if (editingId) {
        const existing = updates.find((u) => u._id === editingId);
        if (existing?.imageUrl) {
          // Old image will be deleted by the PATCH endpoint
        }
      }
      setImageUrl(data.url);
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!title || !imageUrl) return;
    if (editingId) {
      await fetch("/api/updates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title, description, imageUrl }),
      });
    } else {
      await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, imageUrl, order: updates.length }),
      });
    }
    setTitle(""); setDescription(""); setImageUrl(""); setEditingId(null);
    loadUpdates();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/updates?id=${id}`, { method: "DELETE" });
    loadUpdates();
  }

  function handleEdit(update: UpdateData) {
    setEditingId(update._id);
    setTitle(update.title);
    setDescription(update.description);
    setImageUrl(update.imageUrl);
  }

  return (
    <div>
      <div className="card p-6 mb-6 max-w-xl">
        <h3 className="font-semibold text-asf-slateDeep mb-4">{editingId ? "Edit Banner" : "Add Banner"}</h3>
        <div className="grid gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Banner title" className="border border-asf-mist rounded-xl px-4 py-2" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="border border-asf-mist rounded-xl px-4 py-2" />
          <div>
            <label className="text-sm font-medium text-asf-slateDeep mb-1 block">Banner Image</label>
            <input type="file" accept="image/*" onChange={handleUpload} />
            {uploading && <p className="text-xs text-asf-slate">Uploading...</p>}
            {imageUrl && (
              <div className="relative w-full h-32 mt-2 rounded-xl overflow-hidden bg-asf-mist">
                <Image src={imageUrl} alt="" fill className="object-cover" />
                <button onClick={() => { setImageUrl(""); setEditingId(null); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"><Trash2 size={12} /></button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {editingId && <button onClick={() => { setEditingId(null); setTitle(""); setDescription(""); setImageUrl(""); }} className="flex-1 border border-asf-mist rounded-xl font-medium py-2">Cancel</button>}
            <button onClick={handleSave} disabled={!title || !imageUrl} className="btn-primary flex-1">{editingId ? "Update Banner" : "Add Banner"}</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {updates.map((u) => (
          <div key={u._id} className="card p-4 flex gap-4 items-center">
            <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-asf-mist shrink-0">
              <Image src={u.imageUrl} alt={u.title} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-asf-slateDeep">{u.title}</p>
              {u.description && <p className="text-xs text-asf-slate truncate">{u.description}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(u)} className="text-asf-slate hover:text-asf-copper"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(u._id)} className="text-asf-slate hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {updates.length === 0 && <p className="text-asf-slate text-sm">No banners yet. Add one above.</p>}
      </div>
    </div>
  );
}
