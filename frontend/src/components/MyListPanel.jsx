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
      : "Learn the ethical impact of the brands you use and switch to better options.";

  const deckLine =
    lang === "it"
      ? "Cerca un brand nella barra sopra oppure sfoglia tra i settori. Clicca su un brand per vederne i dettagli e leggere direttamente le fonti — poi aggiungilo per vedere il quadro d'insieme."
      : "Search for a brand using the bar above or browse by sectors. Click on any brand to explore its details and read the sources yourself — then add it to see the bigger picture.";

  const sectionStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  };

  const bandTitleStyle = (tone) => {
    const tones = {
      harm: {
        bg: "rgba(255,107,107,0.08)",
        border: "rgba(255,107,107,0.18)",
        color: "#ff8f8f",
      },
      transparency: {
        bg: "rgba(255,214,102,0.08)",
        border: "rgba(255,214,102,0.18)",
        color: "#f1d37a",
      },
      positive: {
        bg: "rgba(99,202,183,0.1)",
        border: "rgba(99,202,183,0.18)",
        color: "#63CAB7",
      },
    };

    const current = tones[tone];

    return {
      background: current.bg,
      color: current.color,
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      lineHeight: 1,
      letterSpacing: 3,
      textTransform: "uppercase",
      padding: "16px 18px",
      borderBottom: `1px solid ${current.border}`,
    };
  };

  const renderBrandRow = (b, mode = "harm") => {
    return (
      <BrandRow
        key={b.name}
        b={b}
        mode={mode}
        lang={lang}
        categories={categories}
        db={db}
        onSelect={onSelect}
        onReplace={onReplace}
        onRemove={onRemove}
      />
    );
  };

  function BrandRow({ b, mode, lang, categories, db, onSelect, onReplace, onRemove }) {
    const displayScore = getDisplayScore(b);
    const issueExplanation = getIssueExplanation(b, categories, lang);
    const topAlternative = getTopAlternative(b);
    const alternativeName = getAlternativeName(topAlternative);
    const alternativeDelta = getAlternativeDelta(b);
    const replaceBrand = findAlternativeInDb(b, db);
    const verdict = getDisplayLabel(b, lang);
    const issueLabel = getIssueLabel(b, categories, lang);
    const scoreColor = getDisplayScoreColor(displayScore);

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

    const primaryActionBg =
      mode === "harm"
        ? "rgba(255,107,107,0.12)"
        : "rgba(99,202,183,0.12)";

    const primaryActionBorder =
      mode === "harm"
        ? "rgba(255,107,107,0.24)"
        : "rgba(99,202,183,0.24)";

    const primaryActionColor =
      mode === "harm"
        ? "#ff9a9a"
        : "#63CAB7";

    return (
      <div
        onClick={() => onSelect(b)}
        className="ep-row"
        style={{
          padding: "18px 18px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          cursor: "pointer",
          background: "transparent",
          transition: "background 0.15s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", gap: 12, minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: `${scoreColor}22`,
                border: `1px solid ${scoreColor}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: scoreColor,
                fontSize: 15,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {b.logo || b.name?.[0]}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 18,
                  lineHeight: 1.1,
                  color: "#e8e8f0",
                  marginBottom: 4,
                }}
              >
                {b.name}
              </div>

              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  fontWeight: 400,
                }}
              >
                {b?.sector || ""}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: scoreColor,
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
              }}
            >
              {displayScore ?? "—"}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              /100
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          {verdict && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 26,
                padding: "0 10px",
                borderRadius: 99,
                background:
                  mode === "harm"
                    ? "rgba(255,107,107,0.1)"
                    : mode === "positive"
                    ? "rgba(99,202,183,0.12)"
                    : "rgba(255,214,102,0.1)",
                border:
                  mode === "harm"
                    ? "1px solid rgba(255,107,107,0.22)"
                    : mode === "positive"
                    ? "1px solid rgba(99,202,183,0.22)"
                    : "1px solid rgba(255,214,102,0.22)",
                color:
                  mode === "harm"
                    ? "#ff9a9a"
                    : mode === "positive"
                    ? "#63CAB7"
                    : "#f1d37a",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {verdict}
            </div>
          )}

          {issueLabel && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 26,
                padding: "0 10px",
                borderRadius: 99,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.55)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
              }}
            >
              {issueLabel}
            </div>
          )}

          {alternativeDelta !== null && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 26,
                padding: "0 10px",
                borderRadius: 99,
                background: "rgba(99,202,183,0.1)",
                border: "1px solid rgba(99,202,183,0.2)",
                color: "#63CAB7",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
              }}
            >
              +{alternativeDelta}
            </div>
          )}
        </div>

        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.72)",
            marginBottom: 12,
          }}
        >
          {issueExplanation}
        </div>

        {mode === "harm" && abandonCount !== null && abandonCount > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginBottom: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: "10px 12px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.68)",
            }}
          >
            <span style={{ fontWeight: 600, color: "#e8e8f0" }}>
              {lang === "it"
                ? `${abandonCount.toLocaleString()} persone`
                : `${abandonCount.toLocaleString()} people`}
            </span>{" "}
            {lang === "it"
              ? "hanno abbandonato questo brand questo mese — unisciti a loro e scegli un'alternativa migliore."
              : "abandoned this brand this month — join them and switch to a better alternative."}
          </div>
        )}

        <div
          style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
          onClick={(e) => e.stopPropagation()}
        >
          {(alternativeName || replaceBrand) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (replaceBrand) onReplace(b, replaceBrand);
                else onSelect(b);
              }}
              style={{
                background: primaryActionBg,
                color: primaryActionColor,
                border: `1px solid ${primaryActionBorder}`,
                padding: "9px 12px",
                borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {lang === "it" ? "Passa a un'alternativa" : "Switch to an alternative"}
            </button>
          )}

          {!alternativeName && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(b); }}
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "9px 12px",
                borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {lang === "it" ? "Apri dettagli" : "Open details"}
            </button>
          )}

          {mode === "harm" && (
            <button
              onClick={handleAbandon}
              style={{
                background: abandoned ? "rgba(99,202,183,0.12)" : "rgba(255,107,107,0.12)",
                color: abandoned ? "#63CAB7" : "#ff9a9a",
                border: abandoned
                  ? "1px solid rgba(99,202,183,0.24)"
                  : "1px solid rgba(255,107,107,0.24)",
                padding: "9px 12px",
                borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                cursor: abandoned ? "default" : "pointer",
                marginLeft: "auto",
                transition: "all 0.15s",
              }}
            >
              {abandoned
                ? lang === "it" ? "✓ Abbandonato" : "✓ Abandoned"
                : lang === "it" ? "Abbandona" : "Abandon"}
            </button>
          )}

          {mode !== "harm" && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(b.name); }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.35)",
                fontSize: 22,
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
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "28px 24px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .ep-manifest * { box-sizing: border-box; }
        .ep-manifest {
          color: #e8e8f0;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }
        .ep-manifest::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at top left, rgba(99,202,183,0.05), transparent 28%),
            radial-gradient(circle at bottom right, rgba(255,255,255,0.03), transparent 24%);
        }
        .ep-row:hover {
          background: rgba(255,255,255,0.03) !important;
        }
        .ep-search::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .ep-pill:hover {
          background: rgba(99,202,183,0.1) !important;
          border-color: rgba(99,202,183,0.3) !important;
          color: #63CAB7 !important;
        }
        .ep-add-result:hover {
          background: rgba(255,255,255,0.04) !important;
        }
        @media (max-width: 860px) {
          .ep-top-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="ep-manifest">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }} className="ep-top-grid">
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "rgba(99,202,183,0.6)",
                textTransform: "uppercase",
                marginBottom: 14,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {lang === "it" ? "My list · panoramica" : "My list · overview"}
            </div>

            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(28px, 5vw, 42px)",
                lineHeight: 0.98,
                color: "#e8e8f0",
                maxWidth: 640,
                marginBottom: 14,
                whiteSpace: "pre-line",
                fontWeight: 600,
              }}
            >
              {headlineText}
            </div>

            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "clamp(16px, 2.5vw, 20px)",
                lineHeight: 1.45,
                fontWeight: 300,
                maxWidth: 720,
                marginBottom: 14,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              {subtitle}
            </div>

            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.45)",
                maxWidth: 680,
              }}
            >
              {deckLine}
            </div>

            {ethicalStatusMsg && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 14px",
                  border: `1px solid ${
                    majorityCritical
                      ? "rgba(255,107,107,0.22)"
                      : "rgba(99,202,183,0.22)"
                  }`,
                  background: majorityCritical
                    ? "rgba(255,107,107,0.08)"
                    : "rgba(99,202,183,0.08)",
                  color: majorityCritical ? "#ff9a9a" : "#63CAB7",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.45,
                  fontWeight: 600,
                  maxWidth: 760,
                }}
              >
                {ethicalStatusMsg}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
                marginTop: 18,
                maxWidth: 760,
              }}
            >
              {[
                {
                  label: lang === "it" ? "Brand tracciati" : "Tracked brands",
                  value: myBrands.length,
                },
                {
                  label: lang === "it" ? "Fonti" : "Sources",
                  value: totalSources,
                },
                {
                  label: lang === "it" ? "Settori" : "Sectors",
                  value: totalSectors,
                },
                {
                  label: lang === "it" ? "Database" : "Database",
                  value: totalBrands,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.3)",
                      fontFamily: "'DM Mono', monospace",
                      marginBottom: 8,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      lineHeight: 1,
                      color: "#e8e8f0",
                      fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            marginBottom: 22,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${
                localQuery || activeHint
                  ? "rgba(99,202,183,0.3)"
                  : "rgba(255,255,255,0.1)"
              }`,
              borderRadius: 14,
              padding: "12px 14px",
              boxShadow:
                localQuery || activeHint
                  ? "0 0 0 3px rgba(99,202,183,0.08)"
                  : "none",
              transition: "all 0.2s",
            }}
          >
            <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              className="ep-search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder={lang === "it" ? "Aggiungi un brand alla lista" : "Add a brand to your list"}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />

            {(localQuery || activeHint) && (
              <button
                onClick={() => {
                  setLocalQuery("");
                  setActiveHintKey(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'DM Mono', monospace",
                marginRight: 4,
              }}
            >
              {lang === "it" ? "Filtra:" : "Filter:"}
            </span>

            {hints.map((hint) => {
              const active = activeHintKey === hint.key;
              return (
                <button
                  key={hint.key}
                  className="ep-pill"
                  onClick={() => setActiveHintKey(active ? null : hint.key)}
                  style={{
                    background: active ? "rgba(99,202,183,0.12)" : "rgba(255,255,255,0.05)",
                    border: active
                      ? "1px solid rgba(99,202,183,0.3)"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: active ? "#63CAB7" : "rgba(255,255,255,0.58)",
                    padding: "6px 12px",
                    borderRadius: 99,
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  {hint.label}
                </button>
              );
            })}

            {myBrands.length > 0 && (
              <button
                onClick={onClear}
                style={{
                  marginLeft: "auto",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.4)",
                  padding: "6px 12px",
                  borderRadius: 99,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'DM Mono', monospace",
                  transition: "all 0.15s",
                }}
              >
                {lang === "it" ? "Svuota lista" : "Clear list"}
              </button>
            )}
          </div>

          {shouldShowResults && (
            <div
              style={{
                marginTop: 10,
                background: "#0f0f1a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            >
              {addResults.length === 0 ? (
                <div
                  style={{
                    padding: "14px 16px",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {lang === "it" ? "Nessun brand trovato." : "No brands found."}
                </div>
              ) : (
                addResults.map((brand) => {
                  const score = getDisplayScore(brand);
                  const scoreColor = getDisplayScoreColor(score);
                  return (
                    <div
                      key={brand.name}
                      className="ep-add-result"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${scoreColor}22`,
                          border: `1px solid ${scoreColor}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: scoreColor,
                          flexShrink: 0,
                        }}
                      >
                        {brand.logo || brand.name?.[0]}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#e8e8f0",
                            lineHeight: 1,
                            marginBottom: 3,
                          }}
                        >
                          {brand.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          {brand.sector || ""}
                        </div>
                      </div>

                      <div style={{ textAlign: "right", marginRight: 6 }}>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: scoreColor,
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {score ?? "—"}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                          /100
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onAdd(brand);
                          setLocalQuery("");
                        }}
                        style={{
                          background: "rgba(99,202,183,0.1)",
                          border: "1px solid rgba(99,202,183,0.2)",
                          color: "#63CAB7",
                          padding: "6px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'DM Sans', sans-serif",
                          whiteSpace: "nowrap",
                          transition: "all 0.15s",
                        }}
                      >
                        {lang === "it" ? "+ Aggiungi" : "+ Add"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 6 }}>
          <div style={sectionStyle}>
            <div style={bandTitleStyle("harm")}>
              {lang === "it" ? "Danno attivo" : "Active harm"}
            </div>
            {problematic.length === 0 ? (
              <div
                style={{
                  padding: 18,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                }}
              >
                {lang === "it" ? "Nessun brand critico al momento." : "No critical brands right now."}
              </div>
            ) : (
              problematic.map((b) => renderBrandRow(b, "harm"))
            )}
          </div>

          <div style={sectionStyle}>
            <div style={bandTitleStyle("transparency")}>
              {lang === "it" ? "Trasparenza carente" : "Lacking transparency"}
            </div>
            {insufficient.length === 0 ? (
              <div
                style={{
                  padding: 18,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                }}
              >
                {lang === "it"
                  ? "Tutti i brand hanno abbastanza evidenza pubblica."
                  : "All tracked brands have enough public evidence."}
              </div>
            ) : (
              insufficient.map((b) => renderBrandRow(b, "transparency"))
            )}
          </div>

          <div style={sectionStyle}>
            <div style={bandTitleStyle("positive")}>
              {lang === "it" ? "Alternative migliori" : "Better choices"}
            </div>
            {positive.length === 0 ? (
              <div
                style={{
                  padding: 18,
                  fontFamily: "'DM Sans', sans-serif",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                }}
              >
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
