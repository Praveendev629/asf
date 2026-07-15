import webPush from "web-push";
import DeliveryPartner from "./models/DeliveryPartner";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@asfshopee.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

async function sendWebPush(
  subscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[],
  title: string,
  body: string,
  url?: string
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url: url || "/" });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await DeliveryPartner.updateOne(
            { "pushSubscriptions.endpoint": sub.endpoint },
            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
          );
        }
      }
    })
  );
}

export async function sendDeliveryNotification(partnerId: string, title: string, body: string, data?: Record<string, string>) {
  try {
    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner) return;

    // Web push to PWA
    if (partner.pushSubscriptions?.length > 0) {
      await sendWebPush(partner.pushSubscriptions, title, body, "/");
    }

    // Expo push to mobile
    if (partner.fcmTokens?.length > 0) {
      const messages = partner.fcmTokens.map((token: string) => ({
        to: token, sound: "default", title, body, data: data || {}, channelId: "orders",
      }));
      for (let i = 0; i < messages.length; i += 100) {
        await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messages.slice(i, i + 100)),
        });
      }
    }
  } catch {}
}

export async function notifyAllDeliveryPartners(orderId: string, orderNumber: string, total: number) {
  try {
    const partners = await DeliveryPartner.find({ isAvailable: true });

    for (const partner of partners) {
      const title = "New Order Available!";
      const body = `Order #${orderNumber} — ₹${total}. Tap to accept.`;

      // Web push to PWA
      if (partner.pushSubscriptions?.length > 0) {
        await sendWebPush(partner.pushSubscriptions, title, body, "/");
      }

      // Expo push to mobile
      if (partner.fcmTokens?.length > 0) {
        const messages = partner.fcmTokens.map((token: string) => ({
          to: token, sound: "default", title, body,
          data: { orderId, type: "new_order" }, channelId: "orders",
        }));
        for (let i = 0; i < messages.length; i += 100) {
          await fetch(EXPO_PUSH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messages.slice(i, i + 100)),
          });
        }
      }
    }
  } catch {}
}
