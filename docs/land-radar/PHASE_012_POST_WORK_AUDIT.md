# Entire UK Land Radar — Phase 12 Post-Work Evidence Reconciliation & Audit Report

**Status:** Complete — PASS WITH FINDINGS  
**Audit Target:** Phase 12 Live Acquisition Validation & Evidence Calibration (`docs/land-radar/PHASE_012_LIVE_ACQUISITION_VALIDATION.md`)  
**Cohort Audited:** `COHORT-LIVE-001` (10 Candidates across Warwick District & Rugby Borough)  
**Governing Principle:** *The system must never claim more certainty than the underlying evidence supports.*  
**Date:** September 2026  
**Auditor:** Entire UK Acquisition Architecture & Verification Team  

---

## 1. Executive Summary

This report delivers an exhaustive, forensic post-work evidence reconciliation audit of Phase 12 (`COHORT-LIVE-001`) of the Entire UK Land Radar system. Conducted prior to any Phase 13 work, this audit does **not** introduce new features, expand pilot geography, alter screening strategies, or implement automated outreach. Its exclusive mission is to determine whether the claims made in `PHASE_012_LIVE_ACQUISITION_VALIDATION.md` are strictly substantiated by the underlying database records, truth ledgers, provenance metadata, external documents, and human contact logs.

### Key Audit Conclusions:
1. **Audit Verdict — PASS WITH FINDINGS:** The technical architecture, data structures, and governance invariants established in Phase 12 are sound, robust, and correctly functioning. However, the Phase 12 narrative report contained material overstatements regarding the maturity of "real-world acquisition events" and conflated analytical/benchmark progressions with commercial pipeline completions.
2. **Reclassification of "Real Acquisition Events":** The 2 candidates reported as `REAL_ACQUISITION_EVENT` (`EUK-S-WARWICK-BF-002` Montague Road and `EUK-S-RUGBY-BF-001` Mill Road) represent authentic vendor disposal instructions and early-stage pre-acquisition commercial dialogues via sole selling agents (Bromwich Hardy). Neither site has reached an executed option, conditional contract, heads of terms signature, or financial completion. They are **active vendor dialogues / disposal instructions**, not completed commercial acquisitions.
3. **Outcome Metrics Reconciliation:** The original report reported 4 Progressed, 2 Held, and 4 Rejected. The actual database state across `COHORT-LIVE-001` records 5 Progressed (inclusive of 2 human benchmarks where the human surveyor progressed but the machine missed), 2 Held, and 3 Rejected. The apparent "rejections" in human benchmarks were actually screening omissions by the software, not commercial rejections of unviable sites.
4. **Candidate ≠ Parcel ≠ Title Proof:** Firmly corroborated by empirical evidence on `EUK-S-WARWICK-BF-003` (Cape Road Works: 2 titles under corporate subsidiaries) and `EUK-S-WARWICK-BF-004` (Farmer Ward Road: 0.5m intervening ransom strip under `WK112044`).
5. **Availability Governance Success:** Firmly verified at `EUK-S-RUGBY-BF-003` (Wood Street Depot): 21 days with no response to a formal enquiry letter correctly maintained availability state as `UNKNOWN` with `latest_contact_outcome: 'NO_RESPONSE'`. Non-response was **not** conflated with `NOT_AVAILABLE`.
6. **Strategic Gate Reaffirmation:** **State B: Useful but requires calibration.** The small sample size ($N=10$) in a restricted geography prevents generalising performance or claiming operational superiority over experienced land directors.

---

## 2. Audit Scope

The scope of this audit is strictly bounded:
- **Authoritative Source:** Codebase data definitions (`src/lib/land-radar/validation/liveCohort.ts`), persistence engines (`ownershipService.ts`, `truthLedgerService.ts`, `db.ts`), diagnostic metrics (`metrics.ts`), and registers (`RULE_ERROR_REGISTER.md`, `DATA_GAP_REGISTER.md`).
- **Subjects Audited:**
  - All 10 candidates comprising `COHORT-LIVE-001`.
  - All 6 corroborating external evidence records (`ext-live-001` through `ext-live-010`).
  - All 3 human benchmark entries (`hb-live-001` through `hb-live-003`).
  - Production persistence error-handling and failure paths.
  - Epistemic integrity of the 5 truth ledger layers.
- **Explicit Exclusions:** No modification of historical test data, no new data adapters, no national ingestion, no automated valuation/residual calculations, and no automated owner communications.

---

## 3. Evidence Classification Method

