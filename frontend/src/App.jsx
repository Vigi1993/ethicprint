import { useState, useEffect, useRef } from "react";
import logoSrc from "./assets/logo.png";
import BrandCard from "./components/BrandCard";
import MyListPanel from "./components/MyListPanel";
import SectorSection from "./components/SectorSection";
import { CategoriesContext, useCategories } from "./context/categoriesContext";
import { useInitialData } from "./hooks/useInitialData";
import { useSourcesCount } from "./hooks/useSourcesCount";
import { useBrandSearch } from "./hooks/useBrandSearch";
import { getSectorAvgScore, getCatLabel } from "./utils/brandHelpers";

const THRESHOLD = 50;

const UI = {
  en: {
    tagline: "Open Source · Community Driven",
    subtitle: "Discover the ethical impact of the brands you use every day.",
    search_placeholder: "Search brand, platform, service...",
    db_info: (n, s, src) => `${n} brands · ${s} sectors · ${src || "–"} sources · open source`,
    my_list_title: "Your ethical footprint",
    aggregated_score: "Aggregated score",
    clear_list: "Clear list",
    alternatives_title: "⚠️ Recommended alternatives",
    below_threshold: "below threshold",
    replace_with: "Consider replacing it with:",
    ranking_title: "Ranking by sector",
    notes_title: "Notes & Sources",
    alternatives_label: "✦ More ethical alternatives",
    parent: "Parent company",
    footer: "EthicPrint is an open source, non-profit project.",
    footer_cta: "Contribute on GitHub · Report an error · Add a brand",
    sources_banner_title: "How do we score brands?",
    sources_banner_desc:
      "Every score is backed by verified sources, weighted by publisher authority. Amnesty International counts more than a blog. Everything is public.",
    sources_banner_cta: "View all sources & methodology →",
    loading: "Loading...",
    hint: "Add the brands you use with + to discover your personal ethical footprint.",
    hint_dismiss: "Got it",
    show_less: "Less",
    show_more: (n) => `+${n} more`,
    score_verdicts: ["Strongly discouraged", "Problematic", "Improvable", "Fairly ethical"],
  },
  it: {
    tagline: "Open Source · Community Driven",
    subtitle: "Scopri l'impatto etico dei brand che usi ogni giorno.",
    search_placeholder: "Cerca brand, piattaforma, fornitore...",
    db_info: (n, s, src) => `${n} brand · ${s} settori · ${src || "–"} fonti · open source`,
    my_list_title: "La tua impronta etica",
    aggregated_score: "Score aggregato",
    clear_list: "Svuota lista",
    alternatives_title: "⚠️ Alternative consigliate",
    below_threshold: "sotto soglia",
    replace_with: "Considera di sostituirlo con:",
    ranking_title: "Classifica per settore",
    notes_title: "Note & Fonti",
    alternatives_label: "✦ Alternative più etiche",
    parent: "Casa madre",
    footer: "EthicPrint è un progetto open source e no-profit.",
    footer_cta: "Contribuisci su GitHub · Segnala un errore · Aggiungi un brand",
    sources_banner_title: "Come calcoliamo i punteggi?",
    sources_banner_desc:
      "Ogni punteggio è supportato da fonti verificate, pesate per autorevolezza. Amnesty International vale più di un blog. Tutto è pubblico.",
    sources_banner_cta: "Vedi tutte le fonti e la metodologia →",
    loading: "Caricamento...",
    hint: "Aggiungi i brand che usi con + per scoprire la tua impronta etica personale.",
    hint_dismiss: "Capito",
    show_less: "Meno",
    show_more: (n) => `+${n} altri`,
    score_verdicts: ["Fortemente sconsigliato", "Problematico", "Migliorabile", "Abbastanza etico"],
  },
};

function ScoreBar({ value, color, max = 20 }) {
  const pct = Math.min(100, Math.abs(Math.round((value / max) * 50)));
  const positive = value >= 0;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 99,
        height: 6,
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: 1,
          height: "100%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: "width 1s cubic-bezier(.4,0,.2,1)",
          left: positive ? "50%" : undefined,
          right: positive ? undefined : "50%",
        }}
      />
    </div>
  );
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
            border: lang === l ? "1px solid rgba(99,202,183,0.4)" : "1px solid transparent",
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

