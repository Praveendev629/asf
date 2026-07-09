import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { colors } from "../../lib/theme";

// User pins their exact delivery location; lat/lng + address are saved
// to Firestore under users/{uid}/addresses.
export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion((r) => ({ ...r, latitude: loc.coords.latitude, longitude: loc.coords.longitude }));
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker coordinate={region} draggable />
      </MapView>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          // TODO: save { lat: region.latitude, lng: region.longitude } to Firestore
          router.replace("/");
        }}
      >
        <Text style={styles.saveText}>Save this location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  saveButton: { position: "absolute", bottom: 24, left: 24, right: 24, backgroundColor: colors.secondary, padding: 16, borderRadius: 10, alignItems: "center" },
  saveText: { color: colors.accent, fontWeight: "700" },
});
