"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

const CATEGORIES = ["all", "Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages", "Bakery", "Household"];

export default function HomePage() {
  return <Suspense fallback={null}><HomeContent /></Suspense>;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { firebaseUser, profile } = useAuth();
  const q = searchParams.get("q") || "";
  const redirect = searchParams.get("redirect");
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!redirect || !firebaseUser) return;
    if (!profile?.phone || !profile?.address) router.replace(`/onboarding?redirect=${encodeURIComponent(redirect)}`);
    else router.replace(redirect);
  }, [redirect, firebaseUser, profile]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (q) params.set("q", q);
    fetch(`/api/products?${params.toString()}`).then((res) => res.json()).then((data) => setProducts(data.products || [])).finally(() => setLoading(false));
  }, [category, q]);

  return (
    <div>
      <section className="bg-gradient-to-br from-asf-slateDeep to-asf-slateDark text-white py-16">
        <div className="container-app">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="font-display text-3xl sm:text-5xl font-semibold max-w-2xl leading-tight">Fresh groceries, delivered with premium care.</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="text-asf-cream/70 mt-4 max-w-lg">Curated produce, real-time order tracking, and a shopping experience designed around you.</motion.p>
        </div>
      </section>
      <section className="container-app py-8">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ${category === c ? "bg-asf-slateDeep text-white border-asf-slateDeep" : "bg-white text-asf-slate border-asf-mist hover:border-asf-copper"}`}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="card p-3 h-64 animate-pulse bg-asf-mist/50" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-asf-slate">
            <p className="font-display text-xl mb-2">No products found</p>
            <p className="text-sm">Try a different category or add products from the admin dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
