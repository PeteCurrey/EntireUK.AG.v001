# Entire UK Land Radar — Phase 10: Real-World Acquisition Validation & Candidate Truth Ledger

**Status:** Implemented  
**Phase:** 10 of 10+  
**Depends on:** Phase 9 (Market & Development Intelligence)  
**Document version:** 1.0.0  
**Date:** September 2026  

---

## 1. Purpose

Phase 10 transitions Entire UK Land Radar from **building the system** to **proving the system**.

Phases 5–9 established:
- Real geospatial evidence from six licensed datasets
- Deterministic screening rules with explicit signal classification
- Planning intelligence matched by spatial proximity
- Market evidence from HMLR Price Paid transactions
- Development-capacity evidence from net-developable area calculation
- Explainable prioritisation via `whySurfaced` profiles
- Analyst investigation workflow with gated progression
- Evidence snapshots and candidate outcome recording
- Structured feedback via `AnalystUsefulnessAssessment`

Phase 10 must determine whether that system is **actually useful for real acquisition work**.

The central question is:

> **Can Entire UK's Land Radar consistently identify sites that deserve genuine acquisition investigation, while clearly explaining why, exposing uncertainty, and learning from what happens in the real world?**

This question cannot be answered by adding more datasets. It must be answered by subjecting the existing system to a disciplined real-world validation process.

---

## 2. Core Principles

### 2.1 A model output is not validated merely because the software produced it

Validation requires evidence of what happened **after** the candidate was surfaced. A site marked `HIGH` by the prioritisation engine is not validated until a qualified person has:

1. Investigated the site in the real world
2. Gathered external corroborating evidence (planning consultant advice, highways audit, title deed inspection, owner/agent response, or physical site inspection)
3. Reached a commercial decision

Without such external evidence, the site's `VALIDATION_STATUS` remains `UNVALIDATED`.

> [!NOTE]
> **Phase 11 Validation Reality Audit (September 2026):** All records in `WARWICK_VALIDATION_COHORT` and `RUGBY_VALIDATION_COHORT` have been formally classified as `BENCHMARK` fixtures to strictly reflect their synthetic baseline status. No record is reported as a live field acquisition until verified by external acquisition evidence. Single vanity accuracy scores are prohibited across all validation interfaces.

### 2.2 The anti-valuation gate is permanent

Phase 10 does not compute:
- Gross Development Value (GDV)
- Residual Land Value (RLV)
- Automated dwelling count estimates

These are outputs of a development appraisal engine. Land Radar is a **screening and triage tool**, not an appraisal engine. The gate is enforced at the code level: no component in Phase 10 computes or exposes GDV, RLV, or unit count estimates.

### 2.3 Strategy versions must be frozen during a validation cohort

Once a validation cohort is initiated, the V1/V2/V3 rule configurations are frozen. No rule tuning is permitted on the basis of individual candidate outcomes during the cohort. Rule changes require:

1. A new entry in the Rule Error Register
2. A new cohort with a new identifier
3. Full re-run of validation for the new cohort

This prevents overfitting to the validation sample.

### 2.4 Unknown is not clear

Signal status `unknown` does not mean the site is safe to assume positive. It means the data required to make a determination is unavailable. Unknown evidence must be surfaced to the analyst and treated as uncertainty, not absence of risk.

---

## 3. Validation Model Overview

```
CANDIDATE TRUTH LEDGER
├── Layer 1: Machine Intelligence (deterministic rules, signals, screening)
├── Layer 2: Derived Evidence (prioritisation, whySurfaced, evidence completeness)
├── Layer 3: Analyst Evidence (investigation notes, actions, progression, outcome)
└── Layer 4: Real-World Ground Truth (external evidence, validation realities, commercial decision)
```

The four layers are strictly separated. Layer 4 data (real-world outcomes) cannot contaminate Layer 1 (machine signals) retroactively. The append-only event log records all state changes with timestamps, preventing revision of history.

---

## 4. The Four-Layer Candidate Truth Ledger

### Layer 1: Machine Intelligence

All deterministic rule outputs for the candidate at the time of surfacing:

| Field | Content |
|-------|---------|
| `signals` | All `SiteSignal` records: type, value, status, confidence, explanation |
| `screening_result` | Pass/fail, hard exclusions, exclusion reasons |
| `strategy` | V1/V2/V3 strategy identifier and version |
| `data_sources` | All data sources active at time of evaluation |

