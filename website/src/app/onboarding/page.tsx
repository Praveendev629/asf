"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, MapPin, Check } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

const STEPS = ["phone", "address", "map"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  return <Suspense fallback={null}><OnboardingContent /></Suspense>;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/checkout";
  const { firebaseUser, profile, getToken, refreshProfile, loading } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.209);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!loading && !firebaseUser) router.replace(`/?redirect=${encodeURIComponent(redirectTo)}`); }, [loading, firebaseUser]);

  useEffect(() => {
    if (profile?.phone) setPhone(profile.phone);
    if (profile?.address) { setLine1(profile.address.line1 || ""); setLine2(profile.address.line2 || ""); setCity(profile.address.city || ""); setState(profile.address.state || ""); setPincode(profile.address.pincode || ""); if (profile.address.lat) setLat(profile.address.lat); if (profile.address.lng) setLng(profile.address.lng); }
    if (navigator.geolocation && !profile?.address?.lat) navigator.geolocation.getCurrentPosition((pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); }, () => {});
  }, [profile]);

  function validPhone(p: string) { return /^[0-9]{10}$/.test(p.replace(/\D/g, "")); }

  async function handleFinish() {
    setSubmitting(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/users/profile", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ phone: phone.replace(/\D/g, ""), address: { line1, line2, city, state, pincode, lat, lng } }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      await refreshProfile(); router.push(redirectTo);
    } catch (err: any) { setError(err.message); } finally { setSubmitting(false); }
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="container-app py-12 max-w-xl">
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= stepIndex ? "bg-asf-copper text-white" : "bg-asf-mist text-asf-slate"}`}>{i < stepIndex ? <Check size={14} /> : i + 1}</div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < stepIndex ? "bg-asf-copper" : "bg-asf-mist"}`} />}
          </div>
        ))}
      </div>
      <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="card p-6 sm:p-8">
        {step === "phone" && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-asf-slateDeep"><Phone size={22} /><h2 className="font-display text-2xl font-semibold">Your delivery number</h2></div>
            <p className="text-sm text-asf-slate mb-6">We use this to coordinate delivery and share updates about your order.</p>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" maxLength={10} className="w-full border border-asf-mist rounded-xl px-4 py-3 mb-6 outline-none focus:border-asf-copper" />
            <button disabled={!validPhone(phone)} onClick={() => setStep("address")} className="btn-primary w-full">Continue</button>
          </div>
        )}
        {step === "address" && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-asf-slateDeep"><MapPin size={22} /><h2 className="font-display text-2xl font-semibold">Delivery address</h2></div>
            <div className="grid gap-3 mb-6">
              <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="House / Flat / Street" className="border border-asf-mist rounded-xl px-4 py-3 outline-none focus:border-asf-copper" />
              <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Landmark (optional)" className="border border-asf-mist rounded-xl px-4 py-3 outline-none focus:border-asf-copper" />
              <div className="grid grid-cols-2 gap-3">
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="border border-asf-mist rounded-xl px-4 py-3 outline-none focus:border-asf-copper" />
                <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="border border-asf-mist rounded-xl px-4 py-3 outline-none focus:border-asf-copper" />
              </div>
              <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" className="border border-asf-mist rounded-xl px-4 py-3 outline-none focus:border-asf-copper" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("phone")} className="flex-1 border border-asf-mist rounded-xl font-medium">Back</button>
              <button disabled={!line1 || !city || !pincode} onClick={() => setStep("map")} className="btn-primary flex-1">Continue</button>
            </div>
          </div>
        )}
        {step === "map" && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-asf-slateDeep"><MapPin size={22} /><h2 className="font-display text-2xl font-semibold">Confirm exact location</h2></div>
            <p className="text-sm text-asf-slate mb-4">Tap on the map to pin your precise delivery spot.</p>
            <LocationMap lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("address")} className="flex-1 border border-asf-mist rounded-xl font-medium">Back</button>
              <button disabled={submitting} onClick={handleFinish} className="btn-primary flex-1">{submitting ? "Saving..." : "Confirm & Continue"}</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
