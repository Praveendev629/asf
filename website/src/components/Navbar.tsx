"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, User, LogOut, LayoutDashboard, Search } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { profile, firebaseUser, signInWithGoogle, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  const isAdmin = Boolean(profile?.email) && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").includes(profile?.email || "");

  return (
    <header className="sticky top-0 z-50 bg-asf-cream/90 backdrop-blur border-b border-asf-mist">
      <div className="container-app flex items-center gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-9 h-9"><Image src="/logo.png" alt="ASF" fill className="object-contain" /></div>
          <span className="font-display text-xl font-semibold text-asf-slateDeep">ASF Shopee</span>
        </Link>
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
          <div className="flex w-full items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-soft border border-asf-mist">
            <Search size={18} className="text-asf-slate" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for fruits, vegetables, dairy..." className="flex-1 outline-none bg-transparent text-sm" />
          </div>
        </form>
        <div className="flex items-center gap-3 ml-auto">
          {isAdmin && (
            <Link href={process.env.NEXT_PUBLIC_ADMIN_URL || "/admin"} className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-asf-slateDeep hover:text-asf-copper transition">
              <LayoutDashboard size={18} /> Admin
            </Link>
          )}
          <Link href="/cart" className="relative">
            <ShoppingCart size={22} className="text-asf-slateDeep" />
            {count > 0 && <span className="absolute -top-2 -right-2 bg-asf-copper text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>}
          </Link>
          {firebaseUser ? (
            <div className="flex items-center gap-2">
              {profile?.photoURL ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-asf-mist"><Image src={profile.photoURL} alt={profile.name} fill className="object-cover" /></div>
              ) : <User size={20} />}
              <button onClick={() => logout()} title="Sign out" className="text-asf-slate hover:text-asf-copper"><LogOut size={18} /></button>
            </div>
          ) : (
            <button onClick={() => signInWithGoogle()} className="btn-primary text-sm py-2 px-4">Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}
