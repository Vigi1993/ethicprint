import { useState, useEffect, useRef, createContext, useContext } from "react";

const API = "https://web-production-14708.up.railway.app";

const CategoriesContext = createContext([]);
const useCategories = () => useContext(CategoriesContext);

const THRESHOLD = 50;

const UI = {
  en: {
    tagline: "Open Source · Community Driven",
    subtitle: "Discover the ethical impact of the brands you use every day.",
    search_placeholder: "Search brand, platform, service...",
    db_info: (n, s) => `${n} brands in the database · ${s} sectors · open source · community-updated data`,
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
    footer: "EthicPrint is an open source, non-profit project.\nData sourced from SIPRI, CDP, KnowTheChain, Oxfam, Ethical Consumer.",
    footer_cta: "Contribute on GitHub · Report an error · Add a brand",
    loading: "Loading...",
    show_less: "Less",
    show_more: (n) => `+${n} more`,
    score_verdicts: ["Strongly discouraged", "Problematic", "Improvable", "Fairly ethical"],
  },
  it: {
    tagline: "Open Source · Community Driven",
    subtitle: "Scopri l'impatto etico dei brand che usi ogni giorno.",
    search_placeholder: "Cerca brand, piattaforma, fornitore...",
    db_info: (n, s) => `${n} brand nel database · ${s} settori · open source · dati aggiornati dalla community`,
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
    footer: "EthicPrint è un progetto open source e no-profit.\nI dati sono raccolti da SIPRI, CDP, KnowTheChain, Oxfam, Ethical Consumer.",
    footer_cta: "Contribuisci su GitHub · Segnala un errore · Aggiungi un brand",
    loading: "Caricamento...",
    show_less: "Meno",
    show_more: (n) => `+${n} altri`,
    score_verdicts: ["Fortemente sconsigliato", "Problematico", "Migliorabile", "Abbastanza etico"],
  }
};

function getScore(brand) {
  const vals = Object.values(brand.scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getColor(score) {
  if (score >= 75) return "#4ade80";
  if (score >= 55) return "#facc15";
  if (score >= 35) return "#fb923c";
  return "#f87171";
}

function getVerdict(score, lang) {
  const verdicts = UI[lang]?.score_verdicts || UI.en.score_verdicts;
  if (score >= 75) return { label: verdicts[3], emoji: "🟢" };
  if (score >= 55) return { label: verdicts[2], emoji: "🟡" };
  if (score >= 35) return { label: verdicts[1], emoji: "🟠" };
  return { label: verdicts[0], emoji: "🔴" };
}

// Ritorna label categoria nella lingua corretta
function getCatLabel(cat, lang) {
  if (lang === "en" && cat.label_en) return cat.label_en;
  return cat.label;
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ background: "#1a1a2e", borderRadius: 99, height: 6, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "4px" }}>
      {["en", "it"].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          background: lang === l ? "rgba(99,202,183,0.2)" : "transparent",
          border: lang === l ? "1px solid rgba(99,202,183,0.4)" : "1px solid transparent",
          color: lang === l ? "#63cab7" : "rgba(255,255,255,0.35)",
          padding: "4px 12px", borderRadius: 99, cursor: "pointer",
          fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.15s"
        }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function RadarChart({ scores, lang }) {
  const categories = useCategories();
  const size = 140; const cx = size / 2, cy = size / 2, r = 52;
  const keys = categories.map(c => c.key);
  const labels = categories.map(c => getCatLabel(c, lang).split(" ")[0]);
  const angles = keys.map((_, i) => (i * 2 * Math.PI) / keys.length - Math.PI / 2);
  const points = keys.map((k, i) => { const val = (scores[k] || 0) / 100; return [cx + r * val * Math.cos(angles[i]), cy + r * val * Math.sin(angles[i])]; });
  const gridPoints = (scale) => keys.map((_, i) => [cx + r * scale * Math.cos(angles[i]), cy + r * scale * Math.sin(angles[i])]);
  const polyStr = (pts) => pts.map(p => p.join(",")).join(" ");
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map(s => <polygon key={s} points={polyStr(gridPoints(s))} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />)}
      {angles.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />)}
      <polygon points={polyStr(points)} fill="rgba(99,202,183,0.18)" stroke="#63cab7" strokeWidth="1.5" />
      {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#63cab7" />)}
      {angles.map((a, i) => { const lx = cx + (r + 16) * Math.cos(a); const ly = cy + (r + 16) * Math.sin(a); return <text key={i} x={lx} y={ly + 4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="'DM Sans', sans-serif">{labels[i]}</text>; })}
    </svg>
  );
}

