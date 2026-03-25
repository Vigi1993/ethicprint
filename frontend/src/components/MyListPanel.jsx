import { useMemo, useState, useEffect, useCallback } from "react";
import { useCategories } from "../context/categoriesContext";
import { API_BASE_URL } from "../api/config";
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
      : "There aren't enough published sources yet to assess it properly.";
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
  totalBrands = 0,
  totalSectors = 0,
  totalSources = 0,
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

  // Messaggio etico aggregato — solo se ci sono brand in lista
  const scoredBrands = myBrands.filter(
    (b) => !b.insufficient_data && getDisplayScore(b) !== null
  );
  const majorityCritical =
    scoredBrands.length > 0 &&
    problematic.length > scoredBrands.length / 2;
  const majorityPositive =
    scoredBrands.length > 0 &&
    positive.length > scoredBrands.length / 2;

  const ethicalStatusMsg = !isEmpty && scoredBrands.length > 0
    ? majorityCritical
      ? lang === "it"
        ? "⚠️ La maggior parte dei brand che usi presenta criticità etiche significative."
        : "⚠️ Most of the brands you use have significant ethical concerns."
      : majorityPositive
      ? lang === "it"
        ? "✅ La maggior parte dei brand che usi è eticamente positiva."
        : "✅ Most of the brands you use are ethically positive."
      : null
    : null;

  const headlineText =
    lang === "it"
      ? "I TUOI BRAND, IL LORO IMPATTO"
      : "YOUR BRANDS, THEIR IMPACT";

  const subtitle = 
    lang === "it"
      ? "Scopri l'impatto etico dei brand che usi e passa ad alternative migliori."
      : "Learn the ethical impact of the brands you use and switch to better options."
    ;

  const deckLine =
    lang === "it"
      ? "Cerca un brand nella barra sopra oppure sfoglia tra i settori. Clicca su un brand per vederne i dettagli e leggere direttamente le fonti — poi aggiungilo per vedere il quadro d'insieme."
      : "Search for a brand using the bar above or browse by sectors. Click on any brand to explore its details and read the sources yourself — then add it to see the bigger picture.";


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
    return <BrandRow key={b.name} b={b} mode={mode} lang={lang} categories={categories} db={db} onSelect={onSelect} onReplace={onReplace} onRemove={onRemove} />;
  };

  function BrandRow({ b, mode, lang, categories, db, onSelect, onReplace, onRemove }) {
    const displayScore = getDisplayScore(b);
    const issueExplanation = getIssueExplanation(b, categories, lang);
    const topAlternative = getTopAlternative(b);
    const alternativeName = getAlternativeName(topAlternative);
    const alternativeDelta = getAlternativeDelta(b);
    const replaceBrand = findAlternativeInDb(b, db);
    const verdict = getDisplayLabel(b, lang);

    const [abandonCount, setAbandonCount] = useState(null);
    const [abandoned, setAbandoned] = useState(false);

    useEffect(() => {
      if (!b.id) return;
      fetch(`${API_BASE_URL}/brands/${b.id}/abandon-count`)
        .then((r) => r.json())
        .then((data) => setAbandonCount(data.count ?? 0))
        .catch(() => setAbandonCount(0));
    }, [b.id]);

    const handleAbandon = useCallback(async (e) => {
      e.stopPropagation();
      if (abandoned) return;
      try {
        const res = await fetch(`${API_BASE_URL}/brands/${b.id}/abandon`, { method: "POST" });
        const data = await res.json();
        setAbandonCount(data.count ?? (abandonCount ?? 0) + 1);
        setAbandoned(true);
        onRemove(b.name);
      } catch {
        onRemove(b.name);
      }
    }, [abandoned, abandonCount, b.id, b.name, onRemove]);

    const buttonBg = mode === "harm" ? "#f2b11c" : "#111";
    const buttonColor = mode === "harm" ? "#111" : "#f6f0e5";

    return (
      <div
        onClick={() => onSelect(b)}
        className="ep-row"
        style={{
          padding: "16px 18px",
          borderBottom: "2px solid rgba(0,0,0,0.22)",
          cursor: "pointer",
          background: "rgba(255,255,255,0.16)",
        }}
      >
        {/* Nome + settore */}
        <div style={{ marginBottom: 8 }}>
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
            {b?.sector || ""}
          </div>
        </div>

        {/* Verdict timbro — solo per active harm */}
        {mode === "harm" && verdict && (
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "inline-block",
                border: "3px solid #c4432c",
                color: "#c4432c",
                background: "transparent",
                padding: "5px 10px 4px",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 18,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1,
                transform: "rotate(-1.5deg)",
                transformOrigin: "left center",
                boxShadow: "2px 2px 0 rgba(196,67,44,0.18)",
              }}
            >
              {verdict}
            </div>
          </div>
        )}

        {/* Spiegazione */}
        <div
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 13.5,
            lineHeight: 1.45,
            color: "rgba(0,0,0,0.8)",
            marginBottom: 12,
          }}
        >
          {issueExplanation}
        </div>

        {/* Contatore abbandoni — solo active harm */}
        {mode === "harm" && abandonCount !== null && abandonCount > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginBottom: 12,
              border: "2px solid rgba(0,0,0,0.18)",
              background: "#fff8f0",
              padding: "10px 12px",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 13,
              lineHeight: 1.4,
              color: "#111",
            }}
          >
            <span style={{ fontWeight: 900 }}>
              {lang === "it"
                ? `${abandonCount.toLocaleString()} persone`
                : `${abandonCount.toLocaleString()} people`}
            </span>{" "}
            {lang === "it"
              ? "hanno abbandonato questo brand questo mese — unisciti a loro e scegli un'alternativa migliore."
              : "abandoned this brand this month — join them and switch to a better alternative."}
          </div>
        )}

        {/* Azioni */}
        <div
          style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bottone switch */}
          {(alternativeName || replaceBrand) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (replaceBrand) onReplace(b, replaceBrand);
                else onSelect(b);
              }}
              style={{
                background: buttonBg,
                color: buttonColor,
                border: "3px solid rgba(0,0,0,0.85)",
                padding: "10px 12px 9px",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 14,
                lineHeight: 1,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {lang === "it" ? "Passa a un'alternativa" : "Switch to an alternative"}
            </button>
          )}

          {/* Bottone dettagli */}
          {!alternativeName && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(b); }}
              style={{
                background: "transparent",
                color: "#111",
                border: "3px solid rgba(0,0,0,0.85)",
                padding: "10px 12px 9px",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 14,
                lineHeight: 1,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {lang === "it" ? "Apri dettagli" : "Open details"}
            </button>
          )}

          {/* Bottone Abbandona */}
          {mode === "harm" && (
            <button
              onClick={handleAbandon}
              style={{
                background: abandoned ? "#2e7d32" : "#c4432c",
                color: "#fff",
                border: "3px solid rgba(0,0,0,0.85)",
                padding: "10px 12px 9px",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 14,
                lineHeight: 1,
                textTransform: "uppercase",
                cursor: abandoned ? "default" : "pointer",
                marginLeft: "auto",
              }}
            >
              {abandoned
                ? lang === "it" ? "✓ Abbandonato" : "✓ Abandoned"
                : lang === "it" ? "Abbandona" : "Abandon"}
            </button>
          )}

          {/* X per non-harm */}
          {mode !== "harm" && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(b.name); }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(0,0,0,0.72)",
                fontSize: 24,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0,
                marginLeft: "auto",
              }}
              aria-label={`Remove ${b.name}`}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 18,
        background: "#f2eadf",
        padding: "26px 24px 30px",
        border: "4px solid #181310",
        boxShadow: "8px 8px 0 #181310",
        position: "relative",
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
          .ep-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="ep-manifest" style={{ padding: 26 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }} className="ep-top-grid">
          <div>
            {/* Titolo */}
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

            {/* Subtitle */}
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

            {/* Deck line — senza link */}
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

            {/* Messaggio etico aggregato */}
            {ethicalStatusMsg && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  border: `3px solid ${majorityCritical ? "#c4432c" : "#2e7d32"}`,
                  background: majorityCritical ? "#fde8e4" : "#e8f5e9",
                  color: majorityCritical ? "#c4432c" : "#2e7d32",
                  fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                  fontSize: 16,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  lineHeight: 1.3,
                }}
              >
                {ethicalStatusMsg}
              </div>
            )}
          </div>
        </div>

        {/* Sezioni brand */}
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
            <div style={bandTitleStyle("#2e7d32", "#f4eee3")}>{lang === "it" ? "Alternative migliori" : "Better choices"}</div>
            {positive.length === 0 ? (
              <div style={{ padding: 18, fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, color: "#111" }}>
                {lang === "it" ? "Ancora nessuna alternativa in lista." : "No alternatives in the list yet."}
              </div>
            ) : (
              positive.map((b) => renderBrandRow(b, "positive"))
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
