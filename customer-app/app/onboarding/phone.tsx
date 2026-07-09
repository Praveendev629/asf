import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

// After Google Login, the app checks Firestore for a saved phone number.
// If missing, this screen collects and confirms it before continuing.
export default function PhoneScreen() {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="call-outline" size={40} color={colors.secondary} />
      <Text style={styles.title}>Confirm your phone number</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+91 98765 43210"
        placeholderTextColor={colors.textMuted}
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.button} onPress={() => router.push("/onboarding/address")}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  title: { color: colors.accent, fontSize: 18, fontWeight: "700" },
  input: { width: "100%", backgroundColor: colors.card, color: colors.accent, borderRadius: 10, padding: 14 },
  button: { backgroundColor: colors.secondary, width: "100%", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: colors.accent, fontWeight: "700" },
});