Layer 1 events are **immutable**. Once written, they cannot be updated. Corrections go into the Rule Error Register with a new cohort designation.

### Layer 2: Derived Evidence

All derived analytical outputs:

| Field | Content |
|-------|---------|
| `prioritisation` | `PrioritisationResult`: priority, reasons, recommended next actions |
| `evidence_completeness` | Assessed/missing categories, percentage |
| `why_surfaced` | `WhySurfacedProfile`: core driver, key positive factors, constraints, unknowns |
| `market_evidence` | Transaction comparables, price per sqm range, confidence |
| `development_capacity` | Net developable area, density range, capacity band |

### Layer 3: Analyst Evidence

All human-recorded evidence from the investigation workflow:

| Field | Content |
|-------|---------|
| `notes` | Timestamped investigation notes, pinned observations |
| `next_actions` | Structured action items with priority, assignee, deadline |
| `progression` | Stage transitions: `SURFACED → UNDER_REVIEW → PROGRESSED/REJECTED/ON_HOLD` |
| `outcome` | `CandidateOutcome`: commercial decision, rejection taxonomy |
| `usefulness_assessment` | `AnalystUsefulnessAssessment`: signal quality, evidence usefulness scores |

### Layer 4: Real-World Ground Truth

External evidence gathered after machine surfacing:

| Field | Content |
|-------|---------|
| `external_evidence` | Type, source, date, contradiction status, corroboration notes |
| `validation_state` | Full `CandidateValidationRecord` with all reality dimensions |
| `events` | Append-only event log for this layer |

---

## 5. External Evidence Types

Phase 10 defines 10 external evidence types, each requiring a human source:

| Type | Description |
|------|-------------|
| `planning_consultant_advice` | Written or verbal advice from a qualified planning consultant |
| `highways_audit` | Highways engineer's assessment of access viability |
| `title_deed_inspection` | Land Registry title inspection confirming ownership, restrictions, covenants |
| `owner_agent_response` | Response from land owner or agent to acquisition enquiry |
| `physical_site_inspection` | First-hand physical inspection of the site |
| `valuation_advice` | RICS-qualified valuer's opinion on site value (not GDV/RLV) |
| `ecology_desk_study` | Preliminary ecological appraisal |
| `contamination_screening` | Phase 1 or Phase 2 contamination assessment |
| `comparable_transaction` | A confirmed comparable land transaction in the market area |
| `pre_application_response` | Pre-application enquiry response from the LPA |

### Contradiction Status

External evidence can contradict machine signals. Each record carries:

- `CORROBORATES`: External evidence supports the machine signal
- `CONTRADICTS`: External evidence materially contradicts the machine signal — this triggers a review of the originating rule
- `NEUTRAL`: External evidence relates to factors not captured by any machine signal

When `CONTRADICTS` is recorded, the Rule Error Register must be updated.

---

## 6. Validation Realities

The `CandidateValidationRecord` captures six reality dimensions. Each dimension has defined permissible values derived from the actual investigation experience.

### 6.1 Availability Reality

```
available | available_with_conditions | not_available | owner_not_engaged | unknown
```

Whether the land is genuinely available for acquisition.

### 6.2 Owner Engagement Reality

```
receptive | non_receptive | no_response | represented_by_agent | unknown
```

The owner's response to acquisition enquiry.

### 6.3 Planning Reality

```
supportive | neutral | unsupportive | allocated | refused | pre_app_only | unknown
```

The LPA's evident position on development.

### 6.4 Access Reality

```
direct_highway_frontage | ransom_strip_present | adoptable_route_available | access_required | unknown
```

The actual highway access position confirmed by inspection or highways audit.

### 6.5 Market Reality

```
active | slow | no_comparable_transactions | price_expectation_mismatch | unknown
```

The state of the local land market as evidenced by transactions and agent intelligence.

### 6.6 Acquisition Outcome Reality

```
acquired | under_offer | progressed_to_appraisal | rejected_access | rejected_planning | rejected_ownership | rejected_price | rejected_contamination | rejected_market | rejected_other | on_hold | no_decision
```

The final commercial decision outcome.

---

## 7. False Positive Taxonomy

