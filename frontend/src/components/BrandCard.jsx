import { useEffect, useState } from "react";
import { getBrandDetail } from "../api/brands";
import { useCategories } from "../context/categoriesContext";
import {
  getScore,
  getColor,
  getCatLabel,
  getDisplayScore,
  getDisplayLabel,
  getDisplayScoreColor,
  rawCategoryScoreToPublic,
} from "../utils/brandHelpers";

function ScoreBar({ value, color }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.08)",
        border: "2px solid rgba(0,0,0,0.78)",
        height: 16,
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: `${pct}%`,
          background: color,
          transition: "width 1s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}
const UI = {
  en: {
    notes_title: "Notes & Sources",
    alternatives_label: "Better alternatives",
    parent: "Parent company",
    loading: "Loading...",
    score: "Ethical score",
    insufficient: "Insufficient data",
    raw: "raw",
    criteria: "published criteria",
    noAlt: "This brand is among the strongest options in its sector.",
  },
  it: {
    notes_title: "Note & Fonti",
    alternatives_label: "Alternative migliori",
    parent: "Casa madre",
    loading: "Caricamento...",
    score: "Punteggio etico",
    insufficient: "Dati insufficienti",
    raw: "raw",
    criteria: "criteri pubblicati",
    noAlt: "Questo brand è tra le opzioni più forti del suo settore.",
  },
};

