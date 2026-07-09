"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  images: string[];
  actualPrice: number;
  discountPrice: number;
  rating?: number;
};

export default function ProductCard({ product }: { product: Product }) {
  const discountPct = Math.round(
    ((product.actualPrice - product.discountPrice) / product.actualPrice) * 100
  );

  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-card rounded-xl p-3 border border-white/5 hover:border-secondary/60 transition-colors group relative"
    >
      <button
        aria-label="Add to wishlist"
        onClick={(e) => e.preventDefault()}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/70 text-white/70 hover:text-danger"
      >
        <Heart size={16} />
      </button>

      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-background">
        {product.images?.[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        )}
      </div>

      <h3 className="mt-3 text-sm font-medium line-clamp-2">{product.name}</h3>

      <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
        <Star size={12} className="fill-warning text-warning" />
        {product.rating ?? "4.5"}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-secondary font-semibold">₹{product.discountPrice}</span>
        <span className="text-xs line-through text-white/40">₹{product.actualPrice}</span>
        <span className="text-xs text-success">{discountPct}% off</span>
      </div>
    </Link>
  );
}
