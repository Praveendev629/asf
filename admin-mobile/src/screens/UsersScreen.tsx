import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../lib/api";

interface User { _id: string; name: string; email: string; phone?: string; address?: { line1: string; city: string; state: string }; createdAt: string; }

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => { const res = await apiFetch("/api/admin/users"); if (res.ok) { const data = await res.json(); setUsers(data.users || []); } }, []);

  useEffect(() => { loadUsers(); const i = setInterval(loadUsers, 30000); return () => clearInterval(i); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customers ({users.length})</Text>
      <FlatList data={users} keyExtractor={(i) => i._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadUsers(); setRefreshing(false); }} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}><Ionicons name="person" size={16} color="#6b7280" /><Text style={styles.name}>{item.name}</Text></View>
            <View style={styles.row}><Ionicons name="mail" size={14} color="#6b7280" /><Text style={styles.text}>{item.email}</Text></View>
            {item.phone && <View style={styles.row}><Ionicons name="call" size={14} color="#6b7280" /><Text style={styles.text}>+91 {item.phone}</Text></View>}
            {item.address && <View style={styles.row}><Ionicons name="location" size={14} color="#6b7280" /><Text style={styles.text}>{item.address.line1}, {item.address.city}</Text></View>}
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="people-outline" size={48} color="#d1d5db" /><Text style={styles.emptyText}>No customers</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  title: { fontSize: 20, fontWeight: "bold", padding: 16, color: "#111827" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 14, fontWeight: "600", color: "#111827" },
  text: { fontSize: 13, color: "#6b7280" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#9ca3af", marginTop: 8 },
});
