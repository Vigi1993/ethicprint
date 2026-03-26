// src/api/sources.js
import { apiRequest } from "./http";
import { API_BASE_URL } from "./config";

export async function getRecentSourceUpdates(limit = 20) {
  try {
    const res = await fetch(`${API_BASE_URL}/recent-source-updates?limit=${limit}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getPublicSourcesCount() {
  const data = await apiRequest("/sources/public", {
    fallback: { total: 0 },
  });

  if (!data || typeof data !== "object") return 0;
  return typeof data.total === "number" ? data.total : 0;
}
