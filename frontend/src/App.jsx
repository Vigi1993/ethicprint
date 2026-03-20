import { useState, useEffect, useRef } from "react";
import logoSrc from "./assets/logo.png";
import BrandCard from "./components/BrandCard";
import MyListPanel from "./components/MyListPanel";
import SectorSection from "./components/SectorSection";
import { CategoriesContext } from "./context/categoriesContext";
import { useInitialData } from "./hooks/useInitialData";
import { useSourcesCount } from "./hooks/useSourcesCount";
import { useBrandSearch } from "./hooks/useBrandSearch";
import WorstBrandsPanel from "./components/WorstBrandsPanel";
import {
  getSectorAvgScore,
  getCatLabel,
  getDisplayScore,
  getDisplayScoreColor,
} from "./utils/brandHelpers";
import { UI } from "./constants/uiText";

const THRESHOLD = 50;
const MY_BRANDS_STORAGE_KEY = "ethicprint_my_brands_v1";

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
  const sourcesCount = useSourcesCount();
  const inputRef = useRef(null);

  const t = UI[lang] || UI.en;

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo+Narrow:wght@400;600;700;800&family=Bitter:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
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

  const headlineScore =
    myBrands.length > 0
      ? Math.round(
          myBrands.reduce((sum, brand) => sum + (getDisplayScore(brand) || 0), 0) /
            myBrands.length
        )
      : 53;

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

  const visibleSectors = showAllSectors
  ? brandsBySector
  : brandsBySector.slice(0, 4);
  
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
          .section-strip {
            border-top: 4px solid #181310;
            border-bottom: 4px solid #181310;
            padding: 14px 18px 10px;
            font-family: 'Archivo Black', 'Arial Black', sans-serif;
            font-size: clamp(28px, 5vw, 42px);
            line-height: 0.95;
            letter-spacing: -0.05em;
            text-transform: uppercase;
          }
          .section-subtitle {
            font-family: 'Bitter', serif;
            font-size: clamp(18px, 2.9vw, 28px);
            line-height: 1.05;
            margin-top: 14px;
          }
          .section-subtitle .accent { color: #cc431f; }
          .label-stamp {
            font-family: 'Archivo Black', 'Arial Black', sans-serif;
            text-transform: uppercase;
            letter-spacing: -0.03em;
            font-size: 18px;
          }
          .search-row:hover { background: rgba(0,0,0,0.035) !important; }
          .poster-button {
            background: #f0c741;
            color: #181310;
            border: 3px solid #181310;
            box-shadow: 4px 4px 0 #181310;
            font-family: 'Archivo Black', 'Arial Black', sans-serif;
            font-size: 15px;
            line-height: 1;
            text-transform: uppercase;
            padding: 12px 14px;
            cursor: pointer;
          }
          .poster-button:hover { transform: translate(1px, 1px); box-shadow: 3px 3px 0 #181310; }
          .poster-input {
            width: 100%;
            background: #fbf7f0;
            border: 3px solid #181310;
            padding: 14px 16px;
            font-size: 18px;
            color: #181310;
            font-family: 'Archivo Narrow', sans-serif;
            font-weight: 700;
            box-shadow: 5px 5px 0 #181310;
          }
        `}</style>

        <div style={{ maxWidth: 980, margin: "0 auto", padding: "34px 24px 90px" }}>
          <div
            style={{
              fontFamily: "'Archivo Narrow', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
          </div>
         <div className="paper-panel" style={{ padding: "26px 26px 30px", marginBottom: 30 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr auto",
                gap: 20,
                alignItems: "start",
                position: "relative",
                zIndex: 1,
              }}
            >

               <div>
              <div
                style={{
                  fontFamily: "'Bitter', serif",
                  lineHeight: 1.2,
                     marginBottom: 10,
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                Open Source   -  Community Driven
              </div>
        
              <div className="section-strip" style={{ padding: "14px 20px" }}>
                <img
                  src={logoSrc}
                  alt="EthicPrint"
                  style={{
                    display: "block",
                    height: "clamp(52px, 7vw, 72px)",
                    width: "auto",
                    maxWidth: "100%",
                    filter: "grayscale(1) contrast(1.5) brightness(0.08)",
                  }}
                />
              </div>              
        <div style={{ marginTop: 16, maxWidth: "100%" }}>
  {t.subtitle.map((line, i) => {
    const boldWords = [
      "consequences",
      "shape the world",
      "EthicPrint",
      "aware",
      "change",
    ];

    let formatted = line;

    boldWords.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      formatted = formatted.replace(regex, "<strong>$1</strong>");
    });

    if (formatted.includes("better alternatives")) {
  formatted = formatted.replace(
    "better alternatives.",
    `better alternatives. <a href="/methodology.html" style="text-decoration: underline; font-weight: 700;">Discover how we score brands →</a>`
  );
}

    return (
      <p
        key={i}
        style={{
          marginTop: i === 0 ? 0 : 10,
          fontFamily: "'Bitter', serif",
          fontSize: "clamp(20px, 3vw, 28px)",
          lineHeight: 1.3,
          fontWeight: 500,
        }}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  })}


          
<div
  style={{
    marginTop: 16,
    fontFamily: "'Bitter', serif",
    fontSize: 15,
    lineHeight: 1.4,
  }}
>
  <a href="/contribute.html" style={{ fontWeight: 700, textDecoration: "none", color: "#c63f1d" }}>
    ➕ Contribute
  </a>{" "}
  ·{" "}
  <a href="/contribute.html" style={{ fontWeight: 700, textDecoration: "none", color: "#c63f1d" }}>
    Report an error
  </a>{" "}
  ·{" "}
  <a href="/contribute.html" style={{ fontWeight: 700, textDecoration: "none", color: "#c63f1d" }}>
    Add a brand
  </a>
</div>


          
</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
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
            />
          </div>

          <WorstBrandsPanel
  brands={db}
  lang={lang}
  onSelect={setSelected}
/>




          

          <div style={{ marginTop: 18 }}>
            <div
              style={{
                display: "inline-block",
                background: "#efc640",
                color: "#181310",
                border: "3px solid #181310",
                boxShadow: "4px 4px 0 #181310",
                padding: "10px 14px",
                marginBottom: 18,
                fontFamily: "'Archivo Black', 'Arial Black', sans-serif",
                fontSize: 20,
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
              }}
            >
              {t.ranking_title}
            </div>

            {visibleSectors.map(({ sector, sectorIcon, brands }) => (
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

            {brandsBySector.length > 4 && (
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
        ? (lang === "it" ? "Nascondi settori" : "Hide sectors")
        : (lang === "it"
            ? `Mostra altri ${brandsBySector.length - 4}`
            : `Show ${brandsBySector.length - 4} more sectors`)}
    </button>
  </div>
)}
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
            <div style={{ marginTop: 10 }}>
              <a
                href="/contribute.html"
                style={{
                  color: "#c63f1d",
                  textDecoration: "none",
                  fontWeight: 700,
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
