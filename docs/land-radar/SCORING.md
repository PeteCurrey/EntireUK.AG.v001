# Entire UK Land Radar — Scoring Evolution & The "No Magic Score" Rule

## 1. Why There Is No 0–100 Score in Phase 4

A common failure mode in proptech startups is the premature deployment of a single, opaque "Opportunity Score" (e.g., `87/100`).
Such scores are ungrounded, non-actionable, and mislead acquisition directors.

In Phase 4, **Land Radar explicitly avoids arbitrary composite scores**.
Instead, the system outputs:
```
EVIDENCE → SIGNALS → CONSTRAINTS → EXPLANATION → HUMAN REVIEW
```

---

## 2. The Future Scoring Framework

When automated scoring is introduced in subsequent phases (following real-world geographic pilot validation), it must adhere to four strict architectural constraints:

### 2.1 Versioned
Every score calculation stores its formula version (e.g. `SCORE-RESIDENTIAL-V2.1`).

### 2.2 Decomposable & Dimensional
A score must never exist as a standalone single number. It must decompose into distinct sub-indices:
- **Planning Adjacency Index** (e.g. `78/100`)
- **Transport & Access Index** (e.g. `91/100`)
- **Environmental Constraint Resistance** (e.g. `54/100`)
- **Market Demand Index** (e.g. `84/100`)
- **Economic Viability**: `unknown` (until appraisal engine integration)

### 2.3 Recalculable & Explainable
If an upstream dataset updates (e.g., a new Local Plan allocation or flood map revision), the system can re-run the score and explain exactly what changed:
> *"Score shifted from 62 to 74 because Warwick District Council published an updated Brownfield Land Register containing this site on 2026-09-01."*

### 2.4 Subordinate to Human Judgement
The automated score is an ordering aid for the human analyst queue, not an automated buy trigger.
