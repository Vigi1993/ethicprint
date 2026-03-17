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

function ScoreBar({ value, color, max = 20 }) {
  const pct = Math.min(100, Math.abs(Math.round((value / max) * 50)));
  const positive = value >= 0;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 99,
        height: 6,
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: 1,
          height: "100%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: "width 1s cubic-bezier(.4,0,.2,1)",
          left: positive ? "50%" : undefined,
          right: positive ? undefined : "50%",
        }}
      />
    </div>
  );
}

const UI = {
  en: {
    notes_title: "Notes & Sources",
    alternatives_label: "✦ More ethical alternatives",
    parent: "Parent company",
    loading: "Loading...",
  },
  it: {
    notes_title: "Note & Fonti",
    alternatives_label: "✦ Alternative più etiche",
    parent: "Casa madre",
    loading: "Caricamento...",
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
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
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
            background: "#0f0f1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
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
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
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
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 32,
          maxWidth: 520,
          width: "100%",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
            width: 32,
            height: 32,
            borderRadius: 99,
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          ×
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            paddingRight: 40,
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
                marginBottom: 4,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {b.sector}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {b.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
                marginTop: 2,
              }}
            >
              {t.parent}: {b.parent}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            {b.insufficient_data || displayScore === null ? (
              <div
                style={{
                  fontSize: 13,
                  color: "#fb923c",
                  fontWeight: 600,
                  maxWidth: 140,
                  lineHeight: 1.4,
                }}
              >
                {lang === "it" ? "⚠️ Dati insufficienti" : "⚠️ Insufficient data"}
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 800,
                    color,
                    fontFamily: "monospace",
                    lineHeight: 1,
                  }}
                >
                  {displayScore}
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 2,
                  }}
                >
                  / 100
                </div>

                {displayLabel && (
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {displayLabel}
                  </div>
                )}

                {b.criteria_published > 0 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.25)",
                      marginTop: 6,
                    }}
                  >
                    {lang === "it"
                      ? `${b.criteria_published} criteri pubblicati`
                      : `${b.criteria_published} published criteria`}
                  </div>
                )}

                {total !== null && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.18)",
                      marginTop: 2,
                    }}
                  >
                    raw {total}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {b.impact_summary && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              fontStyle: "italic",
            }}
          >
            {b.impact_summary}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          {categories.map((cat) => {
            const conf = b.confidence?.[cat.key] || {};
            const criteria_met = conf.criteria_met;
           const rawScore = b.scores?.[cat.key];
            const publicCategoryScore = criteria_met
              ? rawCategoryScoreToPublic(rawScore)
              : null;
            
            const catColor = criteria_met
              ? getDisplayScoreColor(publicCategoryScore)
              : "rgba(255,255,255,0.15)";
            const t1 = conf.tier1 ?? conf.t1 ?? 0;
            const t2 = conf.tier2 ?? conf.t2 ?? 0;
            const t3 = conf.tier3 ?? conf.t3 ?? 0;
            const hasAnySources = t1 + t2 + t3 > 0;

            return (
              <div key={cat.key} style={{ marginBottom: 12, opacity: criteria_met ? 1 : 0.45 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: criteria_met ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {cat.icon} {getCatLabel(cat, lang)}
                  </span>

                  {criteria_met ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: catColor }}>
                        {publicCategoryScore}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                        / 100
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontSize: 10,
                        color: "#fb923c",
                        fontFamily: "'DM Mono', monospace",
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
                  value={criteria_met ? (publicCategoryScore ?? 0) - 50 : 0}
                  color={catColor}
                  max={50}
                />
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 14,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t.notes_title}
          </div>

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
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{cat.icon}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {getCatLabel(cat, lang)}
                  </span>
                </div>

                {hasNote && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.6,
                      marginBottom: 8,
                    }}
                  >
                    {b.notes?.[cat.key]}
                  </div>
                )}

                {conf && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: catSources.length ? 8 : 0,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingLeft: 16,
                    }}
                  >
                    {catSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11,
                          color: "rgba(99,202,183,0.6)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          borderBottom: "1px solid rgba(99,202,183,0.15)",
                          paddingBottom: 1,
                          width: "fit-content",
                          transition: "color 0.15s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.color = "#63CAB7";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.color = "rgba(99,202,183,0.6)";
                        }}
                      >
                        ↗ {src.title || src.publisher || "Source"}
                        {src.publisher && src.title && (
                          <span
                            style={{
                              color: "rgba(255,255,255,0.2)",
                              fontSize: 10,
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

        <div
          style={{
            marginTop: 20,
            background:
              b.alternatives && b.alternatives.length > 0
                ? "rgba(99,202,183,0.06)"
                : "rgba(255,255,255,0.02)",
            border:
              "1px solid " +
              (b.alternatives && b.alternatives.length > 0
                ? "rgba(99,202,183,0.15)"
                : "rgba(255,255,255,0.06)"),
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#63CAB7",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {t.alternatives_label}
          </div>

          {b.alternatives && b.alternatives.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {b.alternatives.map((alt) => (
                <div
                  key={alt.id}
                  onClick={() => onSelectAlt(alt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(99,202,183,0.15)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(99,202,183,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: getColor(alt.score) + "22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {alt.logo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                      {alt.name}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {alt.sector}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: getColor(alt.score),
                    }}
                  >
                    {alt.score}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    →
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                fontStyle: "italic",
              }}
            >
              {lang === "it"
                ? "🏆 Questo brand è tra i più virtuosi nel suo settore."
                : "🏆 This brand is among the most ethical in its sector."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
