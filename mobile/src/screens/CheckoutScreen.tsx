import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch, apiFetchAuth } from "../lib/api";
import { saveAuth, getAuth } from "../lib/storage";

export default function CheckoutScreen({ navigation }: any) {
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function handlePlaceOrder() {
    setPlacing(true);
    setError("");
    try {
      const { token } = await getAuth();
      if (!token) return setError("Please login first");
      const res = await apiFetchAuth("/api/orders", token, {
        method: "POST",
        body: JSON.stringify({ items: [] }), // Items from cart
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      navigation.replace("OrderDetail", { id: data.order._id });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Confirm Order</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={18} color="#059669" />
          <Text style={styles.cardTitle}>Delivery Address</Text>
        </View>
        <Text style={styles.cardText}>Your delivery address will appear here</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder} disabled={placing}>
        {placing ? <ActivityIndicator color="white" /> : <Text style={styles.placeBtnText}>Place Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 16 },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  cardText: { fontSize: 14, color: "#6b7280" },
  error: { color: "#ef4444", fontSize: 14, marginBottom: 12 },
  placeBtn: { backgroundColor: "#059669", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 12 },
  placeBtnText: { color: "white", fontSize: 16, fontWeight: "600" },
});
