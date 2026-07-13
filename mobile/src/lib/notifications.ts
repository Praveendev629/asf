import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { apiFetchAuth } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(token: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const pushToken = await Notifications.getExpoPushTokenAsync();
  
  // Save token to server
  if (token) {
    await apiFetchAuth("/api/users/fcm-token", token, {
      method: "POST",
      body: JSON.stringify({ fcmToken: pushToken.data }),
    });
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("orders", {
      name: "Order Updates",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return pushToken.data;
}

export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (notification: Notifications.Notification) => void
) {
  const receivedSub = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseSub = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);
  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
