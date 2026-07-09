import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

const stats = [
  { label: "Total Users", value: "—", icon: "people-outline" as const },
  { label: "Today's Orders", value: "—", icon: "receipt-outline" as const },
  { label: "Pending Orders", value: "—", icon: "time-outline" as const },
  { label: "Revenue", value: "₹—", icon: "cash-outline" as const },
];

// Live values should be wired to Firestore aggregation queries or a
// backend /api/admin/stats endpoint.
export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.card}>
            <Ionicons name={s.icon} size={24} color={colors.secondary} />
            <Text style={styles.value}>{s.value}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  card: { width: "46%", backgroundColor: colors.card, borderRadius: 14, padding: 18, gap: 6 },
  value: { color: colors.accent, fontSize: 22, fontWeight: "800" },
  label: { color: colors.textMuted, fontSize: 12 },
});
