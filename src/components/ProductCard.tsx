"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/components/CartContext";

export interface ProductCardData {
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

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { addItem } = useCart();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const outOfStock = product.stock <= 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-3 flex flex-col group relative overflow-hidden"
    >
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-asf-copper text-white text-[11px] font-bold px-2 py-1 rounded-lg">
          {discount}% OFF
        </span>
      )}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-asf-mist mb-3">
          <Image
            src={product.images[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-asf-slateDeep font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>
        <p className="text-xs text-asf-slate mb-1">{product.unit}</p>
        <h3 className="font-medium text-sm text-asf-slateDeep line-clamp-2 mb-1">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-asf-slate mb-2">
          <Star size={12} className="fill-asf-copper text-asf-copper" />
          {product.rating.toFixed(1)}
        </div>
      </Link>
      <div className="flex items-center justify-between mt-auto">
        <div>
          <p className="font-semibold text-asf-slateDeep">₹{product.price}</p>
          {product.mrp > product.price && (
            <p className="text-xs strike">₹{product.mrp}</p>
          )}
        </div>
        <button
          disabled={outOfStock}
          onClick={() =>
            addItem({
              productId: product._id,
              name: product.name,
              image: product.images[0] || "",
              price: product.price,
              mrp: product.mrp,
              unit: product.unit,
              stock: product.stock,
            })
          }
          className="bg-asf-slateDeep disabled:opacity-40 text-white rounded-lg w-9 h-9 flex items-center justify-center hover:bg-asf-copper transition"
        >
          <Plus size={18} />
        </button>
      </div>
    </motion.div>
  );
}
