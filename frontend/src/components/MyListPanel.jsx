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

export default function MyListPanel({
  myBrands,
  db,
  onAdd,
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
  categories.forEach((c) => {
    avgScores[c.key] = 0;
  });

  if (myBrands.length > 0) {
    myBrands.forEach((b) => {
      categories.forEach((c) => {
        avgScores[c.key] += b.scores?.[c.key] || 0;
      });
    });

    categories.forEach((c) => {
      avgScores[c.key] = Math.round(avgScores[c.key] / myBrands.length);
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
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
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
              marginBottom: 6,
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
                  insufficient_data: publicAverage === null,
                },
                lang
              )}
            </div>
          </div>
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
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 10,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {lang === "it" ? "I tuoi brand" : "Your brands"}
        </div>

        {isEmpty ? (
          <div
            style={{
              padding: "8px 0 2px",
              color: "rgba(255,255,255,0.58)",
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {lang === "it"
              ? "Aggiungi i brand che usi più spesso. Ti mostreremo il loro giudizio e, se serve, alternative migliori."
              : "Add the brands you use most. We’ll show their ethical standing and, when needed, better alternatives."}
          </div>
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

                    return (
                      <div
                        key={b.name}
                        onClick={() => onSelect(b)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <div style={{ fontSize: 16, minWidth: 18 }}>
                            {b.insufficient_data ? "❔" : "⚠️"}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
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
                              {b.name}
                            </div>

                            <div
                              style={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: 12,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {getDisplayLabel(b, lang)}
                            </div>
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
                              fontWeight: 700,
                              color: getDisplayScoreColor(displayScore),
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {displayScore ?? "—"}
                          </div>

                          {b.alternatives?.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect(b);
                              }}
                              style={{
                                background: "rgba(99,202,183,0.08)",
                                border: "1px solid rgba(99,202,183,0.2)",
                                borderRadius: 8,
                                padding: "7px 10px",
                                color: "#63CAB7",
                                cursor: "pointer",
                                fontSize: 11,
                                fontFamily: "'DM Sans', sans-serif",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {lang === "it" ? "Alternative →" : "Alternatives →"}
                            </button>
                          )}

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
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 8,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {lang === "it" ? "In buona posizione" : "In good standing"}
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
                          padding: "12px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <div style={{ fontSize: 16, minWidth: 18 }}>✓</div>

                          <div style={{ minWidth: 0, flex: 1 }}>
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
                              {b.name}
                            </div>

                            <div
                              style={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: 12,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {getDisplayLabel(b, lang)}
                            </div>
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
            marginBottom: 10,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {lang === "it" ? "Aggiungi brand che usi" : "Add brands you use"}
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

      <div>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 10,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {lang === "it" ? "Profilo categorie" : "Category profile"}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
            gap: 10,
          }}
        >
          {categories.map((cat) => {
            const publicCatScore = isEmpty
              ? null
              : rawCategoryScoreToPublic(avgScores[cat.key]);

            return (
              <div
                key={cat.key}
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 6,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {cat.icon} {getCatLabel(cat, lang)}
                </div>

                <div
                  style={{
                    fontSize: 16,
                    color: getDisplayScoreColor(publicCatScore),
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {publicCatScore ?? "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
