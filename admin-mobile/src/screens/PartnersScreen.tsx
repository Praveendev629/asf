import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";

interface Partner { _id: string; name: string; phone: string; email: string; isAvailable: boolean; currentLocation?: { lat: number; lng: number }; createdAt: string; }

export default function PartnersScreen() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPartners = useCallback(async () => { const res = await apiFetch("/api/admin/delivery-partners"); if (res.ok) { const data = await res.json(); setPartners(data.partners || []); } }, []);

  useEffect(() => { loadPartners(); const i = setInterval(loadPartners, 30000); return () => clearInterval(i); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Partners ({partners.length})</Text>
      <FlatList data={partners} keyExtractor={(i) => i._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadPartners(); setRefreshing(false); }} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: item.isAvailable ? "#dcfce7" : "#fee2e2" }]}><Text style={[styles.badgeText, { color: item.isAvailable ? "#16a34a" : "#dc2626" }]}>{item.isAvailable ? "Available" : "Unavailable"}</Text></View>
            </View>
            <View style={styles.row}><Ionicons name="call" size={14} color="#6b7280" /><Text style={styles.text}>+91 {item.phone}</Text></View>
            <View style={styles.row}><Ionicons name="mail" size={14} color="#6b7280" /><Text style={styles.text}>{item.email}</Text></View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="car-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No partners</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, gap: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { fontSize: 13, color: "#6b7280" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 8 },
});