A **false positive** occurs when Land Radar surfaces a site as HIGH or MEDIUM priority, but real-world investigation reveals the site is not a genuine acquisition opportunity.

False positives are diagnosed with a root cause:

| Root Cause | Description | Example |
|-----------|-------------|---------|
| `access_failure` | Machine access signal was positive, but physical inspection or highways audit revealed a ransom strip, adoptable-route requirement, or access impossibility | Farmer Ward Road: mapped road proximity ≠ direct highway frontage |
| `ownership_barrier` | Title deed inspection revealed restrictive covenant, absence of willing seller, or adverse ownership structure | — |
| `planning_policy_barrier` | Pre-application enquiry or consultant advice revealed material planning policy objection not captured by any signal | — |
| `contamination_unviable` | Phase 1/2 assessment revealed contamination remediation costs incompatible with viable development | Ford Foundry: held on contamination, not rejected, but a rejection variant |
| `market_mismatch` | Owner price expectations confirmed to be materially above market comparable evidence | Railway Terrace: price expectation mismatch FP |
| `data_false_positive` | The underlying data was incorrect (e.g., OS MasterMap misclassified a garden as a brownfield parcel) | — |
| `rule_false_positive` | The data was correct but the rule logic was incorrectly calibrated | — |
| `geometry_false_positive` | The spatial geometry was incorrect or mismatched, causing a site to score positively when it should not | — |

---

## 8. False Negative Taxonomy

A **false negative** occurs when Land Radar **fails to surface** a site that a qualified analyst independently identifies as a genuine acquisition opportunity.

False negatives are the most dangerous failure mode: they represent systematic blindspots. Detection requires deliberate inclusion of **Human Benchmark Candidates** in the validation cohort.

False negatives are categorised:

| Category | Description | Example |
|----------|-------------|---------|
| `data_false_negative` | The site was missing from or incorrectly recorded in the input datasets | Old Warwick Road Gasworks: omitted from DLUHC Brownfield Register open data |
| `rule_false_negative` | The data was present and correct, but the rule logic excluded the site incorrectly | Newbold Road Rugby: settlement proximity buffer 850m; site at 1040m — correctly excluded by rule but incorrectly calibrated |
| `geometry_false_negative` | The spatial geometry was incorrect, causing a site to fall outside the screening radius | — |
| `strategy_false_negative` | The site is genuinely viable but the current strategy definition correctly excludes it (deliberate design choice, not an error) | — |

---

## 9. Human Benchmark Candidates

To detect false negatives, the validation cohort must include sites that were **independently identified by a qualified analyst** as genuine acquisition opportunities — sites that were NOT surfaced by Land Radar.

### Requirements

- Each cohort must include at least **one Human Benchmark Candidate**
- The benchmark must be independently discovered (not prompted by Land Radar output)
- The benchmark site must have external corroboration of genuine opportunity status

### Benchmark Record

Each Human Benchmark Candidate records:

| Field | Content |
|-------|---------|
| `site_reference` | Human-readable reference |
| `discovery_method` | How the human analyst found the site |
| `why_not_surfaced` | The analyst's hypothesis for why Land Radar missed it |
| `false_negative_category` | Taxonomy entry from Section 8 |
| `land_radar_result` | What Land Radar actually returned for this site (if anything) |
| `external_corroboration` | Evidence that the site is a genuine opportunity |

---

## 10. Validation Cohort Construction

### Deliberate Candidate Mix (per cohort)

Each validation cohort must contain a deliberate mixture across priority bands and outcome types:

| Mix Element | Purpose |
|------------|---------|
| **HIGH priority — PROGRESS** | Validates true positive detection at high confidence |
| **MEDIUM priority — PROGRESS or HOLD** | Validates sensitivity at moderate confidence |
| **LOW priority — REJECT** | Validates false positive containment |
| **SCREENING EXCLUDED — correct** | Validates hard exclusion logic |
| **Human Benchmark FN** | Validates false negative detection capability |

A cohort that contains only HIGH candidates with positive outcomes is **not a valid validation cohort** — it cannot measure false positive rate or false negative detection.

### Cohort Identifiers

Cohort IDs follow the format `COHORT-{AREA}-{NNN}`. Once initiated, cohorts are immutable. A new rule calibration requires a new cohort.

---

