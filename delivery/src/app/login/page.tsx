"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Truck, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function DeliveryLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/delivery/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("delivery_token", data.token);
      localStorage.setItem("delivery_partner", JSON.stringify(data.partner));
      router.push("/");
    } catch (err: any) { setError(err.message); } finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4"><Truck size={32} className="text-white" /></div>
          <h1 className="font-display text-3xl font-semibold text-white">Delivery Partner</h1><p className="text-white/60 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-xl space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3"><Mail size={18} className="text-gray-400 mr-3" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 outline-none text-sm" required /></div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3"><Lock size={18} className="text-gray-400 mr-3" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="flex-1 outline-none text-sm" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50">{submitting ? "Signing in..." : "Sign In"}</button>
          <p className="text-center text-sm text-gray-500">Don&apos;t have an account? <Link href="/register" className="text-gray-900 font-medium hover:underline">Register</Link></p>
        </form>
      </div>
    </div>
  );
}
