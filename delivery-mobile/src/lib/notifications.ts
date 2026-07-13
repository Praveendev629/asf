import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { apiFetchAuth } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
});

export async function registerForPushNotifications(token: string): Promise<string | null> {
  if (!Device.isDevice) return null;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") return null;
  }
  const pushToken = await Notifications.getExpoPushTokenAsync();
  await apiFetchAuth("/api/delivery/fcm-token", token, {
    method: "POST",
    body: JSON.stringify({ fcmToken: pushToken.data }),
  });
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("orders", {
      name: "New Orders", importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
    });
  }
  return pushToken.data;
}

export function setupNotificationListeners(
  onReceived: (n: Notifications.Notification) => void,
  onTapped: (n: Notifications.Notification) => void
) {
  const a = Notifications.addNotificationReceivedListener(onReceived);
  const b = Notifications.addNotificationResponseReceivedListener(onTapped);
  return () => { a.remove(); b.remove(); };
}

export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, channelId: "orders" },
    trigger: null,
  });
}
