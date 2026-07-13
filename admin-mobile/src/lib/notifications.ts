import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { apiFetch } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
});

export async function registerForPushNotifications(email: string): Promise<string | null> {
  if (!Device.isDevice) return null;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: s } = await Notifications.requestPermissionsAsync();
    if (s !== "granted") return null;
  }
  const pushToken = await Notifications.getExpoPushTokenAsync();
  await apiFetch("/api/admin/fcm-token", { method: "POST", body: JSON.stringify({ email, fcmToken: pushToken.data }) });
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("admin", { name: "Admin Alerts", importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 250, 250] });
  }
  return pushToken.data;
}

export function setupNotificationListeners(onReceived: (n: Notifications.Notification) => void, onTapped: (n: Notifications.Notification) => void) {
  const a = Notifications.addNotificationReceivedListener(onReceived);
  const b = Notifications.addNotificationResponseReceivedListener(onTapped);
  return () => { a.remove(); b.remove(); };
}
