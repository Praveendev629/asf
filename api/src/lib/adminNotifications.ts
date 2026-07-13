import Admin from "./models/Admin";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendAdminNotification(title: string, body: string, data?: Record<string, string>) {
  try {
    const admins = await Admin.find({ fcmTokens: { $exists: true, $ne: [] } });
    if (admins.length === 0) return;

    const allTokens: string[] = [];
    admins.forEach((admin: any) => {
      if (admin.fcmTokens) allTokens.push(...admin.fcmTokens);
    });

    if (allTokens.length === 0) return;

    const messages = allTokens.map((token: string) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: data || {},
      channelId: "admin",
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

export async function notifyAdminNewCustomer(name: string, email: string) {
  await sendAdminNotification("New Customer!", `${name} (${email}) has registered.`, { type: "new_customer" });
}

export async function notifyAdminNewDeliveryPartner(name: string, phone: string) {
  await sendAdminNotification("New Delivery Partner!", `${name} (${phone}) has registered.`, { type: "new_delivery_partner" });
}

export async function notifyAdminOrderDelivered(orderNumber: string, total: number) {
  await sendAdminNotification("Order Delivered!", `Order #${orderNumber} (₹${total}) has been delivered.`, { type: "order_delivered" });
}
