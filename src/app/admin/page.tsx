"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Package, ClipboardList } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  category: string;
  unit: string;
  mrp: number;
  price: number;
  stock: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  userName: string;
  userPhone: string;
  total: number;
  status: string;
  createdAt: string;
}

const STAGES = ["placed", "confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];

export default function AdminPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading, getToken } = useAuth();
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/");
      return;
    }
    checkAdmin();
  }, [loading, firebaseUser]);

  async function checkAdmin() {
    const token = await getToken();
    const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 403 || res.status === 401) {
      setAuthorized(false);
    } else {
      setAuthorized(true);
      loadProducts();
      loadOrders();
    }
  }

  async function loadProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function loadOrders() {
    const token = await getToken();
    const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const token = await getToken();
    await fetch(`/api/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadProducts();
  }

  async function handleStatusChange(orderId: string, status: string) {
    const token = await getToken();
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  }

  if (authorized === null) return <div className="container-app py-20 text-center text-asf-slate">Checking access...</div>;
  if (authorized === false)
    return (
      <div className="container-app py-20 text-center">
        <p className="font-display text-xl text-asf-slateDeep mb-2">Access restricted</p>
        <p className="text-asf-slate text-sm">
          Your account ({profile?.email}) is not an authorized admin. Add your email to ADMIN_EMAILS in the
          environment variables.
        </p>
      </div>
    );

  return (
    <div className="container-app py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-asf-slateDeep">ASF Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 ${
              tab === "products" ? "bg-asf-slateDeep text-white" : "bg-white border border-asf-mist"
            }`}
          >
            <Package size={16} /> Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 ${
              tab === "orders" ? "bg-asf-slateDeep text-white" : "bg-white border border-asf-mist"
            }`}
          >
            <ClipboardList size={16} /> Orders
          </button>
        </div>
      </div>

      {tab === "products" && (
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn-primary mb-6 flex items-center gap-2 w-fit"
          >
            <Plus size={18} /> Add Product
          </button>

          {showForm && (
            <ProductForm
              product={editing}
              onClose={() => setShowForm(false)}
              onSaved={() => {
                setShowForm(false);
                loadProducts();
              }}
              getToken={getToken}
            />
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {products.map((p) => (
              <div key={p._id} className="card p-4 flex gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-asf-mist shrink-0">
                  {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-asf-slateDeep text-sm">{p.name}</p>
                  <p className="text-xs text-asf-slate">{p.category}</p>
                  <p className="text-sm font-semibold">
                    ₹{p.price} <span className="text-xs text-asf-slate font-normal">Stock: {p.stock}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                    className="text-asf-slate hover:text-asf-copper"
                  >
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-asf-slate hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="card p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-medium text-asf-slateDeep">#{o.orderNumber}</p>
                <p className="text-xs text-asf-slate">
                  {o.userName} · +91 {o.userPhone}
                </p>
              </div>
              <p className="font-semibold">₹{o.total}</p>
              <select
                value={o.status}
                onChange={(e) => handleStatusChange(o._id, e.target.value)}
                className="border border-asf-mist rounded-xl px-3 py-2 text-sm"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {orders.length === 0 && <p className="text-asf-slate text-sm">No orders yet.</p>}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  product,
  onClose,
  onSaved,
  getToken,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
  getToken: () => Promise<string | null>;
}) {
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
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const token = await getToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (res.ok) setImages((prev) => [...prev, data.url]);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    const token = await getToken();
    const payload = {
      name,
      category,
      unit,
      mrp: Number(mrp),
      price: Number(price),
      stock: Number(stock),
      description,
      images,
    };
    const url = product ? `/api/products/${product._id}` : "/api/products";
    const method = product ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="card p-6 mb-6 max-w-xl">
      <h2 className="font-semibold text-asf-slateDeep mb-4">{product ? "Edit Product" : "New Product"}</h2>
      <div className="grid gap-3 mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="border border-asf-mist rounded-xl px-4 py-2" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="border border-asf-mist rounded-xl px-4 py-2" />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit e.g. 1 kg" className="border border-asf-mist rounded-xl px-4 py-2" />
        <div className="grid grid-cols-3 gap-3">
          <input value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="MRP" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
          <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="border border-asf-mist rounded-xl px-4 py-2" />
        <input type="file" accept="image/*" onChange={handleUpload} />
        {uploading && <p className="text-xs text-asf-slate">Uploading...</p>}
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-asf-mist">
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-asf-mist rounded-xl font-medium py-2">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}
