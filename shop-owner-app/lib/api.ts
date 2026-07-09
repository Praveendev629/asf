import Constants from "expo-constants";

const API_BASE = Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:10000/api";

// Uploads an image to the backend, which forwards it to Cloudinary.
export async function uploadProductImage(uri: string, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", { uri, name: "product.jpg", type: "image/jpeg" } as any);
  formData.append("folder", "asf-shopee/products");

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  return data.url;
}

export async function createProduct(payload: unknown, token: string) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return res.json();
}
