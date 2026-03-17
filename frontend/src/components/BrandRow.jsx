import { useCategories } from "../context/categoriesContext";
import {
  getScore,
  getColor,
  getCatLabel,
  getDisplayScore,
  getDisplayScoreColor,
} from "../utils/brandHelpers";

export default function BrandRow({
  brand,
  idx,
  myBrands,
  onAdd,
  onSelect,
  lang,
}) {
  const categories = useCategories();
  const score = getDisplayScore(brand);
  const rawScore = getScore(brand);
  const inList = myBrands.find((b) => b.name === brand.name);

  return (
    <div
      className="brand-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 11,
        cursor: "pointer",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.18)",
          width: 16,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {idx + 1}
      </div>

      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          flexShrink: 0,
          background: `${getColor(score)}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: getColor(score),
        }}
      >
        {brand.logo}
      </div>

      <div style={{ flex: 1, minWidth: 0 }} onClick={() => onSelect(brand)}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {brand.name}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
          {brand.parent}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 5,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.key}
            title={getCatLabel(cat, lang)}
            style={{
              width: 5,
              height: 5,
              borderRadius: 99,
              background: getColor(brand.scores?.[cat.key]),
            }}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: getColor(score),
          width: 32,
          textAlign: "right",
          flexShrink: 0,
        }}
        onClick={() => onSelect(brand)}
      >
        {score}
      </div>

      <button
        className="add-btn"
        onClick={() => onAdd(brand)}
        style={{
          background: inList ? "rgba(99,202,183,0.1)" : "transparent",
          border: "1px solid rgba(255,255,255,0.08)",
          color: inList ? "#63CAB7" : "rgba(255,255,255,0.3)",
          padding: "4px 10px",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 11,
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.15s",
          flexShrink: 0,
        }}
      >
        {inList ? "✓" : "+"}
      </button>
    </div>
  );
}
