"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp } from "lucide-react";

interface ProductData {
  _id: string; name: string; slug: string; images: string[]; category: string; unit: string;
  unitType: string; unitOptions: { label: string; price: number; mrp: number; stock: number }[];
  mrp: number; price: number; stock: number; description: string;
  variants: { name: string; slug: string; price: number; mrp: number; stock: number; image: string; attributes: Record<string, string> }[];
  relatedProducts: string[];
  specifications: { label: string; value: string; icon: string }[];
  productType: string;
}

const UNIT_TYPES = [
  { value: "none", label: "None (single unit)" },
  { value: "weight", label: "Weight (kg, g)" },
  { value: "volume", label: "Volume (L, ml)" },
  { value: "length", label: "Length (m, cm, mm)" },
  { value: "size", label: "Size (S, M, L, XL, 38, 39...)" },
];

const PRODUCT_TYPES = [
  "", "Smartphone", "Laptop", "Tablet", "Headphones", "Earbuds", "Smartwatch",
  "TV", "Camera", "Shoes", "Clothing", "Furniture", "Appliance", "Other",
];

const SPEC_FIELDS: Record<string, string[]> = {
  Smartphone: ["Display", "Processor", "RAM", "Storage", "Battery", "Camera", "OS", "Weight", "SIM", "Network"],
  Laptop: ["Display", "Processor", "RAM", "Storage", "Graphics", "Battery", "OS", "Weight", "Ports"],
  Tablet: ["Display", "Processor", "RAM", "Storage", "Battery", "OS", "Weight"],
  Headphones: ["Type", "Driver", "Frequency", "Battery", "Noise Cancelling", "Weight", "Connectivity"],
  Earbuds: ["Driver", "Frequency", "Battery", "Noise Cancelling", "Water Resistance", "Weight", "Connectivity"],
  Smartwatch: ["Display", "Processor", "RAM", "Storage", "Battery", "OS", "Water Resistance", "Sensors"],
  TV: ["Display", "Resolution", "Refresh Rate", "HDR", "Smart OS", "Speakers", "Ports"],
  Camera: ["Sensor", "Resolution", "ISO", "Shutter Speed", "Video", "Lens Mount", "Weight"],
  Shoes: ["Type", "Material", "Sole", "Closure", "Toe Style", "Heel Height"],
  Clothing: ["Fabric", "Fit", "Pattern", "Neck", "Sleeve", "Length"],
  Furniture: ["Material", "Dimensions", "Weight Capacity", "Assembly", "Style"],
  Appliance: ["Power", "Capacity", "Dimensions", "Weight", "Energy Rating", "Warranty"],
  Other: [],
};

