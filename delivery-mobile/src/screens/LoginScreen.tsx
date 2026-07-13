import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { saveAuth } from "../lib/storage";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return Alert.alert("Error", "Fill all fields");
    setLoading(true);
    try {
      const res = await apiFetch("/api/delivery/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      await saveAuth(data.token, data.partner);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="car" size={48} color="#111827" />
        <Text style={styles.title}>ASF Delivery</Text>
        <Text style={styles.subtitle}>Delivery Partner Portal</Text>
      </View>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")} style={styles.link}>
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  form: { gap: 12 },
  input: { backgroundColor: "white", borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: "#e5e7eb" },
  btn: { backgroundColor: "#111827", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "white", fontSize: 16, fontWeight: "600" },
  link: { alignItems: "center", marginTop: 12 },
  linkText: { color: "#059669", fontSize: 14, fontWeight: "500" },
});
