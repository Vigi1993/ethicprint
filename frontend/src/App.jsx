import { useState, useEffect, useRef, createContext, useContext } from "react";
import logoSrc from "./assets/logo.png";

const API = "https://web-production-14708.up.railway.app";

const CategoriesContext = createContext([]);
const useCategories = () => useContext(CategoriesContext);

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
    footer: "EthicPrint is an open source, non-profit project.\nData sourced from SIPRI, CDP, KnowTheChain, Oxfam, Ethical Consumer.",
    footer_cta: "Contribute on GitHub · Report an error · Add a brand",
    sources_banner_title: "How do we score brands?",
    sources_banner_desc: "Every score is backed by verified sources, weighted by publisher authority. Amnesty International counts more than a blog. Everything is public.",
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
    footer: "EthicPrint è un progetto open source e no-profit.\nI dati sono raccolti da SIPRI, CDP, KnowTheChain, Oxfam, Ethical Consumer.",
    footer_cta: "Contribuisci su GitHub · Segnala un errore · Aggiungi un brand",
    sources_banner_title: "Come calcoliamo i punteggi?",
    sources_banner_desc: "Ogni punteggio è supportato da fonti verificate, pesate per autorevolezza. Amnesty International vale più di un blog. Tutto è pubblico.",
    sources_banner_cta: "Vedi tutte le fonti e la metodologia →",
    loading: "Caricamento...",
    hint: "Aggiungi i brand che usi con + per scoprire la tua impronta etica personale.",
    hint_dismiss: "Capito",

    show_less: "Meno",
    show_more: (n) => `+${n} altri`,
    score_verdicts: ["Fortemente sconsigliato", "Problematico", "Migliorabile", "Abbastanza etico"],
  }
};

