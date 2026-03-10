import { useState, useEffect, useRef } from "react";

const DB = [
  {
    name: "Amazon",
    sector: "E-commerce",
    category: "E-commerce / Cloud",
    logo: "A",
    parent: "Amazon Inc.",
    scores: { armi: 55, ambiente: 38, diritti: 32, fisco: 20 },
    notes: {
      armi: "Contratti con Pentagono e forze armate USA (Project Nimbus, JEDI)",
      ambiente: "Obiettivo net-zero 2040, ma emissioni in crescita con espansione logistica",
      diritti: "Denunce diffuse per condizioni nei magazzini, sindacalizzazione ostacolata",
      fisco: "Strutture in Lussemburgo, pagamenti fiscali minimi in EU"
    },
    alternatives: ["Etsy", "eBay (usato)", "negozi locali indipendenti"]
  },
  {
    name: "Google",
    sector: "Tech & Advertising",
    category: "Tech / Advertising",
    logo: "G",
    parent: "Alphabet Inc.",
    scores: { armi: 48, ambiente: 62, diritti: 45, fisco: 22 },
    notes: {
      armi: "Project Maven (droni militari), contratti DoD nonostante proteste interne",
      ambiente: "100% rinnovabili dal 2017, ma crescita datacenter ad alto impatto idrico",
      diritti: "Censura in Cina (Dragonfly), licenziamenti attivisti interni",
      fisco: "Double Irish, strutture offshore, sede EU in Irlanda"
    },
    alternatives: ["DuckDuckGo (ricerca)", "Brave Search", "ProtonMail (email)", "Nextcloud (storage)"]
  },
  {
    name: "Meta",
    sector: "Social Media",
    category: "Social Media",
    logo: "M",
    parent: "Meta Platforms Inc.",
    scores: { armi: 70, ambiente: 55, diritti: 28, fisco: 30 },
    notes: {
      armi: "Nessun contratto militare diretto noto",
      ambiente: "Net-zero claims, ma impronta carbonio datacenter significativa",
      diritti: "Ruolo documentato in violenza Myanmar, profilazione massiva, dipendenza psicologica minori",
      fisco: "Sede irlandese per ottimizzazione fiscale EU"
    },
    alternatives: ["Mastodon (social)", "Signal (messaggistica)", "Pixelfed (foto)"]
  },
  {
    name: "TikTok",
    sector: "Social Media",
    category: "Social Media",
    logo: "T",
    parent: "ByteDance Ltd.",
    scores: { armi: 45, ambiente: 40, diritti: 22, fisco: 35 },
    notes: {
      armi: "Casa madre cinese con obblighi verso governo PRC, potenziale dual-use dati",
      ambiente: "Datacenter ad alta intensità energetica, poca trasparenza",
      diritti: "Censura sistematica contenuti pro-Tibet, Xinjiang, Hong Kong; raccolta dati massiva su minori",
      fisco: "Struttura con sede Cayman Islands, ottimizzazione aggressiva"
    },
    alternatives: ["Mastodon", "YouTube (relativamente migliore)", "PeerTube (open source)"]
  },
  {
    name: "Netflix",
    sector: "Streaming Video",
    category: "Streaming",
    logo: "N",
    parent: "Netflix Inc.",
    scores: { armi: 82, ambiente: 60, diritti: 68, fisco: 45 },
    notes: {
      armi: "Nessun coinvolgimento diretto nell'industria degli armamenti",
      ambiente: "Impegni net-zero, produzioni cinematografiche con impatto residuo",
      diritti: "Politiche lavoro relativamente buone, contenuti diversificati",
      fisco: "Strutture in Olanda per riduzione fiscale EU"
    },
    alternatives: []
  },
  {
    name: "Disney+",
    sector: "Streaming Video",
    category: "Streaming",
    logo: "D",
    parent: "The Walt Disney Company",
    scores: { armi: 55, ambiente: 52, diritti: 45, fisco: 38 },
    notes: {
      armi: "Casa madre con partecipazioni in media legata a difesa USA",
      ambiente: "Impegni verdi dichiarati, parchi tematici ad alto consumo energetico",
      diritti: "Autocensura su temi LGBTQ+ in paesi con leggi repressive per motivi commerciali",
      fisco: "Strutture offshore, ottimizzazione fiscale aggressiva documentata"
    },
    alternatives: ["Netflix", "MUBI (cinema d'autore)", "RaiPlay (gratuito)"]
  },
  {
    name: "Spotify",
    sector: "Streaming Audio",
    category: "Streaming Audio",
    logo: "S",
    parent: "Spotify AB",
    scores: { armi: 85, ambiente: 65, diritti: 55, fisco: 50 },
    notes: {
      armi: "Nessun coinvolgimento con industria militare",
      ambiente: "Carbon neutral dal 2021, supply chain ancora da migliorare",
      diritti: "Royalties basse agli artisti, ma no scandali gravi su diritti umani",
      fisco: "Sede in Svezia, struttura fiscale relativamente trasparente"
    },
    alternatives: []
  },
  {
    name: "Apple",
    sector: "Tech & Hardware",
    category: "Tech / Hardware",
    logo: "A",
    parent: "Apple Inc.",
    scores: { armi: 60, ambiente: 70, diritti: 40, fisco: 25 },
    notes: {
      armi: "Contratti limitati con settore difesa, principalmente software",
      ambiente: "Obiettivo carbon neutral 2030, riciclaggio materiali in crescita",
      diritti: "Supply chain Foxconn con condizioni documentate di sfruttamento, censura in Cina",
      fisco: "Caso storico evasione Ireland, 13 miliardi recuperati da EU"
    },
    alternatives: ["Fairphone (smartphone etico)", "Framework (laptop riparabile)"]
  },
  {
    name: "Microsoft",
    sector: "Tech & Hardware",
    category: "Tech / Cloud",
    logo: "M",
    parent: "Microsoft Corp.",
    scores: { armi: 35, ambiente: 60, diritti: 55, fisco: 35 },
    notes: {
      armi: "Contratto IVAS con US Army per visori AR militari (480M$), Azure Government DoD",
      ambiente: "Carbon negative entro 2030, investimenti significativi in rinnovabili",
      diritti: "Migliorata su diversità, ma contratti con governi autoritari",
      fisco: "Strutture in Irlanda e Puerto Rico per ottimizzazione"
    },
    alternatives: ["LibreOffice (suite office)", "Linux (OS)", "Nextcloud (cloud)"]
  },
  {
    name: "Enel",
    sector: "Energia",
    category: "Energia",
    logo: "E",
    parent: "Enel SpA",
    scores: { armi: 75, ambiente: 52, diritti: 65, fisco: 70 },
    notes: {
      armi: "Nessun coinvolgimento diretto",
      ambiente: "Piano di transizione energetica avviato, ancora forte dipendenza da fossili",
      diritti: "Controversie in America Latina per impatti su comunità locali (dighe)",
      fisco: "Società italiana quotata, fiscalità relativamente trasparente"
    },
    alternatives: ["Plenitude", "Illumia", "Dolomiti Energia (100% rinnovabile)"]
  },
  {
    name: "Eni",
    sector: "Energia",
    category: "Energia / Petrolio",
    logo: "E",
    parent: "Eni SpA",
    scores: { armi: 40, ambiente: 22, diritti: 35, fisco: 55 },
    notes: {
      armi: "Operazioni in paesi con conflitti attivi (Congo, Nigeria, Libia)",
      ambiente: "Tra i maggiori emettitori italiani, transizione lenta",
      diritti: "Denunce per impatto su comunità in Nigeria e Congo, cause pendenti",
      fisco: "Struttura multinazionale con sussidiarie in paesi a bassa tassazione"
    },
    alternatives: ["Dolomiti Energia", "Iren Mercato", "Enercoop (cooperativa)"]
  },
  {
    name: "TIM",
    sector: "Telecomunicazioni",
    category: "Telecomunicazioni",
    logo: "T",
    parent: "Telecom Italia SpA",
    scores: { armi: 65, ambiente: 58, diritti: 62, fisco: 72 },
    notes: {
      armi: "Forniture infrastrutture a difesa nazionale, non export bellico",
      ambiente: "Piano green avviato, datacenter con consumo energetico elevato",
      diritti: "Ristrutturazioni con impatti occupazionali, nessun caso grave noto",
      fisco: "Società italiana, fiscalità prevalentemente nazionale"
    },
    alternatives: ["Fastweb", "CoopVoce (Coop)"]
  },
  {
    name: "Vodafone",
    sector: "Telecomunicazioni",
    category: "Telecomunicazioni",
    logo: "V",
    parent: "Vodafone Group Plc",
    scores: { armi: 62, ambiente: 55, diritti: 58, fisco: 38 },
    notes: {
      armi: "Contratti con governi per intercettazioni, ceduto dati in paesi autoritari",
      ambiente: "Target net-zero 2040, transizione in corso",
      diritti: "Cooperazione con regimi autoritari per sorveglianza utenti (Egitto, Turchia)",
      fisco: "Struttura UK con ottimizzazioni fiscali aggressive documentate"
    },
    alternatives: ["Fastweb", "CoopVoce (Coop)"]
  },
  {
    name: "Fastweb",
    sector: "Telecomunicazioni",
    category: "Telecomunicazioni",
    logo: "F",
    parent: "Swisscom AG",
    scores: { armi: 78, ambiente: 68, diritti: 72, fisco: 65 },
    notes: {
      armi: "Nessun coinvolgimento militare diretto noto",
      ambiente: "Impegni clima della casa madre svizzera, buone pratiche energetiche",
      diritti: "Nessun caso grave documentato, sede in paese con forti tutele",
      fisco: "Controllata svizzera, fiscalità mediamente trasparente"
    },
    alternatives: []
  },
  {
    name: "Leonardo",
    sector: "Difesa",
    category: "Difesa / Aerospazio",
    logo: "L",
    parent: "Leonardo SpA",
    scores: { armi: 5, ambiente: 35, diritti: 38, fisco: 60 },
    notes: {
      armi: "Principale produttore di armi italiano, export verso zone di conflitto (Arabia Saudita, Yemen)",
      ambiente: "Settore aerospazio ad alto impatto, limitati impegni verdi",
      diritti: "Export verso paesi con violazioni documentate dei diritti umani",
      fisco: "Società italiana quotata, parzialmente pubblica"
    },
    alternatives: ["Non esiste alternativa diretta — valuta se il tuo rapporto con questa azienda è necessario"]
  },
  {
    name: "Airbnb",
    sector: "Travel & Hospitality",
    category: "Travel / Platform",
    logo: "A",
    parent: "Airbnb Inc.",
    scores: { armi: 80, ambiente: 50, diritti: 55, fisco: 42 },
    notes: {
      armi: "Nessun coinvolgimento militare",
      ambiente: "Impatto turismo difficile da misurare, iniziative verdi limitate",
      diritti: "Operazioni in insediamenti israeliani in Cisgiordania (poi rimosse dopo pressioni)",
      fisco: "Strutture irlandesi per ottimizzazione EU"
    },
    alternatives: ["Fairbnb.coop (cooperativa)", "Booking.com (comparabile)", "hotel locali indipendenti"]
  },
  {
    name: "Volkswagen",
    sector: "Automotive",
    category: "Automotive",
    logo: "V",
    parent: "Volkswagen AG",
    scores: { armi: 45, ambiente: 35, diritti: 42, fisco: 50 },
    notes: {
      armi: "Legami storici con industria militare tedesca, forniture veicoli a forze armate",
      ambiente: "Dieselgate: frode sistematica sulle emissioni, transizione EV in corso",
      diritti: "Forniture da miniere cobalto Congo, supply chain problematica",
      fisco: "Struttura multinazionale con ottimizzazioni fiscali"
    },
    alternatives: ["Peugeot (punteggio migliore)", "bicicletta / trasporto pubblico", "Citroën"]
  },
  {
    name: "Intesa Sanpaolo",
    sector: "Banche & Finanza",
    category: "Banca",
    logo: "I",
    parent: "Intesa Sanpaolo SpA",
    scores: { armi: 42, ambiente: 48, diritti: 60, fisco: 65 },
    notes: {
      armi: "Finanziamenti documentati a produttori di armi controverse (bombe a grappolo)",
      ambiente: "Piano ESG avviato, ma ancora forti esposizioni a fossili",
      diritti: "Banca italiana, standard lavoro buoni internamente",
      fisco: "Società italiana quotata, fiscalità prevalentemente nazionale"
    },
    alternatives: ["Banca Etica (100% etica)", "Crédit Cooperatif", "banche cooperative locali"]
  },
  {
    name: "Banca Etica",
    sector: "Banche & Finanza",
    category: "Banca",
    logo: "B",
    parent: "Banca Popolare Etica",
    scores: { armi: 98, ambiente: 90, diritti: 95, fisco: 92 },
    notes: {
      armi: "Statuto vieta esplicitamente finanziamenti a industria bellica",
      ambiente: "100% finanza etica, solo progetti a impatto positivo",
      diritti: "Missione sociale esplicita, trasparenza totale su impieghi",
      fisco: "Cooperativa italiana, massima trasparenza fiscale"
    },
    alternatives: []
  },
];