function RadarChart({ scores, lang }) {
  const categories = useCategories();
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;

  const keys = categories.map((c) => c.key);
  const labels = categories.map((c) => getCatLabel(c, lang).split(" ")[0]);
  const angles = keys.map((_, i) => (i * 2 * Math.PI) / keys.length - Math.PI / 2);

  const points = keys.map((k, i) => {
    const val = (scores?.[k] || 0) / 100;
    return [cx + r * val * Math.cos(angles[i]), cy + r * val * Math.sin(angles[i])];
  });

  const gridPoints = (scale) =>
    keys.map((_, i) => [cx + r * scale * Math.cos(angles[i]), cy + r * scale * Math.sin(angles[i])]);

  const polyStr = (pts) => pts.map((p) => p.join(",")).join(" ");

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={polyStr(gridPoints(s))}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + r * Math.cos(a)}
          y2={cy + r * Math.sin(a)}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
        />
      ))}
      <polygon points={polyStr(points)} fill="rgba(99,202,183,0.18)" stroke="#63CAB7" strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#63CAB7" />
      ))}
      {angles.map((a, i) => {
        const lx = cx + (r + 16) * Math.cos(a);
        const ly = cy + (r + 16) * Math.sin(a);
        return (
          <text
            key={i}
            x={lx}
            y={ly + 4}
            textAnchor="middle"
            fill="rgba(255,255,255,0.45)"
            fontSize="9"
            fontFamily="'DM Sans', sans-serif"
          >
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const { db, categories, loading } = useInitialData(lang);
  const [query, setQuery] = useState("");
  const results = useBrandSearch(query, db);
  const [selected, setSelected] = useState(null);
  const [myBrands, setMyBrands] = useState([]);
  const [showHint, setShowHint] = useState(true);
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
      return { sector, sectorIcon, brands, avgScore: getSectorAvgScore(brands) };
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

      <div style={{ minHeight: "100vh", background: "#08080f", fontFamily: "'DM Sans', sans-serif", color: "#e8e8f0" }}>
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
                  filter: "brightness(1.05) drop-shadow(0 0 18px rgba(99,202,183,0.25))",
                  mixBlendMode: "normal",
                }}
              />
            </div>

            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
              {t.subtitle}
              <br />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                {categories.map((c) => getCatLabel(c, lang).split(" ")[0]).join(" · ")}
              </span>
            </p>
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
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24">
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
                  const score = getScore(brand);
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
                          background: `${getColor(score)}22`,
                          border: `1px solid ${getColor(score)}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: 700,
                          color: getColor(score),
                        }}
                      >
                        {brand.logo}
                      </div>

                      <div style={{ flex: 1 }} onClick={() => setSelected(brand)}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{brand.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{brand.sector}</div>
                      </div>

                      <div style={{ textAlign: "right", marginRight: 8 }} onClick={() => setSelected(brand)}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: getColor(score) }}>{score ?? "—"}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>/ ±400</div>
                      </div>

                      <button
                        className="add-btn"
                        onClick={() => addToList(brand)}
                        style={{
                          background: inList ? "rgba(99,202,183,0.1)" : "rgba(255,255,255,0.06)",
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

          {showHint && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(99,202,183,0.07)",
                border: "1px solid rgba(99,202,183,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 16 }}>👆</span>
              <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{t.hint}</span>
              <button
                onClick={() => setShowHint(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(99,202,183,0.3)",
                  color: "#63CAB7",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {t.hint_dismiss}
              </button>
            </div>
          )}

          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 8, paddingLeft: 4 }}>
            {t.db_info(db.length, sectors.length, sourcesCount)}
          </div>

          <div style={{ marginBottom: 40, paddingLeft: 4 }}>
            <a
              href="/sources.html"
              style={{ fontSize: 12, color: "rgba(99,202,183,0.6)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#63CAB7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(99,202,183,0.6)";
              }}
            >
              {lang === "en" ? "How do we score brands? →" : "Come calcoliamo i punteggi? →"}
            </a>
          </div>

         <MyListPanel
              myBrands={myBrands}
              onRemove={(name) => setMyBrands((prev) => prev.filter((b) => b.name !== name))}
              onClear={() => setMyBrands([])}
              onSelect={setSelected}
              lang={lang}
              ui={UI}
              threshold={THRESHOLD}
          />

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

          <div style={{ marginTop: 64, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 32 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.8 }}>
              {t.footer.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
              <br />
              <a href="/contribute.html" style={{ color: "rgba(99,202,183,0.5)", textDecoration: "none" }}>
                {lang === "it" ? "➕ Contribuisci · Segnala un errore · Aggiungi un brand" : "➕ Contribute · Report an error · Add a brand"}
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
