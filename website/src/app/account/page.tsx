"use client";

import { useAuth } from "@/components/AuthContext";
import { User, MapPin, Phone, Mail, LogOut, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { profile, firebaseUser, signInWithGoogle, logout } = useAuth();

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-gray-400" />
          </div>
          <h1 className="font-semibold text-lg mb-2">Sign in to your account</h1>
          <p className="text-sm text-gray-500 mb-6">Access your orders, wishlist, and more.</p>
          <button onClick={signInWithGoogle} className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = Boolean(profile?.email) && process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").includes(profile?.email || "");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <User size={24} className="text-emerald-600" />
            </div>
          )}
          <div>
            <h1 className="font-semibold text-gray-900">{profile?.name}</h1>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-3">
        {/* Quick links */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <Link href="/orders" className="flex items-center justify-between p-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Shield size={18} className="text-blue-600" /></div>
              <span className="text-sm font-medium">My Orders</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
          <Link href="/wishlist" className="flex items-center justify-between p-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><Shield size={18} className="text-red-600" /></div>
              <span className="text-sm font-medium">My Wishlist</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-2xl p-4 space-y-4">
          <h2 className="font-semibold text-sm text-gray-900">Delivery Details</h2>
          {profile?.phone && (
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">+91 {profile.phone}</span>
            </div>
          )}
          {profile?.address && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700">
                {profile.address.line1}{profile.address.line2 ? `, ${profile.address.line2}` : ""}, {profile.address.city}, {profile.address.state} - {profile.address.pincode}
              </span>
            </div>
          )}
          {!profile?.phone && !profile?.address && (
            <Link href="/onboarding" className="text-sm text-emerald-600 font-medium">Complete your profile</Link>
          )}
        </div>

        {isAdmin && (
          <a href={process.env.NEXT_PUBLIC_ADMIN_URL || "#"} className="bg-white rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Shield size={18} className="text-amber-600" /></div>
            <span className="text-sm font-medium">Admin Dashboard</span>
          </a>
        )}

        <button onClick={logout} className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 text-red-500">
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
