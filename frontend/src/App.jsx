import { useState, useEffect, useRef } from "react";
import logoSrc from "./assets/logo.png";
import BrandCard from "./components/BrandCard";
import MyListPanel from "./components/MyListPanel";
import SectorSection from "./components/SectorSection";
import { CategoriesContext } from "./context/categoriesContext";
import { useInitialData } from "./hooks/useInitialData";
import { useSourcesCount } from "./hooks/useSourcesCount";
import { useBrandSearch } from "./hooks/useBrandSearch";
import {
  getScore,
  getColor,
  getSectorAvgScore,
  getCatLabel,
  getDisplayScore,
  getDisplayScoreColor,
} from "./utils/brandHelpers";
import { UI } from "./constants/uiText";

const THRESHOLD = 50;

function LangToggle({ lang, setLang }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 200,
        display: "flex",
        gap: 4,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 99,
        padding: "4px",
      }}
    >
      {["en", "it"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? "rgba(99,202,183,0.2)" : "transparent",
            border:
              lang === l
                ? "1px solid rgba(99,202,183,0.4)"
                : "1px solid transparent",
            color: lang === l ? "#63CAB7" : "rgba(255,255,255,0.35)",
            padding: "4px 12px",
            borderRadius: 99,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.15s",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const { db, categories, loading } = useInitialData(lang);
  const [query, setQuery] = useState("");
  const results = useBrandSearch(query, db);
  const [selected, setSelected] = useState(null);
  const [myBrands, setMyBrands] = useState([]);
  const sourcesCount = useSourcesCount();
  const inputRef = useRef(null);

  const t = UI[lang] || UI.en;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const addToList = (brand) => {
    if (!myBrands.find((b) => b.name === brand.name)) {
      setMyBrands((prev) => [...prev, brand]);
    }
    setQuery("");
  };

  const sectors = [...new Set(db.map((b) => b.sector))].sort();

  const brandsBySector = sectors
    .map((sector) => {
      const brands = db.filter((b) => b.sector === sector);
      const sectorIcon = brands[0]?.sector_icon || "🏢";
      return {
        sector,
        sectorIcon,
        brands,
        avgScore: getSectorAvgScore(brands),
      };
    })
    .sort((a, b) => (b.avgScore ?? -9999) - (a.avgScore ?? -9999));

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#08080f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            letterSpacing: 2,
          }}
        >
          {t.loading}
        </div>
      </div>
    );
  }

  return (
    <CategoriesContext.Provider value={categories}>
      <LangToggle lang={lang} setLang={setLang} />

      <div
        style={{
          minHeight: "100vh",
          background: "#08080f",
          fontFamily: "'DM Sans', sans-serif",
          color: "#e8e8f0",
        }}
      >
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::selection { background: rgba(99,202,183,0.3); }
          input:focus { outline: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
          .brand-row:hover { background: rgba(255,255,255,0.05) !important; }
          .add-btn:hover { background: rgba(99,202,183,0.2) !important; color: #63cab7 !important; }
        `}</style>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 4,
                color: "rgba(99,202,183,0.7)",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              {t.tagline}
            </div>

            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
              <img
                src={logoSrc}
                alt="EthicPrint"
                style={{
                  height: "clamp(48px, 10vw, 80px)",
                  width: "auto",
                  filter:
                    "brightness(1.05) drop-shadow(0 0 18px rgba(99,202,183,0.25))",
                  mixBlendMode: "normal",
                }}
              />
            </div>

            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 16,
                maxWidth: 440,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              {t.subtitle}
              <br />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                {categories.map((c) => getCatLabel(c, lang).split(" ")[0]).join(" · ")}
              </span>
            </p>
          </div>

              <MyListPanel
                myBrands={myBrands}
                db={db}
                onAdd={addToList}
                onRemove={(name) =>
                  setMyBrands((prev) => prev.filter((b) => b.name !== name))
                }
                onClear={() => setMyBrands([])}
                onSelect={setSelected}
                lang={lang}
                ui={UI}
                threshold={THRESHOLD}
              />
              
              <div style={{ marginTop: 28, marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 8,
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {lang === "it" ? "Database brand" : "Brand database"}
                </div>
              
                <div
                  style={{
                    color: "rgba(255,255,255,0.62)",
                    fontSize: 14,
                    marginBottom: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {lang === "it"
                    ? "Esplora tutti i brand e confrontali per settore."
                    : "Explore all brands and compare them by sector."}
                </div>
              
                <div style={{ position: "relative", marginBottom: 8 }}>
                  
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                padding: "14px 18px",
                boxShadow: query ? "0 0 0 2px rgba(99,202,183,0.15)" : "none",
              }}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search_placeholder}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 16,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />

              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "#0f0f1a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  overflow: "hidden",
                  zIndex: 50,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                {results.map((brand) => {
                  const score = getDisplayScore(brand);
                  const rawScore = getScore(brand);
                  const inList = myBrands.find((b) => b.name === brand.name);

                  return (
                    <div
                      key={brand.name}
                      className="brand-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: `${getDisplayScoreColor(score)}22`,
                          border: `1px solid ${getDisplayScoreColor(score)}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: getDisplayScoreColor(score),
                        }}
                      >
                        {brand.logo}
                      </div>

                      <div style={{ textAlign: "right", marginRight: 8 }} onClick={() => setSelected(brand)}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: getDisplayScoreColor(score) }}>
                          {score ?? "—"}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>/ 100</div>
                      </div>

                      <button
                        className="add-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToList(brand);
                          }}
                        style={{
                          background: inList
                            ? "rgba(99,202,183,0.1)"
                            : "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: inList ? "#63CAB7" : "rgba(255,255,255,0.5)",
                          padding: "6px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {inList ? "✓" : "+ List"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.2)",
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            {t.db_info(db.length, sectors.length, sourcesCount)}
          </div>
        </div>

          <div style={{ marginTop: 52 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                marginBottom: 32,
              }}
            >
              {t.ranking_title}
            </div>

            {brandsBySector.map(({ sector, sectorIcon, brands }) => (
              <SectorSection
                key={sector}
                sector={sector}
                sectorIcon={sectorIcon}
                brands={brands}
                myBrands={myBrands}
                onAdd={addToList}
                onSelect={setSelected}
                lang={lang}
                defaultOpen={true}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 64,
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              paddingTop: 32,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.2)",
                lineHeight: 1.8,
              }}
            >
              {t.footer.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
              <br />
              <a
                href="/contribute.html"
                style={{
                  color: "rgba(99,202,183,0.5)",
                  textDecoration: "none",
                }}
              >
                {lang === "it"
                  ? "➕ Contribuisci · Segnala un errore · Aggiungi un brand"
                  : "➕ Contribute · Report an error · Add a brand"}
              </a>
            </div>
          </div>
        </div>

        {selected && (
          <BrandCard
            brand={selected}
            onClose={() => setSelected(null)}
            lang={lang}
            onSelectAlt={(alt) => setSelected(alt)}
          />
        )}
      </div>
    </CategoriesContext.Provider>
  );
}
