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
  getDisplayScoreColor,
} from "./utils/brandHelpers";
import { UI } from "./constants/uiText";

const THRESHOLD = 50;
const MY_BRANDS_STORAGE_KEY = "ethicprint_my_brands_v1";

const QUICK_SECTORS = [
  { en: "Tech Software & Cloud", it: "Tech Software & Cloud" },
  { en: "Social Media",          it: "Social Media" },
  { en: "Fashion & Apparel",     it: "Moda & Abbigliamento" },
  { en: "Food & Beverages",      it: "Alimentare & Bevande" },
  { en: "Retail & Supermarkets", it: "Grande Distribuzione" },
];

function LangToggle({ lang, setLang }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 300,
      display: "flex", gap: 4,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 99, padding: 4,
    }}>
      {["en", "it"].map((l) => (
        <button key={l} onClick={() => setLang(l)} style={{
          background: lang === l ? "rgba(99,202,183,0.2)" : "transparent",
          border: lang === l ? "1px solid rgba(99,202,183,0.4)" : "1px solid transparent",
          color: lang === l ? "#63CAB7" : "rgba(255,255,255,0.35)",
          padding: "4px 12px", borderRadius: 99, cursor: "pointer",
          fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.15s",
        }}>
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

  const [myBrands, setMyBrands] = useState(() => {
    try {
      const raw = localStorage.getItem(MY_BRANDS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
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
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(MY_BRANDS_STORAGE_KEY, JSON.stringify(myBrands)); } catch {}
  }, [myBrands]);

  useEffect(() => {
    if (!Array.isArray(db) || db.length === 0) return;
    setMyBrands((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((savedBrand) => {
        const freshBrand = db.find(
          (brand) => String(brand.name || "").toLowerCase() === String(savedBrand.name || "").toLowerCase()
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
      return { sector, sectorIcon, brands, avgScore: getSectorAvgScore(brands) };
    })
    .sort((a, b) => (b.avgScore ?? -9999) - (a.avgScore ?? -9999));

  const modalFilteredSectors = modalSectorFilter
    ? brandsBySector.filter((s) => s.sector === modalSectorFilter)
    : brandsBySector;

  const modalVisibleSectors = showAllSectors
    ? modalFilteredSectors
    : modalFilteredSectors.slice(0, 6);

  const openSectorModal = (sectorKey = null) => {
    setModalSectorFilter(sectorKey);
    setShowAllSectors(false);
    setIsSectorModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#08080f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, letterSpacing: 2 }}>
          {t.loading}
        </div>
      </div>
    );
  }

  return (
    <CategoriesContext.Provider value={categories}>
      <LangToggle lang={lang} setLang={setLang} />

      <div style={{ minHeight: "100vh", background: "#08080f", color: "#e8e8f0", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #root { background: #08080f; }
          ::selection { background: rgba(99,202,183,0.3); }
          input:focus { outline: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
          .search-result-row:hover { background: rgba(255,255,255,0.04) !important; }
          .ep-search::placeholder { color: rgba(255,255,255,0.25); }
          .sector-btn:hover { background: rgba(99,202,183,0.1) !important; border-color: rgba(99,202,183,0.3) !important; color: #63CAB7 !important; }
          .add-btn:hover { background: rgba(99,202,183,0.15) !important; color: #63CAB7 !important; }
        `}</style>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* ── HERO ── */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: "36px 32px 32px", marginBottom: 20,
          }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: "rgba(99,202,183,0.6)",
              textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Mono', monospace",
            }}>
              Open Source · Community Driven · No Profit
            </div>

            <img src={logoSrc} alt="EthicPrint" style={{
              display: "block", height: "clamp(40px, 6vw, 60px)", width: "auto",
              filter: "brightness(1.05) drop-shadow(0 0 18px rgba(99,202,183,0.2))",
              marginBottom: 20,
            }} />

            <div style={{
              fontSize: "clamp(17px, 2.4vw, 22px)", lineHeight: 1.5,
              color: "rgba(255,255,255,0.7)", maxWidth: 620, marginBottom: 18, fontWeight: 300,
            }}>
              {lang === "it"
                ? "Scopri l'impatto sul mondo dei brand che usi ogni giorno per aiutarti a passare ad alternative migliori."
                : "Discover the impact on the world made by the brands you use every day to help you switch to better options."}
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
              {[
                { href: "/sources.html", en: "How we score →", it: "Come valutiamo →" },
                { href: "/sources.html", en: "Our mission →",  it: "La nostra missione →" },
              ].map((link, i) => (
                <a key={i} href={link.href} style={{
                  fontSize: 12, color: "#63CAB7", textDecoration: "none",
                  fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em",
                  borderBottom: "1px solid rgba(99,202,183,0.3)", paddingBottom: 1,
                }}>
                  {lang === "it" ? link.it : link.en}
                </a>
              ))}
            </div>

            {/* Search bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${query ? "rgba(99,202,183,0.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 14, padding: "14px 18px",
              boxShadow: query ? "0 0 0 3px rgba(99,202,183,0.08)" : "none",
              transition: "all 0.2s",
            }}>
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={searchRef} className="ep-search" value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "it"
                  ? "Cerca un brand e cliccalo per vedere dettagli e fonti"
                  : "Search a brand and click it to see details and sources"}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  color: "#fff", fontSize: 16, fontFamily: "'DM Sans', sans-serif",
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                  cursor: "pointer", fontSize: 20, lineHeight: 1,
                }}>×</button>
              )}
            </div>

            {/* Search results */}
            {query.length >= 2 && (
              <div style={{
                marginTop: 8, background: "#0f0f1a",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
                overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}>
                {results.length === 0 ? (
                  <div style={{ padding: "14px 18px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                    {lang === "it" ? "Nessun brand trovato." : "No brands found."}
                  </div>
                ) : (
                  results.slice(0, 6).map((brand) => {
                    const score = getDisplayScore(brand);
                    const inList = myBrands.find((b) => b.name === brand.name);
                    const scoreColor = getDisplayScoreColor(score);
                    return (
                      <div key={brand.name} className="search-result-row" onClick={() => setSelected(brand)}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "12px 18px", cursor: "pointer",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: `${scoreColor}22`, border: `1px solid ${scoreColor}44`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700, color: scoreColor, flexShrink: 0,
                        }}>
                          {brand.logo || brand.name?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e8f0", lineHeight: 1, marginBottom: 3 }}>
                            {brand.name}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{brand.sector || ""}</div>
                        </div>
                        <div style={{ textAlign: "right", marginRight: 8 }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor, fontFamily: "'DM Mono', monospace" }}>
                            {score ?? "—"}
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>/100</div>
                        </div>
                        <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToList(brand); }} style={{
                          background: inList ? "rgba(99,202,183,0.1)" : "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: inList ? "#63CAB7" : "rgba(255,255,255,0.5)",
                          padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                          fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.15s", whiteSpace: "nowrap",
                        }}>
                          {inList ? "✓" : lang === "it" ? "+ Aggiungi" : "+ Add"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Quick sectors + contribute */}
            {!query && (
              <>
                <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", marginRight: 4 }}>
                    {lang === "it" ? "Sfoglia:" : "Browse:"}
                  </span>
                  {QUICK_SECTORS.map((s, i) => (
                    <button key={i} className="sector-btn"
                      onClick={() => openSectorModal(lang === "it" ? s.it : s.en)}
                      style={{
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.6)", padding: "6px 12px", borderRadius: 99,
                        cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      {lang === "it" ? s.it.split(" ")[0] : s.en.split(" ")[0]}
                    </button>
                  ))}
                  <button className="sector-btn" onClick={() => openSectorModal(null)} style={{
                    background: "transparent", border: "1px solid rgba(99,202,183,0.3)",
                    color: "#63CAB7", padding: "6px 12px", borderRadius: 99,
                    cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
                    transition: "all 0.15s",
                  }}>
                    {lang === "it" ? "Tutti i settori →" : "All sectors →"}
                  </button>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { href: "/contribute.html", en: "Contribute →",      it: "Contribuisci →" },
                    { href: "/contribute.html", en: "Report an error →", it: "Segnala un errore →" },
                    { href: "/contribute.html", en: "Add a brand →",     it: "Aggiungi un brand →" },
                  ].map((link, i) => (
                    <a key={i} href={link.href} style={{
                      fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none",
                      fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em",
                    }}>
                      {lang === "it" ? link.it : link.en}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── RECENT SOURCES ── */}
          <RecentSourcesPanel
            updates={recentSourceUpdates}
            lang={lang}
            onSelectBrand={(brandRef) => {
              const found = db.find((b) => b.name === brandRef.name || b.id === brandRef.id);
              if (found) setSelected(found);
            }}
          />

          {/* ── MY LIST PANEL ── */}
          <div style={{ marginTop: 20 }}>
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

          {/* ── FOOTER ── */}
          <div style={{
            marginTop: 64, paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center",
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif" }}>
              {t.footer.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </div>
          </div>
        </div>

        {/* ── SECTOR MODAL ── */}
        {isSectorModalOpen && (
          <div onClick={() => setIsSectorModalOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            zIndex: 500, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 20,
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: "min(1100px, 100%)", maxHeight: "85vh", overflowY: "auto",
              background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20, padding: "24px 22px 20px",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, marginBottom: 18, position: "sticky", top: 0,
                background: "#0f0f1a", zIndex: 2, paddingBottom: 16,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{
                    fontSize: 11, letterSpacing: 3, color: "rgba(99,202,183,0.7)",
                    textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                  }}>
                    {modalSectorFilter
                      ? `${t.ranking_title} · ${modalFilteredSectors[0]?.sector || ""}`
                      : t.ranking_title}
                  </div>
                  {modalSectorFilter && (
                    <button onClick={() => { setModalSectorFilter(null); setShowAllSectors(false); }} style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: 99,
                      cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {lang === "it" ? "Tutti i settori" : "All sectors"}
                    </button>
                  )}
                </div>
                <button onClick={() => setIsSectorModalOpen(false)} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)", padding: "6px 14px", borderRadius: 99,
                  cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                }}>
                  ✕ {lang === "it" ? "Chiudi" : "Close"}
                </button>
              </div>

              {modalVisibleSectors.map(({ sector, sectorIcon, brands }) => (
                <SectorSection
                  key={sector} sector={sector} sectorIcon={sectorIcon}
                  brands={brands} myBrands={myBrands} onAdd={addToList}
                  onSelect={setSelected} lang={lang} defaultOpen={true}
                />
              ))}

              {modalFilteredSectors.length > 6 && (
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setShowAllSectors((prev) => !prev)} style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)", padding: "8px 18px", borderRadius: 99,
                    cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {showAllSectors
                      ? lang === "it" ? "Nascondi" : "Hide"
                      : lang === "it" ? `Mostra altri ${modalFilteredSectors.length - 6}` : `Show ${modalFilteredSectors.length - 6} more`}
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
