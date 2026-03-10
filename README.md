# EthicScore

**Discover the ethical impact of the brands you use every day.**

---

## Why this exists

After watching the film *The Voice of Hind Rajab*. After the massacre at the school in Minab. After yet more innocent victims of war.

Not just the helplessness in front of these facts — but the idea of being complicit. Of using brands out of convenience, brands that with the money earned from my convenience sponsor or even directly participate in these massacres.

That's why I decided to try to do something. Not to change the world. But at least to change my world.

— *Marco Viglianti, 2025*

---

## What is EthicScore

EthicScore is a free, open source, community-driven tool that lets you measure the ethical impact of the brands, platforms, and services you use every day.

For each brand, EthicScore assigns a score across four dimensions:

| Dimension | What it measures |
|---|---|
| ⚔️ Conflicts & Arms | Contracts with military, arms exports, operations in conflict zones |
| 🌿 Environment & CO₂ | Emissions, climate commitments, energy transition |
| ✊ Human Rights | Labour conditions, supply chain, operations under authoritarian regimes |
| ⚖️ Tax & Transparency | Tax avoidance, offshore structures, fiscal transparency |

You can build your personal list of brands and get an aggregated ethical score — your **EthicPrint** — along with suggestions for more ethical alternatives where your score falls below the threshold.

---

## Principles

- **No profit.** EthicScore will never be monetised. No ads, no paid placements, no sponsored scores.
- **Radical transparency.** Every score is documented with sources. Every change is public, dated and signed.
- **Community driven.** Anyone can propose new brands or corrections — but every change requires verified sources and is reviewed before being accepted.
- **Methodological honesty.** We don't claim to have the definitive truth. Scores are based on the best available public information and are updated as new information emerges.

---

## How scores are calculated

See [METHODOLOGY.md](./METHODOLOGY.md) for the full explanation of how scores are calculated, which sources are accepted, and how the weighting works.

---

## How to contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide on how to propose new brands, correct existing scores, or contribute to the codebase.

All contributions are reviewed before being merged. No change enters the project without verified sources and explicit approval.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python FastAPI |
| Database | PostgreSQL (Supabase) |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## Run locally

```bash
# Clone the repository
git clone https://github.com/markoviglianti/ethicscore.git
cd ethicscore

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Data sources

Scores are built from publicly available data including:

- [SIPRI Arms Transfers Database](https://www.sipri.org/databases/armstransfers)
- [CDP Climate Scores](https://www.cdp.net)
- [KnowTheChain](https://knowthechain.org)
- [Oxfam Tax Responsibility Ranking](https://www.oxfam.org)
- [Ethical Consumer](https://www.ethicalconsumer.org)
- Investigative journalism and verified public reports

---

## License

This project is licensed under the **MIT License** — you are free to use, copy, modify and distribute it, as long as you keep attribution and the same license.

Data (brand scores and notes) is licensed under **CC BY-SA 4.0** — you can use and share the data freely, with attribution and under the same terms.

---

## Contact

Marco Viglianti  
GitHub: [@markoviglianti](https://github.com/markoviglianti)

*If you found a factual error, have a source to share, or simply want to say something — open an issue or write directly.*
