import webPush from "web-push";
import User from "./models/User";
import Order from "./models/Order";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Configure VAPID keys for web push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@asfshopee.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Send push notification to PWA web push subscriptions
async function sendWebPushNotifications(
  subscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url: data?.orderId ? `/orders/${data.orderId}` : "/", ...data });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
      } catch (err: any) {
        // Remove expired/invalid subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await User.updateOne(
            { "pushSubscriptions.endpoint": sub.endpoint },
            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
          );
        }
        throw err;
      }
    })
  );

  return results;
}

// Send Expo push to mobile app tokens
async function sendExpoNotifications(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (fcmTokens.length === 0) return;

  const messages = fcmTokens.map((token: string) => ({
    to: token,
    sound: "default",
    title,
    body,
    data: data || {},
    channelId: "orders",
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
  }
}

export async function sendOrderNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
  try {
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) return;

    // Send to PWA web push subscriptions
    if (user.pushSubscriptions?.length > 0) {
      await sendWebPushNotifications(user.pushSubscriptions, title, body, data);
    }

    // Send to Expo mobile app tokens
    if (user.fcmTokens?.length > 0) {
      await sendExpoNotifications(user.fcmTokens, title, body, data);
    }
  } catch {}
}

export async function notifyOrderStatusUpdate(orderId: string, newStatus: string) {
  const order = await Order.findById(orderId);
  if (!order) return;

  const statusLabels: Record<string, string> = {
    confirmed: "Your order has been confirmed!",
    packed: "Your order has been packed and is ready for pickup.",
    dispatched: "Your order is on the way!",
    out_for_delivery: "Your order is out for delivery. ETA: " + (order.deliveryPartner?.eta || "Soon"),
    delivered: "Your order has been delivered! Thank you for shopping with ASF.",
  };

  const title = "Order Update";
  const body = statusLabels[newStatus] || `Your order status has been updated to ${newStatus}`;

  await sendOrderNotification(order.userId, title, body, {
    orderId: String(order._id),
    status: newStatus,
    type: "order_update",
  });
}
