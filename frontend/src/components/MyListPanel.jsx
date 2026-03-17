import { useCategories } from "../context/categoriesContext";

export default function MyListPanel({
  myBrands,
  onRemove,
  onClear,
  onSelect,
  lang,
  ui,
  threshold,
  getScore,
  getColor,
  getVerdict,
  getCatLabel,
}) {
  const categories = useCategories();
  const t = ui[lang] || ui.en;

  if (myBrands.length === 0) return null;

  const avgScores = {};
  categories.forEach((c) => {
    avgScores[c.key] = 0;
  });

  myBrands.forEach((b) => {
    categories.forEach((c) => {
      avgScores[c.key] += b.scores?.[c.key] || 0;
    });
  });

  categories.forEach((c) => {
    avgScores[c.key] = Math.round(avgScores[c.key] / myBrands.length);
  });

  const total = categories.length
    ? Math.round(Object.values(avgScores).reduce((a, b) => a + b, 0) / categories.length)
    : 0;

  const verdict = getVerdict(total, lang);
  const color = getColor(total);

  const problematic = myBrands.filter(
    (b) => (getScore(b) ?? 9999) < threshold && b.alternatives && b.alternatives.length > 0
  );

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: 24,
        marginTop: 32,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {t.my_list_title}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
            {verdict.emoji} {t.aggregated_score}: <span style={{ color }}>{total}</span>
          </div>
        </div>

        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.3)",
            padding: "6px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          {t.clear_list}
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <div
            key={cat.key}
            style={{
              flex: "1 1 120px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
              {cat.icon} {getCatLabel(cat, lang)}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: getColor(avgScores[cat.key]) }}>
              {avgScores[cat.key] ?? "—"}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: problematic.length > 0 ? 24 : 0 }}>
        {myBrands.map((b) => {
          const s = getScore(b);
          return (
            <div
              key={b.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: s < threshold ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${s < threshold ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 99,
                padding: "6px 12px 6px 8px",
                cursor: "pointer",
              }}
              onClick={() => onSelect(b)}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: getColor(s) }}>{s}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{b.name}</span>
              {s < threshold && <span style={{ fontSize: 10 }}>⚠️</span>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(b.name);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {problematic.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: "#f87171", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            {t.alternatives_title}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {problematic.map((b) => (
              <div
                key={b.name}
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: "1px solid rgba(239,68,68,0.12)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: getColor(getScore(b)) }}>{b.name}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    {b.insufficient_data ? "⚠️" : `score ${getScore(b) ?? "—"}`}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      background: "rgba(239,68,68,0.15)",
                      color: "#f87171",
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    {t.below_threshold}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{t.replace_with}</div>

                <button
                  onClick={() => onSelect(b)}
                  style={{
                    background: "rgba(99,202,183,0.08)",
                    border: "1px solid rgba(99,202,183,0.2)",
                    borderRadius: 8,
                    padding: "7px 14px",
                    color: "#63CAB7",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {lang === "it" ? "Vedi alternative →" : "See alternatives →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
