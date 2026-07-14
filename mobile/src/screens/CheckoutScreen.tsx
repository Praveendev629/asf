import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetchAuth } from "../lib/api";
import { getAuth } from "../lib/storage";
import { useCart } from "../lib/CartContext";
import { COLORS, getDeliveryFee } from "../lib/theme";

export default function CheckoutScreen({ navigation }: any) {
  const { items, subtotal, clearCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const deliveryFee = getDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    getAuth().then(({ token }) => {
      if (token) apiFetchAuth("/api/users/profile", token).then((r) => r.json()).then((d) => setProfile(d.user));
    });
  }, []);

  useEffect(() => {
    if (profile && (!profile.phone || !profile.address)) {
      navigation.replace("Onboarding");
    }
  }, [profile, navigation]);

  async function handlePlaceOrder() {
    setPlacing(true);
    setError("");
    try {
      const { token } = await getAuth();
      if (!token) return setError("Please login first");
      const res = await apiFetchAuth("/api/orders", token, {
        method: "POST",
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      clearCart();
      navigation.replace("OrderDetail", { id: data.order._id });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) return <View style={styles.empty}><Text style={{ color: COLORS.textMuted }}>Your cart is empty.</Text></View>;
  if (!profile?.phone || !profile?.address) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Confirm your order</Text>

      {/* Delivery Address */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Delivery Address</Text>
        </View>
        <Text style={styles.cardText}>{profile.address.line1}{profile.address.line2 ? `, ${profile.address.line2}` : ""}, {profile.address.city}, {profile.address.state} - {profile.address.pincode}</Text>
      </View>

      {/* Contact */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call" size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Delivery Contact</Text>
        </View>
        <Text style={styles.cardText}>+91 {profile.phone}</Text>
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Order Items</Text>
        {items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <Image source={{ uri: item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100" }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemUnit}>{item.unit} × {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>₹{subtotal}</Text></View>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Delivery</Text><Text style={styles.totalValue}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text></View>
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text style={styles.totalFinalLabel}>Total</Text>
            <Text style={styles.totalFinalValue}>₹{total}</Text>
          </View>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder} disabled={placing}>
        {placing ? <ActivityIndicator color={COLORS.white} /> : (
          <View style={styles.placeBtnInner}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
            <Text style={styles.placeBtnText}>Place Order · ₹{total}</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginBottom: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cardText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: COLORS.borderLight },
  itemName: { fontSize: 14, fontWeight: "500", color: COLORS.text },
  itemUnit: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  totalsSection: { borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 12, marginTop: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalLabel: { fontSize: 14, color: COLORS.textSecondary },
  totalValue: { fontSize: 14, color: COLORS.text },
  totalFinal: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4 },
  totalFinalLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  totalFinalValue: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  error: { color: COLORS.danger, fontSize: 14, marginBottom: 12 },
  placeBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 32 },
  placeBtnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  placeBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
});
