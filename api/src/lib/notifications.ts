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
  console.log("[Push] VAPID configured successfully");
} else {
  console.warn("[Push] VAPID keys not configured — web push disabled");
}

// Send push notification to PWA web push subscriptions
async function sendWebPushNotifications(
  subscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[Push] VAPID keys missing, skipping web push");
    return;
  }
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, url: data?.orderId ? `/orders/${data.orderId}` : "/", ...data });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
        console.log("[Push] Sent to:", sub.endpoint.substring(0, 50) + "...");
      } catch (err: any) {
        console.error("[Push] Failed for endpoint:", sub.endpoint.substring(0, 50), "status:", err.statusCode, "message:", err.body || err.message);
        // Remove expired/invalid subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await User.updateOne(
            { "pushSubscriptions.endpoint": sub.endpoint },
            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
          );
          console.log("[Push] Removed expired subscription");
        }
        throw err;
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.warn(`[Push] ${failed.length}/${subscriptions.length} web push notifications failed`);
  } else {
    console.log(`[Push] All ${subscriptions.length} web push notifications sent successfully`);
  }

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
    console.log("[Push] Looking up user:", userId);
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      console.warn("[Push] User not found for firebaseUid:", userId);
      return;
    }

    console.log("[Push] User found:", user.name, "| pushSubscriptions:", user.pushSubscriptions?.length || 0, "| fcmTokens:", user.fcmTokens?.length || 0);

    // Send to PWA web push subscriptions
    if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
      console.log("[Push] Sending web push to", user.pushSubscriptions.length, "subscriptions...");
      await sendWebPushNotifications(user.pushSubscriptions, title, body, data);
    } else {
      console.log("[Push] No web push subscriptions found for user");
    }

    // Send to Expo mobile app tokens
    if (user.fcmTokens && user.fcmTokens.length > 0) {
      console.log("[Push] Sending Expo push to", user.fcmTokens.length, "tokens...");
      await sendExpoNotifications(user.fcmTokens, title, body, data);
    }
  } catch (err: any) {
    console.error("[Push] sendOrderNotification error:", err.message, err.stack);
  }
}

export async function notifyOrderStatusUpdate(orderId: string, newStatus: string) {
  const order = await Order.findById(orderId);
  if (!order) {
    console.warn("[Push] Order not found:", orderId);
    return;
  }

  console.log("[Push] Order status update:", order.orderNumber, "->", newStatus, "| userId:", order.userId);

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
