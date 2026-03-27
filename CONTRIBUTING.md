
# Contributing to EthicPrint

Thank you for contributing to EthicPrint.

The project depends on people who care about accuracy, transparency, and public accountability. Contributions are welcome, but because EthicPrint makes factual claims about real companies, contributions must meet a higher standard than in a typical UI-only project.

---

## Two ways to contribute

### 1. Data contributions
You want to:
- propose a new brand
- report an error
- suggest better alternatives
- add or improve sources
- challenge an existing score or note

### 2. Code contributions
You want to:
- fix a bug
- improve the frontend
- improve the API or internal tooling
- improve performance or maintainability
- add a non-breaking feature

---

## Data contributions


The current contribution flow is based on the project interface and review process.

Use the public contribution/report flow to:
- submit a new brand
- report an error
- suggest a correction
- provide missing sources

If needed, a maintainer may later translate accepted proposals into backend/database changes.

### What to include in a data contribution

Every factual contribution should include:

- the brand name
- what should change
- why it should change
- at least two solid public sources when possible
- a short explanation of how the sources support the change

### Accepted sources

Examples of acceptable sources:

- recognised NGOs
- major investigative journalism outlets
- court decisions
- regulatory findings
- academic research
- specialised databases
- official company disclosures, only when not used as the sole source for contested claims

### Usually not accepted on their own

- anonymous claims
- unverified social posts
- screenshots without provenance
- petitions
- opinion pieces without evidence
- brand PR statements used alone for positive claims

---

## How to report a brand issue

Use the project’s public contribution/report interface when available.

A good report should answer:

- **What is wrong?**
- **What should be changed?**
- **Which sources support the change?**
- **Is this about one score, multiple scores, or the overall label?**

Examples:
- a source is outdated
- a score is too high or too low
- a note is incomplete
- a brand is missing
- an alternative is misleading
- a source link is broken

---

## How to propose a new brand

Use the contribution flow provided by the project.

Include as much of the following as possible:

- brand name
- parent company
- sector
- country or main market
- why the brand should be included
- relevant public sources
- possible ethical concerns by dimension
- possible ethical alternatives, if known

Submitting a brand does **not** guarantee inclusion. A proposal may be declined if the evidence is too weak, too incomplete, or too difficult to verify.

---

## Code contributions

For code contributions:

1. Open an issue first for larger changes
2. Fork the relevant repository
3. Create a focused branch
4. Keep the change small and reviewable
5. Open a pull request with a clear explanation

Examples of good branch names:

- `fix/search-dropdown-overflow`
- `feature/recent-sources-empty-state`
- `refactor/api-normalization`
- `docs/update-contribution-flow`

---

## Repositories

EthicPrint currently uses separate repositories for frontend and backend.

- frontend app: `ethicprint`
- backend API and jobs: `ethicprint-api`

Make sure you open the PR in the correct repository.

---

## Code standards

Please try to keep contributions aligned with the existing structure:

- keep components small and readable
- avoid unnecessary dependencies
- prefer simple data flow
- keep naming consistent
- do not mix unrelated refactors into one PR
- preserve transparency in any score-related logic
- test changes locally before submitting

If you change user-facing behavior, include:
- a short explanation
- screenshots for UI changes when relevant
- any migration notes if applicable

---

## What will likely be rejected

The following are likely to be rejected:

- factual changes without sources
- score changes that are not evidence-based
- contributions clearly motivated by brand reputation management
- code that adds tracking, ads, dark patterns, or monetisation
- large unscoped rewrites without discussion
- silent methodology changes without documentation

---

## Review principles

Contributions are reviewed with these priorities:

1. factual accuracy
2. transparency
3. methodological consistency
4. code clarity
5. maintainability

Not every correct contribution will be accepted immediately. Some may require:
- more evidence
- a narrower scope
- restructuring
- discussion first

---

## If you are contacted by a company

If a company or agency asks you to manipulate a score, hide evidence, or submit a reputation-driven correction, please report it publicly to the maintainer.

EthicPrint should remain independent from commercial pressure.

---

## Questions

Open an issue in the relevant repository, or contact the maintainer through GitHub.

Thank you for helping make EthicPrint more accurate, more transparent, and more useful.
