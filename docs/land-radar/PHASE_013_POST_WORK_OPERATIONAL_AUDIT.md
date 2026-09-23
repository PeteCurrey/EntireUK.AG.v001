# Entire UK Land Radar — Phase 13 Post-Work Operational Audit

**Audit Date:** 2026-09-23  
**Audit Scope:** Phase 13 Acquisition Operations Workbench & Opportunity Execution  
**Subject Under Audit:** Commit `2fe9da7` on branch `main`  
**Audited Cohort:** `COHORT-LIVE-001` (10 genuine investigated candidates across Warwick District & Rugby Borough)  
**System State:** 207 passing automated tests (61 suites), Next.js 15 production build successful (61/61 static pages)  
**Audit Standard:** Strict epistemic chain ($$\text{Fact} \rightarrow \text{Derived Evidence} \rightarrow \text{Interpretation} \rightarrow \text{Human Action} \rightarrow \text{Real-World Outcome}$$). Zero financial or physical fictions.

---

## 1. Executive Summary

Phase 13 transitioned Entire UK Land Radar from a spatial intelligence engine into an interactive **Acquisition Operations Workbench**. The workbench provides:
- An operational queue categorising candidates across 7 operational workstreams.
- A candidate workstation with 6 specialised operational tabs (Overview, Evidence Checklist, Contradictions, Contacts & Outreach, Acquisition Gate, and Audit Timeline).
- A deterministic next-action engine computing categorical operational directives.
- An 8-dimensional evidence checklist tracking epistemic completeness.
- Sourced contact tracking with follow-up scheduling.
- Formal contradiction resolution with mandatory rationale.
- Chronological timeline reconstruction blending all 4/5 Truth Ledger layers.

This post-work audit performed a **forensic, read-only audit** of the Phase 13 runtime against the genuine Phase 12 validation cohort (`COHORT-LIVE-001`) and the implemented codebase.

### Audit Verdict
**STATE B — OPERATIONAL BUT REQUIRES CORRECTION**

The workbench is genuinely functional and operational. Analysts can navigate queues, review candidates, track contact outreach without assuming silence implies unavailability, resolve contradictions with auditable rationale, and inspect evidence checklists without automated financial fictions (no GDVs, RLVs, or automated dwelling predictions).

However, the audit identified **five specific defects** that must be corrected before Phase 14:
1. **Server-Side Lifecycle Validation & Auth Defect (HIGH):** Server actions in `actions.ts` do not authenticate user sessions, and `recordOutcome()` does not verify `previous_state` against the database's actual current state, allowing potential lifecycle jumps if called directly via RPC.
2. **Artificial Completeness Gating for Contacts (MEDIUM):** The next-action engine requires verified HMLR title status before allowing `CONTACT_OWNER_OR_AGENT`, unnecessarily blocking outreach to authorized commercial selling agents who are already publicly marketing a site.
3. **Incomplete Next-Action Rule Coverage (MEDIUM):** Three of the 14 declared next-action codes (`PLACE_ON_HOLD`, `OBTAIN_MARKET_EVIDENCE`, `REVIEW_LOCAL_PLAN`) have no triggering logic in `nextActionEngine.ts`, causing commercially held candidates to receive `INVESTIGATE_AVAILABILITY` rather than `PLACE_ON_HOLD`.
4. **Truth Ledger Layer Assignment Inconsistency (MEDIUM):** Phase 10 services log external evidence under `real_world_outcome`, while Phase 11 services log external evidence under `external_evidence`.
5. **Overstated Technical Claims Regarding Immutability (LOW):** The Truth Ledger was documented as "immutable" and "tamper-evident", but lacks cryptographic hash chaining and database-level update/delete prevention triggers. Immutability is enforced strictly by application-level TypeScript conventions.

---

## 2. Phase 12 Cohort Reconciliation (`COHORT-LIVE-001`)

All 10 genuine investigated candidates from `COHORT-LIVE-001` were reconciled against the Phase 13 Acquisition Operations Workbench runtime.

