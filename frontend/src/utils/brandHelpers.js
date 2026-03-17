// src/utils/brandHelpers.js

export function getScore(brand) {
  if (brand?.total_score !== undefined && brand?.total_score !== null) {
    return brand.total_score;
  }
  return null;
}

export function getColor(score) {
  if (score === null || score === undefined) return "rgba(255,255,255,0.2)";
  if (score >= 200) return "#6dbb7a";
  if (score >= 50) return "#a8c5a0";
  if (score >= -49) return "#facc15";
  if (score >= -199) return "#fb923c";
  return "#ef4444";
}

export function getVerdict(score, lang) {
  if (score === null || score === undefined) {
    return { label: "—", emoji: "❓" };
  }

  const it = lang === "it";

  if (score >= 200) {
    return { label: it ? "Profondamente Etico" : "Deeply Ethical", emoji: "🌿" };
  }
  if (score >= 50) {
    return { label: it ? "Abbastanza Etico" : "Fairly Ethical", emoji: "✅" };
  }
  if (score >= -49) {
    return { label: it ? "Parzialmente Etico" : "Partially Ethical", emoji: "⚖️" };
  }
  if (score >= -199) {
    return { label: it ? "Scarsamente Etico" : "Scarcely Ethical", emoji: "⚠️" };
  }

  return {
    label: it ? "Eticamente Inadeguato" : "Ethically Compromised",
    emoji: "🚫",
  };
}

export function getSectorAvgScore(brands) {
  const scored = brands.filter((b) => getScore(b) !== null);
  if (!scored.length) return null;

  return Math.round(
    scored.reduce((sum, b) => sum + getScore(b), 0) / scored.length
  );
}

export function getCatLabel(cat, lang) {
  if (lang === "en" && cat.label_en) return cat.label_en;
  return cat.label;
}

export function getDisplayScore(brand) {
  if (!brand || brand.insufficient_data) return null;

  if (typeof brand.public_score === "number") {
    return brand.public_score;
  }

  return null;
}

export function getDisplayLabel(brand, lang = "en") {
  if (!brand || brand.insufficient_data) {
    return lang === "it" ? "Dati insufficienti" : "Insufficient data";
  }

  if (brand.public_label) return brand.public_label;

  return "";
}

export function getDisplayScoreColor(score) {
  if (score === null || score === undefined) return "rgba(255,255,255,0.2)";
  if (score >= 80) return "#6dbb7a";
  if (score >= 60) return "#a8c5a0";
  if (score >= 40) return "#facc15";
  if (score >= 20) return "#fb923c";
  return "#ef4444";
}

export function getSectorAvgDisplayScore(brands) {
  const scored = brands.filter(
    (b) => typeof b.public_score === "number" && !b.insufficient_data
  );

  if (!scored.length) return null;

  return Math.round(
    scored.reduce((sum, b) => sum + b.public_score, 0) / scored.length
  );
}

export function rawCategoryScoreToPublic(score) {
  if (score === null || score === undefined) return null;

  const clamped = Math.max(-20, Math.min(20, score));
  return Math.round(((clamped + 20) / 40) * 100);
}

export function getSectorAvgDisplayScore(brands) {
  const scored = brands.filter(
    (b) => typeof b.public_score === "number" && !b.insufficient_data
  );

  if (!scored.length) return null;

  return Math.round(
    scored.reduce((sum, b) => sum + b.public_score, 0) / scored.length
  );
}
