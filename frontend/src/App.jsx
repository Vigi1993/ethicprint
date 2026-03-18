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
const MY_BRANDS_STORAGE_KEY = "ethicprint_my_brands_v1";

// 🔧 Adapter: trasforma dati backend → UI
const adaptBrandsForUI = (brands) => {
  return brands.map((b) => {
    const score = b.total_score ?? null

    let group = "unknown"
    if (b.insufficient_data) group = "unknown"
    else if (score !== null && score < 50) group = "problem"
    else if (score !== null && score >= 50) group = "strong"

    return {
      id: b.id,
      name: b.name,
      score,
      group,
      issue: b.impact_summary || "No clear issue available",
      impact: b.impact_summary || "Your usage contributes to this impact",
      alternative: b.alternatives?.[0] || null,
    }
  })
}

function YourEthicalFootprint({ myBrands, onRemove, onReplace, onClear }) {
  const adapted = adaptBrandsForUI(myBrands)

  const problems = adapted.filter(b => b.group === "problem")
  const unknown = adapted.filter(b => b.group === "unknown")
  const strong = adapted.filter(b => b.group === "strong")

  const validScores = adapted
    .filter(b => b.score !== null && b.group !== "unknown")
    .map(b => b.score)

  const avg =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : null

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* HERO */}
      <section className="mb-14">
        <h1 className="text-4xl font-semibold tracking-tight mb-6">
          Your Ethical Footprint
        </h1>

        <div className="flex items-end gap-4">
          <span className="text-7xl font-bold leading-none">
            {avg ?? "--"}
          </span>

          {avg !== null && (
            <span className="text-lg text-neutral-600">
              {avg < 50 ? "Needs attention" : "Decent"}
            </span>
          )}
        </div>

        <p className="mt-4 text-neutral-800 max-w-md">
          {problems.length > 0
            ? `${problems.length} brands are driving most of your impact`
            : "Your current selection shows no major issues"}
        </p>
      </section>
      
            <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Your brands
          </h2>
      
          {myBrands.length > 0 && (
            <button
              className="text-sm text-neutral-500 underline underline-offset-2"
              onClick={() => onClear?.()}
            >
              Clear all
            </button>
          )}
        </div>
      
        {myBrands.length === 0 ? (
          <div className="border-t border-neutral-300 pt-6">
            <p className="text-sm text-neutral-700 max-w-md">
              Add the brands you actually use to see where your impact gets worse and where you can switch to better options.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myBrands.map((brand) => {
              const score = brand.total_score ?? "—"
      
              return (
                <div
                  key={brand.id ?? brand.name}
                  className="border-t border-neutral-300 pt-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">{brand.name}</div>
                    <div className="text-sm text-neutral-500">
                      {score === "—" ? "No score available" : `${score} / 100`}
                    </div>
                  </div>
      
                  <button
                    className="text-sm text-neutral-500 underline underline-offset-2"
                    onClick={() => onRemove(brand.name)}
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* PROBLEMS */}
      {problems.length > 0 && (
        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-8">
            Brands hurting your impact
          </h2>

          <div className="space-y-12">
            {problems.map((b) => (
              <div key={b.id} className="border-t border-neutral-300 pt-8">

                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">{b.name}</h3>
                  <span className="text-xs text-neutral-400">{b.score}</span>
                </div>

                <p className="mt-2 text-sm font-medium text-red-700">
                  Main issue
                </p>

                <p className="text-sm text-neutral-700 mt-1 max-w-md">
                  {b.issue}
                </p>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                    Your impact
                  </p>
                  <p className="text-sm text-neutral-900 max-w-md font-medium">
                    {b.impact}
                  </p>
                </div>

                {b.alternative && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
                      Better option
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">
                        {b.alternative.name}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-6 mt-5 text-sm">
                  {b.alternative && (
                    <button
                      className="underline underline-offset-2 font-medium">
                      onClick={() => onReplace(b.id, b.alternative)}
                    >
                      Replace with {b.alternative.name}
                    </button>
                  )}

                  <button
                    className="text-neutral-500 underline"
                    onClick={() => onRemove(b.id)}
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* UNKNOWN */}
      {unknown.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6">
            Not enough public evidence
          </h2>

          <div className="space-y-6">
            {unknown.map((b) => (
              <div key={b.id} className="border-t border-neutral-200 pt-4">

                <h3 className="font-medium">{b.name}</h3>

                <p className="text-sm text-neutral-600 mt-1 max-w-md">
                  We don’t have enough public evidence to assess this brand reliably.
                </p>

                <button
                  className="text-sm text-neutral-500 underline mt-2"
                  onClick={() => onRemove(b.id)}
                >
                  Remove
                </button>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* STRONG */}
      {strong.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-6">
            Stronger choices
          </h2>

          <div className="space-y-2">
            {strong.map((b) => (
              <div key={b.id} className="flex justify-between text-sm">

                <span className="font-medium">{b.name}</span>

                <span className="text-neutral-500">
                  {b.score}
                </span>

              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

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
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
  try {
    localStorage.setItem(
      MY_BRANDS_STORAGE_KEY,
      JSON.stringify(myBrands)
    );
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

                  <YourEthicalFootprint
                    myBrands={myBrands}
                    onRemove={(id) =>
                      setMyBrands((prev) => prev.filter((b) => b.name !== name))
                    }
                    onReplace={(oldId, newBrand) => {
                      setMyBrands((prev) => {
                        const withoutOld = prev.filter((b) => b.id !== oldId)
                        const alreadyPresent = withoutOld.some((b) => b.name === newBrand.name)
                        return alreadyPresent ? withoutOld : [...withoutOld, newBrand]
                      })
                    }}
                    onClear={() => setMyBrands([])}
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
