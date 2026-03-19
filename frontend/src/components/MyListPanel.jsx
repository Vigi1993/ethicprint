import { useMemo, useState } from "react";
import { useCategories } from "../context/categoriesContext";
import {
  getScore,
  getCatLabel,
  getDisplayScore,
  getDisplayLabel,
  getDisplayScoreColor,
  rawCategoryScoreToPublic,
} from "../utils/brandHelpers";

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
  const haystack = [
    brand?.name,
    brand?.sector,
    brand?.sector_icon,
    brand?.description,
    brand?.parent_company,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return hint.terms.some((term) => haystack.includes(term));
}

function getWorstCategory(brand, categories) {
  if (!brand?.scores) return null;

  const scoredCategories = categories
    .map((cat) => {
      const raw = brand.scores?.[cat.key];
      const publicScore =
        typeof raw === "number" ? rawCategoryScoreToPublic(raw) : null;

      return {
        cat,
        raw,
        publicScore,
      };
    })
    .filter((item) => typeof item.publicScore === "number");

  if (!scoredCategories.length) return null;

  scoredCategories.sort((a, b) => a.publicScore - b.publicScore);
  return scoredCategories[0];
}

function getIssueLabel(brand, categories, lang) {
  if (brand?.insufficient_data) {
    return lang === "it" ? "Dati insufficienti" : "Insufficient data";
  }

  const worst = getWorstCategory(brand, categories);
  if (!worst) {
    return lang === "it" ? "Criticità etiche" : "Ethical concerns";
  }

  return getCatLabel(worst.cat, lang);
}

function getIssueExplanation(brand, categories, lang) {
  if (brand?.insufficient_data) {
    return lang === "it"
      ? "Non ci sono ancora abbastanza fonti pubblicate per valutarlo bene."
      : "There aren’t enough published sources yet to assess it properly.";
  }

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
  if (brand?.insufficient_data) {
    return lang === "it"
      ? "Usandolo continui a sostenere un brand che oggi non è ancora valutabile con abbastanza evidenza pubblica."
      : "Using it still supports a brand that cannot yet be assessed with enough public evidence.";
  }

  const worst = getWorstCategory(brand, categories);
  const key = worst?.cat?.key;

  const copy = {
    it: {
      environment:
        "Usandolo continui a sostenere un modello con impatto ambientale più debole del necessario.",
      labor:
        "Usandolo continui a sostenere possibili criticità su lavoro, filiera o produzione.",
      conflicts:
        "Usandolo continui a sostenere possibili legami con aree o dinamiche controverse.",
      transparency:
        "Usandolo continui a sostenere un brand meno trasparente su pratiche e filiera.",
      animals:
        "Usandolo continui a sostenere possibili criticità su materiali o benessere animale.",
      default:
        "Usandolo continui a sostenere un brand con segnali etici più deboli di alternative migliori.",
    },
    en: {
      environment:
        "Using it continues to support a weaker environmental model than necessary.",
      labor:
        "Using it continues to support possible labor, supply chain, or production concerns.",
      conflicts:
        "Using it continues to support possible links to controversial areas or dynamics.",
      transparency:
        "Using it continues to support a brand with lower transparency on practices and supply chain.",
      animals:
        "Using it continues to support possible concerns around materials or animal welfare.",
      default:
        "Using it continues to support a brand with weaker ethical signals than better alternatives.",
    },
  };

  return copy[lang]?.[key] || copy[lang]?.default || copy.en.default;
}

function getAlternativeName(alternative) {
  if (!alternative) return null;
  if (typeof alternative === "string") return alternative;
  return alternative.name || alternative.brand_name || alternative.title || null;
}

function getAlternativeScore(alternative) {
  if (!alternative || typeof alternative === "string") return null;

  if (typeof alternative.public_score === "number") {
    return alternative.public_score;
  }

  if (typeof alternative.score === "number") {
    return alternative.score;
  }

  return null;
}

