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
          border: "3px solid #111",
          background: open ? "#111" : "#efe7d8",
          color: open ? "#f4eee3" : "#111",
          padding: "8px 10px",
          fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
          fontSize: 14,
          textTransform: "uppercase",
          cursor: "pointer",
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
            marginTop: 6,
            border: "3px solid #111",
            background: "#f7f1e8",
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
