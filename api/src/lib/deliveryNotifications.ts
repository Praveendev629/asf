import DeliveryPartner from "./models/DeliveryPartner";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendDeliveryNotification(partnerId: string, title: string, body: string, data?: Record<string, string>) {
  try {
    const partner = await DeliveryPartner.findById(partnerId);
    if (!partner || !partner.fcmTokens || partner.fcmTokens.length === 0) return;

    const messages = partner.fcmTokens.map((token: string) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: data || {},
      channelId: "orders",
    }));

    for (let i = 0; i < messages.length; i += 100) {
      await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages.slice(i, i + 100)),
      });
    }
  } catch {}
}

export async function notifyAllDeliveryPartners(orderId: string, orderNumber: string, total: number) {
  try {
    const partners = await DeliveryPartner.find({ isAvailable: true, fcmTokens: { $exists: true, $ne: [] } });

    for (const partner of partners) {
      if (!partner.fcmTokens || partner.fcmTokens.length === 0) continue;

      const messages = partner.fcmTokens.map((token: string) => ({
        to: token,
        sound: "default",
        title: "New Order Available!",
        body: `Order #${orderNumber} — ₹${total}. Tap to accept.`,
        data: { orderId, type: "new_order" },
        channelId: "orders",
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
