# EthicPrint — Methodology

This document explains how scores are calculated, which sources are accepted, and how the system works. Transparency on methodology is not optional — it is the foundation of the project's credibility.

---

## The four dimensions

Every brand is scored across four independent dimensions, each converted to a 0–100 scale.

### ⚔️ Conflicts & Arms (0–100)
Measures the brand's direct or indirect involvement in the arms industry and active conflict zones.

**Factors that lower the score:**
- Direct contracts with armed forces or defence ministries
- Export of weapons or dual-use technology to conflict zones
- Operations in countries with active armed conflicts
- Financial links to arms manufacturers
- Provision of surveillance technology to authoritarian regimes

**Factors that raise the score:**
- No documented military contracts
- Explicit policies against arms industry involvement
- Transparent reporting on government contracts

---

### 🌿 Environment & CO₂ (0–100)
Measures the brand's environmental impact and credibility of its climate commitments.

**Factors that lower the score:**
- High direct CO₂ emissions without credible reduction plan
- Operations in fossil fuel extraction or distribution
- Documented greenwashing (commitments not backed by data)
- High water consumption with no mitigation
- Lack of supply chain environmental transparency

**Factors that raise the score:**
- Verified net-zero commitments with intermediate targets
- Use of renewable energy in operations
- Certified emissions reduction (CDP A rating or equivalent)
- Circular economy initiatives and product repairability

---

### ✊ Human Rights (0–100)
Measures the brand's respect for human rights across its operations and supply chain.

**Factors that lower the score:**
- Documented labour exploitation in supply chain
- Operations or commercial agreements with authoritarian regimes
- Censorship of content under political pressure
- Anti-union practices or obstruction of worker organisation
- Use of child labour in supply chain (direct or indirect)
- Mass surveillance of users

**Factors that raise the score:**
- Verified supply chain audits
- Strong worker protection policies
- Resistance to government data requests (transparency reports)
- Fair wages across the supply chain

---

### ⚖️ Tax & Transparency (0–100)
Measures fiscal responsibility and corporate transparency.

**Factors that lower the score:**
- Use of tax havens or aggressive offshore structures
- Large gap between where profit is generated and where tax is paid
- Lack of country-by-country tax reporting
- History of tax disputes with national authorities

**Factors that raise the score:**
- Public country-by-country tax reporting
- Fair Tax Mark certification or equivalent
- Transparent ownership structure
- Tax payments proportional to revenue in each country of operation

---

## How the total score is calculated

Each brand is evaluated on **20 criteria** distributed equally across the 4 categories (5 criteria per category). The scoring system works in three steps.

### Step 1 — Raw criterion score

Each criterion receives an absolute score based on the tier of the sources supporting it. Not every source carries the same weight: sources are classified in three tiers based on their credibility and independence.

| Judgment | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Positive | +20 | +10 | +2 |
| Prevalently positive | +10 | +5 | +1 |
| Prevalently negative | −10 | −5 | −1 |
| Negative | −20 | −10 | −2 |

A criterion only contributes to the score if it meets a **minimum source threshold**:

- **T1 path** — at least 1 Tier 1 source: uses the average of all T1 sources for that criterion.
- **T2 path** — no T1 sources, at least 2 Tier 2 sources: uses the average of T2 sources.
- **T3 path** — no T1 sources, 1 T2 source + at least 3 T3 sources: uses the T2 value plus the average of T3 values (summed, capped at ±20).

If a criterion does not meet any of these thresholds, it is excluded from the calculation entirely. A score based on insufficient evidence is not a score — it is noise.

### Step 2 — Raw category score (−100 to +100)

Each of the 4 categories has 5 criteria, each worth up to ±20 points (at Tier 1). The raw category score is the **sum of all published criteria scores** within that category, and can range from −100 (all criteria strongly negative) to +100 (all criteria strongly positive).

This raw score is then converted to a **0–100 visible scale** using the following formula:

```
Visible category score = (raw + 100) / 200 × 100
```

### Step 3 — Total score (0–100)

The total visible score is the **unweighted average** of the category scores for all categories with sufficient sources:

```
Total = average of category scores (0–100)
```

All four dimensions currently carry equal weight. This is a deliberate choice — we do not believe one dimension is inherently more important than another. This may be revisited as the project matures, always with full public documentation of the change.

---

## Score thresholds

| Score | Meaning |
|---|---|
| 75–100 | Deeply Ethical |
| 55–74 | Fairly Ethical |
| 45–54 | Partially Ethical |
| 25–44 | Scarcely Ethical |
| 0–24 | Ethically Compromised |

Brands scoring below **50** trigger alternative suggestions in the personal EthicPrint panel.

---

## The source tier system

Not all sources carry the same weight. Every source used in EthicPrint is classified into one of three tiers before it can influence a brand's score.

**Tier 1 — Primary sources**
International NGOs, investigative media, and recognised research institutes. These are the gold standard: independent, methodologically rigorous, with an established track record of accountability journalism or research. Examples: Amnesty International, Human Rights Watch, SIPRI, CDP, KnowTheChain, investigative outlets such as ICIJ.

**Tier 2 — Verified sources**
National media, official government data, institutional and certified reports. These are credible and generally reliable, but may carry national biases or institutional constraints. Examples: regulatory decisions, court rulings, corporate sustainability reports (read critically), Fair Tax Mark certifications.

**Tier 3 — Supporting sources**
Blogs and secondary publications. Valid only as supporting evidence alongside higher-tier sources — never as the sole basis for a score. Evaluated case-by-case, with no fixed whitelist.

**Not accepted as sole sources:**
- Anonymous claims or unverified social media posts
- Press releases from the brand itself (can be used as context, not as proof)
- Sources from organisations with documented conflicts of interest

### Human review of every source

AI automatically finds sources and proposes an ethical judgment for each one. A human editor then reviews every proposal before it affects any brand score — approving, rejecting, or correcting the AI suggestion. No automated score change reaches the published data without this review step.

---

## Limitations and honest caveats

EthicPrint does not claim to have the definitive truth on any brand. Scores reflect the best available public information at a given point in time. We acknowledge the following limitations:

- **Information asymmetry.** Companies, especially large ones, do not disclose everything. The absence of negative information is not proof of ethical behaviour.
- **Complexity of supply chains.** Tracing full responsibility across multi-level supply chains is genuinely difficult. Scores reflect what is documentable, not the full picture.
- **Scores can be outdated.** A company can improve or worsen its practices. Every score carries a last-updated date and should be reviewed periodically.
- **Subjectivity in weighting.** Deciding how much weight to give each dimension involves value judgements. We have made ours explicit and open to discussion.

If you believe a score is wrong or outdated, please open an issue with sources. We will review it.

---

## Version history

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026 | New scoring system: tier-weighted criteria, raw score (−100/+100) normalized to 0–100, 5 score bands |

*Every change to this document is tracked in the Git history.*
