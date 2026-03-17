// src/api/categories.js
import { apiRequest } from "./http";

function normalizeCategory(category) {
  if (!category || typeof category !== "object") {
    return null;
  }

  return {
    key: category.key ?? "",
    label: category.label ?? "",
    label_en: category.label_en ?? "",
    description: category.description ?? "",
    description_en: category.description_en ?? "",
    icon: category.icon ?? "•",
  };
}

export async function getCategories() {
  const data = await apiRequest("/categories", {
    fallback: [],
  });

  if (!Array.isArray(data)) return [];
  return data.map(normalizeCategory).filter(Boolean);
}
