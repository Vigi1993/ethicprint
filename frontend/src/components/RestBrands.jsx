import { useState } from "react";
import BrandRow from "./BrandRow";

export default function RestBrands({
  rest,
  myBrands,
  onAdd,
  onSelect,
  lang,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          background: open ? "rgba(99,202,183,0.1)" : "rgba(255,255,255,0.05)",
          border: open
            ? "1px solid rgba(99,202,183,0.28)"
            : "1px solid rgba(255,255,255,0.1)",
          color: open ? "#63CAB7" : "rgba(255,255,255,0.65)",
          padding: "10px 14px",
          borderRadius: 12,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        {open
          ? lang === "it"
            ? "Nascondi"
            : "Hide"
          : lang === "it"
            ? `Vedi altri ${rest.length}`
            : `See ${rest.length} more`}
      </button>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {rest.map((brand, idx) => (
            <BrandRow
              key={brand.name}
              brand={brand}
              idx={idx + 1}
              myBrands={myBrands}
              onAdd={onAdd}
              onSelect={onSelect}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
