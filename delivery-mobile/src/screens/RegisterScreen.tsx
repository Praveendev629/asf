import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";
import { saveAuth } from "../lib/storage";

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !phone || !email || !password) return Alert.alert("Error", "Fill all fields");
    setLoading(true);
    try {
      const res = await apiFetch("/api/delivery/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      await saveAuth(data.token, data.partner);
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message);
    } finally { setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="numeric" maxLength={10} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Register</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 24, textAlign: "center" },
  form: { gap: 12 },
  input: { backgroundColor: "white", borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: "#e5e7eb" },
  btn: { backgroundColor: "#111827", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "white", fontSize: 16, fontWeight: "600" },
  link: { alignItems: "center", marginTop: 12 },
  linkText: { color: "#059669", fontSize: 14, fontWeight: "500" },
});