const SECTORS = [...new Set(DB.map(b => b.sector))].sort();

const CATEGORIES = [
  { key: "armi", label: "Conflitti & Armi", icon: "⚔️", color: "#ef4444" },
  { key: "ambiente", label: "Ambiente & CO₂", icon: "🌿", color: "#22c55e" },
  { key: "diritti", label: "Diritti Umani", icon: "✊", color: "#f59e0b" },
  { key: "fisco", label: "Fisco & Trasparenza", icon: "⚖️", color: "#3b82f6" },
];

const THRESHOLD = 50;

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

function getVerdict(score) {
  if (score >= 75) return { label: "Abbastanza etico", emoji: "🟢" };
  if (score >= 55) return { label: "Migliorabile", emoji: "🟡" };
  if (score >= 35) return { label: "Problematico", emoji: "🟠" };
  return { label: "Fortemente sconsigliato", emoji: "🔴" };
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ background: "#1a1a2e", borderRadius: 99, height: 6, width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function RadarChart({ scores }) {
  const size = 140; const cx = size / 2, cy = size / 2, r = 52;
  const keys = ["armi", "ambiente", "diritti", "fisco"];
  const labels = ["Armi", "Ambiente", "Diritti", "Fisco"];
  const angles = keys.map((_, i) => (i * 2 * Math.PI) / keys.length - Math.PI / 2);
  const points = keys.map((k, i) => { const val = scores[k] / 100; return [cx + r * val * Math.cos(angles[i]), cy + r * val * Math.sin(angles[i])]; });
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

function BrandCard({ brand, onClose }) {
  const total = getScore(brand); const verdict = getVerdict(total); const color = getColor(total);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 32, maxWidth: 520, width: "100%", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4, letterSpacing: 2, textTransform: "uppercase" }}>{brand.sector} · {brand.category}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>{brand.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Casa madre: {brand.parent}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/100</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{verdict.emoji} {verdict.label}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 28, alignItems: "center" }}>
          <RadarChart scores={brand.scores} />
          <div style={{ flex: 1 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{cat.icon} {cat.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getColor(brand.scores[cat.key]) }}>{brand.scores[cat.key]}</span>
                </div>
                <ScoreBar value={brand.scores[cat.key]} color={getColor(brand.scores[cat.key])} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Note & Fonti</div>
          {CATEGORIES.map(cat => (
            <div key={cat.key} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: cat.color }}>{cat.icon} </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{brand.notes[cat.key]}</span>
            </div>
          ))}
        </div>
        {brand.alternatives && brand.alternatives.length > 0 && (
          <div style={{ marginTop: 20, background: "rgba(99,202,183,0.06)", border: "1px solid rgba(99,202,183,0.15)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#63cab7", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>✦ Alternative più etiche</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {brand.alternatives.map(alt => (
                <span key={alt} style={{ fontSize: 12, background: "rgba(99,202,183,0.1)", border: "1px solid rgba(99,202,183,0.2)", borderRadius: 99, padding: "4px 12px", color: "rgba(255,255,255,0.7)" }}>{alt}</span>
              ))}
            </div>
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>Chiudi</button>
      </div>
    </div>
  );
}

function MyListPanel({ myBrands, onRemove, onClear, onSelect }) {
  if (myBrands.length === 0) return null;
  const avgScores = { armi: 0, ambiente: 0, diritti: 0, fisco: 0 };
  myBrands.forEach(b => { Object.keys(avgScores).forEach(k => avgScores[k] += b.scores[k]); });
  Object.keys(avgScores).forEach(k => avgScores[k] = Math.round(avgScores[k] / myBrands.length));
  const total = Math.round(Object.values(avgScores).reduce((a, b) => a + b, 0) / 4);
  const verdict = getVerdict(total); const color = getColor(total);
  const problematic = myBrands.filter(b => getScore(b) < THRESHOLD && b.alternatives && b.alternatives.length > 0);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24, marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>La tua impronta etica</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
            {verdict.emoji} Score aggregato: <span style={{ color }}>{total}/100</span>
          </div>
        </div>
        <button onClick={onClear} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>Svuota lista</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {CATEGORIES.map(cat => (
          <div key={cat.key} style={{ flex: "1 1 120px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{cat.icon} {cat.label}</div>
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
          <div style={{ fontSize: 11, color: "#f87171", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>⚠️ Alternative consigliate</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {problematic.map(b => (
              <div key={b.name} style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: getColor(getScore(b)) }}>{b.name}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>score {getScore(b)}/100</span>
                  <span style={{ fontSize: 11, background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 8px", borderRadius: 99 }}>sotto soglia</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>Considera di sostituirlo con:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {b.alternatives.map(alt => (
                    <span key={alt} style={{ fontSize: 12, background: "rgba(99,202,183,0.08)", border: "1px solid rgba(99,202,183,0.2)", borderRadius: 99, padding: "4px 12px", color: "#63cab7" }}>{alt}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectorSection({ sector, brands, myBrands, onAdd, onSelect }) {
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
            {expanded ? "Meno" : `+${brands.length - 4} altri`}
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
                {CATEGORIES.map(cat => <div key={cat.key} title={cat.label} style={{ width: 5, height: 5, borderRadius: 99, background: getColor(brand.scores[cat.key]) }} />)}
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [myBrands, setMyBrands] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(DB.filter(b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.sector.toLowerCase().includes(q)));
  }, [query]);

  const addToList = (brand) => {
    if (!myBrands.find(b => b.name === brand.name)) setMyBrands(prev => [...prev, brand]);
    setQuery(""); setResults([]);
  };

  const brandsBySector = SECTORS.map(sector => ({ sector, brands: DB.filter(b => b.sector === sector) }));

  return (
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#63cab7", textTransform: "uppercase", marginBottom: 16 }}>Open Source · Community Driven</div>
          <h1 style={{ fontSize: "clamp(36px, 8vw, 64px)", fontFamily: "'Playfair Display', serif", fontWeight: 800, lineHeight: 1.05, marginBottom: 16, background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.4))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EthicScore</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
            Scopri l'impatto etico dei brand che usi ogni giorno.<br />
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 14 }}>Armi · Ambiente · Diritti · Fisco</span>
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", transition: "border-color 0.2s", boxShadow: query ? "0 0 0 2px rgba(99,202,183,0.15)" : "none" }}>
            <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca brand, piattaforma, fornitore..." style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 16, fontFamily: "'DM Sans', sans-serif" }} />
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
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{brand.sector} · {brand.category}</div>
                    </div>
                    <div style={{ textAlign: "right", marginRight: 8 }} onClick={() => setSelected(brand)}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: getColor(score) }}>{score}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>/ 100</div>
                    </div>
                    <button className="add-btn" onClick={() => addToList(brand)} style={{ background: inList ? "rgba(99,202,183,0.1)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: inList ? "#63cab7" : "rgba(255,255,255,0.5)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}>{inList ? "✓ Aggiunto" : "+ Lista"}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 40, paddingLeft: 4 }}>
          {DB.length} brand nel database · {SECTORS.length} settori · open source · dati aggiornati dalla community
        </div>

        {/* My list */}
        <MyListPanel myBrands={myBrands} onRemove={(name) => setMyBrands(prev => prev.filter(b => b.name !== name))} onClear={() => setMyBrands([])} onSelect={setSelected} />

        {/* Sectors */}
        <div style={{ marginTop: 52 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 32 }}>Classifica per settore</div>
          {brandsBySector.map(({ sector, brands }) => (
            <SectorSection key={sector} sector={sector} brands={brands} myBrands={myBrands} onAdd={addToList} onSelect={setSelected} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 64, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 32 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.8 }}>
            EthicScore è un progetto open source e no-profit.<br />
            I dati sono raccolti da SIPRI, CDP, KnowTheChain, Oxfam, Ethical Consumer.<br />
            <span style={{ color: "rgba(99,202,183,0.5)" }}>Contribuisci su GitHub · Segnala un errore · Aggiungi un brand</span>
          </div>
        </div>
      </div>

      {selected && <BrandCard brand={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