export default function ProductForm({ product, onClose, onSaved }: {
  product: ProductData | null; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "Fruits & Vegetables");
  const [unit, setUnit] = useState(product?.unit || "1 unit");
  const [unitType, setUnitType] = useState(product?.unitType || "none");
  const [unitOptions, setUnitOptions] = useState<{ label: string; price: number; mrp: number; stock: number }[]>(product?.unitOptions || []);
  const [mrp, setMrp] = useState(product?.mrp?.toString() || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "");
  const [description, setDescription] = useState(product?.description || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [variants, setVariants] = useState<ProductData["variants"]>(product?.variants || []);
  const [relatedProducts, setRelatedProducts] = useState(product?.relatedProducts || []);
  const [specifications, setSpecifications] = useState<ProductData["specifications"]>(product?.specifications || []);
  const [productType, setProductType] = useState(product?.productType || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [showUnits, setShowUnits] = useState(false);

  // Variant form state
  const [vName, setVName] = useState("");
  const [vBrand, setVBrand] = useState("");
  const [vColor, setVColor] = useState("");
  const [vSize, setVSize] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vMrp, setVMrp] = useState("");
  const [vStock, setVStock] = useState("");
  const [vImage, setVImage] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); const formData = new FormData(); formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json(); if (res.ok) setImages((prev) => [...prev, data.url]); setUploading(false);
  }

  async function handleVariantUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); const formData = new FormData(); formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json(); if (res.ok) setVImage(data.url); setUploading(false);
  }

  function addVariant() {
    if (!vName || !vPrice) return;
    const attrs: Record<string, string> = {};
    if (vBrand) attrs.brand = vBrand;
    if (vColor) attrs.color = vColor;
    if (vSize) attrs.size = vSize;
    setVariants([...variants, {
      name: vName, slug: vName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: Number(vPrice), mrp: Number(vMrp || vPrice), stock: Number(vStock || 0),
      image: vImage, attributes: attrs,
    }]);
    setVName(""); setVBrand(""); setVColor(""); setVSize("");
    setVPrice(""); setVMrp(""); setVStock(""); setVImage("");
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  function addUnitOption() {
    setUnitOptions([...unitOptions, { label: "", price: 0, mrp: 0, stock: 0 }]);
  }

  function updateUnitOption(index: number, field: string, value: string | number) {
    const updated = [...unitOptions];
    (updated[index] as any)[field] = value;
    setUnitOptions(updated);
  }

  function removeUnitOption(index: number) {
    setUnitOptions(unitOptions.filter((_, i) => i !== index));
  }

  function addSpec() {
    setSpecifications([...specifications, { label: "", value: "", icon: "" }]);
  }

  function updateSpec(index: number, field: string, value: string) {
    const updated = [...specifications];
    (updated[index] as any)[field] = value;
    setSpecifications(updated);
  }

  function removeSpec(index: number) {
    setSpecifications(specifications.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      name, category, unit, unitType, unitOptions, mrp: Number(mrp), price: Number(price),
      stock: Number(stock), description, images, variants, relatedProducts, specifications, productType,
    };
    const url = product ? `/api/products/${product._id}` : "/api/products";
    const method = product ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false); onSaved();
  }

  const specFields = SPEC_FIELDS[productType] || [];

  return (
    <div className="card p-6 mb-6 max-w-2xl">
      <h2 className="font-semibold text-asf-slateDeep mb-4">{product ? "Edit Product" : "New Product"}</h2>
      <div className="grid gap-3 mb-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="border border-asf-mist rounded-xl px-4 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="border border-asf-mist rounded-xl px-4 py-2" />
          <select value={productType} onChange={(e) => setProductType(e.target.value)} className="border border-asf-mist rounded-xl px-4 py-2">
            <option value="">No product type</option>
            {PRODUCT_TYPES.filter(Boolean).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Base Price & Stock */}
        <div className="grid grid-cols-3 gap-3">
          <input value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="MRP" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
          <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" type="number" className="border border-asf-mist rounded-xl px-4 py-2" />
        </div>

        {/* Unit */}
        <div className="grid grid-cols-2 gap-3">
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit label (e.g. 1 kg)" className="border border-asf-mist rounded-xl px-4 py-2" />
          <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="border border-asf-mist rounded-xl px-4 py-2">
            {UNIT_TYPES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="border border-asf-mist rounded-xl px-4 py-2" />

        {/* Images */}
        <div>
          <label className="text-sm font-medium text-asf-slateDeep mb-1 block">Product Images (swipeable)</label>
          <input type="file" accept="image/*" onChange={handleUpload} />
          {uploading && <p className="text-xs text-asf-slate">Uploading...</p>}
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-asf-mist group">
                <Image src={img} alt="" fill className="object-cover" />
                <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5 opacity-0 group-hover:opacity-100 transition"><Trash2 size={10} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Options */}
        {unitType !== "none" && (
          <div>
            <button type="button" onClick={() => setShowUnits(!showUnits)} className="flex items-center gap-2 text-sm font-medium text-asf-slateDeep">
              {showUnits ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Unit / Size Options ({unitOptions.length})
            </button>
            {showUnits && (
              <div className="mt-2 space-y-2">
                {unitOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={opt.label} onChange={(e) => updateUnitOption(i, "label", e.target.value)} placeholder="Label (e.g. 500g)" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm flex-1" />
                    <input value={opt.mrp || ""} onChange={(e) => updateUnitOption(i, "mrp", Number(e.target.value))} placeholder="MRP" type="number" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm w-20" />
                    <input value={opt.price || ""} onChange={(e) => updateUnitOption(i, "price", Number(e.target.value))} placeholder="Price" type="number" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm w-20" />
                    <input value={opt.stock || ""} onChange={(e) => updateUnitOption(i, "stock", Number(e.target.value))} placeholder="Stock" type="number" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm w-16" />
                    <button onClick={() => removeUnitOption(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={addUnitOption} className="text-xs text-asf-copper font-medium flex items-center gap-1"><Plus size={12} /> Add option</button>
              </div>
            )}
          </div>
        )}

        {/* Variants */}
        <div>
          <button type="button" onClick={() => setShowVariants(!showVariants)} className="flex items-center gap-2 text-sm font-medium text-asf-slateDeep">
            {showVariants ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Variants / Related Products ({variants.length})
          </button>
          {showVariants && (
            <div className="mt-2 space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="bg-asf-mist/30 rounded-xl p-3 flex gap-3 items-center">
                  {v.image && <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0"><Image src={v.image} alt="" fill className="object-cover" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.name}</p>
                    <p className="text-xs text-asf-slate">₹{v.price} | MRP ₹{v.mrp} | Stock: {v.stock}</p>
                    {Object.keys(v.attributes).length > 0 && (
                      <p className="text-xs text-asf-copper">{Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(", ")}</p>
                    )}
                  </div>
                  <button onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
              <div className="bg-white border border-asf-mist rounded-xl p-3 space-y-2">
                <p className="text-xs font-medium text-asf-slateDeep">Add New Variant</p>
                <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Variant name (e.g. Red, Galaxy Buds Pro)" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm w-full" />
                <div className="grid grid-cols-3 gap-2">
                  <input value={vBrand} onChange={(e) => setVBrand(e.target.value)} placeholder="Brand / Make" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm" />
                  <input value={vColor} onChange={(e) => setVColor(e.target.value)} placeholder="Color" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm" />
                  <input value={vSize} onChange={(e) => setVSize(e.target.value)} placeholder="Size (e.g. XL, 42)" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={vPrice} onChange={(e) => setVPrice(e.target.value)} placeholder="Price" type="number" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm" />
                  <input value={vMrp} onChange={(e) => setVMrp(e.target.value)} placeholder="MRP" type="number" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm" />
                  <input value={vStock} onChange={(e) => setVStock(e.target.value)} placeholder="Stock" type="number" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm" />
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-xs text-asf-slate flex items-center gap-1 cursor-pointer"><Upload size={12} /> Image</label>
                  <input type="file" accept="image/*" onChange={handleVariantUpload} className="text-xs" />
                  {vImage && <span className="text-xs text-green-600">Uploaded</span>}
                </div>
                <button type="button" onClick={addVariant} disabled={!vName || !vPrice} className="bg-asf-slateDeep text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-40"><Plus size={12} className="inline" /> Add Variant</button>
              </div>
            </div>
          )}
        </div>

        {/* Specifications */}
        {productType && specFields.length > 0 && (
          <div>
            <button type="button" onClick={() => setShowSpecs(!showSpecs)} className="flex items-center gap-2 text-sm font-medium text-asf-slateDeep">
              {showSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Specifications ({specifications.length})
            </button>
            {showSpecs && (
              <div className="mt-2 space-y-2">
                {specifications.map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={spec.label} onChange={(e) => updateSpec(i, "label", e.target.value)} className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm flex-1">
                      <option value="">Select...</option>
                      {specFields.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <input value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Value" className="border border-asf-mist rounded-lg px-3 py-1.5 text-sm flex-1" />
                    <button onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={addSpec} className="text-xs text-asf-copper font-medium flex items-center gap-1"><Plus size={12} /> Add spec</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-asf-mist rounded-xl font-medium py-2">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? "Saving..." : "Save Product"}</button>
      </div>
    </div>
  );
}
