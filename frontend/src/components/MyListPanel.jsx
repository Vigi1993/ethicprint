import { useMemo, useState } from "react";
import { useCategories } from "../context/categoriesContext";
import {
  getCatLabel,
  getDisplayScore,
  getDisplayLabel,
  getDisplayScoreColor,
  rawCategoryScoreToPublic,
} from "../utils/brandHelpers";

// ─── Google Fonts injection (Bebas Neue + Playfair Display) ───────────────────
if (typeof document !== "undefined" && !document.getElementById("ep-fonts")) {
  const link = document.createElement("link");
  link.id = "ep-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500&display=swap";
  document.head.appendChild(link);
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  paper: "#E8E4D8",
  paperDark: "#DDD8C8",
  ink: "#1C1409",
  inkMid: "#5a4830",
  inkLight: "#9a8870",
  inkFaint: "#c8bfaa",
  white: "#FFFFFF",
  offWhite: "#F5F1E8",
  red: "#B8301F",
  redLight: "#F5E8E6",
  amber: "#C8860A",
  amberLight: "#FBF0D8",
  green: "#1A6B45",
  greenLight: "#E0F0E8",
  border: "#ccc4b0",
  borderLight: "#ddd8c8",
};

const F = {
  display: "'Bebas Neue', sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

// ─── Score color (maps to paper palette, not dark palette) ───────────────────
function scoreColor(score) {
  if (score === null || score === undefined) return T.inkLight;
  if (score >= 65) return T.green;
  if (score >= 45) return T.amber;
  return T.red;
}

// ─── Shared micro-components ─────────────────────────────────────────────────

function ScoreBadge({ score, size = "md" }) {
  const color = scoreColor(score);
  const sizes = {
    sm: { fontSize: 16, padding: "2px 8px", minWidth: 38 },
    md: { fontSize: 22, padding: "2px 10px", minWidth: 48 },
    lg: { fontSize: 28, padding: "3px 12px", minWidth: 58 },
  };
  const s = sizes[size];
  return (
    <span
      style={{
        fontFamily: F.display,
        fontSize: s.fontSize,
        padding: s.padding,
        minWidth: s.minWidth,
        textAlign: "center",
        background: color,
        color: "#fff",
        borderRadius: 2,
        display: "inline-block",
        lineHeight: 1.15,
        flexShrink: 0,
      }}
    >
      {score ?? "—"}
    </span>
  );
}

function ScoreBar({ score, color }) {
  const pct = score != null ? Math.max(2, score) : 0;
  const c = color || scoreColor(score);
  return (
    <div
      style={{
        background: T.paperDark,
        height: 3,
        borderRadius: 1,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: c,
          borderRadius: 1,
          transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

function SectionHeader({ label, count, variant }) {
  const bg = variant === "red" ? T.red : variant === "green" ? T.green : T.ink;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 14px",
        background: bg,
        borderRadius: "2px 2px 0 0",
      }}
    >
      <span
        style={{
          fontFamily: F.display,
          fontSize: 18,
          letterSpacing: "0.06em",
          color: "#fff",
          flex: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: F.display,
          fontSize: 24,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </div>
  );
}

function RemoveBtn({ onClick, name }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Remove ${name}`}
      style={{
        background: "none",
        border: "none",
        color: T.inkFaint,
        cursor: "pointer",
        fontSize: 16,
        lineHeight: 1,
        padding: 0,
        flexShrink: 0,
      }}
    >
      ×
    </button>
  );
}

// ─── Helper functions (identical logic, unchanged) ───────────────────────────

const CATEGORY_HINTS = {
  en: [
    { key: "grocery", label: "Grocery", terms: ["grocery", "supermarket", "gdo", "retail", "food"] },
    { key: "fashion", label: "Fashion", terms: ["fashion", "clothing", "apparel", "luxury"] },
    { key: "energy", label: "Energy", terms: ["energy", "utility", "oil", "gas", "power"] },
    { key: "tech", label: "Tech", terms: ["tech", "technology", "electronics", "software", "platform"] },
    { key: "social", label: "Social", terms: ["social", "media", "platform", "streaming", "internet"] },
  ],
  it: [
    { key: "grocery", label: "GDO", terms: ["grocery", "supermarket", "gdo", "retail", "food"] },
    { key: "fashion", label: "Moda", terms: ["fashion", "clothing", "apparel", "luxury"] },
    { key: "energy", label: "Energia", terms: ["energy", "utility", "oil", "gas", "power"] },
    { key: "tech", label: "Tech", terms: ["tech", "technology", "electronics", "software", "platform"] },
    { key: "social", label: "Social", terms: ["social", "media", "platform", "streaming", "internet"] },
  ],
};

function normalize(text) {
  return String(text || "").toLowerCase().trim();
}

function matchesHint(brand, hint) {
  const haystack = [brand?.name, brand?.sector, brand?.sector_icon, brand?.description, brand?.parent_company]
    .filter(Boolean).join(" ").toLowerCase();
  return hint.terms.some((term) => haystack.includes(term));
}

function getWorstCategory(brand, categories) {
  if (!brand?.scores) return null;
  const scored = categories
    .map((cat) => {
      const raw = brand.scores?.[cat.key];
      const publicScore = typeof raw === "number" ? rawCategoryScoreToPublic(raw) : null;
      return { cat, raw, publicScore };
    })
    .filter((item) => typeof item.publicScore === "number");
  if (!scored.length) return null;
  scored.sort((a, b) => a.publicScore - b.publicScore);
  return scored[0];
}

function getIssueLabel(brand, categories, lang) {
  if (brand?.insufficient_data) return lang === "it" ? "Dati insufficienti" : "Insufficient data";
  const worst = getWorstCategory(brand, categories);
  if (!worst) return lang === "it" ? "Criticità etiche" : "Ethical concerns";
  return getCatLabel(worst.cat, lang);
}

function getIssueExplanation(brand, categories, lang) {
  if (brand?.insufficient_data)
    return lang === "it"
      ? "Non ci sono ancora abbastanza fonti pubblicate per valutarlo bene."
      : "There aren't enough published sources yet to assess it properly.";
  const worst = getWorstCategory(brand, categories);
  const key = worst?.cat?.key;
  const copy = {
    it: {
      environment: "Impatto ambientale debole rispetto ad alternative migliori.",
      labor: "Possibili criticità su lavoro, filiera o condizioni produttive.",
      conflicts: "Possibile esposizione a conflitti o aree controverse.",
      transparency: "Trasparenza limitata su filiera, pratiche o governance.",
      animals: "Possibili criticità su benessere animale o materiali usati.",
      default: "Questo brand mostra segnali etici più deboli del previsto.",
    },
    en: {
      environment: "Weaker environmental performance than better alternatives.",
      labor: "Possible concerns around labor, supply chain, or production conditions.",
      conflicts: "Possible exposure to conflicts or controversial areas.",
      transparency: "Limited transparency on supply chain, practices, or governance.",
      animals: "Possible concerns around animal welfare or materials used.",
      default: "This brand shows weaker ethical signals than stronger alternatives.",
    },
  };
  return copy[lang]?.[key] || copy[lang]?.default || copy.en.default;
}

function getImpactCopy(brand, categories, lang) {
  if (brand?.insufficient_data)
    return lang === "it"
      ? "Usandolo continui a sostenere un brand che oggi non è ancora valutabile con abbastanza evidenza pubblica."
      : "Using it still supports a brand that cannot yet be assessed with enough public evidence.";
  const worst = getWorstCategory(brand, categories);
  const key = worst?.cat?.key;
  const copy = {
    it: {
      environment: "Usandolo continui a sostenere un modello con impatto ambientale più debole del necessario.",
      labor: "Usandolo continui a sostenere possibili criticità su lavoro, filiera o produzione.",
      conflicts: "Usandolo continui a sostenere possibili legami con aree o dinamiche controverse.",
      transparency: "Usandolo continui a sostenere un brand meno trasparente su pratiche e filiera.",
      animals: "Usandolo continui a sostenere possibili criticità su materiali o benessere animale.",
      default: "Usandolo continui a sostenere un brand con segnali etici più deboli di alternative migliori.",
    },
    en: {
      environment: "Using it continues to support a weaker environmental model than necessary.",
      labor: "Using it continues to support possible labor, supply chain, or production concerns.",
      conflicts: "Using it continues to support possible links to controversial areas or dynamics.",
      transparency: "Using it continues to support a brand with lower transparency on practices and supply chain.",
      animals: "Using it continues to support possible concerns around materials or animal welfare.",
      default: "Using it continues to support a brand with weaker ethical signals than better alternatives.",
    },
  };
  return copy[lang]?.[key] || copy[lang]?.default || copy.en.default;
}

function getAlternativeName(alt) {
  if (!alt) return null;
  if (typeof alt === "string") return alt;
  return alt.name || alt.brand_name || alt.title || null;
}

function getAlternativeScore(alt) {
  if (!alt || typeof alt === "string") return null;
  if (typeof alt.public_score === "number") return alt.public_score;
  if (typeof alt.score === "number") return alt.score;
  return null;
}

function getTopAlternative(brand) {
  if (!Array.isArray(brand?.alternatives) || !brand.alternatives.length) return null;
  return brand.alternatives[0];
}

function getAlternativeDelta(brand) {
  const current = getDisplayScore(brand);
  const topAlt = getTopAlternative(brand);
  const altScore = getAlternativeScore(topAlt);
  if (typeof current !== "number" || typeof altScore !== "number") return null;
  const delta = altScore - current;
  return delta > 0 ? delta : null;
}

function findAlternativeInDb(brand, db) {
  const topAlt = getTopAlternative(brand);
  const altName = normalize(getAlternativeName(topAlt));
  if (!altName || !Array.isArray(db)) return null;
  return db.find((item) => normalize(item.name) === altName) || null;
}

function getCategoryPublicScoreMap(brand, categories) {
  const map = {};
  categories.forEach((cat) => {
    const raw = brand?.scores?.[cat.key];
    map[cat.key] = typeof raw === "number" ? rawCategoryScoreToPublic(raw) : null;
  });
  return map;
}

function getAlternativeAdvantages(currentBrand, alternativeBrand, categories, lang) {
  if (!currentBrand || !alternativeBrand) return [];
  const currentScores = getCategoryPublicScoreMap(currentBrand, categories);
  const altScores = getCategoryPublicScoreMap(alternativeBrand, categories);
  return categories
    .map((cat) => {
      const current = currentScores[cat.key];
      const alt = altScores[cat.key];
      if (typeof current !== "number" || typeof alt !== "number") return null;
      return { key: cat.key, label: getCatLabel(cat, lang), delta: alt - current };
    })
    .filter(Boolean)
    .filter((item) => item.delta >= 8)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);
}

function getAlternativeAdvantageCopy(currentBrand, alternativeBrand, categories, lang) {
  const improvements = getAlternativeAdvantages(currentBrand, alternativeBrand, categories, lang);
  if (!improvements.length)
    return lang === "it" ? "Alternativa con segnali etici più solidi." : "Alternative with stronger ethical signals.";
  if (improvements.length === 1)
    return lang === "it"
      ? `Più forte su ${improvements[0].label.toLowerCase()}.`
      : `Stronger on ${improvements[0].label.toLowerCase()}.`;
  return lang === "it"
    ? `Più forte su ${improvements[0].label.toLowerCase()} e ${improvements[1].label.toLowerCase()}.`
    : `Stronger on ${improvements[0].label.toLowerCase()} and ${improvements[1].label.toLowerCase()}.`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MyListPanel({ myBrands, db, onAdd, onReplace, onRemove, onClear, onSelect, lang, ui, threshold }) {
  const categories = useCategories();
  const t = ui[lang] || ui.en;

  const [localQuery, setLocalQuery] = useState("");
  const [activeHintKey, setActiveHintKey] = useState(null);

  const hints = CATEGORY_HINTS[lang] || CATEGORY_HINTS.en;

  // ── Score aggregation (unchanged logic) ────────────────────────────────────
  const avgScores = {};
  const avgScoreCounts = {};
  categories.forEach((c) => { avgScores[c.key] = 0; avgScoreCounts[c.key] = 0; });

  if (myBrands.length > 0) {
    myBrands.forEach((b) => {
      categories.forEach((c) => {
        const raw = b.scores?.[c.key];
        if (typeof raw === "number") { avgScores[c.key] += raw; avgScoreCounts[c.key] += 1; }
      });
    });
    categories.forEach((c) => {
      avgScores[c.key] = avgScoreCounts[c.key] > 0 ? Math.round(avgScores[c.key] / avgScoreCounts[c.key]) : null;
    });
  }

  const displayScores = myBrands.filter((b) => typeof b.public_score === "number" && !b.insufficient_data);
  const publicAverage = displayScores.length
    ? Math.round(displayScores.reduce((sum, b) => sum + b.public_score, 0) / displayScores.length)
    : null;

  const problematic = myBrands.filter((b) => {
    const score = getDisplayScore(b);
    return !b.insufficient_data && score !== null && score < threshold;
  });
  const insufficient = myBrands.filter((b) => b.insufficient_data);
  const positive = myBrands.filter((b) => {
    const score = getDisplayScore(b);
    return !b.insufficient_data && score !== null && score >= threshold;
  });

  const isEmpty = myBrands.length === 0;
  const trackedNames = useMemo(() => new Set(myBrands.map((b) => normalize(b.name))), [myBrands]);
  const activeHint = hints.find((h) => h.key === activeHintKey) || null;

  const addResults = useMemo(() => {
    const cleanQuery = normalize(localQuery);
    let pool = Array.isArray(db) ? [...db] : [];
    pool = pool.filter((brand) => !trackedNames.has(normalize(brand.name)));
    if (activeHint) pool = pool.filter((brand) => matchesHint(brand, activeHint));
    if (cleanQuery) {
      pool = pool.filter((brand) => {
        const haystack = [brand?.name, brand?.sector, brand?.description, brand?.parent_company]
          .filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(cleanQuery);
      });
    }
    return pool.sort((a, b) => (getDisplayScore(b) ?? -1) - (getDisplayScore(a) ?? -1)).slice(0, 6);
  }, [db, trackedNames, localQuery, activeHint]);

  const shouldShowResults = localQuery.trim().length > 0 || activeHint !== null;
  const avgScoreColor = scoreColor(publicAverage);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: F.sans, background: T.paper }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: T.ink,
          padding: "20px 18px 16px",
          marginBottom: 14,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative circle */}
        <div style={{
          position: "absolute", bottom: -20, right: -20,
          width: 100, height: 100,
          background: T.red, opacity: 0.1, borderRadius: "50%",
          pointerEvents: "none",
        }} />

        <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6b5e48", marginBottom: 14, fontFamily: F.sans }}>
          {t.my_list_title || "EthicPrint · your ethical footprint"}
        </div>

        {/* Score number */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 4, marginBottom: 0 }}>
          <span style={{ fontFamily: F.display, fontSize: 88, color: "#EDE8DC", lineHeight: 0.88, letterSpacing: "0.01em" }}>
            {publicAverage ?? "—"}
          </span>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 8, gap: 4 }}>
            <span style={{ fontFamily: F.display, fontSize: 26, color: "#5a4a32", lineHeight: 1 }}>/100</span>
            {publicAverage !== null && (
              <span style={{
                background: avgScoreColor,
                color: "#fff",
                fontFamily: F.display,
                fontSize: 12,
                letterSpacing: "0.06em",
                padding: "3px 8px",
                display: "inline-block",
                transform: "rotate(-1.5deg)",
              }}>
                {getDisplayLabel({ public_score: publicAverage, insufficient_data: false }, lang)}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#2e2010", height: 4, borderRadius: 1, margin: "12px 0 10px" }}>
          <div style={{ width: `${publicAverage ?? 0}%`, height: "100%", background: avgScoreColor, borderRadius: 1, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
        </div>

        {/* Summary insight */}
        {!isEmpty && (
          <div style={{ fontSize: 12, color: "#7a6648", lineHeight: 1.6, fontFamily: F.sans }}>
            <span style={{ color: "#c9b898", fontWeight: 500 }}>{myBrands.length}</span>
            {" "}{lang === "it" ? "brand monitorati" : "brands tracked"}{" · "}
            <span style={{ color: "#c9b898", fontWeight: 500 }}>{problematic.length}</span>
            {" "}{lang === "it" ? "richiedono attenzione" : "need attention"}
          </div>
        )}

        {isEmpty && (
          <div style={{ fontSize: 12, color: "#7a6648", fontStyle: "italic", fontFamily: F.sans }}>
            {lang === "it" ? "Inizia ad aggiungere brand per vedere la tua impronta." : "Add brands to see your ethical footprint."}
          </div>
        )}

        {/* Category pills */}
        {!isEmpty && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {categories.map((cat) => {
              const pubCatScore = typeof avgScores[cat.key] === "number" ? rawCategoryScoreToPublic(avgScores[cat.key]) : null;
              const c = scoreColor(pubCatScore);
              return (
                <div key={cat.key} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 2,
                  fontFamily: F.sans,
                }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{cat.icon}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{getCatLabel(cat, lang)}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: pubCatScore != null ? c : "rgba(255,255,255,0.3)" }}>{pubCatScore ?? "—"}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Clear + how scores work */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 8 }}>
          <a href="/sources.html" style={{ fontSize: 11, color: "rgba(200,182,130,0.7)", textDecoration: "none", fontFamily: F.sans, letterSpacing: "0.02em" }}>
            {lang === "it" ? "Come funzionano i punteggi? →" : "How do scores work? →"}
          </a>
          {!isEmpty && (
            <button onClick={onClear} style={{
              background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.5)",
              padding: "6px 10px",
              borderRadius: 2,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: F.sans,
              letterSpacing: "0.04em",
            }}>
              {t.clear_list}
            </button>
          )}
        </div>
      </div>

      {/* ── BRAND SECTIONS ─────────────────────────────────────────────────── */}
      {!isEmpty && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* NEEDS ATTENTION */}
          <div>
            <SectionHeader
              label={lang === "it" ? "Richiedono attenzione" : "Needs attention"}
              count={problematic.length}
              variant="red"
            />
            {problematic.length === 0 ? (
              <div style={{ background: T.offWhite, border: `0.5px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 2px 2px", padding: "12px 14px", fontSize: 13, color: T.inkLight, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Nessun brand problematico per ora." : "No problematic brands for now."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {problematic.map((b, i) => {
                  const displayScore = getDisplayScore(b);
                  const issueLabel = getIssueLabel(b, categories, lang);
                  const issueExplanation = getIssueExplanation(b, categories, lang);
                  const impactCopy = getImpactCopy(b, categories, lang);
                  const topAlternative = getTopAlternative(b);
                  const alternativeName = getAlternativeName(topAlternative);
                  const alternativeDelta = getAlternativeDelta(b);
                  const replaceBrand = findAlternativeInDb(b, db);
                  const advantageCopy = replaceBrand ? getAlternativeAdvantageCopy(b, replaceBrand, categories, lang) : null;
                  const isLast = i === problematic.length - 1;

                  return (
                    <div
                      key={b.name}
                      style={{
                        background: T.white,
                        border: `0.5px solid ${T.border}`,
                        borderTop: "none",
                        borderRadius: isLast ? "0 0 2px 2px" : 0,
                        padding: 0,
                      }}
                    >
                      {/* inner card */}
                      <div
                        style={{
                          margin: 12,
                          background: T.offWhite,
                          border: `0.5px solid ${T.borderLight}`,
                          borderRadius: 1,
                          padding: "14px",
                          cursor: "pointer",
                        }}
                        onClick={() => onSelect(b)}
                      >
                        {/* brand row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <span style={{ fontSize: 14, color: T.red, minWidth: 16, fontFamily: F.sans }}>!</span>
                          <span style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 900, color: T.ink, flex: 1, letterSpacing: "-0.01em" }}>
                            {b.name}
                          </span>
                          <ScoreBadge score={displayScore} size="md" />
                        </div>

                        <ScoreBar score={displayScore} />

                        {/* issue */}
                        <div style={{ fontSize: 10, color: T.red, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3, fontWeight: 500, fontFamily: F.sans }}>
                          {issueLabel}
                        </div>
                        <div style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.55, marginBottom: 8, fontFamily: F.sans }}>
                          {issueExplanation}
                        </div>

                        {/* impact */}
                        <div style={{ fontSize: 12, color: T.inkLight, lineHeight: 1.5, marginBottom: alternativeName ? 12 : 0, fontFamily: F.sans }}>
                          <span style={{ color: T.inkFaint }}>{lang === "it" ? "Il tuo impatto: " : "Your impact: "}</span>
                          {impactCopy}
                        </div>

                        {/* alternative */}
                        {alternativeName && (
                          <div>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 8,
                              marginBottom: 10, padding: "8px 10px",
                              background: T.greenLight,
                              borderLeft: `3px solid ${T.green}`,
                              borderRadius: "0 2px 2px 0",
                            }}>
                              <span style={{ fontSize: 11, color: T.inkLight, flex: 1, fontFamily: F.sans }}>
                                {lang === "it" ? "Alternativa migliore" : "Better alternative"}
                              </span>
                              <span style={{ fontFamily: F.serif, fontSize: 14, fontWeight: 900, color: T.ink }}>{alternativeName}</span>
                              {getAlternativeScore(topAlternative) && (
                                <span style={{ fontFamily: F.display, fontSize: 18, color: T.green }}>
                                  {getAlternativeScore(topAlternative)}
                                </span>
                              )}
                            </div>
                            {advantageCopy && (
                              <div style={{ fontSize: 11, color: T.inkLight, marginBottom: 10, fontStyle: "italic", fontFamily: F.sans }}>
                                {advantageCopy}
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              {alternativeDelta !== null && (
                                <span style={{
                                  fontSize: 11, color: T.green,
                                  border: `0.5px solid ${T.green}`,
                                  padding: "3px 8px", borderRadius: 2,
                                  fontFamily: F.sans,
                                }}>
                                  +{alternativeDelta} {lang === "it" ? "punti" : "points"}
                                </span>
                              )}
                              {replaceBrand && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onReplace(b, replaceBrand); }}
                                  style={{
                                    background: T.ink, color: "#EDE8DC",
                                    border: "none", borderRadius: 2,
                                    padding: "8px 12px",
                                    fontFamily: F.display, fontSize: 13,
                                    letterSpacing: "0.06em", cursor: "pointer",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {lang === "it" ? `Sostituisci con ${replaceBrand.name}` : `Replace with ${replaceBrand.name}`} →
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); onSelect(b); }}
                                style={{
                                  background: "transparent", color: T.inkLight,
                                  border: `0.5px solid ${T.border}`, borderRadius: 2,
                                  padding: "7px 10px",
                                  fontFamily: F.sans, fontSize: 11,
                                  cursor: "pointer", whiteSpace: "nowrap",
                                }}
                              >
                                {lang === "it" ? "Apri dettagli →" : "Open details →"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* remove row */}
                      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 12px 10px" }}>
                        <RemoveBtn onClick={(e) => { e.stopPropagation(); onRemove(b.name); }} name={b.name} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* NOT ENOUGH EVIDENCE */}
          <div>
            <SectionHeader
              label={lang === "it" ? "Evidenza limitata" : "Not enough evidence"}
              count={insufficient.length}
              variant="dark"
            />
            {insufficient.length === 0 ? (
              <div style={{ background: T.offWhite, border: `0.5px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 2px 2px", padding: "12px 14px", fontSize: 13, color: T.inkLight, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Tutti i brand hanno abbastanza elementi per una valutazione." : "All tracked brands have enough evidence for an assessment."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {insufficient.map((b, i) => {
                  const isLast = i === insufficient.length - 1;
                  return (
                    <div
                      key={b.name}
                      onClick={() => onSelect(b)}
                      style={{
                        background: T.offWhite,
                        border: `0.5px dashed ${T.border}`,
                        borderTop: "none",
                        borderRadius: isLast ? "0 0 2px 2px" : 0,
                        padding: "12px 14px",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: T.inkLight, marginBottom: 3 }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: 12, color: T.inkFaint, lineHeight: 1.5, fontStyle: "italic", fontFamily: F.sans }}>
                          {lang === "it"
                            ? "Non ci sono ancora abbastanza fonti pubbliche per valutarlo bene."
                            : "There isn't enough public evidence yet to assess it properly."}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: T.inkFaint, border: `0.5px dashed ${T.border}`, padding: "3px 8px", borderRadius: 2, fontFamily: F.sans, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
                        no data
                      </span>
                      <RemoveBtn onClick={(e) => { e.stopPropagation(); onRemove(b.name); }} name={b.name} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STRONGER BRANDS */}
          <div>
            <SectionHeader
              label={lang === "it" ? "Brand solidi" : "Stronger brands"}
              count={positive.length}
              variant="green"
            />
            {positive.length === 0 ? (
              <div style={{ background: T.offWhite, border: `0.5px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 2px 2px", padding: "12px 14px", fontSize: 13, color: T.inkLight, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Nessun brand positivo ancora." : "No positive brands yet."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {positive.map((b, i) => {
                  const displayScore = getDisplayScore(b);
                  const isLast = i === positive.length - 1;
                  return (
                    <div
                      key={b.name}
                      onClick={() => onSelect(b)}
                      style={{
                        background: T.greenLight,
                        border: `0.5px solid ${T.border}`,
                        borderTop: "none",
                        borderRadius: isLast ? "0 0 2px 2px" : 0,
                        padding: "10px 14px",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 11, color: T.green, fontWeight: 500, minWidth: 12, fontFamily: F.sans }}>✓</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: 11, color: T.inkLight, marginTop: 1, fontFamily: F.sans }}>
                          {getDisplayLabel(b, lang)}
                        </div>
                      </div>
                      <ScoreBadge score={displayScore} size="sm" />
                      <RemoveBtn onClick={(e) => { e.stopPropagation(); onRemove(b.name); }} name={b.name} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── EMPTY STATE ────────────────────────────────────────────────────── */}
      {isEmpty && (
        <div style={{ padding: "4px 0 16px" }}>
          <div style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 900, color: T.ink, lineHeight: 1.35, marginBottom: 8 }}>
            {lang === "it"
              ? "Inizia dai brand che usi davvero ogni settimana."
              : "Start with the brands you actually use every week."}
          </div>
          <div style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.65, marginBottom: 6, fontFamily: F.sans }}>
            {lang === "it"
              ? "Ti mostreremo il loro giudizio etico, cosa non va quando emergono criticità, e alternative migliori quando servono."
              : "We'll show their ethical standing, what's problematic when issues emerge, and better alternatives when needed."}
          </div>
          <div style={{ fontSize: 12, color: T.inkLight, lineHeight: 1.5, fontFamily: F.sans }}>
            {lang === "it"
              ? "Dopo averli aggiunti, puoi cliccare su ogni brand per vedere fonti, note e dettagli del punteggio."
              : "Once added, you can click any brand to see sources, notes, and scoring details."}
          </div>
        </div>
      )}

      {/* ── ADD BRANDS SECTION ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: F.serif, fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
          {lang === "it" ? "Aggiungi brand che usi" : "Add brands you use"}
        </div>
        <div style={{ fontSize: 12, color: T.inkLight, marginBottom: 10, fontFamily: F.sans }}>
          {lang === "it"
            ? "Inizia da 3–5 brand che usi davvero: ti daranno una footprint più utile."
            : "Start with 3–5 brands you actually use for a more useful footprint."}
        </div>

        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: T.white, border: `0.5px solid ${T.border}`,
          borderRadius: 2, padding: "9px 12px", marginBottom: 10,
        }}>
          <input
            value={localQuery}
            onChange={(e) => { setLocalQuery(e.target.value); if (activeHintKey) setActiveHintKey(null); }}
            placeholder={lang === "it" ? "Cerca un brand..." : "Search a brand..."}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: T.ink, fontSize: 13, fontFamily: F.sans,
            }}
          />
          {(localQuery || activeHintKey) && (
            <button
              onClick={() => { setLocalQuery(""); setActiveHintKey(null); }}
              style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Hint pills */}
        <div style={{ fontSize: 11, color: T.inkLight, marginBottom: 8, fontFamily: F.sans }}>
          {lang === "it" ? "Per iniziare, prova da qui:" : "A good place to start:"}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: shouldShowResults ? 10 : 0 }}>
          {hints.map((hint) => {
            const isActive = hint.key === activeHintKey;
            return (
              <button
                key={hint.key}
                onClick={() => { setActiveHintKey(isActive ? null : hint.key); setLocalQuery(""); }}
                style={{
                  background: isActive ? T.greenLight : T.offWhite,
                  border: isActive ? `1px solid ${T.green}` : `0.5px solid ${T.border}`,
                  color: isActive ? T.green : T.inkMid,
                  padding: "6px 10px", borderRadius: 2,
                  cursor: "pointer", fontSize: 12, fontFamily: F.sans,
                }}
              >
                {hint.label}
              </button>
            );
          })}
        </div>

        {/* Search results */}
        {shouldShowResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {addResults.length === 0 ? (
              <div style={{ color: T.inkLight, fontSize: 13, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Nessun brand trovato." : "No brands found."}
              </div>
            ) : (
              addResults.map((brand) => {
                const displayScore = getDisplayScore(brand);
                return (
                  <div
                    key={brand.name}
                    onClick={() => onSelect(brand)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                      padding: "10px 12px",
                      background: T.white, border: `0.5px solid ${T.borderLight}`,
                      borderRadius: 2, cursor: "pointer",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: T.ink, fontSize: 14, fontFamily: F.serif, fontWeight: 700, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {brand.name}
                      </div>
                      <div style={{ color: T.inkLight, fontSize: 11, fontFamily: F.sans }}>
                        {brand.sector || getDisplayLabel(brand, lang)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <ScoreBadge score={displayScore} size="sm" />
                      <button
                        onClick={(e) => { e.stopPropagation(); onAdd(brand); setLocalQuery(""); setActiveHintKey(null); }}
                        style={{
                          background: T.ink, color: "#EDE8DC",
                          border: "none", borderRadius: 2,
                          padding: "6px 10px",
                          fontFamily: F.display, fontSize: 13,
                          letterSpacing: "0.06em", cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lang === "it" ? "+ Aggiungi" : "+ Add"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
