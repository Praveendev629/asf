"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import TopBar from "@/components/TopBar";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

const CATEGORIES = ["all", "Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages", "Bakery", "Household"];

interface UpdateBanner {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

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
  const [banners, setBanners] = useState<UpdateBanner[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);

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

  useEffect(() => {
    fetch("/api/updates").then((res) => res.json()).then((data) => setBanners(data.updates || []));
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      {/* Hero Banner Carousel */}
      {banners.length > 0 && (
        <div className="px-4 mb-6">
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            {banners.map((banner, i) => (
              <div key={banner._id} className={`absolute inset-0 transition-opacity duration-500 ${i === activeBanner ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="font-display text-lg font-semibold">{banner.title}</h2>
                  {banner.description && <p className="text-xs text-white/80 mt-1">{banner.description}</p>}
                </div>
              </div>
            ))}
            {/* Nav arrows */}
            {banners.length > 1 && (
              <>
                <button onClick={() => setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5"><ChevronLeft size={16} /></button>
                <button onClick={() => setActiveBanner((prev) => (prev + 1) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5"><ChevronRight size={16} /></button>
              </>
            )}
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setActiveBanner(i)} className={`w-2 h-2 rounded-full transition ${i === activeBanner ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Default banner if no updates */}
      {banners.length === 0 && (
        <div className="px-4 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs font-medium text-emerald-100">Welcome to ASF Shopee</p>
              <h2 className="font-display text-xl font-semibold mt-1">Fresh groceries, delivered fast.</h2>
              <p className="text-xs text-emerald-100 mt-2">Curated products with premium care.</p>
            </div>
            <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
              <Image src="/logo.png" alt="" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition ${
                category === c
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            {q ? `Results for "${q}"` : category === "all" ? "All Products" : category}
          </h2>
          {products.length > 0 && <span className="text-xs text-gray-500">{products.length} items</span>}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 h-56 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No products found</p>
            <p className="text-xs mt-1">Try a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
