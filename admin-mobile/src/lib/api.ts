import { API_URL } from "../config";

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
}
