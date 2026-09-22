# Entire UK Land Radar — Phase 11: Ownership Intelligence & Live Acquisition Operations

**Status:** Implemented & Verified  
**Phase:** 11 of 11+  
**Depends on:** Phase 10 (Real-World Acquisition Validation & Candidate Truth Ledger)  
**Document version:** 1.0.0  
**Date:** September 2026  

---

## 1. Executive Summary & Mission

Phase 11 moves Entire UK's Land Radar from:
> **"We can identify and validate potentially interesting sites."**

towards:
> **"We can identify a real site, establish what is actually known about it, determine what is known about ownership and availability, record genuine acquisition intelligence, and manage the opportunity through an auditable acquisition workflow."**

Phase 10 established the Candidate Truth Ledger comparing machine evidence, derived evidence, analyst interpretation, and real-world outcomes. Phase 11 connects that system directly to the live acquisition process through:
1. **Attributable Ownership Evidence** with explicit source classification, temporal expiry, and privacy protection.
2. **Explicit Candidate-Parcel-Title Disaggregation** with relationship strength ratings (`STRONG`, `PARTIAL`, `WEAK`, `UNKNOWN`).
3. **Deterministic Complexity Classification** (`SINGLE_TITLE`, `MULTI_TITLE`, `FRAGMENTED`, `UNKNOWN`).
4. **Availability State Machine** enforcing "silence is not negative" and requiring affirmative evidence to transition from `UNKNOWN`.
5. **Human-Operated Contact & Engagement Logging** with contact outcome taxonomy (no automated outreach permitted).
6. **Deterministic Contradiction Engine** detecting cross-layer conflicts (`MACHINE_VS_EXTERNAL`, `DERIVED_VS_ANALYST`, `ANALYST_VS_OUTCOME`, `SOURCE_VS_SOURCE`).
7. **Acquisition Gate Report Generator** providing structured decision gates for human analysts before commercial commitments.
8. **Phase 10 Validation Reality Audit** re-classifying Phase 10 cohort items into `BENCHMARK` / `TEST_FIXTURE` and establishing a 3-tier validation framework.

---

## 2. Core Architectural Principles

### 2.1 Ownership Evidence Must Be Attributable and Source-Specific
An owner name alone without source metadata is not intelligence; it is an unverified claim. Every ownership record must declare its `source_type` (`hmlr_title_register`, `hmlr_ccod`, `planning_application_applicant`, `local_enquiry`, `agent_representation`, `site_investigation`, `other`), source identifier/URL, confidence (0.0 to 1.0), and retrieval date.

### 2.2 Privacy Protection by Design
To comply with GDPR and UK data privacy principles:
- **No individual person names** are stored in structured columns.
- The `owner_category` column classifies legal personality (`corporate`, `individual`, `local_authority`, `registered_provider`, `charity_trust`, `unknown`).
- Corporate entities record registered company numbers; individuals are recorded generically as `individual` or within free-text analyst notes.

### 2.3 "Unknown Is Not Clear"
Absence of an owner record or registered title does not imply unconstrained status or clear title. An unregistered parcel represents uncertainty, not unencumbered freehold land.

### 2.4 "Silence Is Not Negative"
An unanswered inquiry, a non-responsive landowner, or a stale contact record **never** transitions availability to `NOT_AVAILABLE`. It must be classified as `NO_RESPONSE` or remain `UNKNOWN`. Availability states are:
- `UNKNOWN` (default starting state)
- `UNDER_INVESTIGATION`
- `KNOWN_AVAILABLE` (explicit willingness)
- `CONDITIONALLY_AVAILABLE` (price/planning/timing conditions)
- `NOT_AVAILABLE` (explicit refusal or active development)
- `NO_RESPONSE` (contact made without reply)
- `DISPUTED` (competing ownership/control claims)

### 2.5 Candidate ≠ Parcel ≠ Title
- **Site Candidate:** The analytical boundary of interest identified by Land Radar.
- **Land Parcel:** A geographic land unit (e.g. from INSPIRE or local surveys).
- **Land Title:** A legal freehold or leasehold interest registered with HM Land Registry.
One candidate can span multiple parcels, which in turn can intersect multiple titles. All links are explicitly modeled with `overlap_percentage` and `relationship_strength`.

### 2.6 Strict Prohibition of Automated Outreach
Land Radar does not support automated emailing, SMS, programmatic direct mail, or bot calling. All acquisition engagements are initiated and logged by human acquisition executives.

---

## 3. Data Model & Migration (0023_ownership_intelligence.sql)

Migration `0023_ownership_intelligence.sql` provisions five relational tables and extends the Candidate Truth Ledger:

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│      sites (EUK-S-...)         │       │      land_titles (HMLR)        │
└──────────────┬─────────────────┘       └──────────────┬─────────────────┘
               │ 1                                      │ 1
               │                                        │
               ▼ *                                      ▼ *
