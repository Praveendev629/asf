import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

const STATUSES = ["pending", "confirmed", "picked", "outForDelivery", "delivered", "cancelled"];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [status, setStatus] = useState("pending");

  async function updateStatus(next: string) {
    setStatus(next);
    // PATCH `${API_BASE}/orders/${id}/status` with { status: next }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{id}</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus("confirmed")}>
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.accent} />
          <Text style={styles.actionText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => updateStatus("cancelled")}>
          <Ionicons name="close-circle-outline" size={18} color={colors.accent} />
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Update Status</Text>
      <View style={styles.statusRow}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusChip, status === s && { backgroundColor: colors.secondary }]}
            onPress={() => updateStatus(s)}
          >
            <Text style={styles.statusText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL("tel:+910000000000")}>
        <Ionicons name="call" size={18} color={colors.accent} />
        <Text style={styles.actionText}>Call Customer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 16 },
  title: { color: colors.accent, fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", gap: 6, backgroundColor: colors.success, padding: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionText: { color: colors.accent, fontWeight: "700" },
  sectionTitle: { color: colors.accent, fontWeight: "700", marginTop: 8 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusChip: { backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  statusText: { color: colors.accent, fontSize: 12 },
  callButton: { flexDirection: "row", gap: 8, backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