| Candidate ID | Site Name & Location | Classification | Phase 12 Evidence Status | Phase 13 Lifecycle State | Phase 13 Next Action | Evidence Checklist Completeness | Outstanding Evidence | Active Contradictions | Contact State | Follow-Up State | Acquisition Gate Readiness | Truth Ledger Events |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EUK-S-WARWICK-BF-002** | Montague Road Commercial Yard, Warwick | Surfaced & Progressed | `REAL_ACQUISITION_EVENT` | `INVESTIGATING` / `PROGRESSED` | `COMPLETE_ACQUISITION_GATE` | 8/8 Known | None (Freehold single title WK89210 verified) | 0 active | `INTERESTED` (Agent Bromwich Hardy) | None (Q1 2027 vacant possession) | Ready for formal review | 5 events (L1–L4) |
| **EUK-S-WARWICK-BF-004** | Former Depot, Farmer Ward Road, Kenilworth | False Positive (Highways Ransom) | `EXTERNAL_EVIDENCE` | `REJECTED_ACCESS` | `REVIEW_REJECTION` | 6/8 Known, 1 Contradicted, 1 Unknown | Third-party ransom strip release terms | 1 active (Road proximity vs County Highways audit) | `NOT_INTERESTED` (Ransom demanded £350k) | None (Terminal) | Blocked by access failure | 4 events (L1–L4) |
| **EUK-S-WARWICK-BF-001** | Former Ford Foundry Site, Princes Drive, Leamington Spa | Commercial Hold (Contamination) | `EXTERNAL_EVIDENCE` | `INVESTIGATING` (Commercially Held) | `INVESTIGATE_AVAILABILITY` *(Defect 3: Should be `PLACE_ON_HOLD`)* | 7/8 Known, 1 Unknown | Phase 2 Remediation deduction agreement (£1.85m) | 0 active | `INTERESTED` (Negotiating deduction) | Scheduled follow-up pending vendor response | Held pending price adjustment | 4 events (L1–L4) |
| **EUK-HB-WARWICK-001** | Old Warwick Road Gasworks, Leamington Spa | Data False Negative (Human Benchmark) | `BENCHMARK` | `ANALYST_REVIEW` / `PROGRESSED` | `VERIFY_TITLE` | 4/8 Known, 4 Unknown | Ingestion boundary polygon, title register | 0 active | `INTERESTED` (National Grid Property) | Pre-app consultation due | Not ready (Missing cadastral boundary) | 3 events (L3–L4) |
| **EUK-S-RUGBY-BF-001** | Former Alstom Works, Mill Road, Rugby | Surfaced & Progressed | `REAL_ACQUISITION_EVENT` | `INVESTIGATING` / `PROGRESSED` | `COMPLETE_ACQUISITION_GATE` | 8/8 Known | None (Freehold single title WK142981 verified) | 0 active | `INTERESTED` (Bromwich Hardy instructed) | Head of terms drafting | Ready for formal review | 4 events (L1–L4) |
| **EUK-S-RUGBY-BF-002** | Railway Terrace Depot / Sidings, Rugby | False Positive (Acoustic Market Mismatch) | `EXTERNAL_EVIDENCE` | `REJECTED_MARKET` | `REVIEW_REJECTION` | 7/8 Known, 1 Unknown | None (Acoustic depression £235/sq ft vs £310/sq ft) | 0 active | `INTERESTED` (Vendor willing, scheme unviable) | None (Terminal) | Blocked by negative land residual | 4 events (L1–L4) |
| **EUK-HB-RUGBY-001** | Newbold Road Commercial Estate, Rugby | Rule False Negative (Human Benchmark) | `BENCHMARK` | `ANALYST_REVIEW` / `PROGRESSED` | `VERIFY_TITLE` | 5/8 Known, 3 Unknown | Title search, settlement rule adjustment | 0 active | `INTERESTED` (Direct agent briefing) | Follow-up due | Not ready (Title unverified) | 3 events (L3–L4) |
| **EUK-S-WARWICK-BF-003** | Cape Road Works & Depot, Warwick | Multi-Title Assembly / Progressed | `EXTERNAL_EVIDENCE` | `INVESTIGATING` | `OBTAIN_ADDITIONAL_TITLE` | 7/8 Known, 1 Unknown | Secondary title register WK29102 resolution | 0 active | `INTERESTED` (Corporate co-proprietors) | Legal assembly review | Held pending multi-title resolution | 4 events (L1–L4) |
| **EUK-S-WARWICK-EX-001** | River Leam Meadow Fringe, Leamington Spa | Correct Exclusion (Floodplain Zone 3b) | `BENCHMARK` | `REJECTED_ENVIRONMENTAL` | `REVIEW_REJECTION` | 5/8 Known, 3 Not Applicable | None (Hydrological inundation confirmed) | 0 active | None (No contact initiated) | None (Terminal) | Blocked by statutory policy | 3 events (L1, L2, L4) |
| **EUK-S-RUGBY-BF-003** | Wood Street Depot / Hunters Lane, Rugby | Ambiguous / Title & Infrastructure Hold | `EXTERNAL_EVIDENCE` | `INVESTIGATING` | `FOLLOW_UP_CONTACT` | 6/8 Known, 1 Contradicted, 1 Unknown | Easement standoff agreement, secondary titles | 1 active (Access/easement) | `NO_RESPONSE` (Letter sent > 21 days ago) | Secondary follow-up due | Held pending vendor response | 5 events (L1–L4) |

---

## 3. Five Required Real Candidate Walkthroughs

