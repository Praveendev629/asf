import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { colors } from "../lib/theme";

const theme = { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: colors.secondary, background: colors.background, surface: colors.card } };

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.accent }}>
        <Stack.Screen name="index" options={{ title: "My Products" }} />
        <Stack.Screen name="add-product" options={{ title: "Add Product" }} />
      </Stack>
    </PaperProvider>
  );
}