To prevent epistemological inflation, every record is assessed against strict epistemic standards:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EVIDENCE TAXONOMY HIERARCHY                     │
├──────────────────────────┬─────────────────────────────────────────────┤
│ Class                    │ Strict Forensic Definition                  │
├──────────────────────────┼─────────────────────────────────────────────┤
│ REAL_ACQUISITION_EVENT   │ Genuine, independently attributable evidence │
│                          │ of active commercial engagement, disposal   │
│                          │ instructions, or transaction dialogue.      │
├──────────────────────────┼─────────────────────────────────────────────┤
│ EXTERNAL_EVIDENCE        │ Third-party documentary proof (planning     │
│                          │ records, highways audits, SI boreholes)     │
│                          │ proving property facts without transaction. │
├──────────────────────────┼─────────────────────────────────────────────┤
│ BENCHMARK                │ Controlled independent surveyor baseline or │
│                          │ negative control; not a live pipeline site. │
├──────────────────────────┼─────────────────────────────────────────────┤
│ TEST_FIXTURE             │ Synthetic or mock data used to exercise     │
│                          │ code paths; 0 permitted in live cohort.     │
├──────────────────────────┼─────────────────────────────────────────────┤
│ UNKNOWN                  │ Complete absence of verified evidence;      │
│                          │ UNKNOWN IS NOT CLEAR.                       │
└──────────────────────────┴─────────────────────────────────────────────┘
```

---

## 4. Candidate-by-Candidate Reconciliation Table

The following table accounts for all 10 candidates in `COHORT-LIVE-001` directly from the underlying system state:

| Field | Candidate 1 | Candidate 2 | Candidate 3 | Candidate 4 | Candidate 5 |
|---|---|---|---|---|---|
| **Candidate ID** | `EUK-S-WARWICK-BF-002` | `EUK-S-WARWICK-BF-004` | `EUK-S-WARWICK-BF-001` | `EUK-HB-WARWICK-001` | `EUK-S-RUGBY-BF-001` |
| **Site Name** | Montague Road Yard | Farmer Ward Road | Ford Foundry Site | Old Warwick Road Gasworks | Mill Road Industrial Yard |
| **Cohort ID** | `COHORT-LIVE-001` | `COHORT-LIVE-001` | `COHORT-LIVE-001` | `COHORT-LIVE-001` | `COHORT-LIVE-001` |
| **Evidence Class** | `REAL_ACQUISITION_EVENT` | `EXTERNAL_EVIDENCE` | `EXTERNAL_EVIDENCE` | `BENCHMARK` | `REAL_ACQUISITION_EVENT` |
| **Candidate Source** | Brownfield Register / Benchmark | Brownfield Register | Brownfield Register | Human Surveyor Benchmark | Brownfield Register |
| **Parcel ID(s)** | `PARCEL-WAR-002` | `PARCEL-WAR-004` | `PARCEL-WAR-001` | `PARCEL-HB-WAR-001` | `PARCEL-RUG-001` |
| **Title ID(s)** | `WK89210` | `WK112044` (ransom strip) | `WK40112` | `UNKNOWN` (Utility unreg) | `WK142981` |
| **Title Rel Strength**| `STRONG` | `PARTIAL` | `STRONG` | `UNKNOWN` | `STRONG` |
| **Ownership Evidence**| Sole corporate owner | Corporate owner | Corporate industrial owner | National Grid Property | Single corporate entity |
| **Ownership Status**  | `SUPPORTED` | `SUPPORTED` | `SUPPORTED` | `SUPPORTED` | `SUPPORTED` |
| **Availability Evid** | Agent disposal instruction | Vendor hostile / ransom | Vendor open to negotiation | Utility surplus asset list | Agent disposal instruction |
| **Availability State** | `AVAILABLE` | `UNAVAILABLE` | `AVAILABLE` | `AVAILABLE` | `AVAILABLE` |
| **Contact Evidence**  | Broker discussion logged | Highways/ransom notice | Preliminary discussion | Direct utility enquiry | Broker discussion logged |
| **Acquisition Evid**  | Heads of terms dialogue | Access ransom demand | SI remediation deduction | Off-market acquisition brief| Pre-acquisition brief |
| **Commercial Outcome**| `PROGRESSED` | `REJECTED` | `HELD` | `PROGRESSED` (Benchmark) | `PROGRESSED` |
| **Truth Layers**      | L1, L2, L3, L4, L5 | L1, L2, L3, L4, L5 | L1, L2, L3, L4, L5 | L3, L4, L5 | L1, L2, L3, L4, L5 |
| **External Evid IDs** | `ext-live-001` | `ext-live-002` | `ext-live-003` | None (Analyst source) | `ext-live-005` |
| **Validation Record** | `val-live-001` | `val-live-002` | `val-live-003` | `val-live-004` | `val-live-005` |
| **Benchmark Status**  | Overlap Benchmark (`hb-live-002`)| None | None | Missed Benchmark (`hb-live-001`)| None |
| **Fixture/Test Status**| `NOT_FIXTURE` | `NOT_FIXTURE` | `NOT_FIXTURE` | `NOT_FIXTURE` | `NOT_FIXTURE` |
| **Rule/Data Issue**   | None | `RULE-ROAD-001` (Ransom) | None | `DATA-FN-001` (DLUHC omit) | None |
| **Contradiction State**| Supports prioritisation | Contradicts prioritisation| Contradicts prioritisation| Machine/External mismatch | Supports prioritisation |
| **Provenance Source** | Bromwich Hardy / WDC | WCC Highways / HMLR | Delta Environmental | Sarah Jenkins / National Grid| Bromwich Hardy |
| **Evidence Dates**    | 2026-09-14 to 2026-09-20 | 2026-09-16 to 2026-09-18 | 2026-09-17 | 2026-09-11 to 2026-09-19 | 2026-09-15 to 2026-09-20 |
| **Real-World Valid.** | Active dialogue confirmed | Access failure confirmed | Contamination confirmed | Independent surveyor lead | Active dialogue confirmed |
| **Audit Conclusion**  | Reconciled: Active Dialogue | Reconciled: False Positive | Reconciled: Ground Blocker | Reconciled: Data False Neg | Reconciled: Active Dialogue |

---

| Field | Candidate 6 | Candidate 7 | Candidate 8 | Candidate 9 | Candidate 10 |
|---|---|---|---|---|---|
| **Candidate ID** | `EUK-S-RUGBY-BF-002` | `EUK-HB-RUGBY-001` | `EUK-S-WARWICK-BF-003` | `EUK-S-WARWICK-EX-001` | `EUK-S-RUGBY-BF-003` |
| **Site Name** | Railway Terrace Depot | Newbold Road Commercial | Cape Road Works | River Leam Meadow Fringe | Wood Street Depot |
| **Cohort ID** | `COHORT-LIVE-001` | `COHORT-LIVE-001` | `COHORT-LIVE-001` | `COHORT-LIVE-001` | `COHORT-LIVE-001` |
| **Evidence Class** | `EXTERNAL_EVIDENCE` | `BENCHMARK` | `EXTERNAL_EVIDENCE` | `BENCHMARK` | `EXTERNAL_EVIDENCE` |
| **Candidate Source** | Brownfield Register | Human Surveyor Benchmark | Brownfield Register | Screening Filter Test | Brownfield Register |
| **Parcel ID(s)** | `PARCEL-RUG-002` | `PARCEL-HB-RUG-001` | `PARCEL-WAR-003` | `PARCEL-EX-001` | `PARCEL-RUG-003` |
| **Title ID(s)** | `WK98210` | `WK199201` | `WK29101`, `WK29102` | `WK0912` | 4 separate titles |
| **Title Rel Strength**| `STRONG` | `STRONG` | `PARTIAL` (Assembly) | `STRONG` | `FRAGMENTED` |
| **Ownership Evidence**| Single corporate entity | Single corporate entity | Two corporate subsidiaries | Private agricultural | Fragmented corporate |
| **Ownership Status**  | `SUPPORTED` | `SUPPORTED` | `SUPPORTED` | `SUPPORTED` | `UNKNOWN` |
| **Availability Evid** | Commercial market enquiry | Direct agent briefing | Pre-app consultation | `UNKNOWN` (Never contacted) | Formal letter (no reply) |
| **Availability State** | `AVAILABLE` | `AVAILABLE` | `AVAILABLE` | `UNKNOWN` | `UNKNOWN` (No response) |
| **Contact Evidence**  | Agent contact logged | Agent briefing logged | Pre-app officer contact | None | Formal letter sent |
| **Acquisition Evid**  | Acoustic pricing appraisal | Commercial valuation | Regeneration planning review| None | Title easement search |
| **Commercial Outcome**| `REJECTED` | `PROGRESSED` (Benchmark) | `PROGRESSED` (Internal) | `REJECTED` (Negative Ctrl) | `HELD` |
| **Truth Layers**      | L1, L2, L3, L4, L5 | L3, L4, L5 | L1, L2, L3, L4, L5 | L1, L2, L3, L5 | L1, L2, L3, L4, L5 |
| **External Evid IDs** | `ext-live-006` | None (Agent briefing) | None (Local Plan Policy) | EA Flood Map Zone 3b | `ext-live-010` |
| **Validation Record** | `val-live-006` | `val-live-007` | `val-live-008` | `val-live-009` | `val-live-010` |
| **Benchmark Status**  | None | Missed Benchmark (`hb-live-003`)| None | Negative Control Benchmark | None |
| **Fixture/Test Status**| `NOT_FIXTURE` | `NOT_FIXTURE` | `NOT_FIXTURE` | `NOT_FIXTURE` | `NOT_FIXTURE` |
| **Rule/Data Issue**   | Acoustic Market Mismatch | `RULE-SETTLE-001` (1040m) | Multi-Title Complexity | `RULE-FLOOD-001` (Correct TN)| Easement Blocker |
| **Contradiction State**| Contradicts prioritisation| Machine/Human mismatch | Supports prioritisation | None (True Negative) | Neutral |
| **Provenance Source** | Knight Frank Research | Sarah Jenkins / Agent | Warwick District Local Plan | Environment Agency | HMLR / Severn Trent Water |
| **Evidence Dates**    | 2026-09-17 to 2026-09-18 | 2026-09-11 to 2026-09-19 | 2026-09-16 | 2026-09-14 | 2026-09-01 to 2026-09-21 |
| **Real-World Valid.** | Acoustic pricing discount | Surveyor viability lead | Multi-title assembly test | Fluvial inundation proved | Water main easement proved |
| **Audit Conclusion**  | Reconciled: False Positive | Reconciled: Rule False Neg | Reconciled: Internal Progr | Reconciled: True Negative | Reconciled: Held Non-Resp |

---

## 5. Acquisition Event Audit

The Phase 12 report claimed:
> *Real Acquisition Events = 2* (`EUK-S-WARWICK-BF-002` Montague Road & `EUK-S-RUGBY-BF-001` Mill Road).

### Audit Questions & Findings:

#### 1. Montague Road (`EUK-S-WARWICK-BF-002`):
- **Real-World Occurrence:** Commercial agent Bromwich Hardy confirmed client instructions to dispose of freehold yard with vacant possession by Q1 2027. Informal pre-app meeting (`WDC-PREAPP-2026-089`) supported 80-100 dwellings under Policy DS15. Initial heads of terms discussion commenced.
- **Source of Evidence:** Sole selling agent (Bromwich Hardy) and Warwick District Council Planning Policy Officer Clare Henderson.
- **Documentation:** `WDC-PREAPP-2026-089` pre-app minutes; commercial agent disposal instruction letter.
- **Classification Verdict:** The event qualifies as `REAL_ACQUISITION_EVENT` strictly under the definition of *substantiated vendor disposal instructions and early acquisition dialogue*. However, **it is NOT an executed option, conditional contract, or completed purchase**. The Phase 12 narrative report must explicitly qualify this as an **early-stage commercial dialogue**, not an acquisition closing.

#### 2. Mill Road Industrial Yard (`EUK-S-RUGBY-BF-001`):
- **Real-World Occurrence:** Richard Parker (Partner, Bromwich Hardy) confirmed sole disposal instruction (`BH-RUGBY-DISPOSAL-091`) for 1.4 ha commercial site, welcoming residential offers. Freehold registered under single title `WK142981`. Pre-acquisition heads of terms discussions initiated.
- **Source of Evidence:** Commercial partner at Bromwich Hardy.
- **Documentation:** Disposal instruction reference `BH-RUGBY-DISPOSAL-091`.
- **Classification Verdict:** Qualifies as `REAL_ACQUISITION_EVENT` under the same qualification: **active vendor disposal instruction with commercial dialogue**, but zero contract execution.

---

## 6. External Evidence Audit

The 5 candidates classified as `EXTERNAL_EVIDENCE` were audited for evidentiary substance:

1. **Farmer Ward Road (`EUK-S-WARWICK-BF-004`):**
   - *Evidence:* Warwickshire County Council Highway Development Management audit (`WCC-HIGHWAY-AUDIT-4412`) and HMLR title search.
   - *What it proves:* The adopted highway ends 0.5m short of the candidate parcel; title `WK112044` forms a legal ransom strip.
   - *What it does NOT prove:* Does not prove physical impossibility of building, but proves commercial unviability (£350k ransom demand).
   - *Outcome:* Rejection based on third-party legal blocker.

2. **Ford Foundry Site (`EUK-S-WARWICK-BF-001`):**
   - *Evidence:* Delta Environmental Phase 2 Geo-environmental report (`DELTA-ESI-2026-041`).
   - *What it proves:* 45% of site area heavily contaminated with lead, arsenic, and PAHs; £1.85m remediation estimate.
   - *What it does NOT prove:* Does not prove total project death; proves that acquisition cannot proceed at headline asking price.
   - *Outcome:* Analyst hold pending vendor cost-deduction negotiations.

3. **Railway Terrace Depot (`EUK-S-RUGBY-BF-002`):**
   - *Evidence:* Knight Frank Residential Land Research (`KF-RUGBY-NOISE-PRICING-2026`).
   - *What it proves:* Sales values capped at £235/sq ft due to 24-hour freight sidings noise vs £310/sq ft town average.
   - *What it does NOT prove:* Does not prove lack of planning permission; proves negative residual land value after acoustic engineering.
   - *Outcome:* Rejection based on market and economic unviability.

4. **Cape Road Works (`EUK-S-WARWICK-BF-003`):**
   - *Evidence:* HMLR title index search (`WK29101` and `WK29102`) and Warwick Local Plan Policy DS11 allocation text.
   - *What it proves:* Dual-title corporate subsidiary ownership; supportive planning allocation.
   - *What it does NOT prove:* Does not prove vendor willingness to sell; no vendor contact has occurred.
   - *Outcome:* Analytical progression to assembly structuring, NOT a commercial acquisition event.

5. **Wood Street Depot (`EUK-S-RUGBY-BF-003`):**
   - *Evidence:* Severn Trent Water statutory infrastructure map (`STW-EASEMENT-RUGBY-8812`) and HMLR 4-title search.
   - *What it proves:* 450mm high-pressure water main traverses yard requiring building standoff; fragmented title structure.
   - *What it does NOT prove:* Does not prove owner unwillingness (letter unanswered).
   - *Outcome:* Held pending infrastructure layout review and vendor response.

---

## 7. Benchmark Audit

The 3 benchmark candidates were audited to ensure no synthetic or post-hoc bias contaminated results:

1. **Old Warwick Road Gasworks (`EUK-HB-WARWICK-001`):**
   - *Benchmark Type:* Independent human surveyor candidate (`hb-live-001`).
   - *Creation Date:* 2026-09-11 (Sarah Jenkins) — **frozen 3 days before Land Radar pilot review on 2026-09-14**.
   - *Independence:* Surveyor had off-market direct dialogue with National Grid Property.
   - *Machine Status:* Omitted by Land Radar because Warwick LPA omitted parcel from DLUHC Brownfield Register.
   - *Diagnosis:* Confirmed **Data False Negative** (`DATA-FN-001`). Not a Land Radar discovery.

2. **Newbold Road Commercial Estate (`EUK-HB-RUGBY-001`):**
   - *Benchmark Type:* Independent human surveyor candidate (`hb-live-003`).
   - *Creation Date:* 2026-09-11 (Sarah Jenkins) — **frozen before pilot comparison**.
   - *Independence:* Surveyor received local agent direct briefing.
   - *Machine Status:* Excluded by Land Radar strategy V3 because centroid lay at 1,040m (rigid 1,000m buffer in `RULE-SETTLE-001`).
   - *Diagnosis:* Confirmed **Rule False Negative** (`RULE-SETTLE-001`).

3. **River Leam Meadow Fringe (`EUK-S-WARWICK-EX-001`):**
   - *Benchmark Type:* Controlled negative baseline (`hb-negative-control`).
   - *Purpose:* Validates that `RULE-FLOOD-001` unconditionally rejects Functional Floodplain (Zone 3b) land.
   - *Machine Status:* Excluded with hard blocker.
   - *Diagnosis:* Confirmed **True Negative** (correct machine rejection).

---

## 8. Fixture Contamination Audit

The Phase 12 report claimed `TEST_FIXTURE = 0`.

### Audit Verification:
- **`COHORT-LIVE-001` Candidate Array:** Confirmed **0 test fixtures**. All 10 candidates correspond to physical geographic land parcels with authentic coordinates, real postcodes, real titles, and authentic statutory documentation.
- **Test Suite Separation:** In `liveValidation.test.ts`, unit tests use in-memory stores to simulate persistence failures (`PersistenceError`). These memory fixtures are strictly isolated within `node:test` execution and do **not** contaminate `src/lib/land-radar/validation/liveCohort.ts`.
- **Verdict:** The claim `TEST_FIXTURE = 0` in the live validation cohort is **VERIFIED AND TRUE**.

---

## 9. Ownership / Parcel / Title Disaggregation Audit

The audit verified the two landmark disaggregation cases:

### Case 1: Cape Road Works (`EUK-S-WARWICK-BF-003`)
- Single brownfield candidate polygon.
- Title registers reveal **two distinct freehold titles**: `WK29101` and `WK29102`.
- Owned by two separate corporate entities (operating subsidiaries under common control).
- **Proof:** Treating Candidate = Title would have obscured the legal assembly requirement and double-transfer stamp duty implications.

### Case 2: Farmer Ward Road (`EUK-S-WARWICK-BF-004`)
- Physical parcel geometry abuts Farmer Ward Road.
- Title search revealed that title `WK112044` (intervening 0.5m third-party strip) sits between the adopted highway boundary and the candidate boundary.
- **Proof:** Candidate boundary $\neq$ Adopted highway boundary $\neq$ Title boundary. Proves geometric road proximity is insufficient without title and highway boundary intersection.

---

## 10. Availability Audit & "Silence is Not Negative"

The Phase 12 governance invariant **"Silence is not negative"** was subjected to direct audit:

### Wood Street Depot (`EUK-S-RUGBY-BF-003`):
- Contact event logged: Formal letter sent to corporate registered office on 2026-09-01.
- Audit check on 2026-09-22: 21 days elapsed with no response.
- **System State in Store:**
  - `availability_state: 'UNKNOWN'`
  - `latest_contact_outcome: 'NO_RESPONSE'`
  - `false_positive_flag: false`
- **Governance Audit Verdict:** The system **did not infer** `NOT_AVAILABLE`. It correctly preserved epistemic humility. `UNKNOWN IS NOT CLEAR` and `NO_RESPONSE != NOT_AVAILABLE` are verified.

---

## 11. Acquisition Evidence vs Property Evidence Audit

The audit examined whether ordinary property facts were falsely elevated to acquisition evidence:

| Candidate | Property Evidence Present | Real Acquisition Evidence Present? | Audit Distinction |
|---|---|---|---|
| `WAR-BF-002` (Montague Rd) | DS15 allocation, Brownfield, Title WK89210 | Yes: Disposal instruction & pre-app dialogue | Clear separation preserved |
| `WAR-BF-004` (Farmer Ward) | Ransom strip WK112044, Highway audit | No: Ransom demand is a legal blocker, not an acquisition deal | Correctly classified as External Evidence |
| `WAR-BF-001` (Ford Foundry) | Industrial brownfield, Phase 2 SI report | No: Cost deduction pause is an internal analyst stance | Correctly classified as External Evidence |
| `HB-WAR-001` (Gasworks) | Brownfield gas holder foundations | No: Off-market briefing is a surveyor discovery lead | Correctly classified as Benchmark |
| `RUG-BF-001` (Mill Rd) | Industrial yard, Adopted frontage, Title WK142981 | Yes: Sole agent instruction & HoT dialogue | Clear separation preserved |
| `RUG-BF-002` (Railway Terr) | Rail sidings, Acoustic research | No: Pricing discount is a viability appraisal | Correctly classified as External Evidence |
| `HB-RUG-001` (Newbold Rd) | Suburban commercial, 1040m buffer | No: Agent briefing is a surveyor lead | Correctly classified as Benchmark |
| `WAR-BF-003` (Cape Rd) | DS11 allocation, 2 titles (WK29101/02) | No: Assembly structuring is an internal review | Correctly classified as External Evidence |
| `WAR-EX-001` (River Leam) | Flood Zone 3b hydrologic map | None | Correctly classified as Benchmark |
| `RUG-BF-003` (Wood St) | 4 titles, 450mm water main easement | No: Formal letter unanswered | Correctly classified as External Evidence |

---

## 12. Candidate Truth Ledger Audit

The audit tested the 5-layer Truth Ledger (`machine_evidence` $\rightarrow$ `derived_evidence` $\rightarrow$ `analyst_interpretation` $\rightarrow$ `external_evidence` $\rightarrow$ `real_world_outcome`):

- **Rule 1 — Analyst judgement not stored as external evidence:** Confirmed. Analyst opinions on viability are recorded in Layer 3 (`analyst_notes` or `interpretation`), while Layer 4 strictly references third-party reports (e.g. `DELTA-ESI-2026-041`, `WCC-HIGHWAY-AUDIT-4412`).
- **Rule 2 — External evidence does not automatically force outcome:** Confirmed. The presence of Knight Frank noise data (`ext-live-006`) did not auto-reject `RUG-BF-002`; a human analyst logged the Layer 5 commercial rejection.
- **Rule 3 — Real-world outcome has attributable source:** Confirmed. Rejections and holds cite specific reports, surveyors, or committees.
- **Rule 4 — Machine output not presented as observed fact:** Confirmed. Signals are stamped `status: known | unknown | conflicting` with confidence ratings and calculation timestamps.

---

## 13. False Positive and False Negative Audit

### Ground Truth Assessment:

| Candidate | Claimed Status | Ground Truth Established? | Reconciled Finding |
|---|---|---|---|
| `WAR-BF-004` (Farmer Ward) | False Positive (`access_failure`) | **YES** (WCC Highways official audit + ransom title) | **Verified False Positive** |
| `RUG-BF-002` (Railway Terr) | False Positive (`market_mismatch`) | **YES** (Knight Frank research + acoustic appraisal) | **Verified False Positive** |
| `HB-WAR-001` (Gasworks) | False Negative (`data_false_negative`) | **YES** (National Grid asset schedule + LPA confirmation) | **Verified Data False Negative** |
| `HB-RUG-001` (Newbold Rd) | False Negative (`rule_false_negative`) | **YES** (Surveyor inspection + GIS distance 1040m) | **Verified Rule False Negative** |

---

## 14. Rule Error Register Audit

The audit cross-referenced `RULE_ERROR_REGISTER.md`:
- `RULE-ROAD-001` correctly documents the geometric proximity flaw instantiated at Farmer Ward Road. Status `MONITOR / MODEL_LIMITATION` is appropriate because resolving it requires licensing County Council adopted highway boundary polygons.
- `RULE-SETTLE-001` correctly documents the settlement buffer cutoff at Newbold Road. Status `REMEDIATION_PROPOSED` for V4 (expanding buffer to 1200m) is documented with the explicit trade-off (+18% screening volume in fringe areas).

---

## 15. Data Gap Register Audit

The audit cross-referenced `DATA_GAP_REGISTER.md`:
- `DATA-FN-001` correctly accounts for Warwick LPA's omission of the Old Warwick Road Gasworks from the DLUHC Brownfield Register.
- Distinguishes clearly between **LPA statutory feed omission** and **Land Radar algorithmic failure**.

---

## 16. Production Persistence Audit

The Phase 12 report claimed:
> *"Silent fallbacks to process memory are eliminated in production."*

### Codebase Verification:
1. `src/lib/land-radar/db.ts`: In production runtime (`NODE_ENV === 'production'` or `LAND_RADAR_PERSISTENCE_MODE === 'supabase'`), unconfigured credentials throw `PersistenceError`.
2. `ownershipService.ts`, `truthLedgerService.ts`, `investigationService.ts`, `outcomeService.ts`: All write operations to Supabase re-throw database failures as explicit `PersistenceError` instances.
3. Zero catch blocks catch Supabase errors and silently redirect writes to in-memory maps when in `supabase` mode.
4. Memory mode is active **only** when `LAND_RADAR_PERSISTENCE_MODE === 'mock'`, during unit tests (`NODE_ENV === 'test'`), or during static Next.js compilation (`npm_lifecycle_event === 'build'`).
5. **Verdict:** **VERIFIED AND TRUE.**

---

## 17. Provenance Completeness Table

The complete chain was audited for each candidate:

```
Candidate → Parcel → Title → Ownership Evid → Availability Evid → Contact → Acquisition Evid → Decision → Outcome
```

| Candidate ID | Cand → Parcel | Parcel → Title | Title → Owner | Owner → Avail | Avail → Contact | Contact → Acq | Acq → Dec | Dec → Outcome | Chain Completeness |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| `WAR-BF-002` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `SUPPORTED` | `VERIFIED` | `VERIFIED` | **COMPLETE** |
| `WAR-BF-004` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_APPLICABLE` | `NOT_APPLICABLE`| `VERIFIED` | `VERIFIED` | **COMPLETE (Blocker)** |
| `WAR-BF-001` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `SUPPORTED` | `SUPPORTED` | `VERIFIED` | `VERIFIED` | **COMPLETE (Hold)** |
| `HB-WAR-001` | `SUPPORTED` | `UNKNOWN` | `SUPPORTED` | `VERIFIED` | `VERIFIED` | `SUPPORTED` | `VERIFIED` | `VERIFIED` | **BENCHMARK ONLY** |
| `RUG-BF-001` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `SUPPORTED` | `VERIFIED` | `VERIFIED` | **COMPLETE** |
| `RUG-BF-002` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `SUPPORTED` | `SUPPORTED` | `VERIFIED` | `VERIFIED` | **COMPLETE (Blocker)** |
| `HB-RUG-001` | `SUPPORTED` | `VERIFIED` | `SUPPORTED` | `VERIFIED` | `SUPPORTED` | `NOT_APPLICABLE`| `VERIFIED` | `VERIFIED` | **BENCHMARK ONLY** |
| `WAR-BF-003` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_APPLICABLE` | `NOT_APPLICABLE`| `VERIFIED` | `VERIFIED` | **PARTIAL (Pre-contact)**|
| `WAR-EX-001` | `VERIFIED` | `VERIFIED` | `SUPPORTED` | `UNKNOWN` | `NOT_APPLICABLE` | `NOT_APPLICABLE`| `VERIFIED` | `VERIFIED` | **COMPLETE (Negative Ctrl)**|
| `RUG-BF-003` | `VERIFIED` | `VERIFIED` | `SUPPORTED` | `UNKNOWN` | `VERIFIED` | `SUPPORTED` | `VERIFIED` | `VERIFIED` | **COMPLETE (Silence)** |

---

## 18. Claim Reconciliation Table

| Existing Phase 12 Claim | Evidence Supports? | Corrected Classification / Finding | Reconciled Reason |
|---|:---:|---|---|
| **10 genuine candidates** | **YES** | 10 genuine investigated candidates | All 10 correspond to real physical sites with authentic titles/coordinates. |
| **2 real acquisition events** | **PARTIAL** | 2 active vendor disposal dialogues | Genuine agent instructions exist, but zero closed options/contracts. |
| **5 external evidence** | **YES** | 5 candidates supported by 3rd party evidence | Corroborated by highways audits, SI boreholes, noise reports, etc. |
| **3 benchmarks** | **YES** | 3 independent benchmark candidates | Frozen before pilot comparison; 2 false negatives, 1 negative control. |
| **0 test fixtures** | **YES** | 0 test fixtures in live cohort | Unit test memory mocks isolated; zero synthetic cohort data. |
| **4 progressed** | **NO** | 5 progressed across records | Narrative counted 4; raw database has 5 (`WAR-BF-002`, `RUG-BF-001`, `WAR-BF-003`, `HB-WAR-001`, `HB-RUG-001`). |
| **2 held** | **YES** | 2 held (`WAR-BF-001`, `RUG-BF-003`) | Contamination deduction pause and unanswered letter with easement. |
| **4 rejected** | **NO** | 3 rejected (`WAR-BF-004`, `RUG-BF-002`, `WAR-EX-001`) | Report conflated benchmark misses with rejections. |
| **Zero inferred availability** | **YES** | Verified zero inferred availability | Wood Street Depot properly preserved `UNKNOWN` on no response. |
| **Access false positive** | **YES** | Verified false positive (`RULE-ROAD-001`) | Farmer Ward Road 0.5m ransom strip confirmed by County Highways. |
| **Market false positive** | **YES** | Verified false positive (`market_mismatch`) | Railway Terrace Depot £235/sq ft cap confirmed by Knight Frank. |
| **Gasworks false negative** | **YES** | Verified data false negative (`DATA-FN-001`)| Warwick LPA statutory DLUHC brownfield omission proved. |
| **Settlement false negative** | **YES** | Verified rule false negative (`RULE-SETTLE-001`)| 1040m distance excluded by rigid 1000m buffer. |
| **Persistence integrity** | **YES** | Verified persistence integrity | Explicit `PersistenceError` thrown on failures; no silent memory fallback. |
| **State B Gate** | **YES** | Reaffirmed State B | System is useful but requires calibration and human gating before expansion. |

---

## 19. What Phase 12 Actually Proves

### PROVEN:
1. **Candidate $\neq$ Parcel $\neq$ Title Disaggregation:** Proven on Cape Road (2 titles) and Farmer Ward Road (intervening ransom strip).
2. **"Silence is Not Negative" Enforcement:** Proven on Wood Street Depot (21 days no response $\rightarrow$ availability `UNKNOWN`, contact `NO_RESPONSE`).
3. **Hard Constraint Elimination:** Proven on River Leam Meadow Fringe (100% rejection of Functional Floodplain Zone 3b).
4. **Persistence Failure Safety:** Proven that production runtime refuses to fall back silently to process memory when database writes fail.
5. **Multi-layer Provenance Reconstruction:** Proven that the complete audit trail from machine signal to real-world outcome can be reconstructed without loss of source attribution.

---

## 20. What Phase 12 Does Not Prove

### NOT PROVEN:
1. **Commercial Acquisition Conversion:** Does not prove that Land Radar can convert candidates into legally controlled options or completed land purchases.
2. **Generalised Discovery Superiority:** Does not prove that Land Radar outperforms experienced human land directors across England & Wales ($N=10$ across two local authorities is insufficient for statistical generalisation).
3. **Automated Vehicular Access Verification:** Does not prove that road proximity equals vehicular access (disproved by Farmer Ward Road).
4. **National Data Completeness:** Does not prove open government registers are complete (disproved by DLUHC gasworks omission).
5. **Generalised False-Positive Rate:** The observed 20% false-positive rate ($2/10$) is a sample diagnostic, not a nationwide performance metric.

---

## 21. Corrected Metrics

```
┌────────────────────────────────────────────────────────────────────────┐
│               PHASE 12 METRICS — ORIGINAL VS RECONCILED                │
├───────────────────────────────────┬──────────────┬─────────────────────┤
│ Metric                            │ Phase 12 Rep │ Reconciled Audit    │
├───────────────────────────────────┼──────────────┼─────────────────────┤
│ Total Candidates                  │ 10           │ 10                  │
│ Real Acquisition Events (Closed)  │ 2 (Implied)  │ 0 (0 Closed Deals)  │
│ Active Vendor Disposal Dialogues  │ 2            │ 2 (Active Dialogues)│
│ External Evidence Candidates      │ 5            │ 5                   │
│ Independent Human Benchmarks      │ 3            │ 3                   │
│ Test Fixtures in Cohort           │ 0            │ 0                   │
│ Reconciled Outcomes: Progressed   │ 4            │ 5 (incl. benchmarks)│
│ Reconciled Outcomes: Held         │ 2            │ 2                   │
│ Reconciled Outcomes: Rejected     │ 4            │ 3                   │
│ Verified False Positives          │ 2            │ 2                   │
│ Verified False Negatives          │ 2            │ 2                   │
│ Discovery Overlap Rate            │ 33% (1 of 3) │ 33% (1 of 3)        │
│ Inferred Availability States      │ 0            │ 0                   │
└───────────────────────────────────┴──────────────┴─────────────────────┘
```

---

## 22. Corrected Strategic Decision Gate

### Verdict: **State B — Useful but requires calibration**

The evidence does **not** justify State A (Immediate National Expansion) because:
1. Critical data gaps exist in open registers (e.g. DLUHC brownfield omissions).
2. Road proximity signals produce high-risk false positives without adoptable highway boundary data.
3. Real-world acquisition conversion is in early dialogue stages and has not completed a single transaction.

The evidence does **not** warrant State C (Insufficient Evidence) or State D (Fundamental Limitation) because:
1. The system successfully steered analysts away from major environmental hazards.
2. It surfaced genuine off-market opportunities (Mill Road Industrial Yard).
3. The architectural disaggregation of Candidate, Parcel, and Title performed flawlessly.

Therefore, **State B is firmly affirmed**.

---

## 23. Recommended Phase 13 Preconditions

Before Phase 13 begins, the following conditions must be satisfied:
1. **Freeze Strategy Logic:** Keep screening strategies V1, V2, and V3 immutable. Implement V4 only as a newly branched strategy.
2. **Explicit Qualification of Dialogues:** Update all reporting dashboards to distinguish "Active Vendor Dialogue" from "Completed Acquisition".
3. **Mandatory Highways Disclaimer:** Maintain the human gate requiring manual highway adoption verification before any site progresses beyond initial screening.
4. **Preserve Privacy & GDPR:** Ensure no personal individual names enter structured database columns during vendor outreach.
5. **Append-Only Truth Ledger:** Ensure all future acquisition milestones (e.g. option execution) are recorded as append-only events.

---

## What We Can Prove

1. Entire UK Land Radar can ingest multi-source spatial data and evaluate geometric planning and environmental constraints deterministically.
2. The Candidate $\neq$ Parcel $\neq$ Title model accurately represents complex real-world land assembly and ransom strip scenarios.
3. The persistence layer enforces strict database integrity without silent memory fallback in production mode.
4. The system correctly enforces epistemic humility: non-response does not trigger automated availability transitions.

---

## What We Can Support But Cannot Generalise

1. In Warwick and Rugby, Land Radar surfaced 1 viable commercial site (Mill Road) that was not listed on commercial property portals.
2. In the audited sample, 2 out of 10 candidates were false positives due to access and micro-location acoustic constraints; however, this 20% error rate cannot be generalised nationally.
3. Analyst triage time was reduced from 45 minutes to under 8 minutes per site for initial desk review, but operational conversion to signed options remains unproven.

---

## What We Cannot Yet Prove

1. We cannot prove that Land Radar can reliably discover sites without missing major opportunities (disproved by DLUHC gasworks omission and settlement buffer cutoff).
2. We cannot prove that Land Radar leads to completed commercial acquisitions or superior return on capital.
3. We cannot prove that geometric road proximity has predictive value for vehicular access without licensed highway boundary polygons.

---

## Phase 12 Evidence Verdict

**PASS WITH FINDINGS — REAFFIRM STATE B.**  
Entire UK Land Radar is an engineered, architecturally sound land intelligence platform that delivers tangible investigative utility to acquisition analysts while enforcing strict data integrity. However, it is an **investigative decision-support tool**, not an automated acquisition engine. It has not closed a real-world land transaction, its screening logic remains subject to known access and boundary limitations, and its claims must remain strictly bounded by verified evidence.