### Walkthrough A: Verified Ownership Candidate
* **Candidate:** `EUK-S-WARWICK-BF-002` (Montague Road Commercial Yard, Warwick)
* **What We Know:** 1.15 ha brownfield site (former commercial transport yard); Local Plan Policy DS15 allocation; single freehold title registered under HMLR Title Number `WK89210`.
* **What Is Verified:** Cadastral boundary exactly matches title plan; sole proprietor confirmed as commercial trading company; sole selling agent Bromwich Hardy formally instructed for freehold disposal with vacant possession targeted Q1 2027.
* **What Remains Unknown:** Ground contamination desk study (Phase 1 Geo-environmental) pending completion.
* **Next Action:** `COMPLETE_ACQUISITION_GATE` (All foundational evidence verified; convene formal commercial review).
* **Acquisition Gate:** Epistemic completeness 100%; ownership verified; availability affirmed; zero contradictions. Proceed to formal commercial gate decision.
* **Logical Consistency:** The next action is strictly consistent with the evidence chain.

---

### Walkthrough B: Fragmented Title Candidate
* **Candidate:** `EUK-S-WARWICK-BF-003` (Cape Road Works & Depot, Warwick)
* **Disaggregation Verified:** Candidate ($\text{EUK-S-WARWICK-BF-003}$) $\neq$ Parcel ($\text{WDC/BR/003}$) $\neq$ Title ($\text{WK29101} + \text{WK29102}$).
* **Multi-Title Visibility:** The workbench displays both titles separately with explicit relationship strengths: `WK29101` (primary operational yard, `STRONG`) and `WK29102` (rear access and sub-station curtilage, `WEAK`).
* **Absence of Ownership Assumption:** System does not merge proprietors or assume unified disposal intent despite common corporate group ancestry.
* **Next Action:** `OBTAIN_ADDITIONAL_TITLE` (Obtain Overlapping Title Plans: Complete assembly requires resolving secondary title register WK29102).
* **Acquisition Gate:** Flags `MULTI_TITLE` complexity; assembly risk is explicitly exposed to the analyst rather than hidden behind an aggregated score.

---

### Walkthrough C: No-Response Candidate
* **Candidate:** `EUK-S-RUGBY-BF-003` (Wood Street Depot / Hunters Lane, Rugby)
* **Outreach History:** Formal introductory acquisition letter dispatched to registered proprietor address. No response received after 21 days.
* **Preservation of Epistemic Principle:**
  $$\text{NO\_RESPONSE} \neq \text{NOT\_AVAILABLE}$$
  $$\text{Silence} \neq \text{Rejection / Unwillingness}$$
* **System State:**
  - Candidate remains in `INVESTIGATING` lifecycle state (not moved to `REJECTED_OTHER`).
  - Availability state remains strictly `UNKNOWN`.
  - Queue classification places site in `WAITING_FOR_RESPONSE` and `FOLLOW_UPS_DUE`.
* **Follow-Up State:** Next action evaluates to `FOLLOW_UP_CONTACT` ("Initial contact sent 21 days ago with no response. Issue polite secondary follow-up or attempt alternate communication channel").

---

### Walkthrough D: Active Contradiction Candidate
* **Candidate:** `EUK-S-WARWICK-BF-004` (Former Depot, Farmer Ward Road, Kenilworth)
* **Contradiction Structure:**
  - **Evidence A (Machine / Layer 1):** Geometric road proximity signal recorded 45m distance to adopted Farmer Ward Road.
  - **Evidence B (External / Layer 4):** Warwickshire County Council Highway Authority Audit (`WCC-HIGHWAY-AUDIT-4412`) proved adopted highway terminates 0.5m short of site boundary, separated by a third-party ransom strip under title `WK112044`.
* **Attribution & Preservation:** Both pieces of evidence remain independently attributable in the Truth Ledger; neither overwrites the other.
* **Workflow Control:**
  - Contradiction is surfaced prominently with severity `CRITICAL`.
  - Lifecycle progression is blocked from advancing to `CONTACTED` or `CONTROLLED`.
  - Next Action evaluates to `VERIFY_ACCESS` ("Resolve Highways & Access Contradiction: Physical road adjacency does not guarantee legal vehicular ransom clearance").
* **Resolution Governance:** Resolving the contradiction requires explicit analyst input with a mandatory substantive rationale (minimum 5 characters).

---

### Walkthrough E: Access-Risk / Rejection Candidate
* **Candidate:** `EUK-S-WARWICK-BF-004` (Kenilworth)
* **Physical Road Proximity vs Legal Access:**
  $$\text{Geometric Proximity} \neq \text{Adopted Highway Boundary}$$
  $$\text{Adopted Highway Boundary} \neq \text{Vehicular Access Right}$$
* **System Behaviour:** The engine explicitly prevented OS road proximity from translating into a legal access clearance. Upon entry of external highway audit evidence refuting access, the candidate was escalated to `REJECTED_ACCESS`.
* **Terminality Verification:** In state `REJECTED_ACCESS`, the next-action engine returned `REVIEW_REJECTION`. The candidate was permanently removed from active operational queues.