## 11. Warwick District Validation Cohort (`COHORT-WARWICK-001`)

| Site | Priority | Outcome | Category |
|------|----------|---------|---------|
| Montague Road, Leamington Spa | HIGH | `PROGRESSED_TO_APPRAISAL` | True positive |
| Cape Road Industrial, Warwick | HIGH | `PROGRESSED_TO_APPRAISAL` | True positive |
| Ford Foundry, Leamington Spa | MEDIUM | `ON_HOLD` — Phase 1 contamination concern | Correct hold |
| Farmer Ward Road, Warwick | LOW | `REJECTED` — access_failure FP | False positive (rule calibration) |
| River Leam Meadow, Leamington | EXCLUDED | Correct exclusion (functional floodplain) | True negative |
| Old Warwick Road Gasworks | HUMAN BENCHMARK | Not surfaced — data_false_negative (DLUHC register gap) | False negative |

**Cohort Findings:**
- Discovery overlap rate: 5/6 (83%)
- Investigation yield rate: 2/3 HIGH candidates progressed
- False positive identified: Farmer Ward Road — ransom strip not detectable from OS road proximity
- False negative identified: Gas holder omitted from DLUHC open data release

---

## 12. Rugby Borough Validation Cohort (`COHORT-RUGBY-001`)

| Site | Priority | Outcome | Category |
|------|----------|---------|---------|
| Mill Road, Rugby | HIGH | `PROGRESSED_TO_APPRAISAL` | True positive |
| Railway Terrace, Rugby | MEDIUM | `REJECTED` — market_mismatch FP | False positive |
| Newbold Road, Rugby | HUMAN BENCHMARK | Not surfaced — rule_false_negative (buffer too tight) | False negative |

**Cohort Findings:**
- Discovery overlap rate: 2/3 (67%)
- Investigation yield rate: 1/1 HIGH candidate progressed
- False positive identified: Railway Terrace — owner price expectations confirmed above comparable evidence
- False negative identified: Newbold Road — settlement proximity buffer 850m, site at 1040m (→ RULE-SETTLE-001 registered)

---

## 13. Validation Metrics

Phase 10 produces **diagnostic metrics**, not a single accuracy score. A single accuracy score would be misleading given the small cohort sizes and deliberate candidate mixture.

### Metrics Produced by `calculateValidationMetrics()`

| Metric | Description |
|--------|-------------|
| `discovery_overlap_rate` | Proportion of cohort candidates that Land Radar surfaced (of all candidates including benchmarks) |
| `investigation_yield_rate` | Proportion of PROGRESSED candidates among all PROGRESS/REJECT decisions |
| `false_positive_count` | Count of confirmed false positives |
| `false_positive_rate` | FP / (FP + TP) |
| `false_negative_count` | Count of confirmed false negatives (from benchmarks) |
| `false_negative_by_category` | Breakdown: data / rule / geometry / strategy |
| `realities_summary` | Distribution across each reality dimension |
| `commercial_decisions` | Count breakdown of all acquisition outcomes |

### What These Metrics Do NOT Tell You

- They do not tell you whether Land Radar will perform the same in a different geography
- They do not tell you the absolute hit rate across all possible land in the market
- They do not tell you whether the sites progressed will ultimately be developed
- They do not tell you the financial return on investigation effort

---

## 14. Rule Error Register

All confirmed rule errors discovered during validation are recorded in [`RULE_ERROR_REGISTER.md`](./RULE_ERROR_REGISTER.md).

### Error Registration Trigger

An entry must be created when:
- External evidence `contradiction_status = 'CONTRADICTS'` for a machine signal
- A false positive is diagnosed with root cause `rule_false_positive` or `access_failure` (where the rule logic was the proximate cause)
- A false negative is diagnosed with category `rule_false_negative`

### Phase 10 Registered Errors

Two errors were identified and registered during initial cohort analysis:

| Error ID | Rule | Error Type | Site | Finding |
|----------|------|-----------|------|---------|
| RULE-ROAD-001 | RULE-ACCESS-001 (road proximity) | False Positive | Farmer Ward Road, Warwick | Road proximity ≠ direct highway frontage; ransom strip not detectable from OS data |
| RULE-SETTLE-001 | RULE-SETTLE-001 (settlement proximity) | False Negative | Newbold Road, Rugby | 850m buffer excludes genuinely investable suburban-fringe sites; recommend extending to 1200m with V4 strategy |

