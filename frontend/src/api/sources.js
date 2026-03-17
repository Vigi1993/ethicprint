// src/api/sources.js
import { apiRequest } from "./http";

export async function getPublicSourcesCount() {
  const data = await apiRequest("/sources/public", {
    fallback: { total: 0 },
  });

  if (!data || typeof data !== "object") return 0;
  return typeof data.total === "number" ? data.total : 0;
}
