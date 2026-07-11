"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebaseClient";

export interface AppUser {
  _id?: string;
  firebaseUid: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  address?: { line1: string; line2?: string; city: string; state: string; pincode: string; lat?: number; lng?: number };
  onboardingComplete?: boolean;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(user: FirebaseUser) {
    const token = await user.getIdToken();
    const res = await fetch("/api/users/profile", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setProfile(data.user);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) await fetchProfile(user);
      else setProfile(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signInWithGoogle() { await signInWithPopup(auth, googleProvider); }
  async function logout() { await signOut(auth); setProfile(null); }
  async function refreshProfile() { if (firebaseUser) await fetchProfile(firebaseUser); }
  async function getToken() { return auth.currentUser ? auth.currentUser.getIdToken() : null; }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, signInWithGoogle, logout, refreshProfile, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
