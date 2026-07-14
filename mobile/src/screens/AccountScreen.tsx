import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth, clearAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";
import { COLORS } from "../lib/theme";

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={28} color={COLORS.primary} />
          </View>
        )}
        <Text style={styles.name}>{user?.name || "User"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Quick Links */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Orders")}>
          <View style={[styles.menuIcon, { backgroundColor: "#eff6ff" }]}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.blue} />
          </View>
          <Text style={styles.menuLabel}>My Orders</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Wishlist")}>
          <View style={[styles.menuIcon, { backgroundColor: "#fef2f2" }]}>
            <Ionicons name="heart-outline" size={18} color={COLORS.danger} />
          </View>
          <Text style={styles.menuLabel}>My Wishlist</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
        </TouchableOpacity>
      </View>

      {/* Delivery Details */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        {user?.phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>+91 {user.phone}</Text>
          </View>
        )}
        {user?.address && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>{user.address.line1}{user.address.line2 ? `, ${user.address.line2}` : ""}, {user.address.city}, {user.address.state} - {user.address.pincode}</Text>
          </View>
        )}
        {!user?.phone && !user?.address && (
          <TouchableOpacity onPress={() => navigation.navigate("Onboarding")}>
            <Text style={styles.completeProfile}>Complete your profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: "center", padding: 32, backgroundColor: COLORS.white },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: { backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginTop: 12 },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  menuSection: { backgroundColor: COLORS.white, marginTop: 16, marginHorizontal: 16, borderRadius: 16, overflow: "hidden", padding: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary, padding: 16, paddingBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: COLORS.text },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 16, paddingBottom: 8 },
  detailText: { fontSize: 14, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
  completeProfile: { fontSize: 14, color: COLORS.primary, fontWeight: "600", padding: 16 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, margin: 16, padding: 16, backgroundColor: COLORS.white, borderRadius: 16 },
  logoutText: { color: COLORS.danger, fontSize: 14, fontWeight: "600" },
});