---

## 4. Audit of the 14 Next-Action Rules

The deterministic next-action engine in `src/lib/land-radar/acquisitions/nextActionEngine.ts` was audited rule-by-rule:

| Code | Action Label | Trigger Evidence | Required Prerequisites | Blocking Conditions | Example Candidate | Status in Engine |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `1. VERIFY_TITLE` | Verify Official Title Register (HMLR) | `!hasVerifiedTitle` (No verified ownership evidence or strong title link) | Candidate not in terminal rejection, no active contradictions | Active contradiction, severe physical constraint | `EUK-HB-WARWICK-001` | **Fully Implemented** |
| `2. OBTAIN_ADDITIONAL_TITLE` | Obtain Overlapping Title Plans | `MULTI_TITLE` or `FRAGMENTED` complexity with unverified secondary titles | Primary title verified, no active contradictions | Active contradiction, unverified primary title | `EUK-S-WARWICK-BF-003` | **Fully Implemented** |
| `3. RESOLVE_TITLE_CONTRADICTION` | Resolve Title / Ownership Contradiction | Unresolved non-access contradiction detected across evidence layers | Not in terminal rejection state | Terminal rejection state | Title vs LPA Brownfield dispute | **Fully Implemented** |
| `4. VERIFY_ACCESS` | Resolve Highways & Access Contradiction / Investigate Access | (a) Unresolved access contradiction, OR (b) Road proximity signal known with value = 0 | Not in terminal rejection state | Terminal rejection state | `EUK-S-WARWICK-BF-004` | **Fully Implemented** |
| `5. INVESTIGATE_AVAILABILITY` | Investigate Commercial Availability | Title verified, planning signal known, but `availabilityState === 'UNKNOWN'` | Verified title, no contradictions | Unverified title, active contradictions, known availability | Unmarketed verified title | **Fully Implemented** |
| `6. CONTACT_OWNER_OR_AGENT` | Initiate Introductory Acquisition Enquiry | `availabilityState` is affirmative (`AVAILABLE`, `POTENTIALLY_AVAILABLE`, `UNDER_DISCUSSION`), contacts = 0 | Verified title/proprietor, zero prior contacts | Prior contacts exist, unverified title, unknown availability | `EUK-S-RUGBY-BF-001` (prior to first call) | **Fully Implemented** |
| `7. FOLLOW_UP_CONTACT` | Execute Scheduled Contact Follow-Up | Prior contact exists AND (follow-up date reached OR `NO_RESPONSE` $\ge$ 7 days) | Prior contact logged, follow-up due date reached | Follow-up date in future, follow-up status = 'completed' | `EUK-S-RUGBY-BF-003` | **Fully Implemented** |
| `8. OBTAIN_MARKET_EVIDENCE` | Obtain Local Market Comparables | Insufficient Price Paid comps within search radius | Cadastral foundation verified | Never emitted by engine | None | **DEFECT: Dead Code** |
| `9. REVIEW_PLANNING_HISTORY` | Review LPA Planning History & SHLAA | Planning activity signal is `unknown` or unreviewed | Title verified, no contradictions | Planning signal already known, unverified title | Title verified, planning unassessed | **Fully Implemented** |
| `10. REVIEW_LOCAL_PLAN` | Review Adopted Local Plan & Allocations | Strategic policy allocation unreviewed | Cadastral foundation verified | Never emitted by engine | None | **DEFECT: Dead Code** |
| `11. INVESTIGATE_ENVIRONMENTAL_CONSTRAINT` | Commission Flood & Environmental Desk Study | Flood risk signal is known with value = 0 (high flood risk / constraint) | Not in terminal rejection state, no contradictions | Flood risk clear or unknown, active contradictions | `EUK-S-WARWICK-EX-001` | **Fully Implemented** |
| `12. COMPLETE_ACQUISITION_GATE` | Convene Formal Acquisition Gate Review | Title verified, zero contradictions, availability affirmative (`AVAILABLE`/`UNDER_DISCUSSION`) | Verified title, no contradictions, confirmed availability | Unverified title, active contradictions, unknown availability | `EUK-S-WARWICK-BF-002` | **Fully Implemented** |
| `13. PLACE_ON_HOLD` | Place Candidate on Operational Hold | Commercial decision = `HOLD` or unresolved infrastructure / contamination hold | Candidate not rejected | Never emitted by engine | `EUK-S-WARWICK-BF-001` | **DEFECT: Dead Code** |
| `14. REVIEW_REJECTION` | Review Terminal Rejection Rationale | Lifecycle stage in terminal rejection (`REJECTED_*`) | Candidate was rejected | Non-rejection state | `EUK-S-RUGBY-BF-002` | **Fully Implemented** |

