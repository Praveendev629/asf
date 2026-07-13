import User from "./models/User";
import Order from "./models/Order";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendOrderNotification(userId: string, title: string, body: string, data?: Record<string, string>) {
  try {
    const user = await User.findOne({ firebaseUid: userId });
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    const messages = user.fcmTokens.map((token: string) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: data || {},
      channelId: "orders",
    }));

    // Send in batches of 100
    for (let i = 0; i < messages.length; i += 100) {
      const batch = messages.slice(i, i + 100);
      await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
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
