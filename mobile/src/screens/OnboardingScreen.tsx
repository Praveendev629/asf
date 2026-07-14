import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetchAuth } from "../lib/api";
import { getAuth } from "../lib/storage";
import { COLORS } from "../lib/theme";

const STEPS = ["phone", "address"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuth().then(({ token }) => {
      if (token) {
        apiFetchAuth("/api/users/profile", token).then((r) => r.json()).then((d) => {
          const u = d.user;
          if (u?.phone) setPhone(u.phone);
          if (u?.address) {
            setLine1(u.address.line1 || "");
            setLine2(u.address.line2 || "");
            setCity(u.address.city || "");
            setState(u.address.state || "");
            setPincode(u.address.pincode || "");
          }
        });
      }
    });
  }, []);

  const stepIndex = STEPS.indexOf(step);

  function validPhone(p: string) { return /^[0-9]{10}$/.test(p.replace(/\D/g, "")); }

  async function handleFinish() {
    setLoading(true);
    setError("");
    try {
      const { token } = await getAuth();
      if (!token) return;
      const res = await apiFetchAuth("/api/users/profile", token, {
        method: "POST",
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), address: { line1, line2, city, state, pincode } }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      navigation.replace("Main");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Progress Steps */}
      <View style={styles.progress}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.progressItem}>
            <View style={[styles.progressDot, i <= stepIndex ? styles.progressDotActive : styles.progressDotInactive]}>
              {i < stepIndex ? <Ionicons name="checkmark" size={14} color={COLORS.white} /> : <Text style={[styles.progressNum, i <= stepIndex && { color: COLORS.white }]}>{i + 1}</Text>}
            </View>
            {i < STEPS.length - 1 && <View style={[styles.progressLine, i < stepIndex && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        {step === "phone" && (
          <>
            <View style={styles.cardHeader}>
              <Ionicons name="call" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Your delivery number</Text>
            </View>
            <Text style={styles.cardDesc}>We use this to coordinate delivery and share updates about your order.</Text>
            <TextInput style={styles.input} placeholder="10-digit mobile number" placeholderTextColor={COLORS.textMuted} value={phone} onChangeText={setPhone} keyboardType="numeric" maxLength={10} />
            <TouchableOpacity style={[styles.btn, !validPhone(phone) && styles.btnDisabled]} onPress={() => setStep("address")} disabled={!validPhone(phone)}>
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "address" && (
          <>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Delivery address</Text>
            </View>
            <TextInput style={styles.input} placeholder="House / Flat / Street" placeholderTextColor={COLORS.textMuted} value={line1} onChangeText={setLine1} />
            <TextInput style={styles.input} placeholder="Landmark (optional)" placeholderTextColor={COLORS.textMuted} value={line2} onChangeText={setLine2} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="City" placeholderTextColor={COLORS.textMuted} value={city} onChangeText={setCity} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="State" placeholderTextColor={COLORS.textMuted} value={state} onChangeText={setState} />
            </View>
            <TextInput style={styles.input} placeholder="Pincode" placeholderTextColor={COLORS.textMuted} value={pincode} onChangeText={setPincode} keyboardType="numeric" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.backBtn]} onPress={() => setStep("phone")}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1, marginLeft: 8 }, (!line1 || !city || !pincode || loading) && styles.btnDisabled]} onPress={handleFinish} disabled={!line1 || !city || !pincode || loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Confirm & Continue</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: "center" },
  progress: { flexDirection: "row", alignItems: "center", marginBottom: 32 },
  progressItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  progressDot: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  progressDotActive: { backgroundColor: COLORS.primary },
  progressDotInactive: { backgroundColor: COLORS.border },
  progressNum: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted },
  progressLine: { flex: 1, height: 3, backgroundColor: COLORS.border, marginHorizontal: 8, borderRadius: 2 },
  progressLineActive: { backgroundColor: COLORS.primary },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 24 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  cardDesc: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 16, fontSize: 15, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12, color: COLORS.text },
  row: { flexDirection: "row" },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
  backBtn: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  backBtnText: { color: COLORS.text, fontSize: 16, fontWeight: "600" },
  error: { color: COLORS.danger, fontSize: 14, marginBottom: 12 },
});
