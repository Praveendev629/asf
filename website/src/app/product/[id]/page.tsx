"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { api } from "@/lib/api";
import { ShoppingCart, Heart, ShieldCheck, Truck } from "lucide-react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return (
      <>
        <Header />
        <p className="text-center text-white/50 py-20">Product currently unavailable.</p>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-card border border-white/5">
            {product.images?.[activeImage] && (
              <Image src={product.images[activeImage]} alt={product.name} fill className="object-contain" />
            )}
          </div>
          <div className="flex gap-2 mt-3">
            {product.images?.map((img: string, i: number) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border ${
                  i === activeImage ? "border-secondary" : "border-white/10"
                }`}
              >
                <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-white/60 mt-2">{product.description}</p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold text-secondary">₹{product.discountPrice}</span>
            <span className="line-through text-white/40">₹{product.actualPrice}</span>
          </div>

          <p className={`mt-2 text-sm ${product.stock > 0 ? "text-success" : "text-danger"}`}>
            {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
          </p>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 rounded-lg py-3 font-medium">
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button className="flex items-center justify-center gap-2 bg-primary rounded-lg px-4 py-3">
              <Heart size={18} />
            </button>
          </div>
          <button className="w-full mt-3 bg-danger/90 hover:bg-danger rounded-lg py-3 font-semibold">
            Buy Now
          </button>

          <div className="mt-8 space-y-3 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-secondary" /> Free delivery available
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-secondary" /> Secure payment guaranteed
            </div>
          </div>

          {product.specifications && (
            <div className="mt-8">
              <h2 className="font-semibold mb-2">Specifications</h2>
              <ul className="text-sm text-white/60 space-y-1">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-white/40">{k}: </span>
                    {String(v)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
