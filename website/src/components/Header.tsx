"use client";

import Link from "next/link";
import { Search, ShoppingCart, Heart, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-secondary">
          ASF Shopee
        </Link>

        <div className="flex-1 flex items-center bg-background rounded-lg px-3 py-2 border border-white/10">
          <Search size={18} className="text-white/40" />
          <input
            type="text"
            placeholder="Search for products, brands and more"
            className="flex-1 bg-transparent outline-none px-2 text-sm placeholder:text-white/40"
          />
        </div>

        <nav className="flex items-center gap-5">
          <Link href="/login" className="flex flex-col items-center text-xs gap-1 hover:text-secondary">
            <User size={20} />
            Login
          </Link>
          <Link href="/wishlist" className="flex flex-col items-center text-xs gap-1 hover:text-secondary">
            <Heart size={20} />
            Wishlist
          </Link>
          <Link href="/cart" className="flex flex-col items-center text-xs gap-1 hover:text-secondary">
            <ShoppingCart size={20} />
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}
