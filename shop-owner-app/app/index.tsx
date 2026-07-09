import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../lib/theme";

export default function ProductListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={(item: any) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No products yet. Tap + to add one.</Text>}
        renderItem={() => null}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add-product")}>
        <Ionicons name="add" size={28} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  fab: { position: "absolute", right: 20, bottom: 20, backgroundColor: colors.secondary, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
});
