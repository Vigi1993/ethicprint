// src/api/brands.js
import { apiRequest } from "./http";

function normalizeAlternative(alt) {
  if (!alt || typeof alt !== "object") return null;

  return {
    id: alt.id ?? null,
    name: alt.name ?? "",
    sector: alt.sector ?? "",
    sector_icon: alt.sector_icon ?? "",
    parent: alt.parent ?? alt.parent_company ?? "",
    total_score:
      typeof alt.total_score === "number"
        ? alt.total_score
        : typeof alt.score === "number"
          ? alt.score
          : null,
    score:
      typeof alt.score === "number"
        ? alt.score
        : typeof alt.total_score === "number"
          ? alt.total_score
          : null,
    logo: alt.logo ?? alt.sector_icon ?? "🏢",
    scores:
      alt.scores && typeof alt.scores === "object" ? alt.scores : {},
    notes:
      alt.notes && typeof alt.notes === "object" ? alt.notes : {},
    sources:
      alt.sources && typeof alt.sources === "object" ? alt.sources : {},
    confidence:
      alt.confidence && typeof alt.confidence === "object" ? alt.confidence : {},
    alternatives: Array.isArray(alt.alternatives)
      ? alt.alternatives.map(normalizeAlternative).filter(Boolean)
      : [],
    impact_summary: alt.impact_summary ?? "",
    insufficient_data: Boolean(alt.insufficient_data),
    criteria_published:
      typeof alt.criteria_published === "number" ? alt.criteria_published : 0,
  };
}

function normalizeBrandSummary(brand) {
  if (!brand || typeof brand !== "object") {
    return null;
  }

  return {
    id: brand.id ?? null,
    name: brand.name ?? "",
    sector: brand.sector ?? "",
    sector_icon: brand.sector_icon ?? "",
    total_score:
      typeof brand.total_score === "number" ? brand.total_score : null,
    parent: brand.parent ?? brand.parent_company ?? "",
    logo: brand.logo ?? brand.sector_icon ?? "🏢",
    logo_url: brand.logo_url ?? null,
    scores:
      brand.scores && typeof brand.scores === "object" ? brand.scores : {},
    notes:
      brand.notes && typeof brand.notes === "object" ? brand.notes : {},
    sources:
      brand.sources && typeof brand.sources === "object" ? brand.sources : {},
    confidence:
      brand.confidence && typeof brand.confidence === "object"
        ? brand.confidence
        : {},
    alternatives: Array.isArray(brand.alternatives)
      ? brand.alternatives.map(normalizeAlternative).filter(Boolean)
      : [],
    impact_summary: brand.impact_summary ?? "",
    insufficient_data: Boolean(brand.insufficient_data),
    criteria_published:
      typeof brand.criteria_published === "number" ? brand.criteria_published : 0,
  };
}

function normalizeBrandDetail(brand) {
  return normalizeBrandSummary(brand);
}

export async function getBrands(lang = "en") {
  const data = await apiRequest("/brands", {
    query: { lang },
    fallback: [],
  });

  if (!Array.isArray(data)) return [];
  return data.map(normalizeBrandSummary).filter(Boolean);
}

export async function getBrandDetail(id, lang = "en") {
  if (!id) return null;

  const data = await apiRequest(`/brands/${id}`, {
    query: { lang },
    fallback: null,
  });

  return normalizeBrandDetail(data);
}