export default function BrandCard({ brand, onClose, lang, onSelectAlt }) {
  const categories = useCategories();
  const [fullBrand, setFullBrand] = useState(brand || null);
  const t = UI[lang] || UI.en;

  const total = fullBrand ? getScore(fullBrand) : null;
  const displayScore = fullBrand ? getDisplayScore(fullBrand) : null;
  const displayLabel = fullBrand ? getDisplayLabel(fullBrand, lang) : "";
  const color = getDisplayScoreColor(displayScore);

  useEffect(() => {
    let isMounted = true;

    async function loadBrandDetail() {
      const data = await getBrandDetail(brand.id, lang);
      if (!isMounted) return;
      setFullBrand(data || brand);
    }

    loadBrandDetail();

    return () => {
      isMounted = false;
    };
  }, [brand.id, lang, brand]);

  if (!fullBrand) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.62)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: "#f4eee3",
            border: "4px solid #111",
            boxShadow: "8px 8px 0 #111",
            padding: 36,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              color: "#111",
              fontSize: 13,
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {t.loading}
          </div>
        </div>
      </div>
    );
  }

  const b = fullBrand;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.62)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#f4eee3",
          border: "4px solid #111",
          boxShadow: "10px 10px 0 #111",
          maxWidth: 780,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          color: "#111",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          .brandcard-paper {
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(circle at 18% 16%, rgba(0,0,0,0.06) 0 1px, transparent 1px),
              radial-gradient(circle at 82% 32%, rgba(0,0,0,0.05) 0 1px, transparent 1px),
              radial-gradient(circle at 58% 78%, rgba(0,0,0,0.05) 0 1px, transparent 1px),
              #f4eee3;
            background-size: 14px 14px, 16px 16px, 12px 12px, auto;
          }
          .brandcard-paper::before {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: repeating-linear-gradient(0deg, rgba(0,0,0,0.018) 0 1px, transparent 1px 3px);
            opacity: 0.45;
          }
          .brandcard-link:hover {
            background: rgba(0,0,0,0.05) !important;
          }
          @media (max-width: 760px) {
            .brandcard-top {
              grid-template-columns: 1fr !important;
            }
            .brandcard-score {
              justify-self: start !important;
            }
          }
        `}</style>

        <div className="brandcard-paper" style={{ padding: 24 }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "#111",
              border: "3px solid #111",
              color: "#f4eee3",
              width: 38,
              height: 38,
              cursor: "pointer",
              fontSize: 26,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            ×
          </button>

          <div
            style={{
              borderBottom: "6px solid #111",
              paddingBottom: 16,
              marginBottom: 18,
              paddingRight: 52,
            }}
          >
            <div
              style={{
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.7)",
                marginBottom: 8,
              }}
            >
              {b.sector || "Brand"}
            </div>

            <div className="brandcard-top" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
              <div>
                <div
                  style={{
                    fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                    fontSize: "clamp(42px, 7vw, 72px)",
                    lineHeight: 0.9,
                    textTransform: "uppercase",
                    letterSpacing: "0.01em",
                    marginBottom: 10,
                    maxWidth: 520,
                  }}
                >
                  {b.name}
                </div>

                <div
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "clamp(18px, 2.5vw, 28px)",
                    lineHeight: 1.08,
                    marginBottom: 10,
                    maxWidth: 520,
                  }}
                >
                  {displayLabel || (lang === "it" ? "Profilo etico del brand" : "Ethical brand profile")}
                </div>

                <div
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 13,
                    color: "rgba(0,0,0,0.72)",
                    fontWeight: 700,
                  }}
                >
                  {t.parent}: {b.parent || "—"}
                </div>
              </div>

              <div
                className="brandcard-score"
                style={{
                  justifySelf: "end",
                  width: 158,
                  minHeight: 158,
                  background: displayScore === null || b.insufficient_data
                  ? "#e7bb3a"
                  : displayScore >= 70
                  ? "#4a9e5c"
                  : displayScore >= 50
                  ? "#e7bb3a"
                  : "#c4432c",
                color: displayScore !== null && !b.insufficient_data && displayScore >= 50 && displayScore < 70
                  ? "#111"
                  : "#fff",
                  border: "6px solid #111",
                  boxShadow: "6px 6px 0 #111",
                  transform: "rotate(-3deg)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 14,
                  textAlign: "center",
                }}
              >
                {b.insufficient_data || displayScore === null ? (
                  <>
                    <div
                      style={{
                        fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                        fontSize: 28,
                        lineHeight: 0.95,
                        textTransform: "uppercase",
                      }}
                    >
                      —
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 12,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        lineHeight: 1.1,
                      }}
                    >
                      {t.insufficient}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                        fontSize: 54,
                        lineHeight: 0.9,
                      }}
                    >
                      {displayScore}
                      <span style={{ fontSize: 24 }}>/100</span>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: 11,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {t.score}
                    </div>
                    {b.criteria_published > 0 && (
                      <div
                        style={{
                          marginTop: 5,
                          fontFamily: "Arial, Helvetica, sans-serif",
                          fontSize: 10,
                          fontWeight: 700,
                          opacity: 0.8,
                        }}
                      >
                        {b.criteria_published} {t.criteria}
                      </div>
                    )}
   
                  </>
                )}
              </div>
            </div>
          </div>

          {b.impact_summary && (
            <div
              style={{
                border: "4px solid #111",
                background: "#111",
                color: "#f4eee3",
                padding: "14px 16px",
                marginBottom: 20,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 18,
                lineHeight: 1.35,
              }}
            >
              {b.impact_summary}
            </div>
          )}

          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                background: "#dd4a2f",
                color: "#fff",
                border: "4px solid #111",
                borderBottom: "none",
                padding: "12px 16px 10px",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 26,
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              {lang === "it" ? "Breakdown per categoria" : "Category breakdown"}
            </div>

            <div style={{ border: "4px solid #111", background: "#efe7d8", padding: 16 }}>
              {categories.map((cat) => {
                const conf = b.confidence?.[cat.key] || {};
                const criteria_met = conf.criteria_met;
                const rawScore = b.scores?.[cat.key];
                const publicCategoryScore = criteria_met ? rawCategoryScoreToPublic(rawScore) : null;
        console.log(cat.key, { conf, criteria_met, rawScore, publicCategoryScore });
                const catColor = criteria_met ? getDisplayScoreColor(publicCategoryScore) : "#b8aa90";
                const t1 = conf.tier1 ?? conf.t1 ?? 0;
                const t2 = conf.tier2 ?? conf.t2 ?? 0;
                const t3 = conf.tier3 ?? conf.t3 ?? 0;
                const hasAnySources = t1 + t2 + t3 > 0;

                return (
                  <div
                    key={cat.key}
                    style={{
                      marginBottom: 14,
                      paddingBottom: 14,
                      borderBottom: "2px solid rgba(0,0,0,0.15)",
                      opacity: criteria_met ? 1 : 0.72,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8, alignItems: "baseline" }}>
                      <span
                        style={{
                          fontFamily: "Arial, Helvetica, sans-serif",
                          fontSize: 14,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          color: "#111",
                        }}
                      >
                        {cat.icon} {getCatLabel(cat, lang)}
                      </span>

                      {criteria_met ? (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                          <span style={{ fontSize: 24, fontWeight: 900, color: "#111", fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif" }}>
                            {publicCategoryScore}
                          </span>
                          <span style={{ fontSize: 11, color: "rgba(0,0,0,0.55)", fontWeight: 800 }}>
                            /100
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: "#9c4f1f", fontWeight: 800, textTransform: "uppercase" }}>
                          {hasAnySources
                            ? lang === "it"
                              ? "fonti insufficienti"
                              : "insufficient sources"
                            : lang === "it"
                              ? "nessuna fonte"
                              : "no sources"}
                        </span>
                      )}
                    </div>

                    <ScoreBar
                      value={criteria_met ? publicCategoryScore : 0}
                      color={catColor}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                background: "#111",
                color: "#f4eee3",
                border: "4px solid #111",
                borderBottom: "none",
                padding: "12px 16px 10px",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 24,
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              {t.notes_title}
            </div>

            <div style={{ border: "4px solid #111", background: "#f4eee3", padding: 16 }}>
              {categories.map((cat) => {
                const catSources = b.sources?.[cat.key] || [];
                const hasNote = b.notes?.[cat.key];
                const conf = b.confidence?.[cat.key];

                if (!hasNote && !catSources.length && !conf) return null;

                return (
                  <div
                    key={cat.key}
                    style={{
                      marginBottom: 18,
                      paddingBottom: 14,
                      borderBottom: "2px solid rgba(0,0,0,0.12)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 15 }}>{cat.icon}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 900,
                          color: "#111",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {getCatLabel(cat, lang)}
                      </span>
                    </div>

                    {hasNote && (
                      <div
                        style={{
                          fontSize: 14,
                          color: "rgba(0,0,0,0.8)",
                          lineHeight: 1.5,
                          marginBottom: 8,
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        {b.notes?.[cat.key]}
                      </div>
                    )}

                    {conf && (
                      <div style={{ marginBottom: catSources.length ? 10 : 0 }}>
                        <span style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", fontWeight: 800, textTransform: "uppercase" }}>
                          ◆ {conf.count} {lang === "it"
                            ? conf.count === 1
                              ? "fonte verificata"
                              : "fonti verificate"
                            : conf.count === 1
                              ? "verified source"
                              : "verified sources"}
                        </span>
                      </div>
                    )}

                    {catSources.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {catSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="brandcard-link"
                            style={{
                              fontSize: 12,
                              color: "#111",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              border: "2px solid #111",
                              background: "#efe7d8",
                              padding: "8px 10px",
                              width: "fit-content",
                              fontWeight: 800,
                            }}
                          >
                            ↗ {src.title || src.publisher || "Source"}
                            {src.publisher && src.title && (
                              <span style={{ color: "rgba(0,0,0,0.58)", fontSize: 11, fontWeight: 700 }}>
                                — {src.publisher}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div
              style={{
                background: "#e7bb3a",
                color: "#111",
                border: "4px solid #111",
                borderBottom: "none",
                padding: "12px 16px 10px",
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                fontSize: 24,
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              {t.alternatives_label}
            </div>

            <div style={{ border: "4px solid #111", background: "#efe7d8", padding: 16 }}>
              {b.alternatives && b.alternatives.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {b.alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => onSelectAlt(alt)}
                      className="brandcard-link"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr auto auto",
                        alignItems: "center",
                        gap: 12,
                        background: "#f4eee3",
                        border: "3px solid #111",
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          border: "3px solid #111",
                          background: getColor(alt.score),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {alt.logo}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#111", lineHeight: 1 }}>
                          {alt.name}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.62)", fontWeight: 700, marginTop: 4 }}>
                          {alt.sector}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 24,
                          fontWeight: 900,
                          color: "#111",
                          fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                        }}
                      >
                        {alt.score}
                      </div>
                      <div style={{ fontSize: 18, color: "#111", fontWeight: 900 }}>
                        →
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "rgba(0,0,0,0.78)", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {t.noAlt}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