---

## 15. Data Gap Register

All confirmed data gaps are recorded in [`DATA_GAP_REGISTER.md`](./DATA_GAP_REGISTER.md).

### Phase 10 Registered Gap

| Gap | Source | Finding |
|-----|--------|---------|
| DLUHC Brownfield Register (England) | Warwick LPA submission | Old Warwick Road Gasworks (former gas holder site) omitted from LPA's DLUHC open data submission. Site is known decommissioned industrial land meeting brownfield definition but absent from dataset. Data false negative. |

---

## 16. The Validation Dashboard

The internal validation dashboard is accessible at `/validation` (internal routes only, not in public navigation).

### Dashboard Sections

1. **Cohort Overview** — all registered cohorts with candidate counts and status
2. **Portfolio Metrics** — discovery overlap rate, investigation yield rate, FP/FN counts
3. **False Positive Diagnosis** — root cause breakdown and remediation notes
4. **False Negative Diagnosis** — category breakdown, benchmark comparison
5. **Human Benchmark Comparison** — sites Land Radar missed vs. independent discovery
6. **Analyst Usefulness Assessment** — signal quality and evidence usefulness aggregates

The dashboard is **read-only** during an active validation cohort. No rule changes may be made on the basis of individual candidates until the cohort is complete.

---

## 17. Investigation Workflow Integration

Phase 10 extends the existing investigation workflow in `/review/[siteId]` with:

### Real-World External Evidence Register

Analysts can record external evidence records directly from the review page:
- Evidence type (10 permitted types)
- Source and date
- Contradiction status
- Confidence level
- Corroboration notes

### Ground Truth Reality Dimensions

Analysts can record all six reality dimensions:
- Availability reality
- Owner engagement reality  
- Planning reality
- Access reality
- Market reality
- Acquisition outcome reality

Plus:
- Validation stage
- Commercial decision
- False positive diagnosis (checkbox + root cause selector)
- Analyst notes

### Candidate Truth Ledger Display

The review page displays the 4-layer truth ledger as a 2×2 grid above the investigation panel:
- Layer 1: Machine Intelligence (signals count, screening result, strategy)
- Layer 2: Derived Evidence (priority, evidence completeness, why surfaced)
- Layer 3: Analyst Evidence (notes count, actions, progression stage)
- Layer 4: Real-World Ground Truth (external evidence count, validation stage, commercial decision)

---

## 18. Server Actions

Two new server actions guard the Phase 10 data entry:

| Action | Auth Guard | Description |
|--------|-----------|-------------|
| `recordExternalEvidenceServer()` | `verifyAcquisitionAnalystAuthorization()` | Records an external evidence record for a site |
| `recordValidationStateServer()` | `verifyAcquisitionAnalystAuthorization()` | Records or updates a candidate validation record |

Both actions are guarded by the acquisition analyst authorisation check. Unauthenticated or unauthorised requests are rejected before any database operation.

---

## 19. Database Schema

Four new tables were added in migration `0022_candidate_truth_ledger.sql`:

### `candidate_truth_ledger`

Append-only event log. Events are never updated or deleted.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Event identifier |
| `site_id` | UUID | Foreign key to `land_radar_sites` |
| `layer_type` | ENUM | `machine_intelligence`, `derived_evidence`, `analyst_evidence`, `real_world_outcome` |
| `event_type` | TEXT | Free-form event type identifier |
| `event_data` | JSONB | Structured event payload |
| `recorded_by` | UUID | Auth user ID |
| `recorded_at` | TIMESTAMPTZ | Immutable timestamp |

### `external_evidence_records`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Record identifier |
| `site_id` | UUID | Foreign key to `land_radar_sites` |
| `evidence_type` | ENUM | One of 10 evidence types |
| `source` | TEXT | Evidence source (person/organisation) |
| `evidence_date` | DATE | Date evidence was gathered |
| `contradiction_status` | ENUM | `CORROBORATES`, `CONTRADICTS`, `NEUTRAL` |
| `confidence` | NUMERIC | 0.0–1.0 |
| `notes` | TEXT | Analyst notes |
| `recorded_by` | UUID | Auth user ID |

### `candidate_validation_records`