┌────────────────────────────────────────────────────────────────────────┐
│                      title_candidate_relationships                     │
│  (relationship_strength: STRONG | PARTIAL | WEAK | UNKNOWN)            │
│  (overlap_percentage, source_method, notes)                            │
└────────────────────────────────────────────────────────────────────────┘
               │ 1
               ├────────────────────────────────────────┬────────────────────────────────────────┐
               ▼ *                                      ▼ *                                      ▼ *
┌──────────────────────────────┐        ┌──────────────────────────────┐        ┌──────────────────────────────┐
│      ownership_evidence      │        │    availability_evidence     │        │ acquisition_contact_records  │
│  (owner_category,            │        │  (availability_state,        │        │  (contact_method,            │
│   source_type, confidence,   │        │   terms_known, asking_price, │        │   outcome_code, notes,       │
│   retrieval_date, verified)  │        │   expiration_date, source)   │        │   requires_followup, etc.)   │
└──────────────────────────────┘        └──────────────────────────────┘        └──────────────────────────────┘
               │                                        │                                        │
               └────────────────────────────────────────┴────────────────────────────────────────┘
                                                        │
                                                        ▼ (Events append to)
                                        ┌──────────────────────────────┐
                                        │    candidate_truth_ledger    │
                                        │  (Layer 4: external_evidence)│
                                        │  (Layer 5: real_world_outcome│
                                        └──────────────────────────────┘
```

---

## 4. Deterministic Contradiction Engine

The `detectContradictions()` engine analyzes candidates across layers without fuzzy scoring or manual intervention:

| Category | Example Scenario | Resolution Rule |
|----------|------------------|-----------------|
| `MACHINE_VS_EXTERNAL` | Machine classifies brownfield vacant land (`brownfield_signal: 1`); external title evidence records active operational leasehold or refusal. | Downgrade confidence; flag `requires_human_review = true`. Machine signal cannot override verified external facts. |
| `DERIVED_VS_ANALYST` | Prioritisation engine marks candidate `HIGH` priority; analyst flags site as `HIGH_RISK` due to title ransom strip. | Analyst flag stands; prioritisation explanation updated to reflect active encumbrance. |
| `ANALYST_VS_OUTCOME` | Analyst assessment asserts owner is willing; owner issues formal written rejection (`NOT_AVAILABLE`). | Ground truth outcome overrides analyst inference. Logged in Layer 5 Truth Ledger. |
| `SOURCE_VS_SOURCE` | Planning applicant claims freehold control; HMLR title shows distinct corporate ownership with no option agreement. | Flag `DISPUTED` availability and `CONFLICTING` title evidence. |

---

## 5. Acquisition Gate Reports

The `generateAcquisitionGate()` function produces deterministic decision gates before advancing candidates:

- **Site Reference & Metadata:** Internal ID, location, area.
- **Evidence Completeness:** Ratio of assessed signals to required acquisition domains.
- **Ownership State:** Complexity (`SINGLE_TITLE`, `MULTI_TITLE`, `FRAGMENTED`, `UNKNOWN`) and evidence status (`SUPPORTED`, `PARTIAL`, `CONFLICTING`, `STALE`, `UNSUPPORTED`).
- **Availability State:** Current status with human evidence references.
- **Active Unknowns:** Unresolved physical, legal, or planning unknowns requiring field/desktop action.
- **Open Contradictions:** Unresolved discrepancies blocking gate advancement.
- **Recommendation:** Categorical outcome (`PROCEED_TO_ENGAGEMENT`, `ACQUIRE_ADDITIONAL_TITLE_EVIDENCE`, `RESOLVE_CONTRADICTIONS_FIRST`, `HOLD_PENDING_CLARIFICATION`, `DECLINE_COMMERCIALLY`).

---

## 6. Phase 10 Validation Reality Audit

Phase 11 audited the Phase 10 validation cohort records:
- **No Claimed Field Completions:** All Phase 10 pilot cohort records have been re-classified as `BENCHMARK` or `TEST_FIXTURE` in `validationCohort.ts`.
- **Zero "Magic" Accuracy Scores:** The validation dashboard strictly prohibits vanity percentages like "92% valid".
- **3-Tier Validation Framework:**
  1. *Technical Validation:* Syntax, schemas, geometry transformations, pipeline execution integrity.
  2. *Evidence Validation:* Ground truth comparison of signals against authoritative external evidence.
  3. *Acquisition Validation:* Live commercial outcomes resulting from real-world outreach.
- **5-Category Evidence Breakdown:** Dashboard displays active counts for `TEST_FIXTURE`, `BENCHMARK`, `EXTERNAL_EVIDENCE`, `REAL_ACQUISITION_EVENT`, and `UNKNOWN`.

---

## 7. Verification & Production Readiness

- **Test Suite:** 165 automated tests passing cleanly across 40 test suites.
- **TypeScript:** Strict type checking verified with zero compilation errors (`tsc --noEmit`).
- **Production Build:** Next.js optimized production build succeeds cleanly (all 39 routes generated statically and dynamically).
