import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";

const STAGE_LABELS: Record<string, string> = { placed: "Placed", confirmed: "Confirmed", packed: "Packed", dispatched: "Dispatched", out_for_delivery: "Out for Delivery", delivered: "Delivered" };
const STAGE_COLORS: Record<string, string> = { placed: "#3b82f6", confirmed: "#6366f1", packed: "#f59e0b", dispatched: "#a855f7", out_for_delivery: "#f97316", delivered: "#22c55e" };

interface Order { _id: string; orderNumber: string; status: string; total: number; items: { name: string; quantity: number }[]; createdAt: string; }

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getAuth().then(({ token }) => {
      if (token) {
        apiFetchAuth("/api/orders", token).then((r) => r.json()).then((d) => setOrders(d.orders || []));
      }
    });
  }, []);

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>No orders yet</Text>
        <Link onPress={() => navigation.navigate("Home")}>Start shopping</Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList data={orders} keyExtractor={(i) => i._id} contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("OrderDetail", { id: item._id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>#{item.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STAGE_COLORS[item.status] || "#9ca3af" }]}>
                <Text style={styles.statusText}>{STAGE_LABELS[item.status] || item.status}</Text>
              </View>
            </View>
            <View style={styles.cardItems}>
              {item.items.slice(0, 2).map((it, i) => (
                <Text key={i} style={styles.itemText}>{it.name} × {it.quantity}</Text>
              ))}
              {item.items.length > 2 && <Text style={styles.moreText}>+{item.items.length - 2} more</Text>}
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.total}>₹{item.total}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function Link({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return <TouchableOpacity onPress={onPress}><Text style={{ color: "#059669", fontWeight: "600" }}>{children}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb", gap: 12 },
  emptyText: { fontSize: 16, color: "#9ca3af" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderNum: { fontSize: 15, fontWeight: "600", color: "#111827" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "white", fontSize: 11, fontWeight: "600" },
  cardItems: { gap: 4, marginBottom: 8 },
  itemText: { fontSize: 13, color: "#6b7280" },
  moreText: { fontSize: 12, color: "#9ca3af" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 8 },
  total: { fontSize: 16, fontWeight: "bold" },
  date: { fontSize: 12, color: "#9ca3af" },
});