function getTopAlternative(brand) {
  if (!Array.isArray(brand?.alternatives) || !brand.alternatives.length) {
    return null;
  }

  return brand.alternatives[0];
}

function getAlternativeDelta(brand) {
  const current = getDisplayScore(brand);
  const topAlternative = getTopAlternative(brand);
  const altScore = getAlternativeScore(topAlternative);

  if (typeof current !== "number" || typeof altScore !== "number") {
    return null;
  }

  const delta = altScore - current;
  return delta > 0 ? delta : null;
}

function findAlternativeInDb(brand, db) {
  const topAlternative = getTopAlternative(brand);
  const alternativeName = normalize(getAlternativeName(topAlternative));

  if (!alternativeName || !Array.isArray(db)) return null;

  return db.find((item) => normalize(item.name) === alternativeName) || null;
}

function getCategoryPublicScoreMap(brand, categories) {
  const map = {};

  categories.forEach((cat) => {
    const raw = brand?.scores?.[cat.key];
    map[cat.key] =
      typeof raw === "number" ? rawCategoryScoreToPublic(raw) : null;
  });

  return map;
}

function getAlternativeAdvantages(currentBrand, alternativeBrand, categories, lang) {
  if (!currentBrand || !alternativeBrand) return [];

  const currentScores = getCategoryPublicScoreMap(currentBrand, categories);
  const alternativeScores = getCategoryPublicScoreMap(alternativeBrand, categories);

  const improvements = categories
    .map((cat) => {
      const current = currentScores[cat.key];
      const alternative = alternativeScores[cat.key];

      if (typeof current !== "number" || typeof alternative !== "number") {
        return null;
      }

      return {
        key: cat.key,
        label: getCatLabel(cat, lang),
        delta: alternative - current,
      };
    })
    .filter(Boolean)
    .filter((item) => item.delta >= 8)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2);

  return improvements;
}

