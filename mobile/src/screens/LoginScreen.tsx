import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { saveAuth } from "../lib/storage";
import { COLORS } from "../lib/theme";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    setLoading(true);
    try {
      const res = await apiFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      await saveAuth(data.token, data.user);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Ionicons name="cart" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>ASF Shopee</Text>
        <Text style={styles.subtitle}>Premium Grocery, Delivered Fast</Text>
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <View style={styles.passwordWrap}>
          <TextInput style={styles.passwordInput} placeholder="Password" placeholderTextColor={COLORS.textMuted} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 40 },
  logoWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.text, marginTop: 16 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  form: { gap: 12 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  passwordWrap: { position: "relative" },
  passwordInput: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, paddingRight: 48 },
  eyeBtn: { position: "absolute", right: 12, top: 12 },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
});
