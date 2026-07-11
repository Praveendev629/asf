"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Truck, ShieldCheck, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  unit: string;
  mrp: number;
  price: number;
  stock: number;
  rating: number;
  ratingCount: number;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { firebaseUser } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.product))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="container-app py-16 text-center text-asf-slate">Loading...</div>;
  if (!product) return <div className="container-app py-16 text-center text-asf-slate">Product not found.</div>;

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const inCart = items.find((i) => i.productId === product._id);

  function handleBuyNow() {
    if (!product) return;
    addItem(
      {
        productId: product._id,
        name: product.name,
        image: product.images[0] || "",
        price: product.price,
        mrp: product.mrp,
        unit: product.unit,
        stock: product.stock,
      },
      qty
    );
    if (!firebaseUser) {
      router.push(`/?redirect=${encodeURIComponent("/checkout")}`);
    } else {
      router.push("/checkout");
    }
  }

  return (
    <div className="container-app py-10 grid md:grid-cols-2 gap-10">
      <div>
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-asf-mist mb-4">
          <Image
            src={product.images[activeImage] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 ${
                  activeImage === i ? "border-asf-copper" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-asf-copper font-semibold mb-2">{product.category}</p>
        <h1 className="font-display text-3xl font-semibold text-asf-slateDeep mb-2">{product.name}</h1>
        <p className="text-asf-slate mb-4">{product.unit}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1 bg-asf-slateDeep text-white text-xs px-2 py-1 rounded-lg">
            <Star size={12} className="fill-white" /> {product.rating.toFixed(1)}
          </span>
          <span className="text-sm text-asf-slate">{product.ratingCount} ratings</span>
        </div>

        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-3xl font-bold text-asf-slateDeep">₹{product.price}</span>
          {product.mrp > product.price && (
            <>
              <span className="text-lg strike text-asf-slate">₹{product.mrp}</span>
              <span className="text-asf-copper font-semibold text-sm">{discount}% OFF</span>
            </>
          )}
        </div>
        {product.mrp > product.price && (
          <p className="text-sm text-green-700 mb-6">You save ₹{product.mrp - product.price}</p>
        )}

        <div className="flex items-center gap-3 mb-4 text-sm text-asf-slate">
          <Truck size={18} /> Delivery in 20-30 minutes
        </div>
        <div className="flex items-center gap-3 mb-6 text-sm text-asf-slate">
          <ShieldCheck size={18} />
          {product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}
        </div>

        {product.stock > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-asf-mist rounded-xl">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3">
                <Plus size={16} />
              </button>
            </div>
            <button onClick={handleBuyNow} className="btn-primary flex-1">
              Buy Now
            </button>
          </div>
        )}

        <div>
          <h2 className="font-display text-lg font-semibold text-asf-slateDeep mb-2">Description</h2>
          <p className="text-asf-slate text-sm leading-relaxed whitespace-pre-line">
            {product.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
}
