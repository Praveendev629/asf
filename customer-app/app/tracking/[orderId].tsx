import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { colors } from "../../lib/theme";

// Live delivery tracking screen: subscribes to the order document for
// real-time driver location updates written by the Admin/Delivery flow.
export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => setOrder(snap.data()));
    return unsub;
  }, [orderId]);

  const loc = order?.currentLocation;

  return (
    <View style={styles.container}>
      {loc && (
        <MapView
          style={{ flex: 1 }}
          region={{ latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        >
          <Marker coordinate={{ latitude: loc.lat, longitude: loc.lng }} title="Delivery Partner" />
        </MapView>
      )}

      <View style={styles.card}>
        <Text style={styles.driverName}>{order?.deliveryPartner?.name || "Delivery Partner"}</Text>
        <Text style={styles.eta}>ETA: {order?.eta || "Calculating..."}</Text>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL(`tel:${order?.deliveryPartner?.phone}`)}
        >
          <Ionicons name="call" size={18} color={colors.accent} />
          <Text style={styles.callText}>Call Delivery Partner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { padding: 20, backgroundColor: colors.card },
  driverName: { color: colors.accent, fontSize: 16, fontWeight: "700" },
  eta: { color: colors.textMuted, marginTop: 4 },
  callButton: { flexDirection: "row", gap: 8, backgroundColor: colors.success, padding: 12, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 12 },
  callText: { color: colors.accent, fontWeight: "700" },
});
