import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "./src/lib/storage";
import { registerForPushNotifications, setupNotificationListeners } from "./src/lib/notifications";
import { sendLocalNotification } from "./src/lib/notifications";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import MyOrdersScreen from "./src/screens/MyOrdersScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import AccountScreen from "./src/screens/AccountScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, any> = { Available: "cube", "My Orders": "clipboard", History: "time", Account: "person" };
        return <Ionicons name={icons[route.name] || "ellipse"} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#111827",
      tabBarInactiveTintColor: "#9ca3af",
      headerShown: false,
    })}>
      <Tab.Screen name="Available" component={DashboardScreen} />
      <Tab.Screen name="My Orders" component={MyOrdersScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  useEffect(() => {
    getAuth().then(({ token }) => {
      setIsLoggedIn(!!token);
      if (token) registerForPushNotifications(token);
    });

    const cleanup = setupNotificationListeners(
      (notification) => {
        // New order received — show local notification sound
        const data = notification.request.content.data;
        if (data?.type === "new_order") {
          setNewOrderAlert(data.orderId as string);
        }
      },
      (notification) => {
        // User tapped notification
        const data = notification.request.content.data;
        if (data?.orderId) {
          // Navigation will be handled by the screen
        }
      }
    );
    return cleanup;
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
