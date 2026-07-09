import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { colors } from "../lib/theme";

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.secondary,
    background: colors.background,
    surface: colors.card,
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.accent }}>
        <Stack.Screen name="index" options={{ title: "ASF Shopee" }} />
        <Stack.Screen name="onboarding/phone" options={{ title: "Phone Number" }} />
        <Stack.Screen name="onboarding/address" options={{ title: "Address" }} />
        <Stack.Screen name="onboarding/map" options={{ title: "Select Location" }} />
        <Stack.Screen name="product/[id]" options={{ title: "Product" }} />
        <Stack.Screen name="cart" options={{ title: "Cart" }} />
        <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="orders" options={{ title: "My Orders" }} />
        <Stack.Screen name="tracking/[orderId]" options={{ title: "Track Order" }} />
      </Stack>
    </PaperProvider>
  );
}
