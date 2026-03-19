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

  const scoreValue = publicAverage ?? 53;
  const headlineText =
    lang === "it"
      ? "LA TUA IMPRONTA\nETICA"
      : "YOUR ETHICAL\nFOOTPRINT";

  const subtitle = isEmpty
    ? lang === "it"
      ? "Aggiungi i brand che usi per vedere la tua impronta etica."
      : "Add the brands you use to see your ethical footprint."
    : problematic.length > 0
    ? lang === "it"
      ? "Stai ancora sostenendo alcuni brand problematici."
      : "You’re supporting some problematic brands."
    : lang === "it"
    ? "La tua lista appare più solida, ma puoi migliorarla ancora."
    : "Your list looks stronger, but there is still room to improve.";

  const deckLine =
    lang === "it"
      ? "Scopri l'impatto etico dei brand che usi e passa ad alternative migliori."
      : "Learn the ethical impact of the brands you use and switch to better options.";

  const sectionStyle = {
    border: "4px solid #111",
    background: "#f4eee3",
    boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.12)",
    marginBottom: 18,
    position: "relative",
    overflow: "hidden",
  };

  const bandTitleStyle = (bg, color = "#111") => ({
    background: bg,
    color,
    fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
    fontSize: 26,
    lineHeight: 1,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    padding: "14px 18px 12px",
    borderBottom: "4px solid #111",
  });

  const renderBrandRow = (b, mode = "harm") => {
    const displayScore = getDisplayScore(b);
    const issueLabel = getIssueLabel(b, categories, lang);
    const issueExplanation = getIssueExplanation(b, categories, lang);
    const topAlternative = getTopAlternative(b);
    const alternativeName = getAlternativeName(topAlternative);
    const alternativeDelta = getAlternativeDelta(b);
    const replaceBrand = findAlternativeInDb(b, db);
    const sectorText = b?.sector || issueLabel;

    const accent =
      mode === "harm" ? "#e34b2f" : mode === "positive" ? "#111" : "#d6aa2d";
    const buttonBg = mode === "harm" ? "#f2b11c" : "#111";
    const buttonColor = mode === "harm" ? "#111" : "#f6f0e5";

    return (
      <div
        key={b.name}
        onClick={() => onSelect(b)}
        className="ep-row"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 14,
          padding: "16px 18px",
          borderBottom: "2px solid rgba(0,0,0,0.22)",
          cursor: "pointer",
          background: "rgba(255,255,255,0.16)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "2px solid rgba(0,0,0,0.2)",
                background: accent,
                color: mode === "transparency" ? "#111" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
                fontFamily: "Impact, sans-serif",
                flexShrink: 0,
              }}
            >
              {b.name?.slice(0, 1)?.toUpperCase() || "B"}
            </div>

            <div>
              <div
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontWeight: 900,
                  fontSize: 22,
                  lineHeight: 1,
                  color: "#101010",
                  marginBottom: 3,
                }}
              >
                {b.name}
              </div>
              <div
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 13,
                  color: "rgba(0,0,0,0.68)",
                  fontWeight: 700,
                }}
              >
                {sectorText}
              </div>
            </div>
          </div>

          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 13.5,
              lineHeight: 1.45,
              color: "rgba(0,0,0,0.8)",
              maxWidth: 520,
            }}
          >
            {issueExplanation}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "center",
            gap: 8,
            minWidth: 178,
          }}
        >
          <div
            style={{
              background: "#111",
              color: "#fff",
              border: "3px solid #111",
              padding: "8px 10px",
              textAlign: "center",
              fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
              fontSize: 22,
              lineHeight: 1,
              letterSpacing: "0.02em",
            }}
          >
            {displayScore ?? "—"}
            <span style={{ fontSize: 14, marginLeft: 3 }}>/100</span>
          </div>

          {(alternativeName || replaceBrand) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (replaceBrand) {
                  onReplace(b, replaceBrand);
                } else {
                  onSelect(b);
                }
              }}
              style={{
                background: buttonBg,
                color: buttonColor,
                border: "3px solid rgba(0,0,0,0.85)",
                padding: "10px 10px 9px",
                textAlign: "center",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 14,
                lineHeight: 1.05,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {lang === "it" ? "Passa a\nun'opzione migliore" : "Switch to a\nbetter option"}
            </button>
          )}

          {!alternativeName && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(b);
              }}
              style={{
                background: buttonBg,
                color: buttonColor,
                border: "3px solid rgba(0,0,0,0.85)",
                padding: "10px 10px 9px",
                textAlign: "center",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 14,
                lineHeight: 1.05,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {lang === "it" ? "Apri\ndettagli" : "Open\ndetails"}
            </button>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 11,
                color: "rgba(0,0,0,0.65)",
                fontWeight: 700,
              }}
            >
              {alternativeDelta !== null
                ? lang === "it"
                  ? `+${alternativeDelta} meglio`
                  : `+${alternativeDelta} better`
                : getDisplayLabel(b, lang)}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(b.name);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(0,0,0,0.72)",
                fontSize: 24,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`Remove ${b.name}`}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        marginTop: 18,
        background: "#d9d5d1",
        padding: "26px 24px 30px",
        borderRadius: 0,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <style>{`
        .ep-manifest * { box-sizing: border-box; }
        .ep-manifest {
          color: #111;
          font-family: Arial, Helvetica, sans-serif;
          position: relative;
        }
        .ep-manifest::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.15;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(0,0,0,0.16) 0 1px, transparent 1.2px),
            radial-gradient(circle at 80% 30%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px),
            radial-gradient(circle at 60% 80%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px);
          background-size: 12px 12px, 16px 16px, 14px 14px;
          mix-blend-mode: multiply;
        }
        .ep-paper {
          position: relative;
          background: #f5f0e6;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: inset 0 0 80px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .ep-paper::before,
        .ep-paper::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .ep-paper::before {
          background:
            radial-gradient(circle at 10% 15%, rgba(0,0,0,0.08) 0 1px, transparent 1px),
            radial-gradient(circle at 80% 30%, rgba(0,0,0,0.06) 0 1px, transparent 1px),
            radial-gradient(circle at 55% 70%, rgba(0,0,0,0.07) 0 1px, transparent 1px);
          background-size: 10px 10px, 13px 13px, 11px 11px;
          opacity: 0.32;
        }
        .ep-paper::after {
          box-shadow: inset 0 0 0 2px rgba(0,0,0,0.04), inset 0 0 40px rgba(0,0,0,0.05);
          opacity: 0.85;
        }
        .ep-row:hover {
          background: rgba(255,255,255,0.36) !important;
        }
        .ep-search::placeholder {
          color: rgba(0,0,0,0.48);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        @media (max-width: 860px) {
          .ep-top-grid { grid-template-columns: 1fr !important; }
          .ep-score-badge { margin-top: 10px; justify-self: start !important; }
          .ep-row { grid-template-columns: 1fr !important; }
        }
      `}</style>


      <div className="ep-manifest ep-paper" style={{ padding: 26 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18 }} className="ep-top-grid">
          <div>


            <div
              style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 74,
                lineHeight: 0.88,
                textTransform: "uppercase",
                color: "#111",
                maxWidth: 600,
                marginBottom: 16,
                whiteSpace: "pre-line",
                letterSpacing: "0.01em",
              }}
            >
              {headlineText}
            </div>

            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 34,
                lineHeight: 1.02,
                fontWeight: 700,
                maxWidth: 720,
                marginBottom: 14,
                color: "#111",
              }}
            >
              {subtitle.split("problematic").length > 1 ? (
                <>
                  {subtitle.split("problematic")[0]}
                  <span style={{ color: "#c4432c" }}>problematic</span>
                  {subtitle.split("problematic")[1]}
                </>
              ) : subtitle.split("problematici").length > 1 ? (
                <>
                  {subtitle.split("problematici")[0]}
                  <span style={{ color: "#c4432c" }}>problematici</span>
                  {subtitle.split("problematici")[1]}
                </>
              ) : (
                subtitle
              )}
            </div>

            <div
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 14,
                lineHeight: 1.45,
                color: "rgba(0,0,0,0.72)",
                maxWidth: 620,
              }}
            >
              {deckLine}
            </div>
          </div>



          