function getAlternativeAdvantageCopy(currentBrand, alternativeBrand, categories, lang) {
  const improvements = getAlternativeAdvantages(
    currentBrand,
    alternativeBrand,
    categories,
    lang
  );

  if (!improvements.length) {
    return lang === "it"
      ? "Alternativa con segnali etici più solidi."
      : "Alternative with stronger ethical signals.";
  }

  if (improvements.length === 1) {
    return lang === "it"
      ? `Più forte su ${improvements[0].label.toLowerCase()}.`
      : `Stronger on ${improvements[0].label.toLowerCase()}.`;
  }

  return lang === "it"
    ? `Più forte su ${improvements[0].label.toLowerCase()} e ${improvements[1].label.toLowerCase()}.`
    : `Stronger on ${improvements[0].label.toLowerCase()} and ${improvements[1].label.toLowerCase()}.`;
}

  
export default function MyListPanel({
  myBrands,
  db,
  onAdd,
  onReplace,
  onRemove,
  onClear,
  onSelect,
  lang,
  ui,
  threshold,
}) {
  const categories = useCategories();
  const t = ui[lang] || ui.en;

  const [localQuery, setLocalQuery] = useState("");
  const [activeHintKey, setActiveHintKey] = useState(null);

  const hints = CATEGORY_HINTS[lang] || CATEGORY_HINTS.en;

  const avgScores = {};
  const avgScoreCounts = {};

  categories.forEach((c) => {
    avgScores[c.key] = 0;
    avgScoreCounts[c.key] = 0;
  });

  if (myBrands.length > 0) {
    myBrands.forEach((b) => {
      categories.forEach((c) => {
        const rawValue = b.scores?.[c.key];
        if (typeof rawValue === "number") {
          avgScores[c.key] += rawValue;
          avgScoreCounts[c.key] += 1;
        }
      });
    });

    categories.forEach((c) => {
      avgScores[c.key] =
        avgScoreCounts[c.key] > 0
          ? Math.round(avgScores[c.key] / avgScoreCounts[c.key])
          : null;
    });
  }

  const displayScores = myBrands.filter(
    (b) => typeof b.public_score === "number" && !b.insufficient_data
  );

  const publicAverage = displayScores.length
    ? Math.round(
        displayScores.reduce((sum, b) => sum + b.public_score, 0) /
          displayScores.length
      )
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
  const trackedNames = useMemo(
    () => new Set(myBrands.map((b) => normalize(b.name))),
    [myBrands]
  );

  const activeHint = hints.find((h) => h.key === activeHintKey) || null;

  const addResults = useMemo(() => {
    const cleanQuery = normalize(localQuery);
    let pool = Array.isArray(db) ? [...db] : [];

    pool = pool.filter((brand) => !trackedNames.has(normalize(brand.name)));

    if (activeHint) {
      pool = pool.filter((brand) => matchesHint(brand, activeHint));
    }

    if (cleanQuery) {
      pool = pool.filter((brand) => {
        const haystack = [
          brand?.name,
          brand?.sector,
          brand?.description,
          brand?.parent_company,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(cleanQuery);
      });
    }

    return pool
      .sort((a, b) => {
        const aScore = getDisplayScore(a);
        const bScore = getDisplayScore(b);
        return (bScore ?? -1) - (aScore ?? -1);
      })
      .slice(0, 6);
  }, [db, trackedNames, localQuery, activeHint]);

  const shouldShowResults = localQuery.trim().length > 0 || activeHint !== null;

  const paper = "#ede7dc";
  const ink = "#111111";
  const accent = "#d75a38";
  const moss = "#5e7f71";
  const line = "rgba(17,17,17,0.18)";
  const softInk = "rgba(17,17,17,0.72)";
  const mutedInk = "rgba(17,17,17,0.58)";

  const sectionTitle = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 700,
    fontSize: 28,
    lineHeight: 1.05,
    color: ink,
    letterSpacing: "-0.03em",
    margin: 0,
  };

  const rowBase = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 18,
    alignItems: "center",
    padding: "18px 0",
    borderTop: `1px solid ${line}`,
  };

  const actionButton = (tone = "dark") => ({
    border: `1px solid ${tone === "dark" ? "rgba(255,255,255,0.2)" : "rgba(17,17,17,0.16)"}`,
    background: tone === "dark" ? "rgba(255,255,255,0.08)" : "rgba(17,17,17,0.02)",
    color: tone === "dark" ? "#fff" : ink,
    padding: "12px 18px",
    textTransform: "uppercase",
    fontFamily: "Arial, Helvetica, sans-serif",
    letterSpacing: "0.06em",
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
  });

  const scoreBadge = (score, mode = "paper") => ({
    minWidth: 138,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    padding: "12px 16px",
    background:
      mode === "circle"
        ? "transparent"
        : score !== null && score < threshold
        ? accent
        : moss,
    color: mode === "circle" ? ink : "#fff",
    border: mode === "circle" ? `4px solid ${ink}` : `1px solid rgba(17,17,17,0.12)`,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 900,
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    boxShadow: mode === "circle" ? "none" : "inset 0 0 0 1px rgba(255,255,255,0.06)",
  });

  const renderBrandRow = (brand, variant) => {
    const displayScore = getDisplayScore(brand);
    const issueLabel = getIssueLabel(brand, categories, lang);
    const issueExplanation = getIssueExplanation(brand, categories, lang);
    const topAlternative = getTopAlternative(brand);
    const alternativeName = getAlternativeName(topAlternative);
    const alternativeDelta = getAlternativeDelta(brand);
    const replaceBrand = findAlternativeInDb(brand, db);
    const alternativeAdvantageCopy = replaceBrand
      ? getAlternativeAdvantageCopy(brand, replaceBrand, categories, lang)
      : null;

    const logoFallback = brand?.name?.slice(0, 1)?.toUpperCase() || "•";
    const darkMode = variant === "insufficient";

    return (
      <div
        key={brand.name}
        onClick={() => onSelect(brand)}
        style={{
          ...rowBase,
          cursor: "pointer",
          color: darkMode ? "#fff" : ink,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: darkMode ? "rgba(255,255,255,0.13)" : "rgba(17,17,17,0.1)",
                color: darkMode ? "#fff" : ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 16,
                fontWeight: 900,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {logoFallback}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
                    fontWeight: 900,
                    fontSize: 19,
                    lineHeight: 1.05,
                    color: darkMode ? "#fff" : ink,
                  }}
                >
                  {brand.name}
                </div>

                {variant === "negative" && (
                  <div
                    style={{
                      color: accent,
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontWeight: 800,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {issueLabel}
                  </div>
                )}
              </div>

              <div
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  color: darkMode ? "rgba(255,255,255,0.74)" : mutedInk,
                  fontSize: 13,
                  lineHeight: 1.38,
                  maxWidth: 530,
                  marginBottom: variant === "negative" && (alternativeName || replaceBrand) ? 10 : 0,
                }}
              >
                {variant === "insufficient"
                  ? lang === "it"
                    ? "Non ci sono ancora abbastanza fonti per verificarlo con sicurezza."
                    : "There aren’t enough sources to verify this brand confidently."
                  : variant === "positive"
                  ? alternativeAdvantageCopy || issueExplanation
                  : issueExplanation}
              </div>

              {variant === "negative" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (replaceBrand) onReplace(brand, replaceBrand);
                    }}
                    style={actionButton(false)}
                  >
                    {lang === "it" ? "Scegli alternativa" : "Switch to a better option"}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(brand.name);
                    }}
                    style={{ ...actionButton(false), opacity: 0.78 }}
                  >
                    {lang === "it" ? "Rimuovi" : "Remove"}
                  </button>
                </div>
              )}

              {variant === "insufficient" && (
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(brand.name);
                    }}
                    style={actionButton("dark")}
                  >
                    {lang === "it" ? "Togli dalla lista" : "Switch to a better option"}
                  </button>
                </div>
              )}

              {variant === "positive" && alternativeName && (
                <div
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    color: softInk,
                    fontSize: 12,
                    lineHeight: 1.35,
                    marginTop: 6,
                  }}
                >
                  {alternativeDelta !== null
                    ? lang === "it"
                      ? `${alternativeName} migliora di ${alternativeDelta} punti.`
                      : `${alternativeName} is ${alternativeDelta} points better.`
                    : alternativeName}
                </div>
              )}
            </div>
          </div>
        </div>

        {variant === "insufficient" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(brand);
            }}
            style={actionButton("dark")}
          >
            {lang === "it" ? "Apri dettagli" : "Switch to a better option"}
          </button>
        ) : (
          <div style={scoreBadge(displayScore)}>
            <span>{displayScore ?? "—"}</span>
            <span style={{ fontSize: 14, marginLeft: 2, opacity: 0.92 }}>/100</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        marginTop: 22,
        background: paper,
        color: ink,
        border: "1px solid rgba(17,17,17,0.12)",
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.7) 0, transparent 18%), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.08) 0, transparent 22%), radial-gradient(circle at 65% 75%, rgba(215,90,56,0.18) 0, transparent 18%), repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 14 }}>
          <div
            style={{
              fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
              fontSize: 32,
              lineHeight: 1,
              color: ink,
            }}
          >
            B.
          </div>
          <div>
            <div
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: ink,
                marginTop: 2,
              }}
            >
              {lang === "it" ? "Editorial impact" : "Editorial impact"}
            </div>
          </div>
        </div>

        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.98), rgba(20,20,20,0.97)), radial-gradient(circle at 88% 38%, rgba(215,90,56,0.8), transparent 20%)",
            color: "#fff",
            padding: "22px 18px 24px",
            border: "1px solid rgba(0,0,0,0.55)",
            position: "relative",
            overflow: "hidden",
            marginBottom: 0,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.16,
              backgroundImage:
                "radial-gradient(circle at 15% 15%, rgba(255,255,255,0.15) 0, transparent 18%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.12) 0, transparent 16%), radial-gradient(circle at 95% 40%, rgba(215,90,56,0.7) 0, transparent 11%), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "minmax(0, 1fr) 156px", gap: 12, alignItems: "end" }}>
            <div>
              <div
                style={{
                  fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
                  fontSize: 28,
                  lineHeight: 1,
                  marginBottom: 22,
                }}
              >
                EthicPrint
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.26)", marginBottom: 20 }} />

              <h2
                style={{
                  margin: 0,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 60,
                  lineHeight: 0.95,
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  maxWidth: 540,
                }}
              >
                {lang === "it" ? (
                  <>
                    Un mix di brand
                    <br />
                    <span style={{ color: accent }}>dannosi e incerti</span>
                  </>
                ) : (
                  <>
                    A mix of harmful
                    <br />
                    and <span style={{ color: accent }}>uncertain</span>
                  </>
                )}
              </h2>

              <div
                style={{
                  marginTop: 18,
                  fontFamily: "Arial, Helvetica, sans-serif",
                  color: "rgba(255,255,255,0.84)",
                  fontSize: 16,
                  lineHeight: 1.35,
                  maxWidth: 380,
                }}
              >
                {lang === "it"
                  ? "Alcuni dei brand che usi causano danni, altri sono ancora troppo opachi per essere verificati bene."
                  : "Some of the brands you use are causing harm, others are just too opaque."}
              </div>
            </div>

            <div
              style={{
                width: 142,
                height: 142,
                borderRadius: "50%",
                background: paper,
                color: ink,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                justifySelf: "end",
                position: "relative",
                boxShadow: "0 0 0 7px rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontFamily: "Arial Black, Arial, Helvetica, sans-serif", fontSize: 66, lineHeight: 0.9 }}>
                {publicAverage ?? "—"}
              </div>
              <div style={{ width: 70, height: 3, background: ink, margin: "4px 0 6px" }} />
              <div
                style={{
                  fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
                  fontSize: 16,
                  color: accent,
                }}
              >
                /100
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderLeft: `1px solid ${line}`, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
          <section style={{ padding: "18px 18px 8px", background: paper }}>
            <h3 style={sectionTitle}>
              {lang === "it" ? "Brand che sostieni e che causano danno" : "Brands you support that cause harm"}
            </h3>

            <div>
              {problematic.length === 0 ? (
                <div style={{ ...rowBase, color: mutedInk, fontSize: 14 }}>
                  <div>{lang === "it" ? "Nessun brand sotto soglia al momento." : "No harmful brands below threshold right now."}</div>
                </div>
              ) : (
                problematic.map((brand) => renderBrandRow(brand, "negative"))
              )}
            </div>
          </section>

          <section
            style={{
              padding: "18px 18px 8px",
              background:
                "linear-gradient(180deg, rgba(14,14,14,0.98), rgba(22,22,22,0.98))",
              color: "#fff",
              borderTop: `1px solid rgba(255,255,255,0.08)`,
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
            }}
          >
            <h3 style={{ ...sectionTitle, color: "#fff" }}>
              {lang === "it" ? "Brand che non riusciamo a verificare con sicurezza" : "Brands we can’t confidently verify"}
            </h3>

            <div>
              {insufficient.length === 0 ? (
                <div style={{ ...rowBase, color: "rgba(255,255,255,0.66)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                  <div>{lang === "it" ? "Tutti i brand hanno fonti sufficienti." : "All tracked brands have enough evidence."}</div>
                </div>
              ) : (
                insufficient.map((brand) => renderBrandRow(brand, "insufficient"))
              )}
            </div>
          </section>

          <section style={{ padding: "18px 18px 8px", background: paper }}>
            <h3 style={sectionTitle}>
              {lang === "it" ? "Brand con uno storico migliore." : "Brands with a better record."}
            </h3>

            <div>
              {positive.length === 0 ? (
                <div style={{ ...rowBase, color: mutedInk, fontSize: 14 }}>
                  <div>{lang === "it" ? "Nessun brand positivo ancora." : "No stronger brands yet."}</div>
                </div>
              ) : (
                positive.map((brand) => renderBrandRow(brand, "positive"))
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                borderTop: `1px solid ${line}`,
                padding: "16px 0 6px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => window?.location?.assign?.('/sources.html')}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  color: ink,
                  cursor: "pointer",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 14,
                }}
              >
                {lang === "it" ? "Esplora e migliora le tue scelte" : "Explore and improve your choices"} →
              </button>

              {!isEmpty && (
                <button onClick={onClear} style={actionButton(false)}>
                  {lang === "it" ? "Svuota lista" : t.clear_list}
                </button>
              )}
            </div>
          </section>
        </div>

        <section
          style={{
            marginTop: 18,
            border: `1px solid ${line}`,
            background: "rgba(255,255,255,0.45)",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "end",
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
                  fontSize: 20,
                  color: ink,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  marginBottom: 6,
                }}
              >
                {lang === "it" ? "Aggiungi brand che usi" : "Add brands you use"}
              </div>
              <div style={{ color: mutedInk, fontSize: 13, maxWidth: 680, lineHeight: 1.45 }}>
                {lang === "it"
                  ? "Cerca un brand o usa i filtri rapidi. Ho lasciato anche il layout e la gerarchia visiva in stile poster/editoriale come nel riferimento."
                  : "Search a brand or use the quick filters. The layout keeps the poster-like editorial hierarchy from the reference."}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <input
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                if (activeHintKey) setActiveHintKey(null);
              }}
              placeholder={lang === "it" ? "Cerca un brand..." : "Search a brand..."}
              style={{
                background: "rgba(255,255,255,0.65)",
                border: `1px solid ${line}`,
                padding: "14px 16px",
                outline: "none",
                color: ink,
                fontSize: 15,
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            />

            {(localQuery || activeHintKey) && (
              <button
                onClick={() => {
                  setLocalQuery("");
                  setActiveHintKey(null);
                }}
                style={actionButton(false)}
              >
                {lang === "it" ? "Pulisci" : "Clear"}
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: shouldShowResults ? 12 : 0 }}>
            {hints.map((hint) => {
              const isActive = hint.key === activeHintKey;
              return (
                <button
                  key={hint.key}
                  onClick={() => {
                    setActiveHintKey(isActive ? null : hint.key);
                    setLocalQuery("");
                  }}
                  style={{
                    ...actionButton(false),
                    background: isActive ? accent : "rgba(17,17,17,0.02)",
                    color: isActive ? "#fff" : ink,
                    padding: "10px 14px",
                  }}
                >
                  {hint.label}
                </button>
              );
            })}
          </div>

          {shouldShowResults && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {addResults.length === 0 ? (
                <div style={{ ...rowBase, color: mutedInk, paddingBottom: 4 }}>
                  <div>{lang === "it" ? "Nessun brand trovato." : "No brands found."}</div>
                </div>
              ) : (
                addResults.map((brand) => {
                  const displayScore = getDisplayScore(brand);
                  return (
                    <div
                      key={brand.name}
                      onClick={() => onSelect(brand)}
                      style={{ ...rowBase, cursor: "pointer", paddingTop: 14, paddingBottom: 14 }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "Arial Black, Arial, Helvetica, sans-serif",
                            fontWeight: 900,
                            fontSize: 18,
                            color: ink,
                            marginBottom: 4,
                          }}
                        >
                          {brand.name}
                        </div>
                        <div style={{ color: mutedInk, fontSize: 13 }}>
                          {brand.sector || getDisplayLabel(brand, lang)}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <div style={scoreBadge(displayScore)}>
                          <span>{displayScore ?? "—"}</span>
                          <span style={{ fontSize: 14, marginLeft: 2, opacity: 0.92 }}>/100</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdd(brand);
                            setLocalQuery("");
                            setActiveHintKey(null);
                          }}
                          style={actionButton(false)}
                        >
                          {lang === "it" ? "Aggiungi" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
