"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  async function handleGoogleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
      // TODO: check phone number in Firestore; if missing, redirect to /onboarding/phone
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-2xl border border-white/5 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-secondary mb-2">ASF Shopee</h1>
        <p className="text-white/60 mb-6">Sign in to continue</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 rounded-lg py-3 font-medium"
        >
          <Chrome size={18} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
