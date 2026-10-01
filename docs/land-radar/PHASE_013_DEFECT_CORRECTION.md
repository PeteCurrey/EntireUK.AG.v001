# Entire UK Land Radar — Phase 13 Defect Correction Record

**Date:** 2026-10-01  
**Subject:** Phase 13 Acquisition Operations Workbench Defect Remediation & Current State  
**Repository:** `PeteCurrey/EntireUK.AG.v001`  
**Standard:** Strict Epistemic Integrity ($$\text{Fact} \rightarrow \text{Derived Evidence} \rightarrow \text{Interpretation} \rightarrow \text{Human Action} \rightarrow \text{Real-World Outcome}$$)

---

## 1. Overview & Remediation Status

Following the Phase 13 Operational Audit (`docs/land-radar/PHASE_013_POST_WORK_OPERATIONAL_AUDIT.md`), five specific defects were registered against the Acquisition Operations Workbench. This document records what has been corrected in code, what remains constrained, and the exact technical boundaries of the current implementation.

| Defect ID | Title | Status | Technical Scope & Location |
| :--- | :--- | :--- | :--- |
| **DEF-013-01** | Server-Side Lifecycle State & Auth Integrity | **CLOSED** | Enforced in `actions.ts` via `requireAuthenticatedAnalyst()` and `outcomeService.ts` via `getCurrentOutcomeState()`. |
| **DEF-013-02** | Contact Gating vs Disposal Agent Outreach | **PARTIALLY CLOSED** | Data models strictly separate ownership evidence from contact records; however, `nextActionEngine.ts` still gates `CONTACT_OWNER_OR_AGENT` behind `hasVerifiedTitle`. |
| **DEF-013-03** | Incomplete Next-Action Rule Coverage | **CLOSED** | Fully implemented in `nextActionEngine.ts` for `PLACE_ON_HOLD`, `OBTAIN_MARKET_EVIDENCE`, and `REVIEW_LOCAL_PLAN`. |
| **DEF-013-04** | Truth Ledger Layer Assignment Divergence | **OPEN** | `truthLedgerService.ts` logs under `real_world_outcome` while `ownershipService.ts` logs under `external_evidence`. Unification pending. |
| **DEF-013-05** | Accuracy of Immutability Claims | **CLOSED (RECONCILED)** | Documentation reconciled: Truth Ledger is strictly **application-enforced append-only**. Database triggers and cryptographic hash chaining are absent. |

---

## 2. What Was Corrected

### DEF-013-01: Server-Side Lifecycle Validation & Auth Enforcement
1. **Server Action Authentication:**
   - Every mutation export in `src/app/(internal)/acquisitions/[siteId]/actions.ts` (`recordContactAction`, `resolveContradictionAction`, `transitionLifecycleAction`, `verifyTitleOnlineAction`) invokes `requireAuthenticatedAnalyst()`.
   - `requireAuthenticatedAnalyst()` verifies the session via HTTP-only cookies (`getCurrentUser()`). Unauthenticated requests throw `Unauthorised: a valid analyst session is required to perform this action.`, blocking RPC invocation.
   - The authenticated user's email is bound server-side to the audit fields (`recorded_by`, `resolved_by`, `analyst`), preventing caller identity spoofing.
2. **Authoritative State Verification:**
   - In `src/lib/land-radar/outcomeService.ts`, `recordOutcome()` no longer relies on client-supplied `previous_state`.
   - The service fetches the true current state from the database: `const actualCurrentState = await getCurrentOutcomeState(input.site_id)`.
   - Transitions are evaluated against `actualCurrentState`. If a client passes a conflicting `previous_state`, the transition is rejected with `Lifecycle state mismatch`.
   - Valid first transitions from an uninitialised state are strictly restricted to `SURFACED` or states reachable from `SURFACED`.

### DEF-013-03: Next-Action Rule Coverage
All 14 `NextActionCode` enum values defined in `src/lib/land-radar/types.ts` are deterministically evaluated and emitted by `src/lib/land-radar/acquisitions/nextActionEngine.ts`:
1. `REVIEW_LOCAL_PLAN`: Emitted when `planning_activity` is unknown and the site is previously developed land (`brownfield_signal` confirmed).
2. `PLACE_ON_HOLD`: Emitted when candidate is `INVESTIGATING` and a known `constraint_signal` has `value < 1` (contamination hold, infrastructure standoff, or ransom).
3. `OBTAIN_MARKET_EVIDENCE`: Emitted when cadastral, planning, and availability foundations are established, but `market_signal` is `unknown` or absent.

