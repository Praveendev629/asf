import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "../lib/storage";
import { apiFetchAuth } from "../lib/api";
import { COLORS, STAGE_META, STAGE_ORDER } from "../lib/theme";

interface Order {
  _id: string; orderNumber: string; status: string; total: number;
  items: { name: string; price: number; quantity: number; image: string }[];
  deliveryAddress: { line1: string; city: string; state: string; pincode: string };
  deliveryPartner?: { name: string; phone: string; eta: string };
  createdAt: string;
}

export default function OrderDetailScreen({ route }: any) {
  const { id } = route.params;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    async function fetchOrder() {
      const { token } = await getAuth();
      if (token) {
        apiFetchAuth(`/api/orders/${id}`, token).then((r) => r.json()).then((d) => setOrder(d.order));
      }
    }
    fetchOrder();
    interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order) return <View style={styles.center}><Text style={{ color: COLORS.textMuted }}>Loading order...</Text></View>;
  const currentIndex = STAGE_ORDER.indexOf(order.status);
  const stageMeta = STAGE_META[order.status] || STAGE_META.placed;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Confirmation Header */}
      <View style={styles.confirmHeader}>
        <Ionicons name="checkmark-circle" size={56} color={COLORS.primary} />
        <Text style={styles.confirmTitle}>Order Confirmed!</Text>
        <Text style={styles.confirmSub}>#{order.orderNumber}</Text>
      </View>

      {/* ETA Banner */}
      {order.deliveryPartner?.eta && order.status !== "delivered" && (
        <View style={styles.etaBanner}>
          <View style={styles.etaIcon}><Ionicons name="time" size={24} color="#92400e" /></View>
          <View>
            <Text style={styles.etaLabel}>Estimated Delivery</Text>
            <Text style={styles.etaTime}>{order.deliveryPartner.eta}</Text>
          </View>
        </View>
      )}

      {/* Order Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Progress</Text>
        {STAGE_ORDER.map((stage, i) => {
          const meta = STAGE_META[stage] || STAGE_META.placed;
          const done = i <= currentIndex;
          return (
            <View key={stage} style={styles.progressRow}>
              <View style={styles.progressLeft}>
                <View style={[styles.progressDot, done ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.border }]}>
                  {done && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                </View>
                {i < STAGE_ORDER.length - 1 && <View style={[styles.progressLine, i < currentIndex ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.border }]} />}
              </View>
              <Text style={[styles.stageLabel, done ? { color: COLORS.text, fontWeight: "600" } : { color: COLORS.textMuted }]}>{meta.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Delivery Partner */}
      {order.deliveryPartner && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Partner</Text>
          <View style={styles.partnerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.partnerName}>{order.deliveryPartner.name}</Text>
              {order.deliveryPartner.eta && <Text style={styles.partnerEta}>ETA: {order.deliveryPartner.eta}</Text>}
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${order.deliveryPartner!.phone}`)}>
              <Ionicons name="call" size={14} color={COLORS.white} />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Items */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Image source={{ uri: item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100" }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>× {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.total}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Delivering to</Text>
        </View>
        <Text style={styles.addressText}>{order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  confirmHeader: { alignItems: "center", paddingVertical: 24 },
  confirmTitle: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginTop: 8 },
  confirmSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  etaBanner: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  etaIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fef3c7", justifyContent: "center", alignItems: "center" },
  etaLabel: { fontSize: 13, color: "#92400e", fontWeight: "500" },
  etaTime: { fontSize: 22, fontWeight: "700", color: "#78350f" },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  progressRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  progressLeft: { alignItems: "center", width: 24 },
  progressDot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  progressLine: { width: 2, flex: 1, minHeight: 24, marginTop: 4 },
  stageLabel: { fontSize: 14, paddingBottom: 12 },
  partnerRow: { flexDirection: "row", alignItems: "center" },
  partnerName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  partnerEta: { fontSize: 13, color: COLORS.amber, fontWeight: "500", marginTop: 4 },
  callBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  callBtnText: { color: COLORS.white, fontSize: 13, fontWeight: "600" },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: COLORS.borderLight },
  itemName: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  itemQty: { fontSize: 12, color: COLORS.textMuted },
  itemPrice: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  addressText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
