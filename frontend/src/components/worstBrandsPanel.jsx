import { useMemo, useState } from "react";
import { useCategories } from "../context/categoriesContext";
import {
  getCatLabel,
  getDisplayScore,
  rawCategoryScoreToPublic,
} from "../utils/brandHelpers";

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
      ? "Non ci sono ancora abbastanza fonti pubbliche per valutarlo bene."
      : "There isn’t enough public evidence yet to assess it properly.";
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

export default function WorstBrandsPanel({
  brands,
  lang,
  onSelect,
  limit = 3,
}) {
  const categories = useCategories();
  const [expanded, setExpanded] = useState(false);

  const sortedWorst = useMemo(() => {
    return [...(brands || [])]
      .filter((brand) => !brand?.insufficient_data)
      .filter((brand) => typeof getDisplayScore(brand) === "number")
      .sort((a, b) => (getDisplayScore(a) ?? 999) - (getDisplayScore(b) ?? 999));
  }, [brands]);

  const visibleBrands = expanded ? sortedWorst.slice(0, 6) : sortedWorst.slice(0, limit);

  if (!sortedWorst.length) return null;

  return (
    <div
      style={{
        marginTop: 26,
        marginBottom: 30,
        border: "4px solid #181310",
        background: "#f2eadf",
        boxShadow: "8px 8px 0 #181310",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(0,0,0,0.2) 0 1px, transparent 1.2px), radial-gradient(circle at 78% 34%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px), radial-gradient(circle at 60% 82%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px)",
          backgroundSize: "12px 12px, 16px 16px, 14px 14px",
          mixBlendMode: "multiply",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: 22 }}>
        <div
          style={{
            display: "inline-block",
            background: "#e44723",
            color: "#fff5ea",
            border: "3px solid #181310",
            boxShadow: "4px 4px 0 #181310",
            padding: "8px 12px",
            marginBottom: 14,
            fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
            fontSize: 18,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
          }}
        >
          {lang === "it" ? "Worst ethics overall" : "Worst ethics overall"}
        </div>

        <div
          style={{
            fontFamily: "'Bitter', serif",
            fontSize: 18,
            lineHeight: 1.35,
            color: "rgba(0,0,0,0.78)",
            maxWidth: 760,
            marginBottom: 18,
          }}
        >
          {lang === "it"
            ? "I brand con i segnali etici più deboli in tutti i settori. Clicca sul brand per vedere alternative migliori."
            : "The brands with the weakest ethical signals across all sectors. Click on the brand to see better alternatives."}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleBrands.map((brand, idx) => {
            const score = getDisplayScore(brand);
            const issueLabel = getIssueLabel(brand, categories, lang);
            const issueExplanation = getIssueExplanation(brand, categories, lang);

            return (
              <div
                key={brand.name}
                onClick={() => onSelect?.(brand)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 14,
                  alignItems: "center",
                  border: "3px solid #181310",
                  background: idx === 0 ? "#efe7d8" : "#f7f1e8",
                  padding: "14px 14px 13px",
                  cursor: "pointer",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      marginBottom: 7,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                        fontSize: 13,
                        textTransform: "uppercase",
                        color: "#c63f1d",
                        border: "2px solid #181310",
                        background: "#efc640",
                        padding: "4px 7px 3px",
                        lineHeight: 1,
                      }}
                    >
                      #{idx + 1}
                    </div>

                    <div
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 24,
                        fontWeight: 900,
                        color: "#111",
                        lineHeight: 1,
                      }}
                    >
                      {brand.name}
                    </div>

                    <div
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 12,
                        color: "rgba(0,0,0,0.62)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                      }}
                    >
                      {brand.sector}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "inline-block",
                      background: "#181310",
                      color: "#fff5ea",
                      padding: "6px 9px 5px",
                      marginBottom: 8,
                      fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                      fontSize: 13,
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    {issueLabel}
                  </div>

                  <div
                    style={{
                      fontFamily: "'Bitter', serif",
                      fontSize: 15,
                      lineHeight: 1.5,
                      color: "rgba(0,0,0,0.76)",
                      maxWidth: 620,
                    }}
                  >
                    {issueExplanation}
                  </div>

                  <div
                    style={{
                      marginTop: 9,
                      fontFamily: "'Archivo Narrow', sans-serif",
                      fontWeight: 800,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "#c63f1d",
                    }}
                  >
                    {lang === "it"
                      ? "Clicca sul brand per vedere alternative"
                      : "Click on the brand to see alternatives"}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 88,
                    textAlign: "center",
                    border: "3px solid #181310",
                    background: "#181310",
                    color: "#fff",
                    padding: "10px 10px 8px",
                    alignSelf: "stretch",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                      fontSize: 30,
                      lineHeight: 0.95,
                    }}
                  >
                    {score ?? "—"}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Archivo Narrow', sans-serif",
                      fontWeight: 800,
                      fontSize: 12,
                      textTransform: "uppercase",
                      marginTop: 3,
                    }}
                  >
                    /100
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedWorst.length > limit && (
          <div style={{ marginTop: 14 }}>
            <button
              onClick={() => setExpanded((prev) => !prev)}
              style={{
                border: "3px solid #181310",
                background: expanded ? "#181310" : "#efe7d8",
                color: expanded ? "#f4eee3" : "#181310",
                padding: "10px 14px",
                fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                fontSize: 14,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {expanded
                ? lang === "it"
                  ? "Nascondi"
                  : "Hide"
                : lang === "it"
                ? "Mostra altri"
                : "Show more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
