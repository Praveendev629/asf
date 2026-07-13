import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { apiFetchAuth } from "../lib/api";
import { getAuth } from "../lib/storage";

export default function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState<"phone" | "address">("phone");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    try {
      const { token } = await getAuth();
      if (!token) return;
      const res = await apiFetchAuth("/api/users/profile", token, {
        method: "POST",
        body: JSON.stringify({ phone, address: { line1, city, state, pincode } }),
      });
      if (!res.ok) throw new Error("Failed");
      navigation.replace("Main");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === "phone" ? "Your Phone Number" : "Delivery Address"}</Text>

      {step === "phone" ? (
        <>
          <TextInput style={styles.input} placeholder="10-digit mobile number" value={phone} onChangeText={setPhone} keyboardType="numeric" maxLength={10} />
          <TouchableOpacity style={styles.btn} onPress={() => phone.length === 10 && setStep("address")} disabled={phone.length !== 10}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput style={styles.input} placeholder="House / Street" value={line1} onChangeText={setLine1} />
          <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
          <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
          <TextInput style={styles.input} placeholder="Pincode" value={pincode} onChangeText={setPincode} keyboardType="numeric" />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.backBtn]} onPress={() => setStep("phone")}><Text style={styles.backText}>Back</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleFinish} disabled={!line1 || !city || !pincode || loading}>
              <Text style={styles.btnText}>{loading ? "Saving..." : "Continue"}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 24, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 24 },
  input: { backgroundColor: "white", borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 12 },
  btn: { backgroundColor: "#059669", borderRadius: 12, padding: 16, alignItems: "center" },
  btnText: { color: "white", fontSize: 16, fontWeight: "600" },
  backBtn: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", flex: 1, marginRight: 12 },
  backText: { color: "#111827", fontSize: 16, fontWeight: "600" },
  row: { flexDirection: "row" },
});
