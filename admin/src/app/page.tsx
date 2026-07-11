"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package, ClipboardList, Users, Truck, MapPin, Phone, Mail, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

interface Product { _id: string; name: string; slug: string; images: string[]; category: string; unit: string; mrp: number; price: number; stock: number; }
interface Order { _id: string; orderNumber: string; userName: string; userPhone: string; userEmail: string; total: number; status: string; items: { product: string; name: string; image: string; price: number; quantity: number }[]; deliveryAddress: { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number }; deliveryPartner?: { name: string; phone: string; eta: string; email?: string }; createdAt: string; }
interface UserData { _id: string; name: string; email: string; phone?: string; address?: { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number }; createdAt: string; }
interface DeliveryPartnerData { _id: string; name: string; phone: string; email: string; isAvailable: boolean; currentLocation?: { lat: number; lng: number }; createdAt: string; }
const STAGES = ["placed", "confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];

export default function AdminPage() {
  const [tab, setTab] = useState<"products" | "orders" | "users" | "partners">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [partners, setPartners] = useState<DeliveryPartnerData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() { await Promise.all([loadProducts(), loadOrders(), loadUsers(), loadPartners()]); }
  async function handleRefresh() { setRefreshing(true); await loadAll(); setRefreshing(false); }
  async function loadProducts() { const res = await fetch("/api/products", { cache: "no-store" }); const data = await res.json(); setProducts(data.products || []); }
  async function loadOrders() { const res = await fetch("/api/admin/orders", { cache: "no-store" }); if (res.ok) { const data = await res.json(); setOrders(data.orders || []); } }
  async function loadUsers() { const res = await fetch("/api/admin/users", { cache: "no-store" }); if (res.ok) { const data = await res.json(); setUsers(data.users || []); } }
  async function loadPartners() { const res = await fetch("/api/admin/delivery-partners", { cache: "no-store" }); if (res.ok) { const data = await res.json(); setPartners(data.partners || []); } }
  async function handleDelete(id: string) { if (!confirm("Delete this product?")) return; await fetch(`/api/products/${id}`, { method: "DELETE" }); loadProducts(); }
  async function handleStatusChange(orderId: string, status: string) { await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); loadOrders(); }
  async function handlePhoneUpdate(orderId: string, phone: string) { await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userPhone: phone }) }); loadOrders(); }
  async function handleAssignPartner(orderId: string, partnerId: string) {
    const partner = partners.find((p) => p._id === partnerId);
    if (!partner) return;
    await fetch(`/api/admin/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deliveryPartner: { name: partner.name, phone: partner.phone, eta: "" }, status: "confirmed" }) });
    loadOrders();
  }
  async function handleTogglePartner(partnerId: string, isAvailable: boolean) { await fetch("/api/admin/delivery-partners", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: partnerId, isAvailable }) }); loadPartners(); }
  async function handleDeleteOrder(orderId: string) { if (!confirm("Delete this order? This cannot be undone.")) return; await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" }); loadOrders(); }
  async function handleDeletePartner(partnerId: string) { if (!confirm("Delete this delivery partner? This cannot be undone.")) return; await fetch(`/api/admin/delivery-partners?id=${partnerId}`, { method: "DELETE" }); loadPartners(); }

  const tabs = [
    { key: "products" as const, label: "Products", icon: Package },
    { key: "orders" as const, label: "Orders", icon: ClipboardList },
    { key: "users" as const, label: "Users", icon: Users },
    { key: "partners" as const, label: "Partners", icon: Truck },
  ];

  return (
    <div className="container-app py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-asf-slateDeep">ASF Admin Dashboard</h1>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 text-sm font-medium text-asf-slate hover:text-asf-copper transition bg-white border border-asf-mist rounded-xl px-4 py-2">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
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
                  <select value={o.status} onChange={(e) => { e.stopPropagation(); handleStatusChange(o._id, e.target.value); }} onClick={(e) => e.stopPropagation()} className="border border-asf-mist rounded-xl px-3 py-2 text-sm">
                    {STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
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
                  <div className="pt-2 border-t border-asf-mist">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(o._id); }} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"><Trash2 size={12} /> Delete Order</button>
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
              <p className="text-xs text-asf-slate mt-2">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
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
    </div>
  );
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "Fruits & Vegetables");
  const [unit, setUnit] = useState(product?.unit || "1 kg");
  const [mrp, setMrp] = useState(product?.mrp?.toString() || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); const formData = new FormData(); formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json(); if (res.ok) setImages((prev) => [...prev, data.url]); setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { name, category, unit, mrp: Number(mrp), price: Number(price), stock: Number(stock), description, images };
    const url = product ? `/api/products/${product._id}` : "/api/products";
    const method = product ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false); onSaved();
  }

  return (
    <div className="card p-6 mb-6 max-w-xl">
      <h2 className="font-semibold text-asf-slateDeep mb-4">{product ? "Edit Product" : "New Product"}</h2>
      <div className="grid gap-3 mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="border border-asf-mist rounded-xl px-4 py-2" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="border border-asf-mist rounded-xl px-4 py-2" />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" className="border border-asf-mist rounded-xl px-4 py-2" />
        <div className="grid grid-cols-3 gap-3">
          <input value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="MRP" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
          <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="border border-asf-mist rounded-xl px-4 py-2" />
        <input type="file" accept="image/*" onChange={handleUpload} />
        {uploading && <p className="text-xs text-asf-slate">Uploading...</p>}
        <div className="flex gap-2 flex-wrap">{images.map((img, i) => <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-asf-mist"><Image src={img} alt="" fill className="object-cover" /></div>)}</div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-asf-mist rounded-xl font-medium py-2">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Save Product"}</button>
      </div>
    </div>
  );
}
