import { useState, useEffect, useRef } from "react";
import logoSrc from "./assets/logo.png";
import BrandCard from "./components/BrandCard";
import MyListPanel from "./components/MyListPanel";
import SectorSection from "./components/SectorSection";
import { CategoriesContext } from "./context/categoriesContext";
import { useInitialData } from "./hooks/useInitialData";
import { useSourcesCount } from "./hooks/useSourcesCount";
import { useBrandSearch } from "./hooks/useBrandSearch";
import RecentSourcesPanel from "./components/RecentSourcesPanel";
import { useRecentSourceUpdates } from "./hooks/useRecentSourceUpdates";
import {
  getSectorAvgScore,
  getDisplayScore,
} from "./utils/brandHelpers";
import { UI } from "./constants/uiText";

const THRESHOLD = 50;
const MY_BRANDS_STORAGE_KEY = "ethicprint_my_brands_v1";

const QUICK_SECTORS = [
  { en: "Tech Software & Cloud", it: "Tech Software & Cloud", icon: "☁️" },
  { en: "Social Media",          it: "Social Media",          icon: "📱" },
  { en: "Fashion & Apparel",     it: "Moda & Abbigliamento",  icon: "👗" },
  { en: "Food & Beverages",      it: "Alimentare & Bevande",  icon: "🥫" },
  { en: "Retail & Supermarkets", it: "Grande Distribuzione",  icon: "🛍️" },
];

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
        background: "rgba(24,19,16,0.9)",
        border: "2px solid #181310",
        boxShadow: "4px 4px 0 #181310",
        padding: 6,
      }}
    >
      {["en", "it"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? "#e44723" : "#f2eadc",
            border: "2px solid #181310",
            color: lang === l ? "#f8f2e9" : "#181310",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Archivo Narrow', 'Arial Narrow', sans-serif",
          }}
        >
          {l}
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

  const [showAllSectors, setShowAllSectors] = useState(false);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [modalSectorFilter, setModalSectorFilter] = useState(null);

  const sourcesCount = useSourcesCount();
  const recentSourceUpdates = useRecentSourceUpdates();
  const searchRef = useRef(null);

  const t = UI[lang] || UI.en;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo+Narrow:wght@400;600;700;800&family=Bitter:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MY_BRANDS_STORAGE_KEY, JSON.stringify(myBrands));
    } catch {}
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

  const modalFilteredSectors = modalSectorFilter
    ? brandsBySector.filter((s) => s.sector === modalSectorFilter)
    : brandsBySector;

  const modalVisibleSectors = showAllSectors
    ? modalFilteredSectors
    : modalFilteredSectors.slice(0, 4);

  const openSectorModal = (sectorKey = null) => {
    setModalSectorFilter(sectorKey);
    setShowAllSectors(false);
    setIsSectorModalOpen(true);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#d9d4cf",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#181310",
          fontFamily: "'Archivo Narrow', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {t.loading}
      </div>
    );
  }

  return (
    <CategoriesContext.Provider value={categories}>
      <LangToggle lang={lang} setLang={setLang} />

      <div
        style={{
          minHeight: "100vh",
          background: "#d8d3ce",
          color: "#181310",
          fontFamily: "'Archivo Narrow', sans-serif",
        }}
      >
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { background: #d8d3ce; }
          body {
            background:
              radial-gradient(circle at 20% 10%, rgba(255,255,255,0.18), transparent 18%),
              radial-gradient(circle at 80% 18%, rgba(0,0,0,0.04), transparent 22%),
              radial-gradient(circle at 10% 90%, rgba(0,0,0,0.05), transparent 18%),
              #d8d3ce;
          }
          ::selection { background: rgba(228,71,35,0.25); }
          input:focus { outline: none; }
          ::-webkit-scrollbar { width: 10px; }
          ::-webkit-scrollbar-track { background: #d8d3ce; }
          ::-webkit-scrollbar-thumb { background: #181310; }
          .paper-panel {
            background: #f2eadf;
            border: 4px solid #181310;
            box-shadow: 8px 8px 0 #181310;
            position: relative;
            overflow: hidden;
          }
          .paper-panel::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              repeating-linear-gradient(0deg, rgba(0,0,0,0.018) 0 1px, transparent 1px 3px),
              radial-gradient(circle at 15% 25%, rgba(0,0,0,0.08) 0 1px, transparent 1px 100%),
              radial-gradient(circle at 85% 70%, rgba(0,0,0,0.06) 0 1px, transparent 1px 100%);
            background-size: auto, 18px 18px, 24px 24px;
            pointer-events: none;
            opacity: 0.55;
          }
          .search-result-row:hover { background: rgba(0,0,0,0.04) !important; }
          .ep-search::placeholder { color: rgba(0,0,0,0.38); }
        `}</style>

        <div style={{ maxWidth: 980, margin: "0 auto", padding: "34px 24px 90px" }}>
          <div className="paper-panel" style={{ padding: "36px 32px 32px", marginBottom: 24 }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontFamily: "'Bitter', serif",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    opacity: 0.55,
                    marginBottom: 10,
                  }}
                >
                  Open Source · Community Driven · No Profit
                </div>

                <img
                  src={logoSrc}
                  alt="EthicPrint"
                  style={{
                    display: "block",
                    height: "clamp(44px, 6vw, 64px)",
                    width: "auto",
                    filter: "grayscale(1) contrast(1.5) brightness(0.08)",
                    marginBottom: 18,
                  }}
                />

                <div
                  style={{
                    fontFamily: "'Bitter', serif",
                    fontSize: "clamp(20px, 2.8vw, 26px)",
                    lineHeight: 1.3,
                    fontWeight: 500,
                    maxWidth: 680,
                    marginBottom: 16,
                  }}
                >
                  {lang === "it"
                    ? "Scopri l'impatto etico dei brand che usi ogni giorno. Ogni punteggio è supportato da fonti verificate."
                    : "Discover the ethical impact of the brands you use every day. Every score is backed by verified sources."}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
  {[
    { href: "/sources.html",    en: "How we score ",   it: "Come valutiamo " },
    { href: "/sources.html", en: "Our mission ",   it: "La nostra missione " },
  ].map((link, i) => (
    <a
      key={i}
      href={link.href}
      style={{
        fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        color: "#c63f1d",
        textDecoration: "none",
        borderBottom: "2px solid #c63f1d",
        paddingBottom: 1,
      }}
    >
      {lang === "it" ? link.it : link.en}
    </a>
  ))}
</div>


              </div>

              <div
                style={{
                  border: "4px solid #181310",
                  background: "#fbf7f0",
                  boxShadow: "6px 6px 0 #181310",
                  marginBottom: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 16px",
                    borderBottom: query ? "3px solid #181310" : "none",
                  }}
                >
                  <span style={{ fontSize: 22, marginRight: 10, opacity: 0.5 }}>🔍</span>

                  <input
                    ref={searchRef}
                    className="ep-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      lang === "it"
                        ? "Cerca un brand, piattaforma o servizio..."
                        : "Search a brand, platform or service..."
                    }
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#181310",
                      fontSize: 20,
                      fontWeight: 700,
                      fontFamily: "'Archivo Narrow', sans-serif",
                      padding: "14px 0",
                    }}
                  />

                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: 26,
                        cursor: "pointer",
                        color: "rgba(0,0,0,0.5)",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {query.length >= 2 && (
                  <div style={{ background: "#f4eee3" }}>
                    {results.length === 0 ? (
                      <div
                        style={{
                          padding: "14px 16px",
                          fontFamily: "'Bitter', serif",
                          fontSize: 14,
                          color: "rgba(0,0,0,0.5)",
                        }}
                      >
                        {lang === "it" ? "Nessun brand trovato." : "No brands found."}
                      </div>
                    ) : (
                      results.slice(0, 6).map((brand) => {
                        const score = getDisplayScore(brand);
                        const inList = myBrands.find((b) => b.name === brand.name);
                        const scoreBg =
                          score === null
                            ? "#111"
                            : score >= 70
                              ? "#4a9e5c"
                              : score >= 50
                                ? "#e7bb3a"
                                : "#c4432c";
                        const scoreColor =
                          score !== null && score >= 50 && score < 70 ? "#111" : "#fff";

                        return (
                          <div
                            key={brand.name}
                            className="search-result-row"
                            onClick={() => setSelected(brand)}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr auto auto",
                              gap: 12,
                              padding: "14px 16px",
                              borderBottom: "2px solid rgba(0,0,0,0.1)",
                              cursor: "pointer",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontWeight: 900,
                                  fontSize: 19,
                                  color: "#111",
                                  lineHeight: 1,
                                  marginBottom: 3,
                                }}
                              >
                                {brand.name}
                              </div>

                              <div
                                style={{
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: 12,
                                  color: "rgba(0,0,0,0.55)",
                                  fontWeight: 700,
                                }}
                              >
                                {brand.sector || ""}
                              </div>
                            </div>

                            <div
                              style={{
                                background: scoreBg,
                                color: scoreColor,
                                border: "3px solid #111",
                                padding: "6px 10px",
                                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                                fontSize: 18,
                                lineHeight: 1,
                                textAlign: "center",
                                minWidth: 60,
                              }}
                            >
                              {score ?? "—"}
                              {score !== null && <span style={{ fontSize: 11 }}>/100</span>}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToList(brand);
                              }}
                              style={{
                                background: inList ? "#111" : "#3570b2",
                                color: "#fff",
                                border: "3px solid #111",
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                                fontSize: 13,
                                textTransform: "uppercase",
                              }}
                            >
                              {inList ? "✓" : lang === "it" ? "+ Aggiungi" : "+ Add"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {!query && (
        <>
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Bitter', serif",
                      fontSize: 13,
                      opacity: 0.55,
                      marginRight: 4,
                    }}
                  >
                    {lang === "it" ? "Sfoglia per categoria:" : "Browse by category:"}
                  </span>

                  {QUICK_SECTORS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => openSectorModal(lang === "it" ? s.it : s.en)}
                      style={{
                        border: "3px solid #181310",
                        background: "#efe7d8",
                        color: "#181310",
                        padding: "7px 12px",
                        fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                        fontSize: 13,
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      {s.icon} {lang === "it" ? s.it.split(" ")[0] : s.en.split(" ")[0]}
                    </button>
                  ))}

                  <button
                    onClick={() => openSectorModal(null)}
                    style={{
                      border: "3px solid #3570b2",
                      background: "transparent",
                      color: "#3570b2",
                      padding: "7px 12px",
                      fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                      fontSize: 13,
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {lang === "it" ? "Tutti i settori →" : "All sectors →"}
                  </button>
                </div>

        <div style={{ width: "100%", marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
  {[
    { href: "/contribute.html", en: "Contribute ",      it: "Contribuisci " },
    { href: "/contribute.html", en: "Report an error ", it: "Segnala un errore " },
    { href: "/contribute.html", en: "Add a brand ",     it: "Aggiungi un brand " },
  ].map((link, i) => (
    <a
      key={i}
      href={link.href}
      style={{
        fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        color: "#c63f1d",
        textDecoration: "none",
        borderBottom: "2px solid #c63f1d",
        paddingBottom: 1,
      }}
    >
      {lang === "it" ? link.it : link.en}
    </a>
  ))}
</div>
          </>
              )}
            </div>
          </div>

          <RecentSourcesPanel
            updates={recentSourceUpdates}
            lang={lang}
            onSelectBrand={(brandRef) => {
              const found = db.find((b) => b.name === brandRef.name || b.id === brandRef.id);
              if (found) setSelected(found);
            }}
          />

          <div style={{ marginTop: 40 }}>
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
              onRemove={(name) => setMyBrands((prev) => prev.filter((b) => b.name !== name))}
              onClear={() => setMyBrands([])}
              onSelect={setSelected}
              lang={lang}
              ui={UI}
              threshold={THRESHOLD}
              totalBrands={db.length}
              totalSectors={[...new Set(db.map((b) => b.sector).filter(Boolean))].length}
              totalSources={sourcesCount}
            />
          </div>

          <div
            style={{
              marginTop: 56,
              paddingTop: 22,
              borderTop: "4px solid #181310",
              fontFamily: "'Bitter', serif",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            {t.footer.split("\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>

        {isSectorModalOpen && (
          <div
            onClick={() => setIsSectorModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <div
              className="paper-panel"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(1100px, 100%)",
                maxHeight: "85vh",
                overflowY: "auto",
                padding: "24px 22px 20px",
                background: "#f2eadf",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 18,
                  position: "sticky",
                  top: 0,
                  background: "#f2eadf",
                  zIndex: 2,
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: "#3570b2",
                      color: "#ffffff",
                      border: "3px solid #181310",
                      boxShadow: "4px 4px 0 #181310",
                      padding: "10px 14px",
                      fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                      fontSize: 20,
                      textTransform: "uppercase",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {modalSectorFilter
                      ? `${t.ranking_title} · ${modalFilteredSectors[0]?.sector || ""}`
                      : t.ranking_title}
                  </div>

                  {modalSectorFilter && (
                    <button
                      onClick={() => {
                        setModalSectorFilter(null);
                        setShowAllSectors(false);
                      }}
                      style={{
                        border: "3px solid #181310",
                        background: "#181310",
                        color: "#f4eee3",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                        fontSize: 13,
                        textTransform: "uppercase",
                      }}
                    >
                      {lang === "it" ? "Tutti i settori" : "All sectors"}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsSectorModalOpen(false)}
                  style={{
                    border: "3px solid #181310",
                    background: "#e44723",
                    color: "#fff",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
                    fontSize: 14,
                    textTransform: "uppercase",
                  }}
                >
                  ✕ {lang === "it" ? "Chiudi" : "Close"}
                </button>
              </div>

              {modalVisibleSectors.map(({ sector, sectorIcon, brands }) => (
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

              {modalFilteredSectors.length > 4 && (
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => setShowAllSectors((prev) => !prev)}
                    style={{
                      border: "3px solid #181310",
                      background: showAllSectors ? "#181310" : "#efe7d8",
                      color: showAllSectors ? "#f4eee3" : "#181310",
                      padding: "10px 14px",
                      fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                      fontSize: 14,
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    {showAllSectors
                      ? lang === "it"
                        ? "Nascondi settori"
                        : "Hide sectors"
                      : lang === "it"
                        ? `Mostra altri ${modalFilteredSectors.length - 4}`
                        : `Show ${modalFilteredSectors.length - 4} more sectors`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
