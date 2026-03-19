import { useMemo, useState } from "react";
import { useCategories } from "../context/categoriesContext";
import {
  getCatLabel,
  getDisplayScore,
  getDisplayLabel,
  getDisplayScoreColor,
  rawCategoryScoreToPublic,
} from "../utils/brandHelpers";

if (typeof document !== "undefined" && !document.getElementById("ep-fonts")) {
  const link = document.createElement("link");
  link.id = "ep-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500&display=swap";
  document.head.appendChild(link);
}

const T = {
  paper: "#F0EDE4",
  white: "#FAFAF5",
  ink: "#0A0A0A",
  inkMid: "#3a3028",
  inkLight: "#7a6e60",
  inkFaint: "#b8afa0",
  red: "#C02617",
  redBg: "#FBE8E6",
  amber: "#B87000",
  amberBg: "#FBF2DC",
  green: "#165C38",
  greenBg: "#E2F0E8",
  border: "#C8C0B0",
  borderLight: "#E0D8C8",
};

const F = {
  display: "'Bebas Neue', Impact, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', sans-serif",
};

function scoreColor(score) {
  if (score === null || score === undefined) return T.inkLight;
  if (score >= 65) return T.green;
  if (score >= 45) return T.amber;
  return T.red;
}

function ScoreBadge({ score, size = "md" }) {
  const color = scoreColor(score);
  const fs = size === "lg" ? 32 : size === "md" ? 24 : 18;
  const pad = size === "lg" ? "4px 14px" : size === "md" ? "3px 10px" : "2px 8px";
  return (
    <span style={{ fontFamily: F.display, fontSize: fs, padding: pad, background: color, color: "#fff", borderRadius: 0, display: "inline-block", lineHeight: 1.2, letterSpacing: "0.02em", flexShrink: 0 }}>
      {score ?? "—"}
    </span>
  );
}

function ScoreBar({ score }) {
  const pct = score != null ? Math.max(2, score) : 0;
  return (
    <div style={{ background: T.borderLight, height: 4, marginBottom: 14 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: scoreColor(score), transition: "width 0.7s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function SectionHeader({ label, count, variant }) {
  const bg = variant === "red" ? T.red : variant === "green" ? T.green : T.ink;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: bg }}>
      <span style={{ fontFamily: F.display, fontSize: 22, letterSpacing: "0.1em", color: "#fff" }}>{label}</span>
      <span style={{ fontFamily: F.display, fontSize: 28, color: "rgba(255,255,255,0.35)", lineHeight: 1 }}>{count}</span>
    </div>
  );
}

function RemoveBtn({ onClick, name }) {
  return (
    <button onClick={onClick} aria-label={`Remove ${name}`} style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>
      ×
    </button>
  );
}

// ─── Unchanged logic ──────────────────────────────────────────────────────────

const CATEGORY_HINTS = {
  en: [
    { key: "grocery", label: "Grocery", terms: ["grocery", "supermarket", "gdo", "retail", "food"] },
    { key: "fashion", label: "Fashion", terms: ["fashion", "clothing", "apparel", "luxury"] },
    { key: "energy", label: "Energy", terms: ["energy", "utility", "oil", "gas", "power"] },
    { key: "tech", label: "Tech", terms: ["tech", "technology", "electronics", "software", "platform"] },
    { key: "social", label: "Social", terms: ["social", "media", "platform", "streaming", "internet"] },
  ],
  it: [
    { key: "grocery", label: "GDO", terms: ["grocery", "supermarket", "gdo", "retail", "food"] },
    { key: "fashion", label: "Moda", terms: ["fashion", "clothing", "apparel", "luxury"] },
    { key: "energy", label: "Energia", terms: ["energy", "utility", "oil", "gas", "power"] },
    { key: "tech", label: "Tech", terms: ["tech", "technology", "electronics", "software", "platform"] },
    { key: "social", label: "Social", terms: ["social", "media", "platform", "streaming", "internet"] },
  ],
};

function normalize(text) { return String(text || "").toLowerCase().trim(); }

