import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, clearAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";

export default function AccountScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getAuth().then(({ token }) => {
      if (token) apiFetchAuth("/api/users/profile", token).then((r) => r.json()).then((d) => setUser(d.user));
    });
  }, []);

  function handleLogout() {
    clearAuth();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user?.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarPlaceholder]}><Ionicons name="person" size={28} color="#059669" /></View>}
        <Text style={styles.name}>{user?.name || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="receipt-outline" label="My Orders" onPress={() => navigation.navigate("Orders")} />
        <MenuItem icon="heart-outline" label="Wishlist" onPress={() => {}} />
        {user?.phone && <MenuItem icon="call-outline" label={`+91 ${user.phone}`} />}
        {user?.address && <MenuItem icon="location-outline" label={`${user.address.line1}, ${user.address.city}`} />}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#6b7280" />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { alignItems: "center", padding: 32, backgroundColor: "white" },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: { backgroundColor: "#d1fae5", justifyContent: "center", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "bold", color: "#111827", marginTop: 12 },
  email: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  menu: { backgroundColor: "white", marginTop: 16, marginHorizontal: 16, borderRadius: 16, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  menuLabel: { flex: 1, fontSize: 14, color: "#111827" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, margin: 16, padding: 16, backgroundColor: "white", borderRadius: 16 },
  logoutText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
});
