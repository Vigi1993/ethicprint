import { useMemo } from "react";

const CAT_LABELS = {
  armi: { en: "Conflicts & Arms", it: "Conflitti & Armi" },
  ambiente: { en: "Environment & CO₂", it: "Ambiente & CO₂" },
  diritti: { en: "Human Rights", it: "Diritti Umani" },
  fisco: { en: "Tax & Transparency", it: "Fisco & Trasparenza" },
};

function getImpactMeta(item, lang) {
  const value = Number(item?.value);
  const isPositive = value > 0;

  const label =
    lang === "it"
      ? isPositive
        ? "Impatto positivo"
        : "Impatto negativo"
      : isPositive
      ? "Positive impact"
      : "Negative impact";

  const tone = isPositive ? "#63CAB7" : "#ff9a9a";
  const bg = isPositive ? "rgba(99,202,183,0.1)" : "rgba(255,107,107,0.1)";
  const border = isPositive ? "rgba(99,202,183,0.22)" : "rgba(255,107,107,0.22)";
  const arrow = isPositive ? "↑" : "↓";

  return { label, tone, bg, border, arrow };
}

function getCategoryLabel(categoryKey, lang) {
  const cat = CAT_LABELS[categoryKey];
  if (!cat) return categoryKey || "—";
  return lang === "it" ? cat.it : cat.en;
}

export default function RecentSourcesPanel({
  updates = [],
  lang = "en",
  onSelectBrand,
}) {
  const items = useMemo(() => {
    // Deduplica per URL: tieni solo la prima occorrenza (la più recente dopo il sort)
    const sorted = [...updates]
      .filter((item) => item?.brand_name && item?.url)
      .sort((a, b) => {
        const aDate = new Date(a.created_at || a.date || 0).getTime();
        const bDate = new Date(b.created_at || b.date || 0).getTime();
        return bDate - aDate;
      });

    const seen = new Set();
    const deduped = [];
    for (const item of sorted) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        deduped.push(item);
      }
    }

    return deduped.slice(0, 12);
  }, [updates]);

  return (
    <div
      style={{
        marginBottom: 20,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at top left, rgba(99,202,183,0.05), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.03), transparent 22%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: 22 }}>
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(99,202,183,0.6)",
              textTransform: "uppercase",
              marginBottom: 12,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {lang === "it" ? "Fonti recenti" : "Recent sources"}
          </div>

          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(26px, 4vw, 34px)",
              lineHeight: 1.05,
              color: "#e8e8f0",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {lang === "it" ? "Ultime fonti aggiunte" : "Latest source updates"}
          </div>

          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 760,
            }}
          >
            {lang === "it"
              ? "Le fonti aggiunte più di recente, con il loro effetto diretto sulla valutazione dei brand."
              : "The most recently added sources, together with their direct effect on brand evaluations."}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 6,
            scrollSnapType: "x proximity",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                padding: "8px 2px 6px",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.32)",
              }}
            >
              {lang === "it"
                ? "Nessuna nuova fonte per ora."
                : "No new sources for now."}
            </div>
          ) : (
            items.map((item, idx) => {
              const impact = getImpactMeta(item, lang);
              const categoryLabel = getCategoryLabel(item.category_key, lang);
              const tier = item.tier ?? item.publisher_tier ?? null;

              return (
                <div
                  key={`${item.brand_name}-${item.url}-${idx}`}
                  style={{
                    minWidth: 300,
                    maxWidth: 300,
                    flex: "0 0 300px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: "14px 14px 13px",
                    scrollSnapAlign: "start",
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#e8e8f0",
                        lineHeight: 1.1,
                        marginBottom: 6,
                        cursor: onSelectBrand ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (onSelectBrand && item.brand_name) {
                          onSelectBrand({ name: item.brand_name, id: item.brand_id });
                        }
                      }}
                    >
                      {item.brand_name}
                    </div>

                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.32)",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {categoryLabel}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      border: `1px solid ${impact.border}`,
                      background: impact.bg,
                      color: impact.tone,
                      padding: "6px 10px",
                      marginBottom: 12,
                      borderRadius: 99,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      textTransform: "uppercase",
                      lineHeight: 1,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {impact.arrow} {impact.label}
                  </div>

                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.72)",
                      marginBottom: 12,
                      minHeight: 64,
                    }}
                  >
                    {item.title || item.publisher || item.url}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontWeight: 500,
                          color: "#63CAB7",
                          textDecoration: "none",
                          fontSize: 12,
                          fontFamily: "'DM Mono', monospace",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {lang === "it" ? "Apri la fonte →" : "Open source →"}
                      </a>

                      {tier != null && (
                        <div
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color:
                              tier === 1
                                ? "rgba(99,202,183,0.7)"
                                : "rgba(255,255,255,0.32)",
                          }}
                        >
                          T{tier} {lang === "it" ? "fonte" : "source"}
                        </div>
                      )}
                    </div>

                    {item.created_at && (
                      <div
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color: "rgba(255,255,255,0.28)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(item.created_at).toLocaleDateString(
                          lang === "it" ? "it-IT" : "en-GB"
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
