import { useState } from "react";
import { useCategories } from "../context/categoriesContext";
import RestBrands from "./RestBrands";
import {
  getScore,
  getColor,
  getCatLabel,
  getSectorAvgScore,
} from "../utils/brandHelpers";

export default function SectorSection({
  sector,
  sectorIcon,
  brands,
  myBrands,
  onAdd,
  onSelect,
  lang,
  defaultOpen,
}) {
  const categories = useCategories();
  const [expanded, setExpanded] = useState(defaultOpen);

  const sorted = [...brands].sort(
    (a, b) => (getScore(b) ?? -9999) - (getScore(a) ?? -9999)
  );
  const avgScore = getSectorAvgScore(brands);
  const best = sorted[0];
  const rest = sorted.slice(1);
  const avgColor = getColor(avgScore);
  const bestScore = best ? getScore(best) : 0;
  const bestInList = best && myBrands.find((b) => b.name === best.name);

  return (
    <div
      style={{
        marginBottom: 8,
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(255,255,255,0.01)",
      }}
    >
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{sectorIcon}</span>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
            {sector}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginTop: 1,
            }}
          >
            {brands.length} {lang === "it" ? "brand" : "brands"}
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
            flexShrink: 0,
            marginRight: 8,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: avgColor }}>
            {avgScore}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            {lang === "it" ? "media" : "avg"}
          </div>
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: 11,
            transition: "transform 0.25s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          ▼
        </div>
      </div>

      {expanded && best && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            margin: "0 12px",
            padding: "12px 6px 8px",
          }}
        >
          <div
            className="brand-row"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 11,
              background: `${getColor(bestScore)}08`,
              border: `1px solid ${getColor(bestScore)}22`,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: `${getColor(bestScore)}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: getColor(bestScore),
                flexShrink: 0,
              }}
            >
              {best.logo}
            </div>

            <div style={{ flex: 1, minWidth: 0 }} onClick={() => onSelect(best)}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{best.name}</div>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 4,
                  alignItems: "center",
                }}
              >
                {categories.map((cat) => (
                  <div
                    key={cat.key}
                    style={{ display: "flex", alignItems: "center", gap: 3 }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 99,
                        background: getColor(best.scores?.[cat.key]),
                      }}
                    />
                    <span
                      style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}
                    >
                      {getCatLabel(cat, lang).split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: getColor(bestScore),
                flexShrink: 0,
              }}
              onClick={() => onSelect(best)}
            >
              {bestScore}
            </div>

            <button
              className="add-btn"
              onClick={() => onAdd(best)}
              style={{
                background: bestInList
                  ? "rgba(99,202,183,0.1)"
                  : "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: bestInList ? "#63CAB7" : "rgba(255,255,255,0.3)",
                padding: "4px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              {bestInList ? "✓" : "+"}
            </button>
          </div>

          {rest.length > 0 && (
            <RestBrands
              rest={rest}
              myBrands={myBrands}
              onAdd={onAdd}
              onSelect={onSelect}
              lang={lang}
              getScore={getScore}
              getColor={getColor}
              getCatLabel={getCatLabel}
            />
          )}
        </div>
      )}

      {expanded && <div style={{ height: 8 }} />}
    </div>
  );
}
