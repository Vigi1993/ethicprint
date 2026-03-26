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
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 999,
        height: 10,
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
          borderRadius: 999,
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
          background: "rgba(0,0,0,0.72)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            padding: 36,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 500,
              letterSpacing: "0.12em",
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
        background: "rgba(0,0,0,0.72)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          maxWidth: 780,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          color: "#e8e8f0",
          borderRadius: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          .brandcard-shell {
            position: relative;
            overflow: hidden;
            background:
              radial-gradient(circle at top left, rgba(99,202,183,0.05), transparent 28%),
              radial-gradient(circle at bottom right, rgba(255,255,255,0.03), transparent 22%),
              #0f0f1a;
          }
          .brandcard-link:hover {
            background: rgba(255,255,255,0.04) !important;
          }
          .brandcard-btn:hover {
            background: rgba(99,202,183,0.15) !important;
            border-color: rgba(99,202,183,0.3) !important;
            color: #63CAB7 !important;
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

        <div className="brandcard-shell" style={{ padding: 24 }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              width: 38,
              height: 38,
              cursor: "pointer",
              fontSize: 24,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              borderRadius: 99,
            }}
          >
            ×
          </button>

          <div
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: 18,
              marginBottom: 20,
              paddingRight: 52,
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(99,202,183,0.65)",
                marginBottom: 10,
              }}
            >
              {b.sector || "Brand"}
            </div>

            <div
              className="brandcard-top"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 20,
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(34px, 6vw, 56px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                    marginBottom: 12,
                    maxWidth: 520,
                    fontWeight: 600,
                    color: "#e8e8f0",
                  }}
                >
                  {b.name}
                </div>

                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(16px, 2.5vw, 22px)",
                    lineHeight: 1.35,
                    marginBottom: 12,
                    maxWidth: 560,
                    color: "rgba(255,255,255,0.72)",
                    fontWeight: 300,
                  }}
                >
                  {displayLabel || (lang === "it" ? "Profilo etico del brand" : "Ethical brand profile")}
                </div>

                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.42)",
                    fontWeight: 400,
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
                  background:
                    b.insufficient_data || displayScore === null
                      ? "rgba(255,214,102,0.12)"
                      : `${color}16`,
                  color:
                    b.insufficient_data || displayScore === null
                      ? "#f1d37a"
                      : color,
                  border: `1px solid ${
                    b.insufficient_data || displayScore === null
                      ? "rgba(255,214,102,0.22)"
                      : `${color}33`
                  }`,
                  borderRadius: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  textAlign: "center",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                }}
              >
                {b.insufficient_data || displayScore === null ? (
                  <>
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 34,
                        lineHeight: 0.95,
                        fontWeight: 500,
                      }}
                    >
                      —
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        lineHeight: 1.2,
                        color: "#f1d37a",
                      }}
                    >
                      {t.insufficient}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 46,
                        lineHeight: 0.9,
                        fontWeight: 700,
                      }}
                    >
                      {displayScore}
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 12,
                        color: "rgba(255,255,255,0.28)",
                      }}
                    >
                      /100
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      {t.score}
                    </div>
                    {b.criteria_published > 0 && (
                      <div
                        style={{
                          marginTop: 6,
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          color: "rgba(255,255,255,0.35)",
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
                border: "1px solid rgba(99,202,183,0.18)",
                background: "rgba(99,202,183,0.08)",
                color: "#e8e8f0",
                padding: "14px 16px",
                marginBottom: 20,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                lineHeight: 1.55,
                borderRadius: 16,
              }}
            >
              {b.impact_summary}
            </div>
          )}

          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                background: "rgba(255,107,107,0.08)",
                color: "#ff9a9a",
                border: "1px solid rgba(255,107,107,0.18)",
                borderBottom: "none",
                padding: "14px 16px",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                lineHeight: 1,
                textTransform: "uppercase",
                letterSpacing: 3,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
              }}
            >
              {lang === "it" ? "Breakdown per categoria" : "Category breakdown"}
            </div>

            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                padding: 16,
                borderBottomLeftRadius: 18,
                borderBottomRightRadius: 18,
              }}
            >
              {categories.map((cat) => {
                const conf = b.confidence?.[cat.key] || {};
                const criteria_met = conf.criteria_met;
                const rawScore = b.scores?.[cat.key];
                const publicCategoryScore = criteria_met ? rawCategoryScoreToPublic(rawScore) : null;
                const catColor = criteria_met ? getDisplayScoreColor(publicCategoryScore) : "rgba(255,255,255,0.22)";
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
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      opacity: criteria_met ? 1 : 0.72,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 10,
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#e8e8f0",
                        }}
                      >
                        {cat.icon} {getCatLabel(cat, lang)}
                      </span>

                      {criteria_met ? (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                          <span
                            style={{
                              fontSize: 22,
                              fontWeight: 700,
                              color: catColor,
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {publicCategoryScore}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.28)",
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            /100
                          </span>
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(255,214,102,0.8)",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            fontFamily: "'DM Mono', monospace",
                            letterSpacing: "0.04em",
                          }}
                        >
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
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "none",
                padding: "14px 16px",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                lineHeight: 1,
                textTransform: "uppercase",
                letterSpacing: 3,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
              }}
            >
              {t.notes_title}
            </div>

            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                padding: 16,
                borderBottomLeftRadius: 18,
                borderBottomRightRadius: 18,
              }}
            >
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
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 15 }}>{cat.icon}</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.78)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {getCatLabel(cat, lang)}
                      </span>
                    </div>

                    {hasNote && (
                      <div
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.72)",
                          lineHeight: 1.6,
                          marginBottom: 8,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {b.notes?.[cat.key]}
                      </div>
                    )}

                    {conf && (
                      <div style={{ marginBottom: catSources.length ? 10 : 0 }}>
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.38)",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            fontFamily: "'DM Mono', monospace",
                            letterSpacing: "0.04em",
                          }}
                        >
                          ◆ {conf.count}{" "}
                          {lang === "it"
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
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {catSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="brandcard-link"
                            style={{
                              fontSize: 12,
                              color: "#e8e8f0",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              border: "1px solid rgba(255,255,255,0.08)",
                              background: "rgba(255,255,255,0.03)",
                              padding: "10px 12px",
                              width: "fit-content",
                              fontWeight: 500,
                              borderRadius: 12,
                              fontFamily: "'DM Sans', sans-serif",
                              transition: "background 0.15s ease",
                            }}
                          >
                            ↗ {src.title || src.publisher || "Source"}
                            {src.publisher && src.title && (
                              <span
                                style={{
                                  color: "rgba(255,255,255,0.35)",
                                  fontSize: 11,
                                  fontWeight: 400,
                                }}
                              >
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
                background: "rgba(99,202,183,0.1)",
                color: "#63CAB7",
                border: "1px solid rgba(99,202,183,0.18)",
                borderBottom: "none",
                padding: "14px 16px",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                lineHeight: 1,
                textTransform: "uppercase",
                letterSpacing: 3,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
              }}
            >
              {t.alternatives_label}
            </div>

            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                padding: 16,
                borderBottomLeftRadius: 18,
                borderBottomRightRadius: 18,
              }}
            >
              {b.alternatives && b.alternatives.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {b.alternatives.map((alt) => {
                    const altColor = getDisplayScoreColor(alt.score);

                    return (
                      <div
                        key={alt.id}
                        onClick={() => onSelectAlt(alt)}
                        className="brandcard-link"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto auto",
                          alignItems: "center",
                          gap: 12,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          padding: "12px 14px",
                          cursor: "pointer",
                          borderRadius: 14,
                          transition: "background 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            background: `${altColor}22`,
                            border: `1px solid ${altColor}44`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            flexShrink: 0,
                            color: altColor,
                            fontWeight: 700,
                          }}
                        >
                          {alt.logo}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#e8e8f0",
                              lineHeight: 1,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {alt.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.35)",
                              fontWeight: 400,
                              marginTop: 4,
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {alt.sector}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: altColor,
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {alt.score}
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            color: "rgba(255,255,255,0.35)",
                            fontWeight: 700,
                          }}
                        >
                          →
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.68)",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.55,
                  }}
                >
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