<div
  className="ep-score-badge"
  style={{
    alignSelf: "start",
    justifySelf: "end",
    width: 168,
    height: 168,
    borderRadius: "50%",
    background: "linear-gradient(180deg, #f04d2e 0%, #c63722 100%)",
    border: "8px solid rgba(0,0,0,0.84)",
    boxShadow: "inset 0 0 0 10px rgba(255,255,255,0.05)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    transform: "rotate(-4deg)",
  }}
>
  <div style={{ textAlign: "center", marginTop: -4 }}>
    <div
      style={{
        fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
        fontSize: 60,
        lineHeight: 0.9,
      }}
    >
      {scoreValue}
      <span style={{ fontSize: 28 }}>/100</span>
    </div>
  </div>
</div>



          
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={sectionStyle}>
            <div style={bandTitleStyle("#dd4a2f", "#fff")}>{lang === "it" ? "Danno attivo" : "Active harm"}</div>
            {problematic.length === 0 ? (
              <div style={{ padding: 18, fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700 }}>
                {lang === "it" ? "Nessun brand critico al momento." : "No critical brands right now."}
              </div>
            ) : (
              problematic.map((b) => renderBrandRow(b, "harm"))
            )}
          </div>

          <div style={sectionStyle}>
            <div style={bandTitleStyle("#e7bb3a", "#111")}>{lang === "it" ? "Trasparenza carente" : "Lacking transparency"}</div>
            {insufficient.length === 0 ? (
              <div style={{ padding: 18, fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700 }}>
                {lang === "it"
                  ? "Tutti i brand hanno abbastanza evidenza pubblica."
                  : "All tracked brands have enough public evidence."}
              </div>
            ) : (
              insufficient.map((b) => renderBrandRow(b, "transparency"))
            )}
          </div>

          <div style={sectionStyle}>
            <div style={bandTitleStyle("#111", "#f4eee3")}>{lang === "it" ? "Alternative più forti" : "Stronger options"}</div>
            {positive.length === 0 ? (
              <div style={{ padding: 18, fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, color: "#111" }}>
                {lang === "it" ? "Ancora nessun brand forte in lista." : "No strong brands in the list yet."}
              </div>
            ) : (
              positive.map((b) => renderBrandRow(b, "positive"))
            )}
          </div>
        </div>

        <div
          style={{
            borderTop: "6px solid #111",
            marginTop: 24,
            paddingTop: 18,
          }}
        >
          <div
            style={{
              fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
              fontSize: 28,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {lang === "it" ? "Aggiungi brand che usi" : "Add brands you use"}
          </div>

          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 13,
              color: "rgba(0,0,0,0.72)",
              marginBottom: 12,
              maxWidth: 680,
            }}
          >
            {lang === "it"
              ? "Inizia dai brand che usi davvero ogni settimana. Il pannello sotto è stato ridisegnato per sembrare un poster stampato: più materico, tipografico e aggressivo."
              : "Start with the brands you actually use every week. The panel below has been redesigned to feel like a printed activist poster: more tactile, typographic, and bold."}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "4px solid #111",
              background: "#efe7d8",
              padding: "12px 14px",
              marginBottom: 10,
            }}
          >
            <input
              className="ep-search"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                if (activeHintKey) setActiveHintKey(null);
              }}
              placeholder={lang === "it" ? "Cerca un brand" : "Search a brand"}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#111",
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            />

            {(localQuery || activeHintKey) && (
              <button
                onClick={() => {
                  setLocalQuery("");
                  setActiveHintKey(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 28,
                  lineHeight: 1,
                  color: "rgba(0,0,0,0.66)",
                  cursor: "pointer",
                }}
                aria-label="Clear brand search"
              >
                ×
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: shouldShowResults ? 12 : 0 }}>
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
                    border: "3px solid #111",
                    background: isActive ? "#dd4a2f" : "#efe7d8",
                    color: isActive ? "#fff" : "#111",
                    padding: "8px 12px 7px",
                    fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                    fontSize: 15,
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {hint.label}
                </button>
              );
            })}

            {!isEmpty && (
              <button
                onClick={onClear}
                style={{
                  marginLeft: "auto",
                  border: "3px solid #111",
                  background: "#111",
                  color: "#f4eee3",
                  padding: "8px 12px 7px",
                  fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                  fontSize: 15,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {t.clear_list}
              </button>
            )}
          </div>

          {shouldShowResults && (
            <div style={{ border: "4px solid #111", background: "#f4eee3" }}>
              {addResults.length === 0 ? (
                <div style={{ padding: 16, fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700 }}>
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
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 12,
                        padding: "14px 16px",
                        borderBottom: "2px solid rgba(0,0,0,0.18)",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "Arial, Helvetica, sans-serif",
                            fontSize: 21,
                            fontWeight: 900,
                            color: "#111",
                            lineHeight: 1,
                            marginBottom: 4,
                          }}
                        >
                          {brand.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "Arial, Helvetica, sans-serif",
                            fontSize: 13,
                            color: "rgba(0,0,0,0.65)",
                            fontWeight: 700,
                          }}
                        >
                          {brand.sector || getDisplayLabel(brand, lang)}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            background: "#111",
                            color: "#fff",
                            padding: "8px 10px",
                            border: "3px solid #111",
                            fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                            fontSize: 20,
                            lineHeight: 1,
                          }}
                        >
                          {displayScore ?? "—"}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdd(brand);
                            setLocalQuery("");
                            setActiveHintKey(null);
                          }}
                          style={{
                            border: "3px solid #111",
                            background: "#e7bb3a",
                            color: "#111",
                            padding: "8px 11px 7px",
                            fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                            fontSize: 14,
                            textTransform: "uppercase",
                            cursor: "pointer",
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
    </div>
  );
}
