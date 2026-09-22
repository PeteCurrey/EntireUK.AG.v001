# Entire UK Land Radar — Domain Model & Entity Architecture

## 1. Executive Summary

Land Radar is the proprietary land intelligence engine for **Entire UK**. Its role is to continuously identify, aggregate, normalise, spatially analyse, and screen candidate land and property situations across the United Kingdom.

The core architecture follows a strict linear epistemological hierarchy:
```
DATA → NORMALISATION → SPATIAL ANALYSIS → RULES → SIGNALS → OPPORTUNITY → HUMAN REVIEW
```
**Not:** `AI → Guess → Score → Buy`.

---

## 2. Core Operational Principles

### 2.1 Principle 1: Potential vs. Outcomes
> **A site being surfaced by Land Radar means: "This site warrants investigation."**

It does **not** mean:
- Planning permission exists.
- Planning permission will be granted.
- Development is achievable.
- The site is financially viable.
- The site is worth a particular amount.
- The owner is willing to sell.
- Acquisition is recommended.

Every interface, report, and export preserves this distinction.

### 2.2 Principle 2: Unknown Is Not Clear
> **No record ≠ No constraint.**

If a dataset does not contain records for a given site, the system must not assume that the site is free of constraints. Absence of evidence is not evidence of absence. Every intelligence attribute models five distinct epistemic states:
1. `known` — Explicitly established by an authoritative source.
2. `unknown` — No data available or area outside coverage.
3. `conflicting` — Multiple sources disagree.
4. `inferred` — Derived from contextual evidence, not direct observation.
5. `verified` — Confirmed through human diligence or surveyor corroboration.

### 2.3 Principle 3: Separation of Facts, Derivations, and Judgements
The data model separates four layers of information:
- **Source Fact**: e.g., Environment Agency polygon intersects site centroid.
- **Derived Result**: e.g., 63.4% of candidate geometry intersects Flood Zone 3.
- **Interpretation**: e.g., Flood risk represents a material planning constraint for residential development.
- **Human Judgement**: e.g., Senior planning consultant assesses residential development viable subject to sustainable drainage attenuation and sequential testing.

---

## 3. Entity Dictionary

### `sites`
The central investigation target for Entire UK.
- **Identity**: Unique internal reference (`EUK-S-xxxx`).
- **Geometry**: MultiPolygon stored in WGS84 (`EPSG:4326`) with calculated area in British National Grid (`EPSG:27700`).
- **Area Integrity**: Both `area_sqm` (calculated) and `area_sqm_source` (supplied) are retained. If they disagree by >5%, `area_discrepancy_flag` is raised.
- **Status Lifecycle**: `candidate` → `screening` → `under_review` → `investigating` → `due_diligence` → `controlled` → `planning` → `development` → `completed` (or `declined` / `archived`).

### `land_parcels`
Geographic land parcels directly imported from authoritative cadastral or survey datasets (e.g., HM Land Registry INSPIRE index polygons).
- **Critical Distinction**: A parcel is **not** an opportunity. A parcel is purely a geographic fact.

### `land_titles` & `parcel_title_relationships`
Legal title register entities where available.
- Explicit `has_geometry` boolean (distinguishing registered extents from titles without digital boundary polygons).
- M:N relationship with parcels allowing partial overlaps, one-to-many, and many-to-one mapping.

### `data_sources` & `ingestion_jobs`
The ingestion control plane.
- Logs licensing, permitted use, update frequency, and endpoint metadata.
- Tracks job runs, error counts, rejected records, and source availability.

### `site_signals`
Independently explainable evidence metrics associated with a site.
- Contains type, quantitative value, confidence score (0-1), and mandatory human-readable explanation.

### `site_constraints`
Environmental, heritage, infrastructural, and statutory policy designations.
- Records overlap percentage, geometry, and severity (`hard_exclusion`, `soft_constraint`, `positive_signal`, `unknown`).
- Flags `severity_is_derived` so internal Entire UK logic is never confused with official statutory designations.

### `opportunities`
The commercial abstraction that links a site with an assessment profile, opportunity type, and priority.
- Sits above the evidence layer.
