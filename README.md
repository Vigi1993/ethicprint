# EthicPrint

**Learn the ethical impact of the brands you use.
Make better choices.**

---

## Why this exists

EthicPrint was created from a simple idea:

using a brand is not always neutral.

Many companies shape the world through supply chains, lobbying, contracts, labour practices, environmental impact, tax behaviour, and relationships with governments or military systems. Most of that information is technically public, but too fragmented and too difficult to compare.

EthicPrint exists to make that information easier to access, easier to understand, and harder to ignore.

---

## What is EthicPrint

EthicPrint is a free, open source, community-driven tool that lets you measure the ethical impact of the brands, platforms, and services you use every day.

For each brand, EthicPrint aggregates public evidence and turns it into a readable score across four core dimensions:

| ⚔️ Conflicts & Arms |
| 🌿 Environment & CO₂ |
| ✊ Human Rights |
| ⚖️ Tax & Transparency |

Users can search brands, open a detailed view with sources, build a personal list, and get more ethical alternatives when a brand falls below the threshold.

---

## Principles

- **No profit.** EthicPrint will never be monetised. No ads, no paid placements, no sponsored scores.
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
## How it works

At a high level, the project is split into two repositories:

### Frontend
This repository contains the public web app:
- React
- Vite
- brand search
- brand detail view
- personal brand list
- sector browsing
- recent source updates
- multilingual UI

### Backend
The API and data workflows live in the separate backend repository:

`ethicprint-api`

The backend is responsible for:
- serving public brand data
- serving brand detail pages and sources
- categories and metadata endpoints
- contribution workflows
- source maintenance
- scoring-related services
- scheduled jobs for source discovery and checking

---

## Repositories

- Frontend: `ethicprint`
- Backend API: `ethicprint-api`

If you are setting up the full project locally, you will usually want both repositories.

---

## Tech stack

### Frontend
- React
- Vite
- JavaScript

### Backend
- FastAPI
- Python
- Supabase / PostgreSQL

### Hosting
- Vercel for the frontend
- Railway for the backend and scheduled jobs

---

## Run locally

### 1. Clone the frontend

```bash
git clone https://github.com/Vigi1993/ethicprint.git
cd ethicprint/frontend
npm install
npm run dev
```
### 2. Clone the backend in a separate folder

```bash
git clone https://github.com/Vigi1993/ethicprint-api.git
cd ethicprint-api
pip install -r requirements.txt
uvicorn app.main:app --reload
```
### 3. Confgure enviroment variables

You will need the appropriate environment variables for:

Supabase
any API keys used by backend jobs/services
frontend API base URL

Document these in the backend and frontend env files used in your setup.

---
## Current status

EthicPrint is actively evolving.

The methodology, UX, contribution flow, and internal tooling are still being refined. The project already works as a public tool, but it should still be considered an evolving open-source system rather than a finished institutional database.

---
## License

This project is licensed under the **MIT License** — you are free to use, copy, modify and distribute it, as long as you keep attribution and the same license.

Data (brand scores and notes) is licensed under **CC BY-SA 4.0** — you can use and share the data freely, with attribution and under the same terms.

---

## Contact

Marco Viglianti  
GitHub: (https://github.com/Vigi1993)

*If you found a factual error, have a source to share, or simply want to say something — open an issue or write directly.*
