import { getDisplayScore, getDisplayScoreColor } from "../utils/brandHelpers";

export default function BrandRow({
  brand,
  myBrands,
  onAdd,
  onSelect,
}) {
  const score = getDisplayScore(brand);
  const inList = myBrands.find((b) => b.name === brand.name);
  const scoreColor = getDisplayScoreColor(score);

  return (
    <div
      className="brand-row"
      onClick={() => onSelect(brand)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 12,
        alignItems: "center",
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        background: "transparent",
        transition: "background 0.15s ease",
      }}
    >
      <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `${scoreColor}22`,
            border: `1px solid ${scoreColor}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: scoreColor,
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {brand.logo || brand.name?.[0]}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: "#e8e8f0",
              lineHeight: 1.1,
              marginBottom: 3,
            }}
          >
            {brand.name}
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              fontWeight: 400,
            }}
          >
            {brand.parent || brand.parent_company || brand.sector || ""}
          </div>
        </div>
      </div>

      <div
        style={{
          minWidth: 60,
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          background: `${scoreColor}14`,
          color: scoreColor,
          padding: "8px 10px",
          borderRadius: 12,
          fontFamily: "'DM Mono', monospace",
          fontSize: 17,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {score ?? "—"}
        {score !== null && (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginLeft: 2 }}>
            /100
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd(brand);
        }}
        style={{
          background: inList ? "rgba(99,202,183,0.12)" : "rgba(255,255,255,0.06)",
          color: inList ? "#63CAB7" : "rgba(255,255,255,0.72)",
          border: inList
            ? "1px solid rgba(99,202,183,0.24)"
            : "1px solid rgba(255,255,255,0.1)",
          padding: "8px 10px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          minWidth: 52,
          borderRadius: 10,
          transition: "all 0.15s ease",
        }}
      >
        {inList ? "✓" : "+"}
      </button>
    </div>
  );
}
