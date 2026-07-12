"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

export default function TopBar() {
  const router = useRouter();
  const { profile, firebaseUser, signInWithGoogle, logout } = useAuth();
  const [q, setQ] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const isAdmin = Boolean(profile?.email) && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").includes(profile?.email || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`);
      setShowSearch(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
        {/* Hamburger */}
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-xl bg-gray-100">
          {showMenu ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <Search size={18} className="text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>
        </form>

        {/* Filter icon */}
        <button className="p-2 rounded-xl bg-gray-100">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="max-w-lg mx-auto p-4 space-y-3">
            {firebaseUser ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><User size={20} className="text-gray-500" /></div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{profile?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <a href={process.env.NEXT_PUBLIC_ADMIN_URL || "#"} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-sm">
                    <LayoutDashboard size={18} className="text-gray-500" /> Admin Dashboard
                  </a>
                )}
                <button onClick={() => { logout(); setShowMenu(false); }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-sm w-full text-left text-red-500">
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { signInWithGoogle(); setShowMenu(false); }} className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm">
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
