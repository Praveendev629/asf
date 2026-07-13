import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { getAdminEmail } from "./src/lib/storage";
import { registerForPushNotifications, setupNotificationListeners } from "./src/lib/notifications";
import { sendLocalNotification } from "./src/lib/notifications";

import LoginScreen from "./src/screens/LoginScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import UsersScreen from "./src/screens/UsersScreen";
import PartnersScreen from "./src/screens/PartnersScreen";
import UpdatesScreen from "./src/screens/UpdatesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, any> = { Orders: "receipt", Users: "people", Partners: "car", Updates: "image" };
        return <Ionicons name={icons[route.name] || "ellipse"} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#059669",
      tabBarInactiveTintColor: "#9ca3af",
      headerShown: false,
    })}>
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Partners" component={PartnersScreen} />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getAdminEmail().then((email) => {
      setIsLoggedIn(!!email);
      if (email) registerForPushNotifications(email);
    });
    const cleanup = setupNotificationListeners(
      (n) => { const d = n.request.content.data; if (d?.type) sendLocalNotification(n.request.content.title || "ASF Admin", n.request.content.body || ""); },
      () => {}
    );
    return cleanup;
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? <Stack.Screen name="Login" component={LoginScreen} /> : <Stack.Screen name="Main" component={MainTabs} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
