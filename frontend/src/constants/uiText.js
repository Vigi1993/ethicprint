export const UI = {
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
    show_less: "Less",
    show_more: (n) => `+${n} more`,
    score_verdicts: ["Strongly discouraged", "Problematic", "Improvable", "Fairly ethical"],
  },
  it: {
    tagline: "Open Source · Community Driven",
    subtitle: [
      "Non sempre decidiamo le conseguenze delle nostre scelte. Ma le produciamo comunque.",
    
      "Le aziende che finanziamo ogni giorno usano quei soldi, quei dati, quel tempo per plasmare il mondo attorno a noi: guerre, ambiente, diritti, tasse.",
    
      "EthicPrint raccoglie fonti, valuta comportamenti, propone alternative.",
    
      "Non per farci sentire migliori — per renderci consapevoli.",
    
      "Perché la consapevolezza è il primo passo verso il cambiamento.",
    
      "Perché le persone sono il motore del sistema."
    ]
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
      "Ogni punteggio è supportato da fonti verificate, pesate per autorevolezza.",
    sources_banner_cta: "Vedi tutte le fonti e la metodologia →",
    loading: "Caricamento...",
    hint: "Aggiungi i brand che usi con + per scoprire la tua impronta etica personale.",
    hint_dismiss: "Capito",
    show_less: "Meno",
    show_more: (n) => `+${n} altri`,
    score_verdicts: ["Fortemente sconsigliato", "Problematico", "Migliorabile", "Abbastanza etico"],
  },
};
