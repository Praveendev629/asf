import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";
import { COLORS, STAGE_META, STAGE_ORDER } from "../lib/theme";

interface Order {
  _id: string; orderNumber: string; status: string; total: number;
  items: { name: string; quantity: number; image: string; price: number }[];
  deliveryPartner?: { name: string; phone: string };
  createdAt: string;
}

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    async function fetchOrders() {
      const { token } = await getAuth();
      if (token) {
        apiFetchAuth("/api/orders", token).then((r) => r.json()).then((d) => {
          setOrders(d.orders || []);
          setLoading(false);
        });
      }
    }
    fetchOrders();
    interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <View style={styles.empty}><Text style={{ color: COLORS.textMuted }}>Loading your orders...</Text></View>;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="cart-outline" size={64} color={COLORS.border} />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Text style={styles.emptyLink}>Start shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const currentIndex = STAGE_ORDER.indexOf(item.status);
          const stageMeta = STAGE_META[item.status] || STAGE_META.placed;
          return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("OrderDetail", { id: item._id })} activeOpacity={0.7}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderNum}>#{item.orderNumber}</Text>
                  <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: stageMeta.bgColor }]}>
                  <Text style={[styles.statusText, { color: stageMeta.color }]}>{stageMeta.label}</Text>
                </View>
              </View>

              {/* Items */}
              <View style={styles.cardItems}>
                {item.items.slice(0, 3).map((it, i) => (
                  <Text key={i} style={styles.itemText}>{it.name} × {it.quantity}</Text>
                ))}
                {item.items.length > 3 && <Text style={styles.moreText}>+{item.items.length - 3} more</Text>}
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.total}>₹{item.total}</Text>
                {item.deliveryPartner && (
                  <Text style={styles.deliveryPartner}>
                    <Ionicons name="car-outline" size={12} /> {item.deliveryPartner.name}
                  </Text>
                )}
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                {STAGE_ORDER.map((stage, i) => (
                  <View key={stage} style={[styles.progressSegment, i <= currentIndex ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.border }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: COLORS.text },
  emptyLink: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },
  title: { fontSize: 22, fontWeight: "700", padding: 16, paddingBottom: 8, color: COLORS.text },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orderNum: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  orderDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600" },
  cardItems: { gap: 4, marginBottom: 10 },
  itemText: { fontSize: 13, color: COLORS.textSecondary },
  moreText: { fontSize: 12, color: COLORS.textMuted },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 10 },
  total: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  deliveryPartner: { fontSize: 12, color: COLORS.green },
  progressBar: { flexDirection: "row", gap: 3, marginTop: 12 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
});
