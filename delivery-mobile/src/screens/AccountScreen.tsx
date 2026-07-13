import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, clearAuth } from "../lib/storage";

export default function AccountScreen({ navigation }: any) {
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => { getAuth().then(({ partner }) => setPartner(partner)); }, []);

  function handleLogout() {
    clearAuth();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Ionicons name="person" size={28} color="white" /></View>
        <Text style={styles.name}>{partner?.name || "Partner"}</Text>
        <Text style={styles.email}>{partner?.email}</Text>
      </View>
      <View style={styles.menu}>
        <View style={styles.menuItem}><Ionicons name="call" size={20} color="#6b7280" /><Text style={styles.menuLabel}>+91 {partner?.phone}</Text></View>
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { alignItems: "center", padding: 32, backgroundColor: "white" },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#111827", justifyContent: "center", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "bold", color: "#111827", marginTop: 12 },
  email: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  menu: { backgroundColor: "white", marginTop: 16, marginHorizontal: 16, borderRadius: 16, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  menuLabel: { flex: 1, fontSize: 14, color: "#111827" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, margin: 16, padding: 16, backgroundColor: "white", borderRadius: 16 },
  logoutText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
});