function getScore(brand) {
  // Usa total_score dall'API se disponibile (esclude categorie senza dati sufficienti)
  if (brand.total_score !== undefined && brand.total_score !== null) return brand.total_score;
  // Fallback: media semplice (per brand nella lista prima del fetch completo)
  const vals = Object.values(brand.scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getColor(score, max = 100) {
  const pct = (score / max) * 100;
  if (pct >= 90) return "#6dbb7a";
  if (pct >= 75) return "#a8c5a0";
  if (pct >= 55) return "#facc15";
  if (pct >= 35) return "#fb923c";
  return "#ef4444";
}

function getVerdict(score, lang) {
  const it = lang === "it";
  if (score >= 90) return { label: it ? "Profondamente Etico"   : "Deeply Ethical",        emoji: "🟢" };
  if (score >= 75) return { label: it ? "Abbastanza Etico"      : "Fairly Ethical",         emoji: "🟢" };
  if (score >= 55) return { label: it ? "Parzialmente Etico"    : "Partially Ethical",      emoji: "🟡" };
  if (score >= 35) return { label: it ? "Scarsamente Etico"     : "Scarcely Ethical",       emoji: "🟠" };
  return           { label: it ? "Eticamente Inadeguato"        : "Ethically Compromised",  emoji: "🔴" };
}

function getSectorAvgScore(brands) {
  if (!brands.length) return 0;
  return Math.round(brands.reduce((sum, b) => sum + getScore(b), 0) / brands.length);
}

// Ritorna label categoria nella lingua corretta
function getCatLabel(cat, lang) {
  if (lang === "en" && cat.label_en) return cat.label_en;
  return cat.label;
}

function ScoreBar({ value, color, max = 25 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "#0d1f16", borderRadius: 99, height: 6, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "4px" }}>
      {["en", "it"].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          background: lang === l ? "rgba(122,171,138,0.2)" : "transparent",
          border: lang === l ? "1px solid rgba(122,171,138,0.4)" : "1px solid transparent",
          color: lang === l ? "#7aab8a" : "rgba(255,255,255,0.35)",
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
      <polygon points={polyStr(points)} fill="rgba(122,171,138,0.18)" stroke="#7aab8a" strokeWidth="1.5" />
      {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="#7aab8a" />)}
      {angles.map((a, i) => { const lx = cx + (r + 16) * Math.cos(a); const ly = cy + (r + 16) * Math.sin(a); return <text key={i} x={lx} y={ly + 4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="'DM Sans', sans-serif">{labels[i]}</text>; })}
    </svg>
  );
}

function BrandCard({ brand, onClose, lang, onSelectAlt }) {
  const categories = useCategories();
  const [fullBrand, setFullBrand] = useState(null);
  const t = UI[lang] || UI.en;
  const total = fullBrand ? getScore(fullBrand) : 0;
  const b_scored = fullBrand?.categories_scored ?? 4;
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
      <div style={{ background: "#0f2018", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 48, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", letterSpacing: 2 }}>{t.loading}</div>
      </div>
    </div>
  );

  const b = fullBrand;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0f2018", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32, maxWidth: 520, width: "100%", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto", position: "relative" }} onClick={e => e.stopPropagation()}>

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
            {b.insufficient_data ? (
              <div style={{ fontSize: 13, color: "#fb923c", fontWeight: 600, maxWidth: 140, lineHeight: 1.4 }}>
                {lang === "it" ? "⚠️ Dati insufficienti" : "⚠️ Insufficient data"}
              </div>
            ) : (
              <>
                <div style={{ fontSize: 40, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{total}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  {b.categories_scored < 4
                    ? (lang === "it" ? `su ${b.categories_scored}/4 categorie` : `${b.categories_scored}/4 categories`)
                    : "/100"}
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{verdict.emoji} {verdict.label}</div>
              </>
            )}
          </div>
        </div>

        {b.impact_summary && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontStyle: "italic" }}>
            {b.impact_summary}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          {categories.map(cat => {
            const status = b.confidence?.[cat.key]?.data_status || "none";
            const score = b.scores[cat.key];
            const isOk = status === "ok";
            const isInsufficient = status === "insufficient";
            const catColor = isOk ? getColor(score, 25) : "rgba(255,255,255,0.15)";
            return (
              <div key={cat.key} style={{ marginBottom: 12, opacity: isOk ? 1 : 0.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: isOk ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)" }}>
                    {cat.icon} {getCatLabel(cat, lang)}
                  </span>
                  {isOk ? (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: catColor }}>{score}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>/25</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 10, color: "#fb923c", fontFamily: "'DM Mono', monospace" }}>
                      {isInsufficient
                        ? (lang === "it" ? "1 fonte" : "1 source")
                        : (lang === "it" ? "nessuna fonte" : "no sources")}
                    </span>
                  )}
                </div>
                <ScoreBar value={isOk ? score : 0} color={catColor} max={25} />
              </div>
            );
          })}
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
                {b.confidence?.[cat.key] && (() => {
                  const c = b.confidence[cat.key];
                  const srcWord = lang === "it" ? (c.count === 1 ? "fonte verificata" : "fonti verificate") : (c.count === 1 ? "verified source" : "verified sources");
                  return (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>◆ {c.count} {srcWord}</span>
                    </div>
                  );
                })()}
                {catSources.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 16 }}>
                    {catSources.map((src, i) => (
                      <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "rgba(122,171,138,0.6)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, borderBottom: "1px solid rgba(122,171,138,0.15)", paddingBottom: 1, width: "fit-content", transition: "color 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.color = "#7aab8a"}
                        onMouseOut={e => e.currentTarget.style.color = "rgba(122,171,138,0.6)"}
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

        <div style={{ marginTop: 20, background: b.alternatives && b.alternatives.length > 0 ? "rgba(122,171,138,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (b.alternatives && b.alternatives.length > 0 ? "rgba(122,171,138,0.15)" : "rgba(255,255,255,0.06)"), borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#7aab8a", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{t.alternatives_label}</div>
          {b.alternatives && b.alternatives.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {b.alternatives.map(alt => (
                <div key={alt.id} onClick={() => onSelectAlt(alt)} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(122,171,138,0.15)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(122,171,138,0.1)"}
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
            <div style={{ fontSize: 22, fontWeight: 700, color: getColor(avgScores[cat.key], 25) }}>{avgScores[cat.key]}</div>
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
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{b.insufficient_data ? "⚠️" : `score ${getScore(b)}/100`}</span>
                  <span style={{ fontSize: 11, background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 8px", borderRadius: 99 }}>{t.below_threshold}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{t.replace_with}</div>
                <button onClick={() => onSelect(b)} style={{ background: "rgba(122,171,138,0.08)", border: "1px solid rgba(122,171,138,0.2)", borderRadius: 8, padding: "7px 14px", color: "#7aab8a", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
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

function BrandRow({ brand, idx, myBrands, onAdd, onSelect, lang }) {
  const categories = useCategories();
  const score = getScore(brand);
  const inList = myBrands.find(b => b.name === brand.name);
  return (
    <div className="brand-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 11, cursor: "pointer", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", width: 16, textAlign: "right", flexShrink: 0 }}>{idx + 1}</div>
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${getColor(score)}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: getColor(score) }}>{brand.logo}</div>
      <div style={{ flex: 1, minWidth: 0 }} onClick={() => onSelect(brand)}>
        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{brand.name}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>{brand.parent}</div>
      </div>
      <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
        {categories.map(cat => <div key={cat.key} title={getCatLabel(cat, lang)} style={{ width: 5, height: 5, borderRadius: 99, background: getColor(brand.scores[cat.key], 25) }} />)}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: getColor(score), width: 32, textAlign: "right", flexShrink: 0 }} onClick={() => onSelect(brand)}>{score}</div>
      <button className="add-btn" onClick={() => onAdd(brand)} style={{ background: inList ? "rgba(122,171,138,0.1)" : "transparent", border: "1px solid rgba(255,255,255,0.08)", color: inList ? "#7aab8a" : "rgba(255,255,255,0.3)", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", flexShrink: 0 }}>{inList ? "✓" : "+"}</button>
    </div>
  );
}

function RestBrands({ rest, myBrands, onAdd, onSelect, lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 4 }}>
      <button onClick={() => setOpen(!open)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", padding: "4px 6px", width: "100%", textAlign: "left" }}>
        {open ? "↑ " + (lang === "it" ? "Nascondi" : "Hide") : "↓ " + (lang === "it" ? `Vedi altri ${rest.length}` : `See ${rest.length} more`)}
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
          {rest.map((brand, idx) => (
            <BrandRow key={brand.name} brand={brand} idx={idx + 1} myBrands={myBrands} onAdd={onAdd} onSelect={onSelect} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectorSection({ sector, sectorIcon, brands, myBrands, onAdd, onSelect, lang, defaultOpen }) {
  const categories = useCategories();
  const t = UI[lang] || UI.en;
  const [expanded, setExpanded] = useState(defaultOpen);
  const sorted = [...brands].sort((a, b) => getScore(b) - getScore(a));
  const avgScore = getSectorAvgScore(brands);
  const best = sorted[0];
  const rest = sorted.slice(1);
  const avgColor = getColor(avgScore);
  const bestScore = best ? getScore(best) : 0;
  const bestInList = best && myBrands.find(b => b.name === best.name);

  return (
    <div style={{ marginBottom: 8, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.01)" }}>

      {/* Header settore */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{sectorIcon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{sector}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
            {brands.length} {lang === "it" ? "brand" : "brands"}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginRight: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: avgColor }}>{avgScore}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{lang === "it" ? "media" : "avg"}</div>
        </div>

      </div>

      {/* Best brand — sempre visibile quando espanso */}
      {expanded && best && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", margin: "0 12px", padding: "12px 6px 8px" }}>
          <div className="brand-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 11, background: `${getColor(bestScore)}08`, border: `1px solid ${getColor(bestScore)}22`, cursor: "pointer" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${getColor(bestScore)}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: getColor(bestScore), flexShrink: 0 }}>{best.logo}</div>
            <div style={{ flex: 1, minWidth: 0 }} onClick={() => onSelect(best)}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{best.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                {categories.map(cat => (
                  <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 99, background: getColor(best.scores[cat.key], 25) }} />
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{getCatLabel(cat, lang).split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: getColor(bestScore), flexShrink: 0 }} onClick={() => onSelect(best)}>{bestScore}</div>
            <button className="add-btn" onClick={() => onAdd(best)} style={{ background: bestInList ? "rgba(122,171,138,0.1)" : "transparent", border: "1px solid rgba(255,255,255,0.08)", color: bestInList ? "#7aab8a" : "rgba(255,255,255,0.3)", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{bestInList ? "✓" : "+"}</button>
          </div>

          {/* Altri brand a scomparsa */}
          {rest.length > 0 && <RestBrands rest={rest} myBrands={myBrands} onAdd={onAdd} onSelect={onSelect} lang={lang} />}
        </div>
      )}

      {expanded && <div style={{ height: 8 }} />}
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
  const [sourcesCount, setSourcesCount] = useState(0);
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
    fetch(`${API}/sources/public`)
      .then(r => r.json())
      .then(data => setSourcesCount(data.total || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap";
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
  const brandsBySector = sectors
    .map(sector => {
      const brands = db.filter(b => b.sector === sector);
      const sectorIcon = brands[0]?.sector_icon || "🏢";
      return { sector, sectorIcon, brands, avgScore: getSectorAvgScore(brands) };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a1a14", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, letterSpacing: 2 }}>{t.loading}</div>
    </div>
  );

  return (
    <CategoriesContext.Provider value={categories}>
      <LangToggle lang={lang} setLang={setLang} />
      <div style={{ minHeight: "100vh", background: "#0a1a14", fontFamily: "'DM Sans', sans-serif", color: "#e8f0ec", backgroundImage: "radial-gradient(ellipse at 15% 10%, rgba(40,80,55,0.6) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(15,40,60,0.5) 0%, transparent 50%)" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::selection { background: rgba(122,171,138,0.3); }
          input:focus { outline: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
          .brand-row:hover { background: rgba(255,255,255,0.05) !important; }
          .add-btn:hover { background: rgba(122,171,138,0.2) !important; color: #63cab7 !important; }
        `}</style>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>

          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#7aab8a", textTransform: "uppercase", marginBottom: 16 }}>{t.tagline}</div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
              <img
                src={logoSrc}
                alt="EthicPrint"
                style={{
                  height: "clamp(48px, 10vw, 80px)",
                  width: "auto",
                  filter: "brightness(1.05) drop-shadow(0 0 18px rgba(122,171,138,0.25))",
                  mixBlendMode: "normal",
                }}
              />
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
              {t.subtitle}<br />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                {categories.map(c => getCatLabel(c, lang).split(" ")[0]).join(" · ")}
              </span>
            </p>
          </div>

          <div style={{ position: "relative", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", boxShadow: query ? "0 0 0 2px rgba(122,171,138,0.15)" : "none" }}>
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search_placeholder} style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 16, fontFamily: "'DM Sans', sans-serif" }} />
              {query && <button onClick={() => { setQuery(""); setResults([]); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18 }}>×</button>}
            </div>

            {results.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#0f2018", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
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
                      <button className="add-btn" onClick={() => addToList(brand)} style={{ background: inList ? "rgba(122,171,138,0.1)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: inList ? "#7aab8a" : "rgba(255,255,255,0.5)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}>{inList ? "✓" : "+ List"}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {showHint && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(122,171,138,0.07)", border: "1px solid rgba(122,171,138,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>👆</span>
              <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{t.hint}</span>
              <button onClick={() => setShowHint(false)} style={{ background: "transparent", border: "1px solid rgba(122,171,138,0.3)", color: "#7aab8a", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{t.hint_dismiss}</button>
            </div>
          )}

          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 8, paddingLeft: 4 }}>
            {t.db_info(db.length, sectors.length, sourcesCount)}
          </div>

          <div style={{ marginBottom: 40, paddingLeft: 4 }}>
            <a href="/sources.html" style={{ fontSize: 12, color: "rgba(122,171,138,0.6)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#7aab8a"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(122,171,138,0.6)"}
            >
              {lang === "en" ? "How do we score brands? →" : "Come calcoliamo i punteggi? →"}
            </a>
          </div>

          <MyListPanel myBrands={myBrands} onRemove={(name) => setMyBrands(prev => prev.filter(b => b.name !== name))} onClear={() => setMyBrands([])} onSelect={setSelected} lang={lang} />

          <div style={{ marginTop: 52 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 32 }}>{t.ranking_title}</div>
            {brandsBySector.map(({ sector, sectorIcon, brands }, idx) => (
              <SectorSection key={sector} sector={sector} sectorIcon={sectorIcon} brands={brands} myBrands={myBrands} onAdd={addToList} onSelect={setSelected} lang={lang} defaultOpen={true} />
            ))}
          </div>

          <div style={{ marginTop: 64, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 32 }}>
            {/* Footer */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.8 }}>
              {t.footer.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}<br />
              <a href="/contribute.html" style={{ color: "rgba(122,171,138,0.5)", textDecoration: "none" }}>
                {lang === "it" ? "➕ Contribuisci · Segnala un errore · Aggiungi un brand" : "➕ Contribute · Report an error · Add a brand"}
              </a>
            </div>
          </div>
        </div>

        {selected && <BrandCard brand={selected} onClose={() => setSelected(null)} lang={lang} onSelectAlt={(alt) => setSelected(alt)} />}
      </div>
    </CategoriesContext.Provider>
  );
}
