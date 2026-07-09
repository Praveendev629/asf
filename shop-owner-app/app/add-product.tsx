import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { uploadProductImage, createProduct } from "../lib/api";

export default function AddProductScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "", category: "", description: "", actualPrice: "", discountPrice: "", stock: "", weight: "", brand: "",
  });

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setImages((prev) => [...prev, result.assets[0].uri]);
  }

  async function handleUpload() {
    // 1) Upload each local image to Cloudinary via the backend
    // 2) Create the product document — it then appears automatically on
    //    the website, customer app, and admin app (shared Firestore).
    const token = "FIREBASE_ID_TOKEN"; // obtained from Firebase Auth session
    const uploadedUrls = await Promise.all(images.map((uri) => uploadProductImage(uri, token)));
    await createProduct({ ...form, images: uploadedUrls }, token);
  }

  const field = (key: keyof typeof form, placeholder: string, keyboardType: "default" | "numeric" = "default") => (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={keyboardType}
      value={form[key]}
      onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
    />
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Ionicons name="camera-outline" size={24} color={colors.secondary} />
        <Text style={styles.imagePickerText}>Add Product Images</Text>
      </TouchableOpacity>

      <View style={styles.imageRow}>
        {images.map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.thumb} />
        ))}
      </View>

      {field("name", "Product Name")}
      {field("category", "Category")}
      {field("brand", "Brand")}
      {field("description", "Description")}
      {field("actualPrice", "Actual Price", "numeric")}
      {field("discountPrice", "Discount Price", "numeric")}
      {field("stock", "Stock", "numeric")}
      {field("weight", "Weight (kg)", "numeric")}

      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
        <Ionicons name="cloud-upload-outline" size={18} color={colors.accent} />
        <Text style={styles.uploadText}>Upload Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  imagePicker: { flexDirection: "row", gap: 8, backgroundColor: colors.card, padding: 16, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  imagePickerText: { color: colors.accent },
  imageRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  input: { backgroundColor: colors.card, color: colors.accent, borderRadius: 10, padding: 12 },
  uploadBtn: { flexDirection: "row", gap: 8, backgroundColor: colors.secondary, padding: 14, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 8 },
  uploadText: { color: colors.accent, fontWeight: "700" },
});
