# EthicScore — Methodology

This document explains how scores are calculated, which sources are accepted, and how the system works. Transparency on methodology is not optional — it is the foundation of the project's credibility.

---

## The four dimensions

Every brand is scored across four independent dimensions, each from 0 to 100.

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

The total score is the **unweighted average** of the four dimensions:

```
Total = (Arms + Environment + Human Rights + Tax) / 4
```

All four dimensions currently have equal weight. This is a deliberate choice — we do not believe one dimension is inherently more important than another. This may be revisited as the project matures, always with full public documentation of the change.

---

## Score thresholds

| Score | Meaning |
|---|---|
| 75–100 | Reasonably ethical |
| 55–74 | Improvable |
| 35–54 | Problematic |
| 0–34 | Strongly not recommended |

Brands scoring below **50** trigger alternative suggestions in the personal EthicPrint panel.

---

## Sources

Every score must be supported by at least one verifiable public source. Accepted sources include:

- Academic research and peer-reviewed studies
- Reports from recognised NGOs (Amnesty International, Human Rights Watch, Oxfam, etc.)
- Investigative journalism from established outlets
- Official corporate sustainability reports (with critical reading)
- Regulatory decisions and court rulings
- Specialised databases: SIPRI, CDP, KnowTheChain, Fair Tax Mark

**Not accepted as sole sources:**
- Anonymous claims or unverified social media posts
- Press releases from the brand itself (can be used as context, not as proof)
- Sources from organisations with documented conflicts of interest

---

## Limitations and honest caveats

EthicScore does not claim to have the definitive truth on any brand. Scores reflect the best available public information at a given point in time. We acknowledge the following limitations:

- **Information asymmetry.** Companies, especially large ones, do not disclose everything. The absence of negative information is not proof of ethical behaviour.
- **Complexity of supply chains.** Tracing full responsibility across multi-level supply chains is genuinely difficult. Scores reflect what is documentable, not the full picture.
- **Scores can be outdated.** A company can improve or worsen its practices. Every score carries a last-updated date and should be reviewed periodically.
- **Subjectivity in weighting.** Deciding how much weight to give each dimension involves value judgements. We have made ours explicit and open to discussion.

If you believe a score is wrong or outdated, please open an issue with sources. We will review it.

---

## Version history

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2025 | Initial methodology, 4 dimensions, equal weighting |

*Every change to this document is tracked in the Git history.*