function matchesHint(brand, hint) {
  const h = [brand?.name, brand?.sector, brand?.sector_icon, brand?.description, brand?.parent_company].filter(Boolean).join(" ").toLowerCase();
  return hint.terms.some((t) => h.includes(t));
}

function getWorstCategory(brand, categories) {
  if (!brand?.scores) return null;
  const scored = categories.map((cat) => {
    const raw = brand.scores?.[cat.key];
    const publicScore = typeof raw === "number" ? rawCategoryScoreToPublic(raw) : null;
    return { cat, publicScore };
  }).filter((item) => typeof item.publicScore === "number");
  if (!scored.length) return null;
  return scored.sort((a, b) => a.publicScore - b.publicScore)[0];
}

function getIssueLabel(brand, categories, lang) {
  if (brand?.insufficient_data) return lang === "it" ? "Dati insufficienti" : "Insufficient data";
  const worst = getWorstCategory(brand, categories);
  if (!worst) return lang === "it" ? "Criticità etiche" : "Ethical concerns";
  return getCatLabel(worst.cat, lang);
}

function getIssueExplanation(brand, categories, lang) {
  if (brand?.insufficient_data)
    return lang === "it" ? "Non ci sono ancora abbastanza fonti pubblicate per valutarlo bene." : "There aren't enough published sources yet to assess it properly.";
  const key = getWorstCategory(brand, categories)?.cat?.key;
  const copy = {
    it: { environment: "Impatto ambientale debole rispetto ad alternative migliori.", labor: "Possibili criticità su lavoro, filiera o condizioni produttive.", conflicts: "Possibile esposizione a conflitti o aree controverse.", transparency: "Trasparenza limitata su filiera, pratiche o governance.", animals: "Possibili criticità su benessere animale o materiali usati.", default: "Questo brand mostra segnali etici più deboli del previsto." },
    en: { environment: "Weaker environmental performance than better alternatives.", labor: "Possible concerns around labor, supply chain, or production conditions.", conflicts: "Possible exposure to conflicts or controversial areas.", transparency: "Limited transparency on supply chain, practices, or governance.", animals: "Possible concerns around animal welfare or materials used.", default: "This brand shows weaker ethical signals than stronger alternatives." },
  };
  return copy[lang]?.[key] || copy[lang]?.default || copy.en.default;
}

function getImpactCopy(brand, categories, lang) {
  if (brand?.insufficient_data)
    return lang === "it" ? "Usandolo continui a sostenere un brand che oggi non è ancora valutabile con abbastanza evidenza pubblica." : "Using it still supports a brand that cannot yet be assessed with enough public evidence.";
  const key = getWorstCategory(brand, categories)?.cat?.key;
  const copy = {
    it: { environment: "Usandolo continui a sostenere un modello con impatto ambientale più debole del necessario.", labor: "Usandolo continui a sostenere possibili criticità su lavoro, filiera o produzione.", conflicts: "Usandolo continui a sostenere possibili legami con aree o dinamiche controverse.", transparency: "Usandolo continui a sostenere un brand meno trasparente su pratiche e filiera.", animals: "Usandolo continui a sostenere possibili criticità su materiali o benessere animale.", default: "Usandolo continui a sostenere un brand con segnali etici più deboli di alternative migliori." },
    en: { environment: "Using it continues to support a weaker environmental model than necessary.", labor: "Using it continues to support possible labor, supply chain, or production concerns.", conflicts: "Using it continues to support possible links to controversial areas or dynamics.", transparency: "Using it continues to support a brand with lower transparency on practices and supply chain.", animals: "Using it continues to support possible concerns around materials or animal welfare.", default: "Using it continues to support a brand with weaker ethical signals than better alternatives." },
  };
  return copy[lang]?.[key] || copy[lang]?.default || copy.en.default;
}

function getAlternativeName(alt) {
  if (!alt) return null;
  if (typeof alt === "string") return alt;
  return alt.name || alt.brand_name || alt.title || null;
}

function getAlternativeScore(alt) {
  if (!alt || typeof alt === "string") return null;
  if (typeof alt.public_score === "number") return alt.public_score;
  if (typeof alt.score === "number") return alt.score;
  return null;
}

function getTopAlternative(brand) {
  if (!Array.isArray(brand?.alternatives) || !brand.alternatives.length) return null;
  return brand.alternatives[0];
}