---

## 3. What Remains Constrained

### DEF-013-02: Contact Gating vs Market-Facing Disposal Contacts
- **The Constraint:** In `src/lib/land-radar/acquisitions/nextActionEngine.ts` (Step 4, line 140), `hasVerifiedTitle` must evaluate to `true` before the engine will evaluate Step 6 (Contact & Availability Workflow).
- **Consequence:** If an analyst discovers an openly marketed site with an instructed commercial agent (e.g. Bromwich Hardy marketing particulars), but the HMLR title register has not yet been pulled (`ownership_evidence_status === 'UNKNOWN'`), the engine emits `VERIFY_TITLE` rather than `CONTACT_OWNER_OR_AGENT`.
- **Epistemic Integrity Maintained:** Contact records (`AcquisitionContactRecord`) remain strictly segregated from title evidence (`OwnershipEvidence`). An agent contact never automatically validates ownership, and silence (`NO_RESPONSE`) never marks a site as unavailable.

### DEF-013-04: Truth Ledger Layer Assignment Divergence
- **The Constraint:** Migration 0022 created the check constraint with 4 layers (`machine_evidence`, `derived_evidence`, `analyst_interpretation`, `real_world_outcome`). Migration 0023 expanded the constraint to allow a 5th layer (`external_evidence`).
- **Codebase Split:**
  - `src/lib/land-radar/truthLedgerService.ts` records third-party documents (`recordExternalEvidence`) under `layer: 'real_world_outcome'`.
  - `src/lib/land-radar/ownership/ownershipService.ts` records external ownership/availability reports under `layer: 'external_evidence'`.
- Both represent external evidence, but they appear under two different layer keys in the ledger.

---

## 4. Technical Enforcement Boundaries

### Application-Enforced (Software Level)
- **Append-Only Event Ledger:** Application services (`truthLedgerService.ts`, `acquisitionService.ts`, `outcomeService.ts`) expose only insertion and query functions. There are no exposed update or deletion routines.
- **Epistemic State Preservation:** Software guarantees that `UNKNOWN != NEGATIVE` and `NO_RESPONSE != NOT_AVAILABLE`.
- **Lifecycle Transition Logic:** Directed graph validation (`VALID_TRANSITIONS`) runs inside Node.js runtime services.

### Database-Enforced (PostgreSQL / PostGIS Level)
- **Foreign Key Referencing:** Strict cascading and integrity checks across `sites`, `land_parcels`, `candidate_truth_ledger`, `acquisition_contact_records`, and `candidate_contradiction_resolutions`.
- **Check Constraints:** State enumerations, layer names, and geometry coordinate limits are enforced via PostgreSQL `CHECK` constraints.
- **Row Level Security (RLS):** Enabled on all commercial tables restricting read/write access to authenticated users (`FOR ALL TO authenticated`).
- **Absence of DB-Level Immutability:** There are **NO** PostgreSQL `BEFORE UPDATE` or `BEFORE DELETE` triggers raising exceptions on `candidate_truth_ledger`. Direct SQL queries from privileged roles can mutate records.
- **Absence of Cryptographic Verification:** There is **NO** cryptographic chaining (SHA-256 blocks, Merkle trees, or `prev_hash` pointers). Claims of "tamper-evidence" are not technically justified.

---

## 5. Epistemic Status of Data

### What Remains UNKNOWN / UNAVAILABLE
- **OS OpenRoads API:** Where external WFS endpoints return 403 or are unconfigured, access dimensions are truthfully marked `UNAVAILABLE` rather than assumed clear.
- **Unverified HMLR Titles:** If cadastral polygons have not been cross-matched against Land Registry Title Plans, ownership remains `UNKNOWN`.
- **Commercial Intent:** If no contact has been recorded, availability remains `UNKNOWN`. Title existence is never conflated with willing disposal.

### What Is Not Yet Proven
- **National Scale Outreach:** Tested and validated on the 10 real-world candidates of `COHORT-LIVE-001` across Warwick District and Rugby Borough. Broad-scale multi-county operational rollout has not yet occurred.
- **Automated Cadastral Ingestion:** Manual entry and cached live queries are validated; full bulk national HMLR vector tile ingestion is deferred.