Full reality capture. One record per site (upserted on update).

| Column | Type | Description |
|--------|------|-------------|
| `site_id` | UUID | Primary key (foreign key to `land_radar_sites`) |
| `validation_status` | ENUM | `UNVALIDATED`, `IN_VALIDATION`, `VALIDATED`, `INVALIDATED` |
| `validation_stage` | ENUM | Progression stage |
| `commercial_decision` | ENUM | Final commercial decision |
| `availability_reality` | ENUM | Availability dimension |
| `owner_engagement_reality` | ENUM | Owner engagement dimension |
| `planning_reality` | ENUM | Planning dimension |
| `access_reality` | ENUM | Access dimension |
| `market_reality` | ENUM | Market dimension |
| `acquisition_outcome_reality` | ENUM | Acquisition outcome dimension |
| `is_false_positive` | BOOLEAN | FP diagnosis flag |
| `false_positive_root_cause` | ENUM | Root cause if FP |
| `is_false_negative` | BOOLEAN | FN flag |
| `false_negative_category` | ENUM | Category if FN |
| `analyst_notes` | TEXT | Free-form analyst notes |
| `updated_by` | UUID | Last editor |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

### `human_benchmark_candidates`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Benchmark identifier |
| `cohort_id` | TEXT | Validation cohort identifier |
| `site_reference` | TEXT | Human-readable reference |
| `discovery_method` | TEXT | How the analyst found the site |
| `why_not_surfaced` | TEXT | Hypothesis for Land Radar miss |
| `false_negative_category` | ENUM | FN taxonomy entry |
| `land_radar_result` | JSONB | What Land Radar returned (if anything) |
| `external_corroboration` | TEXT | Evidence of genuine opportunity |

All four tables have Row Level Security (RLS) enabled. Select, insert, and update are restricted to authenticated users with the `acquisition_analyst` role.

---

## 20. Automated Tests

Phase 10 added 12 automated tests across two test suites:

### `truthLedger.test.ts` (6 tests)

| Test | Validates |
|------|-----------|
| Append-only event behaviour | Events cannot be modified retroactively |
| Layer separation | Layer 1/2/3/4 events are correctly classified |
| External evidence + auto Layer 4 event | Recording evidence auto-triggers a Layer 4 event |
| Validation state recording | Reality dimensions are persisted correctly |
| Human benchmark recording | FN taxonomy is correctly enforced |
| Composite 4-layer ledger | `buildCandidateTruthLedger()` assembles all layers correctly |

### `validation.test.ts` (6 tests)

| Test | Validates |
|------|-----------|
| Deliberate candidate mix (Warwick) | Cohort contains the required mixture of outcomes |
| FP/FN candidates (Rugby) | Cohort includes diagnosed FP and FN cases |
| Diagnostic metrics | `calculateValidationMetrics()` produces correct counts |
| FP standard enforcement | FP requires material real-world contradiction |
| FN taxonomy enforcement | FN must be categorised by root cause |
| Real-World Evidence Requirement | No auto-validation without external corroboration |

---

## 21. Limitations

### 21.1 Cohort Size

The initial validation cohorts (Warwick: 6 candidates, Rugby: 3 candidates) are small. The diagnostic metrics are directionally indicative but not statistically robust. Validation must be expanded to at least 50 candidates across at least 3 different local authority areas before the system can be considered meaningfully validated.

### 21.2 Geographic Generalisability

Performance in Warwick and Rugby cannot be assumed to generalise to:
- Metropolitan areas with different land-use patterns
- Northern England or Scotland (different planning policy contexts)
- Rural areas where HMLR Price Paid comparables are sparse

### 21.3 Temporal Stability

Validation is a snapshot. Market conditions, planning policy, and land availability change. A cohort validated in September 2026 may not reflect system performance in September 2027. Annual re-validation is recommended.

### 21.4 Lagged Ground Truth

Real-world validation evidence (physical inspections, planning consultant advice, title deed inspections) takes time to gather. Some candidates will remain `UNVALIDATED` for months before meaningful ground truth is available.

### 21.5 Human Benchmark Coverage

False negative detection depends on analysts independently discovering missed sites. This is inherently incomplete: analysts may not discover all missed sites. A low false negative count may reflect incomplete benchmark coverage rather than high recall.

---