function getAlternativeDelta(brand) {
  const current = getDisplayScore(brand);
  const altScore = getAlternativeScore(getTopAlternative(brand));
  if (typeof current !== "number" || typeof altScore !== "number") return null;
  const delta = altScore - current;
  return delta > 0 ? delta : null;
}

function findAlternativeInDb(brand, db) {
  const altName = normalize(getAlternativeName(getTopAlternative(brand)));
  if (!altName || !Array.isArray(db)) return null;
  return db.find((item) => normalize(item.name) === altName) || null;
}

function getCategoryPublicScoreMap(brand, categories) {
  const map = {};
  categories.forEach((cat) => {
    const raw = brand?.scores?.[cat.key];
    map[cat.key] = typeof raw === "number" ? rawCategoryScoreToPublic(raw) : null;
  });
  return map;
}

function getAlternativeAdvantageCopy(currentBrand, alternativeBrand, categories, lang) {
  if (!currentBrand || !alternativeBrand) return null;
  const cur = getCategoryPublicScoreMap(currentBrand, categories);
  const alt = getCategoryPublicScoreMap(alternativeBrand, categories);
  const improvements = categories.map((cat) => {
    const c = cur[cat.key], a = alt[cat.key];
    if (typeof c !== "number" || typeof a !== "number") return null;
    return { label: getCatLabel(cat, lang), delta: a - c };
  }).filter(Boolean).filter((i) => i.delta >= 8).sort((a, b) => b.delta - a.delta).slice(0, 2);
  if (!improvements.length) return lang === "it" ? "Alternativa con segnali etici più solidi." : "Alternative with stronger ethical signals.";
  if (improvements.length === 1) return lang === "it" ? `Più forte su ${improvements[0].label.toLowerCase()}.` : `Stronger on ${improvements[0].label.toLowerCase()}.`;
  return lang === "it"
    ? `Più forte su ${improvements[0].label.toLowerCase()} e ${improvements[1].label.toLowerCase()}.`
    : `Stronger on ${improvements[0].label.toLowerCase()} and ${improvements[1].label.toLowerCase()}.`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MyListPanel({ myBrands, db, onAdd, onReplace, onRemove, onClear, onSelect, lang, ui, threshold }) {
  const categories = useCategories();
  const t = ui[lang] || ui.en;
  const [localQuery, setLocalQuery] = useState("");
  const [activeHintKey, setActiveHintKey] = useState(null);
  const hints = CATEGORY_HINTS[lang] || CATEGORY_HINTS.en;

  const avgScores = {};
  const avgScoreCounts = {};
  categories.forEach((c) => { avgScores[c.key] = 0; avgScoreCounts[c.key] = 0; });
  if (myBrands.length > 0) {
    myBrands.forEach((b) => {
      categories.forEach((c) => {
        const raw = b.scores?.[c.key];
        if (typeof raw === "number") { avgScores[c.key] += raw; avgScoreCounts[c.key] += 1; }
      });
    });
    categories.forEach((c) => {
      avgScores[c.key] = avgScoreCounts[c.key] > 0 ? Math.round(avgScores[c.key] / avgScoreCounts[c.key]) : null;
    });
  }

  const displayScores = myBrands.filter((b) => typeof b.public_score === "number" && !b.insufficient_data);
  const publicAverage = displayScores.length
    ? Math.round(displayScores.reduce((sum, b) => sum + b.public_score, 0) / displayScores.length)
    : null;

  const problematic = myBrands.filter((b) => { const s = getDisplayScore(b); return !b.insufficient_data && s !== null && s < threshold; });
  const insufficient = myBrands.filter((b) => b.insufficient_data);
  const positive = myBrands.filter((b) => { const s = getDisplayScore(b); return !b.insufficient_data && s !== null && s >= threshold; });
  const isEmpty = myBrands.length === 0;

  const trackedNames = useMemo(() => new Set(myBrands.map((b) => normalize(b.name))), [myBrands]);
  const activeHint = hints.find((h) => h.key === activeHintKey) || null;

  const addResults = useMemo(() => {
    const q = normalize(localQuery);
    let pool = Array.isArray(db) ? [...db] : [];
    pool = pool.filter((brand) => !trackedNames.has(normalize(brand.name)));
    if (activeHint) pool = pool.filter((brand) => matchesHint(brand, activeHint));
    if (q) pool = pool.filter((brand) => [brand?.name, brand?.sector, brand?.description, brand?.parent_company].filter(Boolean).join(" ").toLowerCase().includes(q));
    return pool.sort((a, b) => (getDisplayScore(b) ?? -1) - (getDisplayScore(a) ?? -1)).slice(0, 6);
  }, [db, trackedNames, localQuery, activeHint]);

  const shouldShowResults = localQuery.trim().length > 0 || activeHint !== null;
  const avgColor = scoreColor(publicAverage);

  return (
    <div style={{ fontFamily: F.sans }}>

      {/* ══ HERO HEADER ═══════════════════════════════════════════════════════ */}
      <div style={{ background: T.ink, padding: "28px 20px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: T.red, opacity: 0.12, borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: -20, width: 120, height: 120, background: "#1a1a2e", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ fontFamily: F.display, fontSize: 12, letterSpacing: "0.24em", color: "rgba(240,237,228,0.3)", marginBottom: 10 }}>
          ETHICPRINT
        </div>

        <div style={{ fontFamily: F.display, fontSize: "clamp(42px, 10vw, 68px)", letterSpacing: "0.04em", color: "#F0EDE4", lineHeight: 0.9, marginBottom: 20 }}>
          YOUR ETHICAL<br />FOOTPRINT
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
          <div style={{ fontFamily: F.display, fontSize: "clamp(96px, 22vw, 140px)", color: publicAverage !== null ? avgColor : "rgba(240,237,228,0.12)", lineHeight: 0.82, letterSpacing: "-0.02em" }}>
            {publicAverage ?? "—"}
          </div>
          <div style={{ paddingBottom: 12 }}>
            <div style={{ fontFamily: F.display, fontSize: 32, color: "rgba(240,237,228,0.25)", lineHeight: 1 }}>/100</div>
            {publicAverage !== null && (
              <div style={{
                display: "inline-block",
                fontFamily: F.display, fontSize: 15, letterSpacing: "0.1em",
                padding: "4px 10px", marginTop: 6,
                background: avgColor, color: "#fff",
                transform: "rotate(-1deg)",
              }}>
                {getDisplayLabel({ public_score: publicAverage, insufficient_data: false }, lang).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.07)", height: 6, marginBottom: 16 }}>
          <div style={{ width: `${publicAverage ?? 0}%`, height: "100%", background: avgColor, transition: "width 0.9s cubic-bezier(.4,0,.2,1)" }} />
        </div>

        {!isEmpty && (
          <div>
            <div style={{ fontSize: 13, color: "rgba(240,237,228,0.45)", marginBottom: 14, fontFamily: F.sans }}>
              <span style={{ color: "#F0EDE4", fontWeight: 500 }}>{myBrands.length}</span>{" "}
              {lang === "it" ? "brand monitorati" : "brands tracked"}{" · "}
              <span style={{ color: problematic.length > 0 ? "#ff6b57" : "rgba(240,237,228,0.45)", fontWeight: problematic.length > 0 ? 500 : 400 }}>
                {problematic.length}
              </span>{" "}
              {lang === "it" ? "richiedono attenzione" : "need attention"}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {categories.map((cat) => {
                const ps = typeof avgScores[cat.key] === "number" ? rawCategoryScoreToPublic(avgScores[cat.key]) : null;
                const cc = scoreColor(ps);
                return (
                  <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{cat.icon}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: F.sans }}>{getCatLabel(cat, lang)}</span>
                    <span style={{ fontFamily: F.display, fontSize: 15, color: ps != null ? cc : "rgba(255,255,255,0.2)" }}>{ps ?? "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isEmpty && (
          <div style={{ fontSize: 14, color: "rgba(240,237,228,0.3)", fontStyle: "italic", fontFamily: F.sans }}>
            {lang === "it" ? "Aggiungi brand per vedere la tua impronta etica." : "Add brands to see your ethical footprint."}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 18, flexWrap: "wrap", gap: 8 }}>
          <a href="/sources.html" style={{ fontSize: 11, color: "rgba(240,237,228,0.25)", textDecoration: "none", fontFamily: F.sans, letterSpacing: "0.04em" }}>
            {lang === "it" ? "Come funzionano i punteggi? →" : "How do scores work? →"}
          </a>
          {!isEmpty && (
            <button onClick={onClear} style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.35)", padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: F.sans }}>
              {t.clear_list}
            </button>
          )}
        </div>
      </div>

      {/* ══ BRAND SECTIONS ════════════════════════════════════════════════════ */}
      {!isEmpty && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* NEEDS ATTENTION */}
          <div>
            <SectionHeader label={lang === "it" ? "Richiedono attenzione" : "Needs attention"} count={problematic.length} variant="red" />
            {problematic.length === 0 ? (
              <div style={{ background: T.white, border: `0.5px solid ${T.border}`, borderTop: "none", padding: "14px 16px", fontSize: 13, color: T.inkLight, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Nessun brand problematico per ora." : "No problematic brands for now."}
              </div>
            ) : (
              problematic.map((b, i) => {
                const displayScore = getDisplayScore(b);
                const issueLabel = getIssueLabel(b, categories, lang);
                const issueExplanation = getIssueExplanation(b, categories, lang);
                const impactCopy = getImpactCopy(b, categories, lang);
                const topAlt = getTopAlternative(b);
                const altName = getAlternativeName(topAlt);
                const altDelta = getAlternativeDelta(b);
                const replaceBrand = findAlternativeInDb(b, db);
                const advantageCopy = replaceBrand ? getAlternativeAdvantageCopy(b, replaceBrand, categories, lang) : null;
                const isLast = i === problematic.length - 1;
                const bColor = scoreColor(displayScore);

                return (
                  <div key={b.name} style={{
                    background: T.white,
                    border: `0.5px solid ${T.border}`,
                    borderTop: "none",
                    borderLeft: `5px solid ${bColor}`,
                  }}>
                    <div style={{ padding: "18px 16px 14px", cursor: "pointer" }} onClick={() => onSelect(b)}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: F.serif, fontSize: 28, fontWeight: 900, color: T.ink, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>
                            {b.name}
                          </div>
                          <div style={{ fontFamily: F.display, fontSize: 13, letterSpacing: "0.14em", color: bColor }}>
                            {issueLabel.toUpperCase()}
                          </div>
                        </div>
                        <ScoreBadge score={displayScore} size="lg" />
                      </div>

                      <ScoreBar score={displayScore} />

                      <div style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.65, marginBottom: 12, fontFamily: F.sans }}>
                        {issueExplanation}
                      </div>

                      <div style={{ borderLeft: `3px solid ${T.borderLight}`, paddingLeft: 12, marginBottom: altName ? 16 : 0 }}>
                        <div style={{ fontFamily: F.display, fontSize: 11, letterSpacing: "0.14em", color: T.inkFaint, marginBottom: 3 }}>
                          {lang === "it" ? "IL TUO IMPATTO" : "YOUR IMPACT"}
                        </div>
                        <div style={{ fontSize: 13, color: T.inkLight, lineHeight: 1.6, fontFamily: F.sans }}>
                          {impactCopy}
                        </div>
                      </div>

                      {altName && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.greenBg, borderLeft: `4px solid ${T.green}`, marginBottom: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: F.display, fontSize: 12, letterSpacing: "0.14em", color: T.green, marginBottom: 3 }}>
                                {lang === "it" ? "ALTERNATIVA MIGLIORE" : "BETTER ALTERNATIVE"}
                              </div>
                              <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 900, color: T.ink, lineHeight: 1 }}>
                                {altName}
                              </div>
                              {advantageCopy && (
                                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 4, fontStyle: "italic", fontFamily: F.sans }}>
                                  {advantageCopy}
                                </div>
                              )}
                            </div>
                            {getAlternativeScore(topAlt) && (
                              <div style={{ fontFamily: F.display, fontSize: 42, color: T.green, lineHeight: 1 }}>
                                {getAlternativeScore(topAlt)}
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            {altDelta !== null && (
                              <span style={{ fontFamily: F.display, fontSize: 14, color: T.green, border: `1.5px solid ${T.green}`, padding: "4px 10px", letterSpacing: "0.06em" }}>
                                +{altDelta} {lang === "it" ? "PUNTI" : "PTS"}
                              </span>
                            )}
                            {replaceBrand && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onReplace(b, replaceBrand); }}
                                style={{ background: T.ink, color: "#F0EDE4", border: "none", padding: "11px 18px", fontFamily: F.display, fontSize: 16, letterSpacing: "0.1em", cursor: "pointer", whiteSpace: "nowrap" }}
                              >
                                {lang === "it" ? `SOSTITUISCI CON ${replaceBrand.name.toUpperCase()}` : `REPLACE WITH ${replaceBrand.name.toUpperCase()}`} →
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); onSelect(b); }}
                              style={{ background: "transparent", color: T.inkLight, border: `0.5px solid ${T.border}`, padding: "10px 12px", fontFamily: F.sans, fontSize: 12, cursor: "pointer" }}
                            >
                              {lang === "it" ? "Dettagli →" : "Details →"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 14px 12px" }}>
                      <RemoveBtn onClick={(e) => { e.stopPropagation(); onRemove(b.name); }} name={b.name} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* NOT ENOUGH EVIDENCE */}
          <div>
            <SectionHeader label={lang === "it" ? "Evidenza limitata" : "Not enough evidence"} count={insufficient.length} variant="dark" />
            {insufficient.length === 0 ? (
              <div style={{ background: T.white, border: `0.5px solid ${T.border}`, borderTop: "none", padding: "14px 16px", fontSize: 13, color: T.inkLight, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Tutti i brand hanno abbastanza elementi per una valutazione." : "All tracked brands have enough evidence for an assessment."}
              </div>
            ) : (
              insufficient.map((b) => (
                <div key={b.name} onClick={() => onSelect(b)} style={{ background: T.white, border: `0.5px dashed ${T.border}`, borderTop: "none", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: F.serif, fontSize: 22, fontWeight: 700, color: T.inkLight, marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, fontStyle: "italic", fontFamily: F.sans, lineHeight: 1.5 }}>
                      {lang === "it" ? "Non ci sono ancora abbastanza fonti pubbliche per valutarlo." : "Not enough public evidence yet to assess this brand."}
                    </div>
                  </div>
                  <div style={{ fontFamily: F.display, fontSize: 12, color: T.inkFaint, border: `0.5px dashed ${T.border}`, padding: "3px 10px", letterSpacing: "0.1em", flexShrink: 0 }}>
                    NO DATA
                  </div>
                  <RemoveBtn onClick={(e) => { e.stopPropagation(); onRemove(b.name); }} name={b.name} />
                </div>
              ))
            )}
          </div>

          {/* STRONGER BRANDS */}
          <div>
            <SectionHeader label={lang === "it" ? "Brand solidi" : "Stronger brands"} count={positive.length} variant="green" />
            {positive.length === 0 ? (
              <div style={{ background: T.white, border: `0.5px solid ${T.border}`, borderTop: "none", padding: "14px 16px", fontSize: 13, color: T.inkLight, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Nessun brand positivo ancora." : "No positive brands yet."}
              </div>
            ) : (
              positive.map((b) => {
                const ds = getDisplayScore(b);
                return (
                  <div key={b.name} onClick={() => onSelect(b)} style={{ background: T.greenBg, border: `0.5px solid ${T.border}`, borderTop: "none", padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ color: T.green, fontFamily: F.display, fontSize: 18 }}>✓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F.serif, fontSize: 20, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: T.inkLight, fontFamily: F.sans, marginTop: 1 }}>{getDisplayLabel(b, lang)}</div>
                    </div>
                    <ScoreBadge score={ds} size="md" />
                    <RemoveBtn onClick={(e) => { e.stopPropagation(); onRemove(b.name); }} name={b.name} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ══ EMPTY STATE ═══════════════════════════════════════════════════════ */}
      {isEmpty && (
        <div style={{ padding: "4px 0 20px" }}>
          <div style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 900, color: T.ink, lineHeight: 1.3, marginBottom: 10 }}>
            {lang === "it" ? "Inizia dai brand che usi davvero ogni settimana." : "Start with the brands you actually use every week."}
          </div>
          <div style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.7, marginBottom: 6, fontFamily: F.sans }}>
            {lang === "it" ? "Ti mostreremo il loro giudizio etico, cosa non va quando emergono criticità, e alternative migliori quando servono." : "We'll show their ethical standing, what's problematic when issues emerge, and better alternatives when needed."}
          </div>
          <div style={{ fontSize: 12, color: T.inkLight, lineHeight: 1.5, fontFamily: F.sans }}>
            {lang === "it" ? "Dopo averli aggiunti, puoi cliccare su ogni brand per vedere fonti, note e dettagli del punteggio." : "Once added, click any brand to see sources, notes, and scoring details."}
          </div>
        </div>
      )}

      {/* ══ ADD BRANDS ════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: F.display, fontSize: 28, letterSpacing: "0.08em", color: T.ink, marginBottom: 6 }}>
          {lang === "it" ? "Aggiungi brand che usi" : "Add brands you use"}
        </div>
        <div style={{ fontSize: 13, color: T.inkLight, marginBottom: 14, fontFamily: F.sans }}>
          {lang === "it" ? "Inizia da 3–5 brand che usi davvero." : "Start with 3–5 brands you actually use."}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.white, border: `1px solid ${T.border}`, padding: "11px 14px", marginBottom: 10 }}>
          <input
            value={localQuery}
            onChange={(e) => { setLocalQuery(e.target.value); if (activeHintKey) setActiveHintKey(null); }}
            placeholder={lang === "it" ? "Cerca un brand..." : "Search a brand..."}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.ink, fontSize: 14, fontFamily: F.sans }}
          />
          {(localQuery || activeHintKey) && (
            <button onClick={() => { setLocalQuery(""); setActiveHintKey(null); }} style={{ background: "none", border: "none", color: T.inkFaint, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
          )}
        </div>

        <div style={{ fontSize: 11, color: T.inkLight, marginBottom: 8, fontFamily: F.sans }}>{lang === "it" ? "Per iniziare, prova da qui:" : "A good place to start:"}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: shouldShowResults ? 12 : 0 }}>
          {hints.map((hint) => {
            const isActive = hint.key === activeHintKey;
            return (
              <button key={hint.key} onClick={() => { setActiveHintKey(isActive ? null : hint.key); setLocalQuery(""); }} style={{
                background: isActive ? T.ink : T.white,
                border: `0.5px solid ${isActive ? T.ink : T.border}`,
                color: isActive ? "#F0EDE4" : T.inkMid,
                padding: "7px 14px", cursor: "pointer",
                fontFamily: F.display, fontSize: 14, letterSpacing: "0.08em",
              }}>
                {hint.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {shouldShowResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {addResults.length === 0 ? (
              <div style={{ color: T.inkLight, fontSize: 13, fontStyle: "italic", fontFamily: F.sans }}>
                {lang === "it" ? "Nessun brand trovato." : "No brands found."}
              </div>
            ) : (
              addResults.map((brand) => {
                const ds = getDisplayScore(brand);
                return (
                  <div key={brand.name} onClick={() => onSelect(brand)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "11px 14px", background: T.white, border: `0.5px solid ${T.borderLight}`, cursor: "pointer" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: F.serif, fontSize: 17, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brand.name}</div>
                      <div style={{ fontSize: 11, color: T.inkLight, fontFamily: F.sans }}>{brand.sector || getDisplayLabel(brand, lang)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <ScoreBadge score={ds} size="sm" />
                      <button
                        onClick={(e) => { e.stopPropagation(); onAdd(brand); setLocalQuery(""); setActiveHintKey(null); }}
                        style={{ background: T.ink, color: "#F0EDE4", border: "none", padding: "8px 14px", fontFamily: F.display, fontSize: 15, letterSpacing: "0.08em", cursor: "pointer", whiteSpace: "nowrap" }}
                      >
                        {lang === "it" ? "+ AGGIUNGI" : "+ ADD"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
