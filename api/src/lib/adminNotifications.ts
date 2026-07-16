import webPush from "web-push";
import Admin from "./models/Admin";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@asfshopee.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

async function sendAdminWebPush(
  subscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[],
  title: string,
  body: string,
  url?: string
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error("[AdminPush] VAPID keys not configured");
    return;
  }
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url: url || "/" });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
        console.log("[AdminPush] Sent to:", sub.endpoint.substring(0, 60));
      } catch (err: any) {
        console.error("[AdminPush] Failed:", err.statusCode, err.message);
        if (err.statusCode === 404 || err.statusCode === 410) {
          await Admin.updateOne(
            { "pushSubscriptions.endpoint": sub.endpoint },
            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
          );
        }
        throw err;
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`[AdminPush] Web push: ${subscriptions.length - failed}/${subscriptions.length} sent`);
}

export async function sendAdminNotification(title: string, body: string, data?: Record<string, string>, url?: string) {
  try {
    const admins = await Admin.find({});
    console.log("[AdminPush] Found", admins.length, "admin(s)");

    if (admins.length === 0) {
      console.warn("[AdminPush] No admin documents in DB — notifications won't send");
      return;
    }

    // Web push
    const allSubscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[] = [];
    admins.forEach((admin: any) => {
      if (admin.pushSubscriptions?.length) allSubscriptions.push(...admin.pushSubscriptions);
    });
    console.log("[AdminPush] Total web push subscriptions:", allSubscriptions.length);
    if (allSubscriptions.length > 0) {
      await sendAdminWebPush(allSubscriptions, title, body, url);
    }

    // Expo push
    const allTokens: string[] = [];
    admins.forEach((admin: any) => {
      if (admin.fcmTokens?.length) allTokens.push(...admin.fcmTokens);
    });
    if (allTokens.length > 0) {
      const messages = allTokens.map((token: string) => ({
        to: token, sound: "default", title, body, data: data || {}, channelId: "admin",
      }));
      for (let i = 0; i < messages.length; i += 100) {
        await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messages.slice(i, i + 100)),
        });
      }
    }
  } catch (err: any) {
    console.error("[AdminPush] sendAdminNotification error:", err.message);
  }
}

export async function notifyAdminNewCustomer(name: string, email: string) {
  console.log("[AdminPush] notifyAdminNewCustomer:", name, email);
  await sendAdminNotification("New Customer!", `${name} (${email}) has registered.`, { type: "new_customer" });
}

export async function notifyAdminNewDeliveryPartner(name: string, phone: string) {
  console.log("[AdminPush] notifyAdminNewDeliveryPartner:", name, phone);
  await sendAdminNotification("New Delivery Partner!", `${name} (${phone}) has registered.`, { type: "new_delivery_partner" });
}

export async function notifyAdminNewOrder(orderNumber: string, total: number, customerName: string) {
  console.log("[AdminPush] notifyAdminNewOrder:", orderNumber, total, customerName);
  await sendAdminNotification("New Order!", `#${orderNumber} — ₹${total} from ${customerName}.`, { type: "new_order" }, "/");
}

export async function notifyAdminOrderDelivered(orderNumber: string, total: number) {
  await sendAdminNotification("Order Delivered!", `Order #${orderNumber} (₹${total}) has been delivered.`, { type: "order_delivered" });
}