### Forensic Analysis of the 6 Questions:
1. **What causes each action to fire?** Deterministic evaluation of candidate state, signals, title evidence, contradictions, and contact timeline.
2. **What evidence is required?** Sourced evidence records in database or memory fixture.
3. **What evidence prevents it?** Higher-priority blockers (rejections, active contradictions, physical constraints).
4. **Is it deterministic?** Yes. Identical input state always yields the exact same next action code, priority, and rationale.
5. **Can it ever recommend an unsupported commercial action?** No. Outreach is blocked if availability is unknown or title is unverified. However, `COMPLETE_ACQUISITION_GATE` currently triggers upon title + availability without verifying whether planning or access checklists are complete.
6. **Can it fire while a contradiction remains unresolved?** No. Active contradictions block all operational progression and divert the next action to `RESOLVE_TITLE_CONTRADICTION` or `VERIFY_ACCESS`.

---

## 5. Audit of the Contact Gate

### Finding: Mixed Implementation with Artificial Completeness Gating (Defect 2)
The implementation claims:
> *"Contact cannot be recommended before title and ownership are verified."*

Inspection of `nextActionEngine.ts` lines 140–155 reveals:
```typescript
const hasVerifiedTitle =
  ownershipSummary.ownership_evidence_records.some((e) => e.evidence_status === 'VERIFIED') ||
  ownershipSummary.title_relationships.some((r) => r.relationship_strength === 'STRONG');

if (!hasVerifiedTitle) {
  return {
    code: 'VERIFY_TITLE',
    label: 'Verify Official Title Register (HMLR)',
    ...
  };
}
```

### Analysis:
- **Off-Market / Cold Outreach:** This is **Correct Evidence Gating** (A). For unsolicited owner enquiries, contacting an occupant or inferred owner without title verification risks contacting the wrong party or alerting tenants.
- **Agency-Marketed Sites:** This is **Artificial Completeness Gating** (B). When a site is openly marketed by an instructed commercial agent (e.g. Bromwich Hardy for `EUK-S-RUGBY-BF-001`), the analyst has high-confidence evidence identifying the authorized disposal representative. Forcing an analyst to pull the official HMLR title register before placing an introductory enquiry call to the marketing agent is an artificial barrier that produces `CONTACT_BLOCKED_UNNECESSARILY`.

---

## 6. Audit of Evidence Checklist

The Evidence Checklist Engine (`checklistEngine.ts`) evaluates all 8 dimensions:

| Dimension | Primary Sources | Supported Epistemic States | Stale Threshold | Upstream Transparency Note |
| :--- | :--- | :--- | :--- | :--- |
| **1. Site** | PostGIS ST_Transform, Local Authority Cadastral Polygon | `KNOWN`, `UNKNOWN` | N/A | Exposes area discrepancies $>10\%$ |
| **2. Ownership** | HMLR Title Register, INSPIRE Index, Ownership Service | `KNOWN`, `UNKNOWN`, `CONTRADICTED`, `STALE` | $> 180$ days | Conflicting proprietor records trigger `CONTRADICTED` |
| **3. Availability** | Direct Vendor / Agent Dialogue, Marketing Particulars | `KNOWN`, `UNKNOWN`, `NOT_APPLICABLE` | $> 180$ days | `UNKNOWN` explicitly notes: *Titleholder existence $\neq$ willingness to sell* |
| **4. Planning** | LPA Planning Register, DLUHC Adopted Policies Map | `KNOWN`, `UNKNOWN` | $> 180$ days | Absence of planning history $\neq$ absence of planning potential |
| **5. Access** | OS Features API (WFS), Local Highways Register | `KNOWN`, `UNKNOWN`, `UNAVAILABLE`, `CONTRADICTED` | $> 180$ days | **Truthfully exposes OS OpenRoads 403 as `UNAVAILABLE`** |
| **6. Market** | HMLR Price Paid Data API | `KNOWN`, `UNAVAILABLE` | $> 180$ days | `UNAVAILABLE` notes: *Absence of sales $\neq$ absence of market* |
| **7. Capacity** | Land Radar Capacity Engine | `KNOWN`, `UNKNOWN` | N/A | Exposes net developable area deductions (zero dwelling guesses) |
| **8. Acquisition** | Outcome State Machine, Contradiction Engine | `KNOWN`, `CONTRADICTED` | N/A | Unresolved contradictions set dimension to `CONTRADICTED` |

**Verification:** No `UNKNOWN`, `UNAVAILABLE`, `STALE`, or `CONTRADICTED` states are silently converted to `KNOWN`. Blank values are strictly prohibited.

---

## 7. Audit of Contradiction Resolution

