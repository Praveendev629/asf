"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import ProductCard, { Product } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Laptop, Smartphone, Shirt, Home as HomeIcon, Watch, Headphones } from "lucide-react";

const categories = [
  { name: "Electronics", icon: Laptop },
  { name: "Mobiles", icon: Smartphone },
  { name: "Fashion", icon: Shirt },
  { name: "Home", icon: HomeIcon },
  { name: "Watches", icon: Watch },
  { name: "Audio", icon: Headphones },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Header />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 py-10"
      >
        <div className="rounded-2xl bg-gradient-to-r from-card to-background border border-white/5 p-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">
            Shop Premium. <span className="text-secondary">Delivered Fast.</span>
          </h1>
          <p className="text-white/60 mt-3">Curated products, live tracking, and secure checkout.</p>
        </div>
      </motion.section>

      <section className="max-w-7xl mx-auto px-4 pb-6">
        <h2 className="text-lg font-semibold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map(({ name, icon: Icon }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 bg-card rounded-xl py-5 border border-white/5 hover:border-secondary/60 cursor-pointer"
            >
              <Icon size={26} className="text-secondary" />
              <span className="text-xs">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-lg font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.length === 0 && (
            <p className="text-white/40 col-span-full">No products yet — add some from the Shop Owner app.</p>
          )}
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
