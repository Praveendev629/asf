import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

const categories = [
  { name: "Electronics", icon: "laptop-outline" as const },
  { name: "Mobiles", icon: "phone-portrait-outline" as const },
  { name: "Fashion", icon: "shirt-outline" as const },
  { name: "Home", icon: "home-outline" as const },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput placeholder="Search products" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
      </View>

      <Text style={styles.sectionTitle}>Shop by Category</Text>
      <View style={styles.categoryRow}>
        {categories.map((c) => (
          <TouchableOpacity key={c.name} style={styles.categoryCard}>
            <Ionicons name={c.icon} size={26} color={colors.secondary} />
            <Text style={styles.categoryLabel}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Featured Products</Text>
      <Text style={{ color: colors.textMuted, paddingHorizontal: 16 }}>
        Connect to the backend API to load live products.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.accent },
  sectionTitle: { color: colors.accent, fontWeight: "700", fontSize: 16, paddingHorizontal: 16, marginTop: 10, marginBottom: 8 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  categoryCard: {
    width: "22%",
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 16,
    gap: 6,
  },
  categoryLabel: { color: colors.accent, fontSize: 11 },
});