Inspected table `candidate_contradiction_resolutions` and service `recordContradictionResolution`:
- **Original Evidence Immutability:** Resolutions are created as additional records in `candidate_contradiction_resolutions` and `candidate_truth_ledger`. No source signals, parcels, or external evidence records are deleted or mutated.
- **Analyst Attribution:** Every resolution records `resolved_by` and `resolved_at timestamptz DEFAULT now()`.
- **Mandatory Rationale:** `actions.ts` enforces `input.resolution_rationale.trim().length >= 5`. Database column is `NOT NULL`.
- **Deterministic Resolution:** Only `resolution_status === 'RESOLVED'` clears the blocking flag. Other statuses (`DEFERRED_TO_LEGAL`, `ACKNOWLEDGED_MATERIAL`, `UNRESOLVED`) maintain the contradiction as active, preventing premature operational advance.

---

## 8. Truth Ledger Layer Audit

The system architecture defines the separation of evidence into distinct layers:

| Event Type | Layer | Epistemic Justification |
| :--- | :--- | :--- |
| **Source Observation** (`site_geometry_ingested`, `signal_calculated`) | `machine_evidence` (Layer 1) | Raw source data from authoritative external providers (OS, HMLR, EA). |
| **Deterministic Derivation** (`screening_evaluated`, `capacity_calculated`) | `derived_evidence` (Layer 2) | Mathematical or spatial derivations (PostGIS intersections, rule checks). |
| **Contradiction Resolution** (`contradiction_resolution`) | `analyst_interpretation` (Layer 3) | **Analyst evaluative decision.** Resolving a discrepancy is an interpretative judgement, not an automated machine fact or physical discovery. |
| **Lifecycle Transition** (`lifecycle_transition`) | `analyst_interpretation` (Layer 3) | Human commercial hypothesis advancing a site through acquisition stages. |
| **External Document / Third-Party Finding** (`external_evidence_received`) | `external_evidence` / `real_world_outcome` | Independent third-party reports (Highways audit, Phase 2 ESI, planning discussion). |
| **Contact Attempt & Outcome** (`acquisition_contact_attempt`) | `real_world_outcome` (Layer 4/5) | Real-world factual outcome of contacting an external party. |

### Finding: Layer Assignment Inconsistency (Defect 4)
- Migration 0022 defined 4 layers: `machine_evidence`, `derived_evidence`, `analyst_interpretation`, `real_world_outcome`.
- Migration 0023 introduced a 5th layer value: `external_evidence`.
- In `truthLedgerService.ts` line 221, `recordExternalEvidence` records events under `layer: 'real_world_outcome'`.
- In `ownershipService.ts` lines 126, 344, and 589, ownership, availability, and acquisition evidence are recorded under `layer: 'external_evidence'`.
- **Conclusion:** Both services represent external factual corroboration, but use divergent layer keys. This should be normalised.

---

## 9. "Immutable" / "Tamper-Evident" Audit

### Verification of Technical Protections:
- **Append-Only Application Architecture:** The TypeScript services (`truthLedgerService.ts`, `acquisitionService.ts`, `outcomeService.ts`) only expose `insert` and `select` functions. No update or delete methods exist in application code.
- **Database Row-Level Security:** In `0022_candidate_truth_ledger.sql`:
  ```sql
  CREATE POLICY "candidate_truth_ledger_authenticated" ON candidate_truth_ledger
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
  ```
  `FOR ALL` allows `UPDATE` and `DELETE` queries if executed directly by an authenticated database user.
- **Database Triggers:** There are NO `BEFORE UPDATE` or `BEFORE DELETE` triggers throwing exceptions.
- **Cryptographic Chaining:** There is NO hash chaining (`prev_hash`, `hash`, or Merkle tree) in the table schema.

### Audit Verdict:
The Truth Ledger is **append-only by application convention**, but is **NOT technically tamper-evident** (lacks cryptographic verification) and its immutability is **not database-enforced**. Describing it as "tamper-evident" in Phase 13 reports was inaccurate.

---

## 10. Audit of the Acquisition Lifecycle

The lifecycle state machine in `outcomeService.ts` enforces forward progression:

```text
SURFACED → SCREENED → ANALYST_REVIEW → INVESTIGATING → CONTACTED →
UNDER_NEGOTIATION → CONTROLLED → DUE_DILIGENCE → ACQUISITION_AGREED →
ACQUIRED → PLANNING → DEVELOPMENT → REALISATION
```

Rejection branches (`REJECTED_PLANNING`, `REJECTED_MARKET`, `REJECTED_ACCESS`, `REJECTED_TITLE`, `REJECTED_ENVIRONMENTAL`, `REJECTED_ECONOMICS`, `REJECTED_OTHER`) and `REALISATION` are terminal.

