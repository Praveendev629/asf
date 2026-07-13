import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";
import { saveOrderToHistory } from "../lib/orderHistory";

interface Order {
  _id: string; orderNumber: string; userName: string; userPhone: string; total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  deliveryAddress: { line1: string; city: string; state: string; pincode: string; lat?: number; lng?: number };
  deliveryPartner?: { eta: string };
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = { confirmed: "Confirmed", packed: "Packed", dispatched: "Dispatched", out_for_delivery: "Out for Delivery", delivered: "Delivered" };
const STATUS_COLORS: Record<string, string> = { confirmed: "#6366f1", packed: "#f59e0b", dispatched: "#a855f7", out_for_delivery: "#f97316", delivered: "#22c55e" };

export default function MyOrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    const { token } = await getAuth();
    if (!token) return;
    const res = await apiFetchAuth("/api/delivery/orders?filter=my", token);
    const data = await res.json();
    setOrders(data.orders || []);
  }, []);

  useEffect(() => { loadOrders(); const i = setInterval(loadOrders, 10000); return () => clearInterval(i); }, []);

  const onRefresh = async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); };

  async function updateStatus(orderId: string, status: string) {
    const { token } = await getAuth();
    if (!token) return;
    await apiFetchAuth(`/api/delivery/orders/${orderId}`, token, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // Save to local history when delivered
    if (status === "delivered") {
      const order = orders.find((o) => o._id === orderId);
      if (order) {
        await saveOrderToHistory({
          _id: order._id, orderNumber: order.orderNumber, userName: order.userName,
          userPhone: order.userPhone, total: order.total, status: "delivered",
          items: order.items, deliveryAddress: order.deliveryAddress,
          acceptedAt: order.createdAt, deliveredAt: new Date().toISOString(),
        });
      }
    }
    loadOrders();
  }

  function openNavigation(destLat: number, destLng: number) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
    import("react-native").then(({ Linking }) => Linking.openURL(url));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders ({orders.length})</Text>
      <FlatList data={orders} keyExtractor={(i) => i._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>#{item.orderNumber}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || "#9ca3af" }]}>
                <Text style={styles.badgeText}>{STATUS_LABELS[item.status] || item.status}</Text>
              </View>
            </View>
            <View style={styles.customer}>
              <Ionicons name="person" size={14} color="#6b7280" />
              <Text style={styles.customerText}>{item.userName} · +91 {item.userPhone}</Text>
            </View>
            <View style={styles.customer}>
              <Ionicons name="location" size={14} color="#6b7280" />
              <Text style={styles.customerText}>{item.deliveryAddress.line1}, {item.deliveryAddress.city}</Text>
            </View>
            <Text style={styles.total}>₹{item.total}</Text>

            <View style={styles.actions}>
              {item.deliveryAddress.lat && item.deliveryAddress.lng && item.status !== "delivered" && (
                <TouchableOpacity style={styles.navBtn} onPress={() => openNavigation(item.deliveryAddress.lat!, item.deliveryAddress.lng!)}>
                  <Ionicons name="navigate" size={16} color="white" />
                  <Text style={styles.actionText}>Navigate</Text>
                </TouchableOpacity>
              )}
              {item.status !== "delivered" && (
                <TouchableOpacity style={styles.statusBtn} onPress={() => {
                  const next = ["confirmed", "packed", "dispatched", "out_for_delivery", "delivered"];
                  const idx = next.indexOf(item.status);
                  if (idx < next.length - 1) updateStatus(item._id, next[idx + 1]);
                }}>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                  <Text style={styles.actionText}>
                    {item.status === "confirmed" ? "Mark Packed" :
                     item.status === "packed" ? "Mark Dispatched" :
                     item.status === "dispatched" ? "Out for Delivery" :
                     item.status === "out_for_delivery" ? "Mark Delivered" : "Next"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="clipboard-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No active orders</Text></View>}
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
  customer: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  customerText: { fontSize: 13, color: "#6b7280" },
  total: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  actions: { flexDirection: "row", gap: 12 },
  navBtn: { flex: 1, backgroundColor: "#3b82f6", borderRadius: 12, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  statusBtn: { flex: 1, backgroundColor: "#111827", borderRadius: 12, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  actionText: { color: "white", fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 8 },
});
