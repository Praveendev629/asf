"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { registerPushNotifications, isPushSubscribed } from "@/lib/pushNotifications";
import { Bell, X } from "lucide-react";

export default function PushNotificationManager() {
  const { firebaseUser, getToken } = useAuth();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;

    isPushSubscribed().then((s) => {
      setSubscribed(s);

      if (!s) {
        // Not subscribed — check permission state
        if (Notification.permission === "granted") {
          // Permission already granted but no subscription — auto-subscribe silently
          registerPushNotifications(getToken).then((ok) => {
            setSubscribed(ok);
            if (!ok) console.warn("[Push] Auto-subscribe failed");
          });
        } else if (Notification.permission === "default") {
          // Haven't asked yet — show custom prompt after 3s
          const timer = setTimeout(() => {
            if (!sessionStorage.getItem("push-prompt-dismissed")) {
              setShowPrompt(true);
            }
          }, 3000);
          return () => clearTimeout(timer);
        }
        // permission === "denied" — do nothing
      }
    });
  }, [firebaseUser, getToken]);

  async function handleSubscribe() {
    setLoading(true);
    const ok = await registerPushNotifications(getToken);
    setSubscribed(ok);
    setShowPrompt(false);
    setLoading(false);
  }

  function handleDismiss() {
    setShowPrompt(false);
    sessionStorage.setItem("push-prompt-dismissed", "1");
  }

  // Don't show banner if already subscribed or prompt hidden
  if (subscribed || !showPrompt || sessionStorage.getItem("push-prompt-dismissed")) {
    return null;
  }

  if (Notification.permission === "denied") return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[60] animate-fadeUp">
      <div className="bg-white rounded-2xl shadow-premium border border-gray-100 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-asf-copper/10 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-asf-copper" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-asf-slateDeep text-sm">Stay updated on your orders</p>
            <p className="text-xs text-asf-slate mt-0.5">
              Get instant notifications when your delivery status changes.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-asf-copper text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-asf-copperDark transition disabled:opacity-50"
              >
                {loading ? "Enabling..." : "Enable Notifications"}
              </button>
              <button
                onClick={handleDismiss}
                className="text-asf-slate text-xs font-medium px-3 py-2 rounded-full hover:bg-gray-100 transition"
              >
                Later
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
