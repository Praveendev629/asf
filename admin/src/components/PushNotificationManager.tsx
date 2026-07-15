"use client";
import { useEffect, useState } from "react";
import { registerPushNotifications, isPushSubscribed } from "@/lib/pushNotifications";
import { Bell, X } from "lucide-react";

export default function PushNotificationManager() {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isPushSubscribed().then((s) => {
      setSubscribed(s);
      if (!s && Notification.permission === "granted") {
        registerPushNotifications();
      } else if (!s && Notification.permission === "default") {
        const t = setTimeout(() => {
          if (!sessionStorage.getItem("push-prompt-dismissed")) setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(t);
      }
    });
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    const ok = await registerPushNotifications();
    setSubscribed(ok);
    setShowPrompt(false);
    setLoading(false);
  }

  if (subscribed || !showPrompt || sessionStorage.getItem("push-prompt-dismissed") || Notification.permission === "denied") return null;

  return (
    <div className="fixed top-4 right-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0"><Bell size={20} className="text-amber-600" /></div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Stay notified</p>
            <p className="text-xs text-gray-500 mt-0.5">New orders, users, and partner alerts.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleSubscribe} disabled={loading} className="bg-amber-600 text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-amber-700 transition disabled:opacity-50">{loading ? "Enabling..." : "Enable"}</button>
              <button onClick={() => { setShowPrompt(false); sessionStorage.setItem("push-prompt-dismissed", "1"); }} className="text-gray-500 text-xs font-medium px-3 py-2 rounded-full hover:bg-gray-100 transition">Later</button>
            </div>
          </div>
          <button onClick={() => { setShowPrompt(false); sessionStorage.setItem("push-prompt-dismissed", "1"); }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      </div>
    </div>
  );
}