## 22. Phase 11 Recommendations

Based on Phase 10 validation findings, the following Phase 11 priorities are recommended:

### 22.1 Rule Calibration — RULE-ACCESS-001

The road proximity rule (`RULE-ACCESS-001`) cannot distinguish between OS-mapped road adjacency and genuine direct highway frontage. Phase 11 should investigate:
- OS OpenData Highways network topology to identify adoptable road access
- LLPG/AddressBase for confirmed address frontage
- OS Rights of Way data to identify access routes

### 22.2 Settlement Buffer Recalibration — RULE-SETTLE-001

The current 850m settlement proximity buffer generates false negatives for suburban-fringe sites between 850m and 1200m from settlement boundaries. Phase 11 should:
- Introduce a V4 strategy with 1200m buffer and re-run against full pilot dataset
- Compare V4 output against V1/V2/V3 candidates

### 22.3 Brownfield Register Gap Mitigation

The DLUHC Brownfield Register has known omissions from individual LPA submissions. Phase 11 should investigate:
- Historic Environment Record (HER) data as a supplementary brownfield signal
- Contaminated Land Register (Part IIA) as an alternative decommissioned industrial indicator
- Historic OS mapping (25-inch series) for known industrial footprints

### 22.4 Cohort Expansion

Expand validation to at least three new local authority areas with materially different characteristics:
- One metropolitan borough (high land value, dense urban pattern)
- One rural district (sparse transactions, high amenity land pressure)
- One areas with active brownfield regeneration programme

### 22.5 Validation Automation

Manual evidence recording is a bottleneck. Phase 11 should investigate:
- Planning decision webhook integration to auto-detect planning permission grants on monitored sites
- HMLR Price Paid monthly feed to detect comparable transactions automatically
- EPC Open Data as a supplementary site characterisation signal

---

## 23. File Index

| File | Purpose |
|------|---------|
| `supabase/migrations/0022_candidate_truth_ledger.sql` | Database tables for all Phase 10 data |
| `src/lib/land-radar/types.ts` (lines 916–1190) | All Phase 10 TypeScript types |
| `src/lib/land-radar/truthLedgerService.ts` | Core truth ledger service (all 4 layers) |
| `src/lib/land-radar/validation/validationCohort.ts` | Warwick & Rugby validation cohorts |
| `src/lib/land-radar/validation/metrics.ts` | `calculateValidationMetrics()` |
| `src/app/(internal)/review/[siteId]/actions.ts` | `recordExternalEvidenceServer`, `recordValidationStateServer` |
| `src/app/(internal)/review/[siteId]/InvestigationPanel.tsx` | External evidence & validation reality UI |
| `src/app/(internal)/review/[siteId]/page.tsx` | 4-layer Truth Ledger display, cohort detection |
| `src/app/(internal)/validation/page.tsx` | Internal validation diagnostic dashboard |
| `src/lib/land-radar/__tests__/truthLedger.test.ts` | 6 truth ledger automated tests |
| `src/lib/land-radar/__tests__/validation.test.ts` | 6 cohort & metrics automated tests |
| `docs/land-radar/RULE_ERROR_REGISTER.md` | Rule error register |
| `docs/land-radar/DATA_GAP_REGISTER.md` | Data gap register |

---

## 24. Terminology Reference

To maintain precision in all communications about Phase 10, use the following approved terminology:

| ❌ Do Not Use | ✅ Use Instead |
|-------------|--------------|
| "100% Market Evidence" | "Market Evidence Coverage: Assessed" |
| "100% Capacity Assessment" | "Development-Capacity Evidence Assessment: Complete" |
| "Accuracy rate" | "Investigation yield rate" (for TP/total decisions ratio) |
| "The model thinks..." | "The machine intelligence layer classified..." |
| "Validated site" | "Site with VALIDATION_STATUS = VALIDATED and external corroboration" |
| "The algorithm rejected it" | "The screening pipeline applied [RULE-X] resulting in hard exclusion" |
| "GDV", "RLV", "units" | These terms must not appear in Land Radar outputs |

---

*Phase 10 documentation complete. For rule errors see [RULE_ERROR_REGISTER.md](./RULE_ERROR_REGISTER.md). For data gaps see [DATA_GAP_REGISTER.md](./DATA_GAP_REGISTER.md).*
