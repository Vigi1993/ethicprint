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

  const avgColor =
    avgScore === null
      ? "rgba(255,255,255,0.4)"
      : avgScore >= 70
      ? "#63CAB7"
      : avgScore >= 50
      ? "#f1d37a"
      : "#ff9a9a";

  const bestScoreColor =
    bestScore === null
      ? "rgba(255,255,255,0.4)"
      : bestScore >= 70
      ? "#63CAB7"
      : bestScore >= 50
      ? "#f1d37a"
      : "#ff9a9a";

  return (
    <div
      style={{
        marginBottom: 16,
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
            "radial-gradient(circle at top left, rgba(99,202,183,0.04), transparent 26%)",
        }}
      />

      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 14,
          alignItems: "center",
          padding: "16px 18px",
          cursor: "pointer",
          userSelect: "none",
          position: "relative",
          zIndex: 1,
          borderBottom: expanded ? "1px solid rgba(255,255,255,0.08)" : "none",
          background: expanded ? "rgba(255,255,255,0.02)" : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
              minWidth: 0,
            }}
          >
            {sectorIcon && (
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 14,
                }}
              >
                {sectorIcon}
              </div>
            )}

            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 20,
                lineHeight: 1.05,
                fontWeight: 600,
                color: "#e8e8f0",
                minWidth: 0,
              }}
            >
              {sector}
            </div>
          </div>

          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.32)",
              letterSpacing: "0.04em",
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
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            padding: "9px 10px 8px",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.3)",
              marginBottom: 4,
            }}
          >
            avg
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 22,
              lineHeight: 1,
              color: avgColor,
              fontWeight: 700,
            }}
          >
            {avgScore ?? "—"}
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              lineHeight: 1,
              color: "rgba(255,255,255,0.24)",
              marginTop: 3,
            }}
          >
            /100
          </div>
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            transition: "transform 0.25s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
            fontWeight: 700,
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
              padding: "14px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 16,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              onClick={() => onSelect(best)}
            >

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#e8e8f0",
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}
                >
                  {best.name}
                </div>

                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 400,
                    marginTop: 2,
                  }}
                >
                  {lang === "it"
                    ? "Clicca per vedere dettagli e fonti"
                    : "Click to see details and sources"}
                </div>
              </div>
            </div>

            <div
              style={{
                minWidth: 82,
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.08)",
                background: `${bestScoreColor}14`,
                borderRadius: 14,
                padding: "10px 10px 8px",
                flexShrink: 0,
              }}
              onClick={() => onSelect(best)}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 22,
                  lineHeight: 1,
                  color: bestScoreColor,
                  fontWeight: 700,
                }}
              >
                {bestScore ?? "—"}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  lineHeight: 1,
                  color: "rgba(255,255,255,0.24)",
                  marginTop: 4,
                }}
              >
                /100
              </div>
            </div>

            <button
              className="add-btn"
              onClick={() => onAdd(best)}
              style={{
                background: bestInList
                  ? "rgba(99,202,183,0.12)"
                  : "rgba(255,255,255,0.06)",
                color: bestInList ? "#63CAB7" : "rgba(255,255,255,0.62)",
                border: bestInList
                  ? "1px solid rgba(99,202,183,0.24)"
                  : "1px solid rgba(255,255,255,0.1)",
                padding: "10px 12px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: 10,
                lineHeight: 1,
                minWidth: 72,
                flexShrink: 0,
                transition: "all 0.15s ease",
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
