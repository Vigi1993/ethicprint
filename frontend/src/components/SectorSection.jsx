import { useState } from "react";
import { useCategories } from "../context/categoriesContext";
import RestBrands from "./RestBrands";
import {
  getCatLabel,
  getDisplayScore,
  getSectorAvgDisplayScore,
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
    (a, b) => (getDisplayScore(b) ?? -9999) - (getDisplayScore(a) ?? -9999)
  );

  const avgScore = getSectorAvgDisplayScore(brands);
  const best = sorted[0];
  const rest = sorted.slice(1);
  const bestScore = best ? getDisplayScore(best) : null;
  const bestInList = best && myBrands.find((b) => b.name === best.name);

  return (
    <div
      style={{
        marginBottom: 16,
        border: "4px solid #111",
        background: "#f4eee3",
        boxShadow: "6px 6px 0 #111",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(0,0,0,0.2) 0 1px, transparent 1.2px), radial-gradient(circle at 78% 34%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px), radial-gradient(circle at 60% 82%, rgba(0,0,0,0.12) 0 1px, transparent 1.2px)",
          backgroundSize: "12px 12px, 16px 16px, 14px 14px",
          mixBlendMode: "multiply",
        }}
      />

      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto auto",
          gap: 14,
          alignItems: "center",
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
          position: "relative",
          zIndex: 1,
          borderBottom: expanded ? "4px solid #111" : "none",
          background: expanded ? "#5d9fd4" : "#efe7d8",
        }}
      >
<div style={{ width: 0 }} />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
              fontSize: 26,
              lineHeight: 0.95,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              color: "#111",
            }}
          >
            {sector}
          </div>
          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 12,
              color: "rgba(0,0,0,0.65)",
              fontWeight: 700,
              marginTop: 3,
              textTransform: "uppercase",
            }}
          >
            {brands.length} {lang === "it" ? "brand" : "brands"}
          </div>
        </div>

        <div
          style={{
            minWidth: 78,
            textAlign: "center",
            flexShrink: 0,
            border: "3px solid #111",
            background: "#111",
            color: "#fff",
            padding: "7px 10px 6px",
          }}
        >
          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              opacity: 0.8,
              marginBottom: 2,
            }}
          >
            avg
          </div>
          <div
            style={{
              fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
              fontSize: 24,
              lineHeight: 1,
            }}
          >
            {avgScore ?? "—"}
          </div>
          <div
            style={{
              fontFamily: "Arial, Helvetica, sans-serif",
              fontSize: 10,
              lineHeight: 1,
              opacity: 0.8,
              marginTop: 2,
            }}
          >
            /100
          </div>
        </div>

        <div
          style={{
            color: "#111",
            fontSize: 16,
            transition: "transform 0.25s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
            fontWeight: 900,
          }}
        >
          ▼
        </div>
      </div>

      {expanded && best && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: "16px 16px 10px",
          }}
        >
          <div
            className="brand-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 12,
              alignItems: "center",
              padding: "14px 14px",
              border: "3px solid #111",
              background: "#f7f1e8",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                minWidth: 0,
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 12,
                alignItems: "start",
              }}
              onClick={() => onSelect(best)}
            >


              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#111",
                    lineHeight: 1,
                    marginBottom: 5,
                  }}
                >
                  {best.name}
                </div>

<div
  style={{
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 12,
    color: "rgba(0,0,0,0.55)",
    fontWeight: 700,
    marginTop: 4,
    fontStyle: "italic",
  }}
>
  {lang === "it" ? "Clicca per vedere dettagli e fonti" : "Click to see details and sources"}
</div>
                
              </div>
            </div>

            <div
              style={{
                minWidth: 82,
                textAlign: "center",
                border: "3px solid #111",
                background: bestScore === null
                  ? "#111"
                  : bestScore >= 70
                  ? "#4a9e5c"
                  : bestScore >= 50
                  ? "#e7bb3a"
                  : "#c4432c",
                color: bestScore !== null && bestScore >= 50 && bestScore < 70 ? "#111" : "#fff",
                padding: "10px 10px 8px",
                flexShrink: 0,
              }}
              onClick={() => onSelect(best)}
            >
              <div
                style={{
                  fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                  fontSize: 24,
                  lineHeight: 1,
                }}
              >
                {bestScore ?? "—"}
                {bestScore !== null && (
                  <span style={{ fontSize: 13 }}>/100</span>
                )}
              </div>
            </div>
            <button
              className="add-btn"
              onClick={() => onAdd(best)}
              style={{
                background: bestInList ? "#111" : "#5d9fd4",
                color: bestInList ? "#f4eee3" : "#111",
                border: "3px solid #111",
                padding: "10px 12px 9px",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                textTransform: "uppercase",
                lineHeight: 1,
                minWidth: 64,
                flexShrink: 0,
              }}
            >
              {bestInList ? "✓" : lang === "it" ? "+ Aggiungi" : "+ Add"}
            </button>
          </div>

          {rest.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <RestBrands
                rest={rest}
                myBrands={myBrands}
                onAdd={onAdd}
                onSelect={onSelect}
                lang={lang}
              />
            </div>
          )}
        </div>
      )}

      {expanded && <div style={{ height: 6 }} />}
    </div>
  );
}
