# Contributing to EthicScore

First of all — thank you. EthicScore only works if people who care contribute to making it more accurate, more complete, and more honest. Every contribution matters.

This document explains how to contribute, what is expected, and how decisions are made.

---

## Two types of contribution

### 1. Contributions to the data (brand scores)
Proposing a new brand, correcting an existing score, or adding sources.

### 2. Contributions to the code
Improving the interface, fixing bugs, adding features.

Both go through **GitHub Pull Requests**. No change enters the project without review and explicit approval.

---

## Contributing to the data

This is the most important type of contribution — and the one with the strictest rules, because accuracy is the project's credibility.

### Rules for data contributions

**Every score change or new brand must include at least two verified sources.**

A verified source is:
- A report from a recognised NGO (Amnesty International, Human Rights Watch, Oxfam, Greenpeace, etc.)
- Investigative journalism from an established outlet
- A regulatory decision, court ruling, or official document
- A specialised database entry (SIPRI, CDP, KnowTheChain, Fair Tax Mark)
- An academic study

**Not accepted as sole sources:**
- Anonymous claims or unverified social media posts
- Press releases from the brand being scored
- Sources from organisations with a documented conflict of interest

### How to propose a new brand

1. Fork the repository
2. Edit `data/brands.json`
3. Add the new brand following the existing structure exactly
4. In the Pull Request description, fill in the template (see below)
5. Submit the Pull Request

**Pull Request template for new brands:**

```
## New brand: [Brand Name]

**Parent company:** 
**Sector:** 
**Category:** 

### Proposed scores
- Arms & Conflicts: XX/100
- Environment & CO₂: XX/100
- Human Rights: XX/100
- Tax & Transparency: XX/100

### Sources
- Arms: [URL] — [brief description]
- Environment: [URL] — [brief description]
- Human Rights: [URL] — [brief description]
- Tax: [URL] — [brief description]

### Notes (shown to users)
- Arms note: 
- Environment note: 
- Human Rights note: 
- Tax note: 

### Suggested alternatives (if score < 50)
- 
```

### How to correct an existing score

1. Fork the repository
2. Edit `data/brands.json`
3. In the Pull Request description, explain:
   - What you are changing and why
   - What the current score gets wrong
   - Your sources (minimum two)
4. Submit the Pull Request

**Pull Requests without sources will be closed without review.**

---

## Contributing to the code

If you want to improve the interface, fix a bug, or add a feature:

1. Open an **Issue** first describing what you want to do — this avoids duplicate work
2. Wait for feedback before starting to code
3. Fork the repository and create a branch with a descriptive name (e.g. `feature/sector-filter` or `fix/search-dropdown`)
4. Make your changes
5. Submit a Pull Request referencing the original Issue

### Code standards
- Keep components small and single-purpose
- Comment non-obvious logic
- Do not introduce new dependencies without discussion
- Test your changes in at least one browser before submitting

---

## Review process

All Pull Requests are reviewed by Marco Viglianti (project maintainer).

**For data contributions:**
- Sources are verified independently
- Scores are checked against the methodology in `METHODOLOGY.md`
- Feedback is given within 7 days
- If a contribution is rejected, a reason is always provided

**For code contributions:**
- Code is reviewed for quality and consistency
- Large changes may require discussion before being accepted
- Feedback is given within 14 days

---

## What will be rejected

To be completely transparent, these are the types of contributions that will always be rejected:

- Score changes without verified sources
- Changes that appear to be motivated by commercial interests (improving a brand's score without evidence)
- Code that introduces tracking, ads, or monetisation of any kind
- Changes that contradict the principles in `README.md`
- Contributions from accounts with no history that propose significant score improvements for specific brands

If you believe a rejection was unfair, open an Issue to discuss it publicly.

---

## A note on pressure from companies

EthicScore has no commercial relationships with any brand. If a company contacts you asking you to improve their score through a contribution, please report it by opening an Issue. Transparency is the only protection this project has.

---

## Code of Conduct

This project follows a simple principle: **good faith and honesty**.

Contributions made in good faith, even if imperfect, are always welcome. Contributions made to manipulate data or undermine the project's integrity are not.

---

## Questions?

Open an Issue or contact Marco Viglianti directly via GitHub.

*Thank you for helping make this project more useful and more honest.*
