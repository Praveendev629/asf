import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Image, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";

interface Update { _id: string; title: string; description: string; imageUrl: string; createdAt: string; }

export default function UpdatesScreen() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUpdates = useCallback(async () => { const res = await apiFetch("/api/updates"); if (res.ok) { const data = await res.json(); setUpdates(data.updates || []); } }, []);

  useEffect(() => { loadUpdates(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Banners ({updates.length})</Text>
      <FlatList data={updates} keyExtractor={(i) => i._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadUpdates(); setRefreshing(false); }} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.title}</Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="image-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No banners</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { backgroundColor: "white", borderRadius: 16, overflow: "hidden" },
  image: { width: "100%", height: 120, backgroundColor: "#f3f4f6" },
  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  desc: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 8 },
});