### Vulnerability Identified: Server-Side Transition Validation Bypass (Defect 1)
Lines 109–114 of `outcomeService.ts`:
```typescript
export async function recordOutcome(input: RecordOutcomeInput): Promise<CandidateOutcome> {
  if (input.previous_state && !isValidTransition(input.previous_state, input.state)) {
    throw new Error(`Invalid lifecycle transition...`);
  }
```
1. If `input.previous_state` is omitted, the validation check is skipped entirely.
2. `recordOutcome` does not query `getCurrentOutcomeState(input.site_id)` to verify that `input.previous_state` matches the actual current state in the database.
3. In `actions.ts`, `transitionLifecycleAction` accepts `current_state` from the client payload without server-side verification against the database.
4. An unauthenticated caller invoking the Next.js Server Action RPC could jump a site from `SURFACED` directly to `ACQUIRED` or out of a terminal rejection state by spoofing `current_state`.

---

## 11. Audit of the Contact Workflow

Inspected `acquisition_contact_records` and `recordContactAttempt()`:
- **Append-Only History:** Each contact attempt is inserted with a unique UUID. Prior contact attempts are never updated or overwritten.
- **Follow-Up Tracking:** `follow_up_date` and `follow_up_status` persist correctly. Overdue follow-ups correctly surface in the `FOLLOW_UPS_DUE` queue.
- **Attributable Outcomes:** Every contact record logs the analyst identity and creates a corresponding Truth Ledger event.
- **Verification of Contact Sequence:** Tested sequence $\text{CONTACTED} \rightarrow \text{NO\_RESPONSE} \rightarrow \text{FOLLOW\_UP} \rightarrow \text{RESPONSE}$; chronological timeline remained fully intact with zero data loss.

---

## 12. Audit of the Acquisition Gate

Inspected `generateAcquisitionGate()` in `src/lib/land-radar/ownership/acquisitionGate.ts`:
- **Evidence-Readiness Mechanism:** The gate synthesises evidence completeness across all domains, active constraints, and detected contradictions.
- **Zero Financial / Physical Fictions:**
  - Zero automated valuations.
  - Zero Gross Development Values (GDV).
  - Zero Residual Land Values (RLV).
  - Zero automated dwelling-count guesses.
  - Zero synthetic profitability scores.
- **Governance Principle Preserved:** The gate does not issue an automated approval. It explicitly states: *"The analyst makes the acquisition decision. This gate surfaces all relevant facts and exposes epistemic gaps."*

---

## 13. Security Audit

- **API Credentials:** `OS_API_KEY`, `OS_API_SECRET`, and `HMLR_API_KEY` are strictly server-side. No credentials are leaked to client bundles or public endpoints.
- **Row Level Security:** Enabled across all Land Radar tables (`sites`, `candidate_truth_ledger`, `acquisition_contact_records`, `candidate_contradiction_resolutions`).
- **Server Action Authorization Defect (Defect 1):** Next.js Server Actions in `src/app/(internal)/acquisitions/[siteId]/actions.ts` do not inspect user authentication sessions or verify internal role permissions before executing mutations.

---

## 14. Production Persistence Audit

Audited `getPersistenceMode()` in `src/lib/land-radar/db.ts`:
- In `NODE_ENV === 'production'`, persistence mode resolves strictly to `'supabase'`.
- If database credentials are missing or database operations fail in production, the system throws `PersistenceError`.
- **Zero Silent Fallback:** There are no `catch { fallbackToMemory() }` blocks in any production mutation path.

---

## 15. Real Data vs Test Data Audit

- **Live Cohort Integrity:** Confirmed that all 10 candidates in `COHORT-LIVE-001` correspond to authentic geographic land parcels in Warwickshire with genuine statutory references.
- **Zero Test Fixture Contamination:** No synthetic test fixtures (`TEST_FIXTURE`) have entered production history for `COHORT-LIVE-001`.
- **Benchmark Distinction:** Human benchmarks (`EUK-HB-WARWICK-001`, `EUK-HB-RUGBY-001`, `EUK-S-WARWICK-EX-001`) are explicitly flagged with `BENCHMARK` status and identified surveyors.

---

## 16. UI / UX Audit

Audited `/acquisitions` and `/acquisitions/[siteId]`:
- **Answering the 7 Analyst Questions:**
  1. *What is this?* Header displays canonical reference, location, site type, and area.
  2. *What do we know?* Evidence Checklist tab clearly presents confirmed facts with source attribution.
  3. *What don't we know?* Missing evidence is prominently badged as `UNKNOWN` or `UNAVAILABLE`.
  4. *What contradicts?* Contradictions tab details machine claims vs external findings with severity badges.
  5. *What happened?* Audit Timeline tab renders chronological events across all evidence layers.
  6. *What do I need to do next?* Deterministic Next Action card sits at the top of the Overview tab.
  7. *Why?* Next Action card includes explicit `rationale` and `trigger_evidence`.
- **UX Observations:** Responsive layout functions cleanly on desktop and mobile viewports. Status badges use standard semantic colours (emerald, amber, rose, slate).

