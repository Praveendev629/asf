import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";

interface Order { _id: string; orderNumber: string; userName: string; userPhone: string; total: number; status: string; items: { name: string; quantity: number }[]; createdAt: string; }
const STATUS_COLORS: Record<string, string> = { placed: "#3b82f6", confirmed: "#6366f1", packed: "#f59e0b", dispatched: "#a855f7", out_for_delivery: "#f97316", delivered: "#22c55e" };

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  const loadOrders = useCallback(async () => {
    const res = await apiFetch("/api/admin/orders");
    if (res.ok) { const data = await res.json(); const newOrders = data.orders || []; if (lastCount > 0 && newOrders.length > lastCount) { /* new order */ } setLastCount(newOrders.length); setOrders(newOrders); }
  }, [lastCount]);

  useEffect(() => { loadOrders(); const i = setInterval(loadOrders, 10000); return () => clearInterval(i); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders ({orders.length})</Text>
      <FlatList data={orders} keyExtractor={(i) => i._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); }} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>#{item.orderNumber}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || "#9ca3af" }]}><Text style={styles.badgeText}>{item.status}</Text></View>
            </View>
            <Text style={styles.customer}>{item.userName} · +91 {item.userPhone}</Text>
            <View style={styles.items}>{item.items.map((it, i) => <Text key={i} style={styles.itemText}>{it.name} × {it.quantity}</Text>)}</View>
            <Text style={styles.total}>₹{item.total}</Text>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No orders</Text></View>}
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
  badgeText: { color: "white", fontSize: 11, fontWeight: "600" },
  customer: { fontSize: 13, color: "#6b7280", marginBottom: 8 },
  items: { gap: 2, marginBottom: 8 },
  itemText: { fontSize: 12, color: "#9ca3af" },
  total: { fontSize: 16, fontWeight: "bold" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 8 },
});
