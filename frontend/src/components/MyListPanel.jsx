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

function getSwitchBenefitCopy(brand, categories, lang) {
  if (brand?.insufficient_data) {
    return lang === "it"
      ? "Scegliere un’alternativa con più evidenza pubblica ti aiuta a fare una scelta più consapevole."
      : "Choosing an alternative with more public evidence helps you make a more informed choice.";
  }

  const worst = getWorstCategory(brand, categories);
  const key = worst?.cat?.key;

  const copy = {
    it: {
      environment:
        "Cambiare può ridurre il supporto a modelli più impattanti su ambiente e risorse.",
      labor:
        "Cambiare può spostare il tuo supporto verso filiere e condizioni più affidabili.",
      conflicts:
        "Cambiare può ridurre l’esposizione a brand con segnali più controversi.",
      transparency:
        "Cambiare può favorire brand più chiari su pratiche, filiera e governance.",
      animals:
        "Cambiare può favorire scelte più attente a materiali e benessere animale.",
      default:
        "Cambiare può spostare il tuo impatto verso opzioni eticamente più solide.",
    },
    en: {
      environment:
        "Switching can reduce support for models with heavier impact on environment and resources.",
      labor:
        "Switching can move your support toward more reliable supply chains and conditions.",
      conflicts:
        "Switching can reduce exposure to brands with more controversial signals.",
      transparency:
        "Switching can favor brands that are clearer about practices, supply chain, and governance.",
      animals:
        "Switching can favor choices that are more careful about materials and animal welfare.",
      default:
        "Switching can move your impact toward more ethically solid options.",
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
    return b.insufficient_data || (score !== null && score < threshold);
  });

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

  return (
    <div
      style={{
        marginTop: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 18,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'DM Mono', monospace",
              marginBottom: 8,
            }}
          >
            {t.my_list_title}
          </div>
      
          <div
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 10,
            }}
          >
            {isEmpty
              ? lang === "it"
                ? "Inizia a costruire la tua impronta etica"
                : "Start building your ethical footprint"
              : lang === "it"
              ? `Monitori ${myBrands.length} brand · ${problematic.length} richiedono attenzione`
              : `You track ${myBrands.length} brands · ${problematic.length} need attention`}
          </div>
      
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: getDisplayScoreColor(publicAverage),
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1,
              }}
            >
              {publicAverage ?? "—"}
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  marginLeft: 6,
                }}
              >
                / 100
              </span>
            </div>
      
          {publicAverage !== null && (
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.75)",
                fontFamily: "'DM Sans', sans-serif",
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {getDisplayLabel(
                {
                  public_score: publicAverage,
                  insufficient_data: false,
                },
                lang
              )}
            </div>
          )}
          </div>
      
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            {categories.map((cat) => {
          const publicCatScore =
            isEmpty || typeof avgScores[cat.key] !== "number"
              ? null
              : rawCategoryScoreToPublic(avgScores[cat.key]);
      
              return (
                <div
                  key={cat.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 8px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {cat.icon}
                  </span>
      
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {getCatLabel(cat, lang)}
                  </span>
      
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: getDisplayScoreColor(publicCatScore),
                    }}
                  >
                    {publicCatScore ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
      
          <a
            href="/sources.html"
            style={{
              fontSize: 12,
              color: "rgba(99,202,183,0.72)",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#63CAB7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(99,202,183,0.72)";
            }}
          >
            {lang === "it"
              ? "Come funzionano i punteggi? →"
              : "How do scores work? →"}
          </a>
        </div>
      
        {!isEmpty && (
          <button
            onClick={onClear}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.65)",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.clear_list}
          </button>
        )}
      </div>

              <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {lang === "it" ? "I tuoi brand" : "Your brands"}
            </div>
        
            {!isEmpty && (
              <div
                style={{
                  color: "rgba(255,255,255,0.42)",
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {lang === "it"
                  ? "Clicca un brand per vedere fonti, note e dettagli"
                  : "Click a brand to see sources, notes, and details"}
              </div>
            )}
          </div>
            {isEmpty ? (
              <>
                <div
                  style={{
                    padding: "8px 0 4px",
                    color: "#fff",
                    fontSize: 15,
                    lineHeight: 1.5,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {lang === "it"
                    ? "Inizia dai brand che usi davvero ogni settimana."
                    : "Start with the brands you actually use every week."}
                </div>
            
                <div
                  style={{
                    padding: "0 0 4px",
                    color: "rgba(255,255,255,0.62)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {lang === "it"
                    ? "Ti mostreremo il loro giudizio etico, cosa non va quando emergono criticità, e alternative migliori quando servono."
                    : "We’ll show their ethical standing, what’s problematic when issues emerge, and better alternatives when needed."}
                </div>
            
                <div
                  style={{
                    padding: "2px 0 10px",
                    color: "rgba(255,255,255,0.42)",
                    fontSize: 12,
                    lineHeight: 1.5,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {lang === "it"
                    ? "Dopo averli aggiunti, puoi cliccare su ogni brand per vedere fonti, note e dettagli del punteggio."
                    : "Once added, you can click any brand to see sources, notes, and scoring details."}
                </div>
            
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    paddingBottom: 4,
                  }}
                >
                  {(lang === "it"
                    ? ["Moda", "GDO", "Energia", "Tech", "Social"]
                    : ["Fashion", "Grocery", "Energy", "Tech", "Social"]
                  ).map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </>
            ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 8,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {lang === "it" ? "Richiedono attenzione" : "Needs attention"}
              </div>

              {problematic.length === 0 ? (
                <div
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {lang === "it"
                    ? "Nessun brand problematico per ora."
                    : "No problematic brands for now."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {problematic.map((b) => {
                    const displayScore = getDisplayScore(b);
                    const issueLabel = getIssueLabel(b, categories, lang);
                    const issueExplanation = getIssueExplanation(b, categories, lang);
                    const impactCopy = getImpactCopy(b, categories, lang);
                    const switchBenefitCopy = getSwitchBenefitCopy(b, categories, lang);
                    const topAlternative = getTopAlternative(b);
                    const alternativeName = getAlternativeName(topAlternative);
                    const alternativeDelta = getAlternativeDelta(b);
                    const replaceBrand = findAlternativeInDb(b, db);
                    const alternativeAdvantageCopy = replaceBrand
                      ? getAlternativeAdvantageCopy(b, replaceBrand, categories, lang)
                      : null;
                  
                    return (
                      
                      <div
                        key={b.name}
                        onClick={() => onSelect(b)}
                        className="footprint-brand-card"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 14,
                          padding: "14px",
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.045)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          cursor: "pointer",
                          transition: "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.065)";
                          e.currentTarget.style.borderColor = "rgba(99,202,183,0.22)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.045)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                      
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ fontSize: 16, minWidth: 18 }}>
                              {b.insufficient_data ? "❔" : "⚠️"}
                            </div>
                  
                            <div
                              style={{
                                color: "#fff",
                                fontSize: 15,
                                fontWeight: 700,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {b.name}
                            </div>
                  
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: getDisplayScoreColor(displayScore),
                                fontFamily: "'DM Sans', sans-serif",
                                padding: "4px 8px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              {displayScore ?? "—"} / 100
                            </div>
                          </div>
                  
                          <div
                            style={{
                              color: "rgba(255,255,255,0.86)",
                              fontSize: 13,
                              fontWeight: 600,
                              fontFamily: "'DM Sans', sans-serif",
                              marginBottom: 4,
                            }}
                          >
                            {issueLabel}
                          </div>
                  
                            <div
                              style={{
                                color: "rgba(255,255,255,0.62)",
                                fontSize: 12,
                                lineHeight: 1.5,
                                fontFamily: "'DM Sans', sans-serif",
                                marginBottom: 8,
                              }}
                            >
                              {issueExplanation}
                            </div>
                            
                            <div
                              style={{
                                color: "rgba(255,255,255,0.78)",
                                fontSize: 12,
                                lineHeight: 1.5,
                                fontFamily: "'DM Sans', sans-serif",
                                marginBottom: 8,
                              }}
                            >
                              <span style={{ color: "rgba(255,255,255,0.45)" }}>
                                {lang === "it" ? "Il tuo impatto: " : "Your impact: "}
                              </span>
                              {impactCopy}
                            </div>
                
                           {alternativeName && (
                              <div>
                                <div
                                  style={{
                                    color: "rgba(255,255,255,0.78)",
                                    fontSize: 12,
                                    lineHeight: 1.5,
                                    fontFamily: "'DM Sans', sans-serif",
                                    marginBottom: 8,
                                  }}
                                >
                                  <span style={{ color: "rgba(255,255,255,0.45)" }}>
                                    {lang === "it" ? "Perché cambiare aiuta: " : "Why switching helps: "}
                                  </span>
                                  {switchBenefitCopy}
                                </div>
                            
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div>
                                    <div
                                      style={{
                                        color: "#63CAB7",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        fontFamily: "'DM Sans', sans-serif",
                                        marginBottom: alternativeAdvantageCopy ? 2 : 0,
                                      }}
                                    >
                                      {lang === "it"
                                        ? `Meglio passare a ${alternativeName}`
                                        : `Better switch to ${alternativeName}`}
                                    </div>
                                  
                                    {alternativeAdvantageCopy && (
                                      <div
                                        style={{
                                          color: "rgba(255,255,255,0.52)",
                                          fontSize: 11,
                                          fontFamily: "'DM Sans', sans-serif",
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        {alternativeAdvantageCopy}
                                      </div>
                                    )}
                                  </div>
                            
                                    {alternativeDelta !== null && (
                                      <div
                                        style={{
                                          fontSize: 11,
                                          color: "rgba(255,255,255,0.5)",
                                          border: "1px solid rgba(255,255,255,0.08)",
                                          background: "rgba(255,255,255,0.03)",
                                          padding: "4px 8px",
                                          borderRadius: 999,
                                          fontFamily: "'DM Sans', sans-serif",
                                        }}
                                      >
                                        {lang === "it"
                                          ? `${alternativeDelta} punti meglio`
                                          : `${alternativeDelta} points better`}
                                      </div>
                                    )}
                            
                                  {replaceBrand ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onReplace(b, replaceBrand);
                                      }}
                                      style={{
                                        background: "#63CAB7",
                                        border: "1px solid rgba(99,202,183,0.35)",
                                        borderRadius: 8,
                                        padding: "6px 10px",
                                        color: "#08110f",
                                        cursor: "pointer",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        fontFamily: "'DM Sans', sans-serif",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {lang === "it"
                                        ? `Sostituisci con ${replaceBrand.name}`
                                        : `Replace with ${replaceBrand.name}`}
                                    </button>
                                  ) : null}
                            
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelect(b);
                                    }}
                                    style={{
                                      background: "rgba(99,202,183,0.08)",
                                      border: "1px solid rgba(99,202,183,0.2)",
                                      borderRadius: 8,
                                      padding: "6px 10px",
                                      color: "#63CAB7",
                                      cursor: "pointer",
                                      fontSize: 11,
                                      fontFamily: "'DM Sans', sans-serif",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {lang === "it" ? "Vedi dettaglio →" : "See details →"}
                                  </button>
                                </div>
                              </div>
                            )}
                        </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              justifyContent: "space-between",
                              gap: 10,
                              flexShrink: 0,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 14,
                                color: "rgba(255,255,255,0.3)",
                                fontFamily: "'DM Sans', sans-serif",
                                lineHeight: 1,
                              }}
                            >
                              →
                            </div>
                        
                          <div
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.45)",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {getDisplayLabel(b, lang)}
                          </div>
                  
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(b.name);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "rgba(255,255,255,0.25)",
                              cursor: "pointer",
                              fontSize: 15,
                              lineHeight: 1,
                              padding: 0,
                            }}
                            aria-label={`Remove ${b.name}`}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.36)",
                    marginBottom: 8,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {lang === "it" ? "Brand solidi" : "Stronger brands"}
                </div>

              {positive.length === 0 ? (
                <div
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {lang === "it"
                    ? "Nessun brand positivo ancora."
                    : "No positive brands yet."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                    {positive.map((b) => {
                        const displayScore = getDisplayScore(b);
                      
                        return (

                          <div
                              key={b.name}
                              onClick={() => onSelect(b)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.05)",
                                cursor: "pointer",
                                transition: "transform 0.15s ease, border-color 0.15s ease, background 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                e.currentTarget.style.borderColor = "rgba(99,202,183,0.16)";
                                e.currentTarget.style.transform = "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.transform = "translateY(0)";
                              }}
                            >

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                minWidth: 0,
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "rgba(99,202,183,0.9)",
                                  minWidth: 14,
                                }}
                              >
                                ✓
                              </div>
                      
                              <div
                                style={{
                                  color: "#fff",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  fontFamily: "'DM Sans', sans-serif",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {b.name}
                              </div>
                            </div>
                            
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "rgba(255,255,255,0.3)",
                                  fontFamily: "'DM Sans', sans-serif",
                                  lineHeight: 1,
                                }}
                              >
                                →
                              </div>

                              <div
                                style={{
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.55)",
                                  fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                {getDisplayLabel(b, lang)}
                              </div>
                      
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: getDisplayScoreColor(displayScore),
                                  fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                {displayScore ?? "—"}
                              </div>
                      
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemove(b.name);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "rgba(255,255,255,0.22)",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  lineHeight: 1,
                                  padding: 0,
                                }}
                                aria-label={`Remove ${b.name}`}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginBottom: 22,
          paddingTop: 2,
        }}
      >
          <div
            style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {lang === "it" ? "Aggiungi brand che usi" : "Add brands you use"}
          </div>
          
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              lineHeight: 1.5,
              marginBottom: 10,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {lang === "it"
              ? "Inizia da 3–5 brand che usi davvero: ti daranno una footprint più utile."
              : "Start with 3–5 brands you actually use for a more useful footprint."}
          </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "10px 12px",
            marginBottom: 10,
          }}
        >
          <input
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              if (activeHintKey) setActiveHintKey(null);
            }}
            placeholder={
              lang === "it"
                ? "Cerca un brand..."
                : "Search a brand..."
            }
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />

          {(localQuery || activeHintKey) && (
            <button
              onClick={() => {
                setLocalQuery("");
                setActiveHintKey(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.35)",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
              }}
              aria-label="Clear brand search"
            >
              ×
            </button>
          )}
        </div>
          <div
            style={{
              color: "rgba(255,255,255,0.42)",
              fontSize: 12,
              marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {lang === "it"
              ? "Per iniziare, prova da qui:"
              : "A good place to start:"}
          </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: shouldShowResults ? 10 : 0,
          }}
        >
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
                  background: isActive
                    ? "rgba(99,202,183,0.16)"
                    : "rgba(255,255,255,0.04)",
                  border: isActive
                    ? "1px solid rgba(99,202,183,0.35)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: isActive ? "#63CAB7" : "rgba(255,255,255,0.72)",
                  padding: "7px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {hint.label}
              </button>
            );
          })}
        </div>

        {shouldShowResults && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 10,
            }}
          >
            {addResults.length === 0 ? (
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {lang === "it"
                  ? "Nessun brand trovato."
                  : "No brands found."}
              </div>
            ) : (
              addResults.map((brand) => {
                const displayScore = getDisplayScore(brand);

                return (
                  <div
                    key={brand.name}
                    onClick={() => onSelect(brand)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {brand.name}
                      </div>

                      <div
                        style={{
                          color: "rgba(255,255,255,0.55)",
                          fontSize: 12,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {brand.sector || getDisplayLabel(brand, lang)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: getDisplayScoreColor(displayScore),
                          fontFamily: "'DM Sans', sans-serif",
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
                          background: "rgba(99,202,183,0.1)",
                          border: "1px solid rgba(99,202,183,0.2)",
                          color: "#63CAB7",
                          padding: "6px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'DM Sans', sans-serif",
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
