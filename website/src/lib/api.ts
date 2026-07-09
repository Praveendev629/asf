const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10000/api";

async function request(path: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getProducts: (params?: string) => request(`/products${params ? `?${params}` : ""}`),
  getProduct: (id: string) => request(`/products/${id}`),
  createOrder: (body: unknown, token: string) =>
    request("/orders", { method: "POST", body: JSON.stringify(body) }, token),
  getOrders: (token: string) => request("/orders", {}, token),
};