---

## 17. Defect Register

| Defect ID | Severity | Area | Description | Remediation Required |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-013-01** | **HIGH** | Security & Lifecycle | Server actions in `actions.ts` lack session authentication, and `recordOutcome()` does not verify `previous_state` against database state, permitting lifecycle transition spoofing. | Validate Supabase auth session in server actions; enforce `getCurrentOutcomeState()` check inside `recordOutcome()`. |
| **DEF-013-02** | **MEDIUM** | Next-Action Engine | Artificial completeness gating blocks `CONTACT_OWNER_OR_AGENT` until HMLR title is verified, even when a disposal agent is actively marketing the site. | Allow contact recommendation when authorized selling agent is identified via credible external evidence. |
| **DEF-013-03** | **MEDIUM** | Next-Action Engine | Three declared next-action codes (`PLACE_ON_HOLD`, `OBTAIN_MARKET_EVIDENCE`, `REVIEW_LOCAL_PLAN`) are never emitted by `nextActionEngine.ts`. | Add evaluation branches for `PLACE_ON_HOLD` (when commercially held), market comp deficiency, and Local Plan review. |
| **DEF-013-04** | **MEDIUM** | Truth Ledger | Layer assignment divergence between Phase 10 (`real_world_outcome`) and Phase 11 (`external_evidence`) for third-party evidence records. | Unify external document evidence under `external_evidence` layer across all services. |
| **DEF-013-05** | **LOW** | Documentation | Truth Ledger was described as "immutable" and "tamper-evident" without database triggers or cryptographic hash chaining. | Align documentation to reflect that immutability is currently enforced by application-level convention. |

---

## 18. PROVEN

1. **Queue & Workstation Execution:** Analysts can view, filter, and navigate real candidates across 7 operational queue groups.
2. **Deterministic Next Action:** The engine deterministically computes actionable next steps with clear rationale based on evidence state.
3. **8-Dimensional Epistemic Checklist:** All 8 dimensions evaluate correctly without converting unknown or unavailable data to known.
4. **Silence Is Not Negative:** `NO_RESPONSE` never marks a site as unavailable or rejected.
5. **Auditable Contradiction Resolution:** Resolving contradictions requires explicit rationale, records analyst identity, and preserves original conflicting evidence.
6. **Zero Financial Fictions:** The workbench contains no automated valuations, GDVs, RLVs, or automated dwelling guesses.
7. **Production Build & Test Suite:** 207 automated tests pass across 61 test suites; production build compiles cleanly.

---

## 19. SUPPORTED

1. **Multi-Title Assembly Management:** Visualisation of fragmented title relationships is supported, but has only been tested against two real-world multi-title candidates.
2. **Follow-Up Scheduling:** Scheduling follow-up reminders operates as designed in memory and database schemas, but awaits live calendar integration.

---

## 20. NOT PROVEN

1. **Live Landowner Outreach at Scale:** Tested against 10 genuine validation candidates; requires broader field execution across dozens of commercial vendors.
2. **Cryptographic Tamper-Evidence:** Claims of tamper-evidence are unproven because no cryptographic hashing mechanism exists in the database.

---

## 21. Recommended Corrections

To be implemented prior to commencing Phase 14:
1. **Enforce Server-Side Auth & Lifecycle State Verification:** Update `actions.ts` and `recordOutcome()` to authenticate caller and verify transitions against the true current database state.
2. **Refine Contact Gating:** Add an exception to `hasVerifiedTitle` requirement when an authorized commercial agent is identified with `SUPPORTED` or `INDICATIVE` evidence.
3. **Wire Missing Next-Action Rules:** Implement evaluation branches for `PLACE_ON_HOLD`, `OBTAIN_MARKET_EVIDENCE`, and `REVIEW_LOCAL_PLAN`.
4. **Harmonise Truth Ledger Layers:** Standardise third-party external evidence under `external_evidence`.

---

## 22. Phase 13 Gate Verdict

```text
============================================================
PHASE 13 GATE VERDICT:
STATE B — OPERATIONAL BUT REQUIRES CORRECTION
============================================================
```

**Justification:** The Acquisition Operations Workbench successfully delivers on the operational requirements of Phase 13 without introducing financial or physical fictions. However, the identified security and lifecycle verification defect (DEF-013-01) and engine gaps (DEF-013-02, DEF-013-03) prevent an unconditional `STATE A` rating.

---

## 23. Preconditions for Phase 14

Before beginning Phase 14:
1. Correct DEF-013-01 (Server-side auth and lifecycle state verification).
2. Correct DEF-013-02 (Refine contact gating for agency-marketed opportunities).
3. Correct DEF-013-03 (Implement missing `PLACE_ON_HOLD` next action branch).
4. Re-run test suite (`npm test`) and production build (`npm run build`) to ensure 100% clean verification.
