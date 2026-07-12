"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { Heart } from "lucide-react";

export interface ProductCardData {
  _id: string; name: string; slug: string; images: string[]; unit: string; mrp: number; price: number; stock: number; rating: number;
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const outOfStock = product.stock <= 0;
  const wished = isWishlisted(product._id);

  return (
    <div className="bg-white rounded-2xl overflow-hidden relative">
      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); toggle(product._id); }}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
      >
        <Heart size={14} className={wished ? "fill-red-500 text-red-500" : "text-gray-400"} />
      </button>

      {/* Discount badge */}
      {discount > 0 && (
        <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
          {discount}% OFF
        </span>
      )}

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={product.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-gray-700 font-semibold text-xs">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-[10px] text-gray-400 mb-2">{product.unit}</p>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
            {product.mrp > product.price && (
              <p className="text-[10px] text-gray-400 line-through">₹{product.mrp}</p>
            )}
          </div>
          <button
            disabled={outOfStock}
            onClick={() => addItem({
              productId: product._id, name: product.name, image: product.images[0] || "",
              price: product.price, mrp: product.mrp, unit: product.unit, stock: product.stock,
            })}
            className="w-8 h-8 bg-emerald-600 disabled:opacity-40 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 transition"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
