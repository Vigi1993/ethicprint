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
  getSectorAvgScore,
  getCatLabel,
  getDisplayScore,
  getDisplayScoreColor,
} from "./utils/brandHelpers";
import { UI } from "./constants/uiText";

const THRESHOLD = 50;
const MY_BRANDS_STORAGE_KEY = "ethicprint_my_brands_v1";

const PAPER = "#ece7df";
const INK = "#12100d";
const RED = "#d45735";
const GREEN = "#557866";
const LINE = "rgba(18,16,13,0.16)";

function LangToggle({ lang, setLang }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 300,
        display: "flex",
        gap: 6,
        background: "rgba(18,16,13,0.88)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 999,
        padding: 4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
      }}
    >
      {["en", "it"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? PAPER : "transparent",
            color: lang === l ? INK : "rgba(255,255,255,0.6)",
            border: "none",
            borderRadius: 999,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Inter', 'Arial', sans-serif",
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function EditorialHero({ t, lang, categories, myBrands }) {
  const total = myBrands.length || 0;
  const withScores = myBrands.filter((b) => typeof getDisplayScore(b) === "number");
  const average =
    withScores.length > 0
      ? Math.round(
          withScores.reduce((sum, brand) => sum + getDisplayScore(brand), 0) /
            withScores.length
        )
      : 53;

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "72px 1fr",
          gap: 14,
          alignItems: "end",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 34,
            lineHeight: 1,
            fontWeight: 500,
            color: INK,
            fontFamily: "'Inter', 'Arial', sans-serif",
          }}
        >
          B.
        </div>
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: INK,
            fontWeight: 500,
            fontFamily: "'Inter', 'Arial', sans-serif",
          }}
        >
          Editorial impact
        </div>
      </div>

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 82% 26%, rgba(212,87,53,0.55), transparent 16%), radial-gradient(circle at 10% 10%, rgba(255,255,255,0.08), transparent 24%), linear-gradient(180deg, #171411 0%, #0f0d0b 100%)",
          color: "#f5efe7",
          border: `1px solid rgba(18,16,13,0.45)`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-radial-gradient(circle at 20% 20%, rgba(255,255,255,0.045) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 5px)",
            mixBlendMode: "screen",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", padding: "18px 18px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={logoSrc} alt="EthicPrint" style={{ height: 34, width: "auto", filter: "brightness(1.1)" }} />
            </div>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.06em",
                color: "rgba(255,245,235,0.8)",
                fontFamily: "'Inter', 'Arial', sans-serif",
                textTransform: "uppercase",
              }}
            >
              {lang === "it" ? "Impatto brand · IT" : "Brand impact · EN"}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,245,235,0.25)",
              paddingTop: 20,
              display: "grid",
              gridTemplateColumns: "1fr 148px",
              gap: 20,
              alignItems: "end",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 700,
                  fontSize: "clamp(38px, 7vw, 66px)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  maxWidth: 540,
                }}
              >
                {lang === "it" ? (
                  <>
                    Un mix di impatti
                    <br />
                    dannosi e <span style={{ color: RED }}>incerti</span>
                  </>
                ) : (
                  <>
                    A mix of harmful
                    <br />
                    and <span style={{ color: RED }}>uncertain</span>
                  </>
                )}
              </h1>

              <p
                style={{
                  marginTop: 18,
                  maxWidth: 430,
                  color: "rgba(255,245,235,0.9)",
                  fontSize: 17,
                  lineHeight: 1.45,
                  fontFamily: "'Inter', 'Arial', sans-serif",
                }}
              >
                {lang === "it"
                  ? "Alcuni dei brand che usi causano danni, altri sono ancora troppo opachi per essere verificati con fiducia."
                  : "Some of the brands you use are causing harm, while others are still too opaque to verify with confidence."}
              </p>
            </div>

            <div
              style={{
                justifySelf: "end",
                width: 132,
                height: 132,
                borderRadius: "50%",
                background: PAPER,
                color: INK,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 0 2px rgba(18,16,13,0.08) inset",
                transform: "rotate(-2deg)",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 0.9,
                  fontFamily: "'Inter', 'Arial', sans-serif",
                }}
              >
                {average}
              </div>
              <div
                style={{
                  width: 72,
                  borderTop: `2px solid ${INK}`,
                  margin: "8px 0 6px",
                  opacity: 0.85,
                }}
              />
              <div
                style={{
                  fontSize: 16,
                  color: RED,
                  fontWeight: 800,
                  fontFamily: "'Inter', 'Arial', sans-serif",
                }}
              >
                /100
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 12,
          color: "rgba(18,16,13,0.72)",
          fontSize: 12,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontFamily: "'Inter', 'Arial', sans-serif",
        }}
      >
        <span>{t.tagline}</span>
        <span>•</span>
        <span>{categories.map((c) => getCatLabel(c, lang).split(" ")[0]).join(" · ")}</span>
        <span>•</span>
        <span>{total} {lang === "it" ? "brand salvati" : "saved brands"}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const { db, categories, loading } = useInitialData(lang);
  const [query, setQuery] = useState("");
  const results = useBrandSearch(query, db);
  const [selected, setSelected] = useState(null);
  const [myBrands, setMyBrands] = useState(() => {
    try {
      const raw = localStorage.getItem(MY_BRANDS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const sourcesCount = useSourcesCount();
  const inputRef = useRef(null);

  const t = UI[lang] || UI.en;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MY_BRANDS_STORAGE_KEY, JSON.stringify(myBrands));
    } catch {
      // ignore storage errors
    }
  }, [myBrands]);

  useEffect(() => {
    if (!Array.isArray(db) || db.length === 0) return;

    setMyBrands((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;

      let changed = false;

      const next = prev.map((savedBrand) => {
        const freshBrand = db.find(
          (brand) =>
            String(brand.name || "").toLowerCase() ===
            String(savedBrand.name || "").toLowerCase()
        );

        if (!freshBrand) return savedBrand;
        if (freshBrand !== savedBrand) changed = true;
        return freshBrand;
      });

      return changed ? next : prev;
    });
  }, [db]);

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
          background: PAPER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "rgba(18,16,13,0.55)",
            fontFamily: "'Inter', 'Arial', sans-serif",
            fontSize: 13,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
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
          background: PAPER,
          fontFamily: "'Inter', 'Arial', sans-serif",
          color: INK,
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.028) 0.7px, transparent 0.7px), radial-gradient(rgba(0,0,0,0.02) 0.6px, transparent 0.6px)",
          backgroundSize: "8px 8px, 13px 13px",
          backgroundPosition: "0 0, 3px 4px",
        }}
      >
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${PAPER}; }
          ::selection { background: rgba(212,87,53,0.22); }
          input:focus { outline: none; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(18,16,13,0.18); border-radius: 99px; }
          .brand-row:hover { background: rgba(18,16,13,0.05) !important; }
          .add-btn:hover { transform: translateY(-1px); filter: brightness(0.98); }
          .editorial-panel > * { position: relative; z-index: 1; }
          @media (max-width: 760px) {
            .editorial-hero-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "34px 20px 80px" }}>
          <EditorialHero
            t={t}
            lang={lang}
            categories={categories}
            myBrands={myBrands}
          />

          <div
            className="editorial-panel"
            style={{
              position: "relative",
              border: `1px solid ${LINE}`,
              background: "rgba(255,255,255,0.24)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.2,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.02), transparent 20%), repeating-linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 1px, transparent 1px, transparent 4px)",
              }}
            />

            <div style={{ padding: 18, borderBottom: `1px solid ${LINE}` }}>
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 700,
                  fontSize: 21,
                  letterSpacing: "-0.04em",
                  marginBottom: 8,
                }}
              >
                {lang === "it" ? "La tua lista editoriale" : "Your editorial list"}
              </div>
              <div
                style={{
                  color: "rgba(18,16,13,0.72)",
                  fontSize: 14,
                  lineHeight: 1.45,
                  maxWidth: 580,
                }}
              >
                {lang === "it"
                  ? "Una vista impaginata dei brand che supporti, con evidenza sui casi dannosi, incerti e con performance migliori."
                  : "A newspaper-like view of the brands you support, highlighting harmful, uncertain and stronger performers."}
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <MyListPanel
                myBrands={myBrands}
                db={db}
                onAdd={addToList}
                onReplace={(oldBrand, newBrand) => {
                  setMyBrands((prev) => {
                    const withoutOld = prev.filter((b) => b.name !== oldBrand.name);
                    const alreadyPresent = withoutOld.some((b) => b.name === newBrand.name);
                    return alreadyPresent ? withoutOld : [...withoutOld, newBrand];
                  });
                }}
                onRemove={(name) =>
                  setMyBrands((prev) => prev.filter((b) => b.name !== name))
                }
                onClear={() => setMyBrands([])}
                onSelect={setSelected}
                lang={lang}
                ui={UI}
                threshold={THRESHOLD}
              />
            </div>
          </div>

          <div style={{ marginTop: 22, borderTop: `1px solid ${LINE}`, paddingTop: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                    color: "rgba(18,16,13,0.55)",
                    marginBottom: 7,
                  }}
                >
                  {lang === "it" ? "Database brand" : "Brand database"}
                </div>
                <div
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {lang === "it"
                    ? "Esplora e confronta i marchi"
                    : "Explore and compare brands"}
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "rgba(18,16,13,0.52)",
                  textAlign: "right",
                  lineHeight: 1.45,
                }}
              >
                {t.db_info(db.length, sectors.length, sourcesCount)}
              </div>
            </div>

            <div
              style={{
                color: "rgba(18,16,13,0.72)",
                fontSize: 14,
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              {lang === "it"
                ? "Cerca un brand, aggiungilo alla lista e scorri il ranking per settore in stile editoriale."
                : "Search a brand, add it to your list, and browse the sector ranking with an editorial layout."}
            </div>

            <div style={{ position: "relative", marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(255,255,255,0.42)",
                  border: `1px solid ${LINE}`,
                  padding: "14px 16px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="rgba(18,16,13,0.48)"
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
                    color: INK,
                    fontSize: 16,
                    fontFamily: "'Inter', 'Arial', sans-serif",
                  }}
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(18,16,13,0.55)",
                      cursor: "pointer",
                      fontSize: 20,
                      lineHeight: 1,
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
                    background: "#f3eee6",
                    border: `1px solid ${LINE}`,
                    zIndex: 50,
                    boxShadow: "0 18px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  {results.map((brand) => {
                    const score = getDisplayScore(brand);
                    const inList = myBrands.find((b) => b.name === brand.name);

                    return (
                      <div
                        key={brand.name}
                        className="brand-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px 1fr auto auto",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 16px",
                          cursor: "pointer",
                          borderBottom: `1px solid ${LINE}`,
                          transition: "background 0.15s",
                        }}
                        onClick={() => setSelected(brand)}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: `${getDisplayScoreColor(score)}20`,
                            border: `1px solid ${getDisplayScoreColor(score)}55`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                          }}
                        >
                          {brand.logo}
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: INK,
                              fontSize: 16,
                              marginBottom: 2,
                            }}
                          >
                            {brand.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "rgba(18,16,13,0.56)",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {brand.sector}
                          </div>
                        </div>

                        <div style={{ textAlign: "right", marginRight: 4 }}>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: 800,
                              color: getDisplayScoreColor(score),
                              lineHeight: 0.9,
                            }}
                          >
                            {score ?? "—"}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(18,16,13,0.5)" }}>/100</div>
                        </div>

                        <button
                          className="add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToList(brand);
                          }}
                          style={{
                            background: inList ? GREEN : INK,
                            border: "none",
                            color: "#f5efe7",
                            padding: "10px 14px",
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {inList
                            ? lang === "it"
                              ? "In lista"
                              : "In list"
                            : lang === "it"
                              ? "Aggiungi"
                              : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 38 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.09em",
                color: "rgba(18,16,13,0.55)",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {t.ranking_title}
            </div>

            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 32,
                lineHeight: 0.96,
                fontWeight: 700,
                letterSpacing: "-0.05em",
                marginBottom: 22,
              }}
            >
              {lang === "it"
                ? "Brand con una traccia migliore."
                : "Brands with a better record."}
            </div>

            {brandsBySector.map(({ sector, sectorIcon, brands }) => (
              <div key={sector} style={{ borderTop: `1px solid ${LINE}` }}>
                <SectorSection
                  sector={sector}
                  sectorIcon={sectorIcon}
                  brands={brands}
                  myBrands={myBrands}
                  onAdd={addToList}
                  onSelect={setSelected}
                  lang={lang}
                  defaultOpen={true}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 56,
              borderTop: `1px solid ${LINE}`,
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "rgba(18,16,13,0.66)",
                lineHeight: 1.7,
                maxWidth: 540,
              }}
            >
              {t.footer.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </div>

            <a
              href="/contribute.html"
              style={{
                alignSelf: "flex-start",
                color: INK,
                textDecoration: "none",
                border: `1px solid ${LINE}`,
                padding: "10px 14px",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                background: "rgba(255,255,255,0.36)",
              }}
            >
              {lang === "it"
                ? "Esplora e migliora le tue scelte"
                : "Explore and improve your choices"}
            </a>
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
