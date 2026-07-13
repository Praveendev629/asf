import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getOrderHistory, OrderHistoryItem } from "../lib/orderHistory";

export default function HistoryScreen() {
  const [history, setHistory] = useState<OrderHistoryItem[]>([]);

  useEffect(() => { getOrderHistory().then(setHistory); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History ({history.length})</Text>
      <FlatList data={history} keyExtractor={(i) => i._id} contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>#{item.orderNumber}</Text>
              <View style={[styles.badge, item.status === "delivered" ? styles.delivered : styles.other]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.customer}>{item.userName} · +91 {item.userPhone}</Text>
            <Text style={styles.total}>₹{item.total}</Text>
            <View style={styles.dates}>
              <Text style={styles.date}>Accepted: {new Date(item.acceptedAt).toLocaleDateString()}</Text>
              {item.deliveredAt && <Text style={styles.date}>Delivered: {new Date(item.deliveredAt).toLocaleDateString()}</Text>}
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="time-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No order history</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderNum: { fontSize: 16, fontWeight: "600" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  delivered: { backgroundColor: "#dcfce7" },
  other: { backgroundColor: "#f3f4f6" },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#111827" },
  customer: { fontSize: 13, color: "#6b7280", marginBottom: 4 },
  total: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  dates: { gap: 4 },
  date: { fontSize: 12, color: "#9ca3af" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 8 },
});
