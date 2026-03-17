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