function BrandCard({ brand, onClose, lang, onSelectAlt }) {
  const categories = useCategories();
  const [fullBrand, setFullBrand] = useState(null);
  const t = UI[lang] || UI.en;
  const total = fullBrand ? getScore(fullBrand) : 0;
  const verdict = getVerdict(total, lang);
  const color = getColor(total);

  useEffect(() => {
    setFullBrand(null);
    fetch(`${API}/brands/${brand.id}?lang=${lang}`)
      .then(r => r.json())
      .then(data => setFullBrand(data))
      .catch(() => setFullBrand(brand));
  }, [brand.id, lang]);

  if (!fullBrand) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 48, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2 }}>{t.loading}</div>
      </div>
    </div>
  );

  const b = fullBrand;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32, maxWidth: 520, width: "100%", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>

        {/* X chiudi in alto a destra */}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", width: 32, height: 32, borderRadius: 99, cursor: "pointer", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
          onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >×</button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingRight: 40 }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4, letterSpacing: 2, textTransform: "uppercase" }}>{b.sector}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>{b.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{t.parent}: {b.parent}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/100</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{verdict.emoji} {verdict.label}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 28, alignItems: "center" }}>
          <RadarChart scores={b.scores} lang={lang} />
          <div style={{ flex: 1 }}>
            {categories.map(cat => (
              <div key={cat.key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{cat.icon} {getCatLabel(cat, lang)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getColor(b.scores[cat.key]) }}>{b.scores[cat.key]}</span>
                </div>
                <ScoreBar value={b.scores[cat.key]} color={getColor(b.scores[cat.key])} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>{t.notes_title}</div>
          {categories.map(cat => {
            const catSources = b.sources?.[cat.key] || [];
            return (
              <div key={cat.key} style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: cat.color }}>{cat.icon} </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{b.notes?.[cat.key]}</span>
                </div>
                {catSources.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 16 }}>
                    {catSources.map((src, i) => (
                      <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "rgba(99,202,183,0.6)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, borderBottom: "1px solid rgba(99,202,183,0.15)", paddingBottom: 1, width: "fit-content", transition: "color 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.color = "#63cab7"}
                        onMouseOut={e => e.currentTarget.style.color = "rgba(99,202,183,0.6)"}
                      >
                        ↗ {src.title || src.publisher || "Source"}
                        {src.publisher && src.title && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>— {src.publisher}</span>}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, background: b.alternatives && b.alternatives.length > 0 ? "rgba(99,202,183,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (b.alternatives && b.alternatives.length > 0 ? "rgba(99,202,183,0.15)" : "rgba(255,255,255,0.06)"), borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#63cab7", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{t.alternatives_label}</div>
          {b.alternatives && b.alternatives.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {b.alternatives.map(alt => (
                <div key={alt.id} onClick={() => onSelectAlt(alt)} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,202,183,0.15)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(99,202,183,0.1)"}
                  onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: getColor(alt.score) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{alt.logo}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{alt.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{alt.sector}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: getColor(alt.score) }}>{alt.score}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>→</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
              {lang === "it" ? "🏆 Questo brand è tra i più virtuosi nel suo settore." : "🏆 This brand is among the most ethical in its sector."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MyListPanel({ myBrands, onRemove, onClear, onSelect, lang }) {
  const categories = useCategories();
  const t = UI[lang] || UI.en;
  if (myBrands.length === 0) return null;
  const avgScores = {};
  categories.forEach(c => avgScores[c.key] = 0);
  myBrands.forEach(b => { categories.forEach(c => avgScores[c.key] += b.scores[c.key] || 0); });
  categories.forEach(c => avgScores[c.key] = Math.round(avgScores[c.key] / myBrands.length));
  const total = Math.round(Object.values(avgScores).reduce((a, b) => a + b, 0) / categories.length);
  const verdict = getVerdict(total, lang); const color = getColor(total);
  const problematic = myBrands.filter(b => getScore(b) < THRESHOLD && b.alternatives && b.alternatives.length > 0);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{t.my_list_title}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
            {verdict.emoji} {t.aggregated_score}: <span style={{ color }}>{total}/100</span>
          </div>
        </div>
        <button onClick={onClear} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>{t.clear_list}</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <div key={cat.key} style={{ flex: "1 1 120px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{cat.icon} {getCatLabel(cat, lang)}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: getColor(avgScores[cat.key]) }}>{avgScores[cat.key]}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: problematic.length > 0 ? 24 : 0 }}>
        {myBrands.map(b => {
          const s = getScore(b);
          return (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 8, background: s < THRESHOLD ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${s < THRESHOLD ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 99, padding: "6px 12px 6px 8px", cursor: "pointer" }} onClick={() => onSelect(b)}>
              <span style={{ fontSize: 12, fontWeight: 600, color: getColor(s) }}>{s}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{b.name}</span>
              {s < THRESHOLD && <span style={{ fontSize: 10 }}>⚠️</span>}
              <button onClick={(e) => { e.stopPropagation(); onRemove(b.name); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          );
        })}
      </div>

      {problematic.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: "#f87171", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>{t.alternatives_title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {problematic.map(b => (
              <div key={b.name} style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: getColor(getScore(b)) }}>{b.name}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>score {getScore(b)}/100</span>
                  <span style={{ fontSize: 11, background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 8px", borderRadius: 99 }}>{t.below_threshold}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{t.replace_with}</div>
                <button onClick={() => onSelect(b)} style={{ background: "rgba(99,202,183,0.08)", border: "1px solid rgba(99,202,183,0.2)", borderRadius: 8, padding: "7px 14px", color: "#63cab7", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  {lang === "it" ? "Vedi alternative →" : "See alternatives →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectorSection({ sector, brands, myBrands, onAdd, onSelect, lang }) {
  const categories = useCategories();
  const t = UI[lang] || UI.en;
  const [expanded, setExpanded] = useState(false);
  const sorted = [...brands].sort((a, b) => getScore(a) - getScore(b));
  const visible = expanded ? sorted : sorted.slice(0, 4);
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 16, background: "rgba(99,202,183,0.4)", borderRadius: 99 }} />
          <span style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{sector}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>· {brands.length}</span>
        </div>
        {brands.length > 4 && (
          <button onClick={() => setExpanded(!expanded)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", padding: "3px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>
            {expanded ? t.show_less : t.show_more(brands.length - 4)}
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {visible.map((brand, idx) => {
          const score = getScore(brand); const inList = myBrands.find(b => b.name === brand.name);
          return (
            <div key={brand.name} className="brand-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", width: 16, textAlign: "right", flexShrink: 0 }}>{idx + 1}</div>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${getColor(score)}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: getColor(score) }}>{brand.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => onSelect(brand)}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brand.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>{brand.parent}</div>
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
                {categories.map(cat => <div key={cat.key} title={getCatLabel(cat, lang)} style={{ width: 5, height: 5, borderRadius: 99, background: getColor(brand.scores[cat.key]) }} />)}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: getColor(score), width: 32, textAlign: "right", flexShrink: 0 }} onClick={() => onSelect(brand)}>{score}</div>
              <button className="add-btn" onClick={() => onAdd(brand)} style={{ background: inList ? "rgba(99,202,183,0.1)" : "transparent", border: "1px solid rgba(255,255,255,0.08)", color: inList ? "#63cab7" : "rgba(255,255,255,0.3)", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", flexShrink: 0 }}>{inList ? "✓" : "+"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [db, setDb] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [myBrands, setMyBrands] = useState([]);
  const [lang, setLang] = useState("en");
  const [showHint, setShowHint] = useState(true);
  const inputRef = useRef(null);
  const t = UI[lang] || UI.en;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/brands?lang=${lang}`).then(r => r.json()),
      fetch(`${API}/categories`).then(r => r.json()),
    ])
      .then(([brandsData, categoriesData]) => {
        setDb(brandsData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(err => { console.error("Error loading data:", err); setLoading(false); });
  }, [lang]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(db.filter(b => b.name.toLowerCase().includes(q) || b.sector.toLowerCase().includes(q)));
  }, [query, db]);

  const addToList = (brand) => {
    if (!myBrands.find(b => b.name === brand.name)) setMyBrands(prev => [...prev, brand]);
    setQuery(""); setResults([]);
  };

  const sectors = [...new Set(db.map(b => b.sector))].sort();
  const brandsBySector = sectors.map(sector => ({ sector, brands: db.filter(b => b.sector === sector) }));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080814", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, letterSpacing: 2 }}>{t.loading}</div>
    </div>
  );

  return (
    <CategoriesContext.Provider value={categories}>
      <LangToggle lang={lang} setLang={setLang} />
      <div style={{ minHeight: "100vh", background: "#080814", fontFamily: "'DM Sans', sans-serif", color: "#fff", backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(99,202,183,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(239,68,68,0.04) 0%, transparent 60%)" }}>
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
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#63cab7", textTransform: "uppercase", marginBottom: 16 }}>{t.tagline}</div>
            <h1 style={{ fontSize: "clamp(36px, 8vw, 64px)", fontFamily: "'Playfair Display', serif", fontWeight: 800, lineHeight: 1.05, marginBottom: 16, background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EthicPrint</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
              {t.subtitle}<br />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                {categories.map(c => getCatLabel(c, lang).split(" ")[0]).join(" · ")}
              </span>
            </p>
          </div>

          <div style={{ position: "relative", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", boxShadow: query ? "0 0 0 2px rgba(99,202,183,0.15)" : "none" }}>
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search_placeholder} style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 16, fontFamily: "'DM Sans', sans-serif" }} />
              {query && <button onClick={() => { setQuery(""); setResults([]); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18 }}>×</button>}
            </div>

            {results.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                {results.map(brand => {
                  const score = getScore(brand); const inList = myBrands.find(b => b.name === brand.name);
                  return (
                    <div key={brand.name} className="brand-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${getColor(score)}22`, border: `1px solid ${getColor(score)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: getColor(score) }}>{brand.logo}</div>
                      <div style={{ flex: 1 }} onClick={() => setSelected(brand)}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{brand.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{brand.sector}</div>
                      </div>
                      <div style={{ textAlign: "right", marginRight: 8 }} onClick={() => setSelected(brand)}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: getColor(score) }}>{score}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>/ 100</div>
                      </div>
                      <button className="add-btn" onClick={() => addToList(brand)} style={{ background: inList ? "rgba(99,202,183,0.1)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: inList ? "#63cab7" : "rgba(255,255,255,0.5)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}>{inList ? "✓" : "+ List"}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {showHint && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(99,202,183,0.07)", border: "1px solid rgba(99,202,183,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>👆</span>
              <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{t.hint}</span>
              <button onClick={() => setShowHint(false)} style={{ background: "transparent", border: "1px solid rgba(99,202,183,0.3)", color: "#63cab7", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{t.hint_dismiss}</button>
            </div>
          )}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 40, paddingLeft: 4 }}>
            {t.db_info(db.length, sectors.length)}
          </div>

          <MyListPanel myBrands={myBrands} onRemove={(name) => setMyBrands(prev => prev.filter(b => b.name !== name))} onClear={() => setMyBrands([])} onSelect={setSelected} lang={lang} />

          <div style={{ marginTop: 52 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 32 }}>{t.ranking_title}</div>
            {brandsBySector.map(({ sector, brands }) => (
              <SectorSection key={sector} sector={sector} brands={brands} myBrands={myBrands} onAdd={addToList} onSelect={setSelected} lang={lang} />
            ))}
          </div>

          <div style={{ marginTop: 64, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 32 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.8 }}>
              {t.footer.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}<br />
              <span style={{ color: "rgba(99,202,183,0.5)" }}>{t.footer_cta}</span>
            </div>
          </div>
        </div>

        {selected && <BrandCard brand={selected} onClose={() => setSelected(null)} lang={lang} onSelectAlt={(alt) => setSelected(alt)} />}
      </div>
    </CategoriesContext.Provider>
  );
}
