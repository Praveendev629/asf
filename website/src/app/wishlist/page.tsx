"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";

interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  unit: string;
  mrp: number;
  price: number;
  stock: number;
  rating: number;
}

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      const allProducts = data.products || [];
      setProducts(allProducts.filter((p: Product) => items.includes(p._id)));
      setLoading(false);
    }
    loadProducts();
  }, [items]);

  if (loading) {
    return <div className="container-app py-20 text-center text-asf-slate animate-pulse">Loading wishlist...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <Heart className="mx-auto mb-4 text-asf-slate" size={48} />
        <p className="font-display text-2xl text-asf-slateDeep mb-2">Your wishlist is empty</p>
        <p className="text-asf-slate text-sm mb-4">Tap the heart icon on any product to save it here.</p>
        <Link href="/" className="text-asf-copper font-medium">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <h1 className="font-display text-2xl font-semibold text-asf-slateDeep mb-8">My Wishlist ({products.length})</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => {
          const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

          return (
            <div key={product._id} className="card p-3 flex flex-col relative overflow-hidden">
              {/* Remove from wishlist */}
              <button
                onClick={() => toggle(product._id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition"
              >
                <Heart size={16} className="fill-red-500 text-red-500" />
              </button>

              {discount > 0 && (
                <span className="absolute top-3 left-3 z-10 bg-asf-copper text-white text-[11px] font-bold px-2 py-1 rounded-lg">{discount}% OFF</span>
              )}

              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-asf-mist mb-3">
                  <Image
                    src={product.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-asf-slate mb-1">{product.unit}</p>
                <h3 className="font-medium text-sm text-asf-slateDeep line-clamp-2 mb-1">{product.name}</h3>
                <div className="flex items-center gap-1 text-xs text-asf-slate mb-2">
                  <Star size={12} className="fill-asf-copper text-asf-copper" />{product.rating.toFixed(1)}
                </div>
              </Link>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  <p className="font-semibold text-asf-slateDeep">₹{product.price}</p>
                  {product.mrp > product.price && <p className="text-xs strike">₹{product.mrp}</p>}
                </div>
                <button
                  disabled={product.stock <= 0}
                  onClick={() => addItem({
                    productId: product._id, name: product.name, image: product.images[0] || "",
                    price: product.price, mrp: product.mrp, unit: product.unit, stock: product.stock,
                  })}
                  className="bg-asf-slateDeep disabled:opacity-40 text-white rounded-lg w-9 h-9 flex items-center justify-center hover:bg-asf-copper transition"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
