import { useState, useEffect, useRef } from "react";
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
          inset: 0,
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
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

// Deduplica un array di fonti per URL
function dedupeByUrl(sources) {
  const seen = new Set();
  return (sources || []).filter((src) => {
    if (!src.url || seen.has(src.url)) return false;
    seen.add(src.url);
    return true;
  });
}

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
          background: "rgba(0,0,0,0.7)",
          zIndex: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "min(780px, 100%)",
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: 24,
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.3)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              letterSpacing: 2,
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
        background: "rgba(0,0,0,0.7)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 100%)",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "24px 22px 20px",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          color: "#e8e8f0",
        }}
      >
        <style>{`
          .brandcard-link:hover { background: rgba(255,255,255,0.04) !important; }
          .brandcard-action:hover {
            background: rgba(99,202,183,0.15) !important;
            color: #63CAB7 !important;
            border-color: rgba(99,202,183,0.3) !important;
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 18,
            background: "#0f0f1a",
            zIndex: 2,
            paddingBottom: 16,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(99,202,183,0.7)",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {b.sector || "Brand"}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
              padding: "6px 14px",
              borderRadius: 99,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ✕ {lang === "it" ? "Chiudi" : "Close"}
          </button>
        </div>

        <div
          className="brandcard-top"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 20,
            alignItems: "start",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "clamp(28px, 5vw, 40px)",
                lineHeight: 0.98,
                color: "#e8e8f0",
                marginBottom: 10,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {b.name}
            </div>

            <div
              style={{
                fontSize: "clamp(15px, 2.2vw, 20px)",
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 10,
                fontWeight: 300,
                fontFamily: "'DM Sans', sans-serif",
                maxWidth: 620,
              }}
            >
              {displayLabel || (lang === "it" ? "Profilo etico del brand" : "Ethical brand profile")}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.parent}: {b.parent || "—"}
            </div>
          </div>

          <div
            className="brandcard-score"
            style={{
              minWidth: 130,
              background: `${color}18`,
              border: `1px solid ${color}33`,
              borderRadius: 20,
              padding: "18px 18px 16px",
              textAlign: "center",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
            }}
          >
            {b.insufficient_data || displayScore === null ? (
              <>
                <div
                  style={{
                    fontSize: 34,
                    lineHeight: 1,
                    color: "#f1d37a",
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  —
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "#f1d37a",
                    fontFamily: "'DM Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t.insufficient}
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 42,
                    lineHeight: 1,
                    color,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {displayScore}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.28)",
                    fontFamily: "'DM Mono', monospace",
                    marginTop: 4,
                  }}
                >
                  /100
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "'DM Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t.score}
                </div>
                {b.criteria_published > 0 && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      color: "rgba(255,255,255,0.28)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {b.criteria_published} {t.criteria}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {b.impact_summary && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.78)",
              fontSize: 14,
              lineHeight: 1.55,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {b.impact_summary}
          </div>
        )}

        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(99,202,183,0.7)",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
              marginBottom: 12,
            }}
          >
            {lang === "it" ? "Breakdown per categoria" : "Category breakdown"}
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
            }}
          >
            {categories.map((cat) => {
              const conf = b.confidence?.[cat.key] || {};
              const criteria_met = conf.criteria_met;
              const rawScore = b.scores?.[cat.key];
              const publicCategoryScore = criteria_met ? rawCategoryScoreToPublic(rawScore) : null;
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
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    opacity: criteria_met ? 1 : 0.72,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
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
                          fontSize: 10,
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
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(99,202,183,0.7)",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
              marginBottom: 12,
            }}
          >
            {t.notes_title}
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
            }}
          >
            {categories.map((cat) => {
              const rawSources = b.sources?.[cat.key] || [];
              const catSources = dedupeByUrl(rawSources); // ← deduplicazione
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
                        lineHeight: 1.55,
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
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(99,202,183,0.7)",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
              marginBottom: 12,
            }}
          >
            {t.alternatives_label}
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
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
  );
}
