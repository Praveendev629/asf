const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_URL}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "Cache-Control": "no-store",
    },
  });
}
