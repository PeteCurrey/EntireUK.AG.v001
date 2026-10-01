# Entire UK Land Radar — Phase 13 Correction Verification Audit

**Audit Date:** 2026-10-01  
**Audit Type:** Read-Only Verification Audit (Phase 13 Defect-Correction Pass)  
**Repository:** `PeteCurrey/EntireUK.AG.v001` (Branch `main`, Commit `39ab346`)  
**Audited Cohort:** `COHORT-LIVE-001` (10 genuine investigated candidates across Warwick District & Rugby Borough)  
**Verification Suite:** 211 passing tests (61 suites), 0 TypeScript errors (`tsc --noEmit`), 51/51 Next.js pages generated cleanly  
**Standard of Audit:** Strict epistemic chain ($$\text{Fact} \rightarrow \text{Derived Evidence} \rightarrow \text{Interpretation} \rightarrow \text{Human Action} \rightarrow \text{Real-World Outcome}$$). Zero financial or physical fictions.

---

## 1. Executive Result

```text
============================================================
PHASE 13 CORRECTION VERIFICATION AUDIT VERDICT:
STATE B — OPERATIONAL BUT REQUIRES CORRECTION
============================================================
```

### Executive Summary
A forensic, read-only verification audit was conducted on the Entire UK codebase to establish whether the five defects identified in the original Phase 13 Operational Audit (`PHASE_013_POST_WORK_OPERATIONAL_AUDIT.md`) have been genuinely closed in production-quality code, database schemas, and runtime behaviour.

**Findings Summary:**
1. **DEF-013-01 (Server-Side Lifecycle Integrity & Authentication):** **`CLOSED`**. Session authentication is enforced across all server mutation actions in `actions.ts`. `recordOutcome()` queries authoritative database state via `getCurrentOutcomeState()`, completely rejecting client-supplied spoofing of `previous_state` and invalid forward jumps.
2. **DEF-013-02 (Contact Gating vs Market-Facing Disposal Contacts):** **`PARTIALLY CLOSED`**. The data model, types, and tables strictly maintain segregation between ownership evidence and contact records. An agent contact never mutates or fabricates ownership. However, in `nextActionEngine.ts`, `evaluateDeterministicNextAction()` still evaluates Step 4 (`hasVerifiedTitle`) before Step 6 (`Contact & Availability Workflow`), continuing to artificially block contact recommendations to openly marketed commercial disposal agents when HMLR title status is unverified.
3. **DEF-013-03 (Next-Action Engine Completeness):** **`CLOSED`**. All 14 next-action codes are defined, deterministically reachable, emitted by production engine logic, and verified by automated unit tests. `PLACE_ON_HOLD`, `OBTAIN_MARKET_EVIDENCE`, and `REVIEW_LOCAL_PLAN` are fully operational.
4. **DEF-013-04 (Truth Ledger Classification Consistency):** **`OPEN`**. Layer assignment divergence remains between Phase 10 services (`truthLedgerService.ts` line 221 & line 252 logging under `real_world_outcome`) and Phase 11 services (`ownershipService.ts` lines 126, 344, 589 logging under `external_evidence`).
5. **DEF-013-05 (Immutability & Tamper-Evidence Terminology):** **`CLOSED (RECONCILED)`**. Documentation and technical boundaries have been reconciled. The Truth Ledger is strictly **application-enforced append-only**. Database triggers and cryptographic hash chaining are absent; claims of "cryptographic tamper-evidence" have been eliminated.

Because DEF-013-02 and DEF-013-04 remain unresolved, the system is **operational and safe from silent data corruption**, but remains at **STATE B**.

---

## 2. Defect Matrix

| Defect ID | Original Problem | Current Implementation Status | Concrete Evidence | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-013-01** | Lifecycle mutations accepted client `previous_state` without DB verification; server actions lacked auth enforcement. | Session auth enforced via `requireAuthenticatedAnalyst()`; `recordOutcome` verifies against authoritative DB state via `getCurrentOutcomeState()`. | `actions.ts` (lines 18–24, 43, 80, 116, 148); `outcomeService.ts` (lines 112–139); `phase13Acquisitions.test.ts` (line 537). | **`CLOSED`** |
| **DEF-013-02** | System blocked contact recommendations to active marketing agents until formal HMLR title was verified. | Data models separate ownership from contact records. However, `nextActionEngine.ts` still blocks `CONTACT_OWNER_OR_AGENT` if `hasVerifiedTitle` is false. | `nextActionEngine.ts` (lines 140–155); `types.ts` (`AcquisitionContactRecord` vs `OwnershipEvidenceRecord`). | **`PARTIALLY CLOSED`** |
| **DEF-013-03** | `PLACE_ON_HOLD`, `OBTAIN_MARKET_EVIDENCE`, `REVIEW_LOCAL_PLAN` declared in types but never emitted by engine. | All 3 actions wired with deterministic evidence triggers in `nextActionEngine.ts`. All 14 codes now reachable. | `nextActionEngine.ts` (lines 186–203, 223–244, 334–348); `phase13Acquisitions.test.ts` (lines 287–352). | **`CLOSED`** |
| **DEF-013-04** | Layer assignment divergence between Phase 10 (`real_world_outcome`) and Phase 11 (`external_evidence`) for third-party evidence. | Divergence persists. `truthLedgerService.ts` uses `real_world_outcome`, while `ownershipService.ts` uses `external_evidence`. | `truthLedgerService.ts` (lines 221, 252); `ownershipService.ts` (lines 126, 344, 589); `0023_ownership_intelligence.sql`. | **`OPEN`** |
| **DEF-013-05** | Truth Ledger documented as "immutable" and "tamper-evident" without DB triggers or cryptographic chaining. | Immutability is application-enforced append-only. Documentation aligned; false claims of cryptographic tamper evidence removed. | `PHASE_013_DEFECT_CORRECTION.md`; `0022_candidate_truth_ledger.sql` (no triggers); `truthLedgerService.ts`. | **`CLOSED (RECONCILED)`** |

---

## 3. DEF-013-01 Evidence: Server-Side Lifecycle Integrity

### 1. Identified Mutation Paths
All operational lifecycle mutations occur via Next.js Server Actions in `src/app/(internal)/acquisitions/[siteId]/actions.ts`:
- `recordContactAction(input: RecordContactServerInput)`
- `resolveContradictionAction(input: ResolveContradictionServerInput)`
- `transitionLifecycleAction(input: TransitionLifecycleServerInput)`
- `verifyTitleOnlineAction(input: { site_id, site_reference, title_reference, recorded_by })`

### 2. Server-Side Authentication & Identity Attribution
Every server action invokes `requireAuthenticatedAnalyst()` at line 18 of `actions.ts`:
```typescript
async function requireAuthenticatedAnalyst(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorised: a valid analyst session is required to perform this action.");
  }
  return user.email;
}
```
- Direct POST or RPC invocations without valid session cookies fail immediately with an unhandled rejection / error response.
- The authenticated user's email is bound server-side to `recorded_by`, `resolved_by`, and `analyst`. Callers cannot forge analyst identity.

### 3. Authoritative Database State Verification
In `src/lib/land-radar/outcomeService.ts`:
```typescript
export async function recordOutcome(input: RecordOutcomeInput): Promise<CandidateOutcome> {
  const actualCurrentState = await getCurrentOutcomeState(input.site_id);
  const effectivePreviousState = actualCurrentState ?? null;

  if (effectivePreviousState !== null) {
    if (!isValidTransition(effectivePreviousState, input.state)) {
      throw new Error(
        `Invalid lifecycle transition: ${effectivePreviousState} → ${input.state}. ` +
          `Valid from ${effectivePreviousState}: [${VALID_TRANSITIONS[effectivePreviousState].join(', ')}]`
      );
    }
    if (input.previous_state && input.previous_state !== effectivePreviousState) {
      throw new Error(
        `Lifecycle state mismatch: caller reported previous_state="${input.previous_state}" ` +
          `but actual current state is "${effectivePreviousState}". Transition rejected.`
      );
    }
  } else {
    const validFirstTargets = VALID_TRANSITIONS['SURFACED'];
    if (input.state !== 'SURFACED' && !validFirstTargets.includes(input.state)) {
      throw new Error(
        `Cannot initialise lifecycle at state "${input.state}". ` +
          `Valid first states: [${validFirstTargets.join(', ')}]`
      );
    }
  }
```
- The client-supplied `previous_state` is never trusted to determine validity.
- The stored audit record uses `verifiedPreviousState = effectivePreviousState`.
- Initialisation validation prevents bootstrapping sites into advanced states such as `ACQUIRED` or `CONTROLLED`.

### 4. Deterministic Test Verification
Automated test suite exercises:
- Valid forward transition sequence: `SURFACED` → `SCREENED` → `ANALYST_REVIEW` (passes).
- Direct invalid jump: `SURFACED` → `ACQUIRED` (rejected).
- Caller state spoofing: site in `SCREENED` with caller claiming `INVESTIGATING` → `CONTACTED` (rejected with `Lifecycle state mismatch`).
- Terminal state immutability: rejection states (`REJECTED_ACCESS`, `REJECTED_PLANNING`, etc.) have zero outgoing transitions.

---

## 4. DEF-013-02 Evidence: Contact Gating vs Disposal Agent Outreach

### 1. Separation of Evidence Models (Preserved)
- **Ownership Evidence (`OwnershipEvidenceRecord`):** Captures HMLR Title Registers, INSPIRE Index polygons, proprietor entities, and tenure. Statuses: `VERIFIED`, `SUPPORTED`, `INDICATIVE`, `CONFLICTING`, `UNKNOWN`.
- **Contact Records (`AcquisitionContactRecord`):** Captures communications with organizations or roles (`organisation_or_role`), channels, outcomes, and scheduled follow-ups.
- **Rule Preserved:** Recording contact with a commercial agent (`Bromwich Hardy`) does **not** mutate `OwnershipEvidence` or infer verified title.
- **Rule Preserved:** `NO_RESPONSE` never marks a site as `NOT_AVAILABLE`.

### 2. Gating Flaw in Next-Action Engine (Unresolved)
In `src/lib/land-radar/acquisitions/nextActionEngine.ts` (lines 140–155):
```typescript
  // -------------------------------------------------------------------------
  // 4. Cadastral & Ownership Foundation
  // -------------------------------------------------------------------------
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
- Step 4 sits before Step 6 (`Contact & Availability Workflow`).
- If an opportunity is openly marketed by an instructed disposal agent (e.g. `EUK-S-RUGBY-BF-001` prior to HMLR pull), the engine unconditionally returns `VERIFY_TITLE`.
- **Required Behaviour Not Yet Met:** The engine does not permit emitting `CONTACT_OWNER_OR_AGENT` when an authorized selling agent is confirmed via credible external marketing evidence, but the HMLR title remains unverified.
- **Verdict:** `PARTIALLY CLOSED`.

---

## 5. DEF-013-03 Evidence: Next-Action Engine Completeness

All 14 `NextActionCode` enum values are verified as defined, reachable, deterministic, and tested:

| Code | Trigger Condition | Deterministic Evidence Check | Test Coverage |
| :--- | :--- | :--- | :--- |
| `VERIFY_TITLE` | `!hasVerifiedTitle` | Ownership evidence status $\neq$ `VERIFIED` | `phase13Acquisitions.test.ts:184` |
| `OBTAIN_ADDITIONAL_TITLE` | `MULTI_TITLE` or `FRAGMENTED` | Secondary title relationships `UNKNOWN` / `WEAK` | `phase13Acquisitions.test.ts:208` |
| `RESOLVE_TITLE_CONTRADICTION` | Unresolved title discrepancy | `contradictions.unresolved_count > 0` (non-access) | `phase13Acquisitions.test.ts:222` |
| `VERIFY_ACCESS` | Access contradiction or highway gap | Unresolved access contradiction OR `road_proximity === 0` | `phase13Acquisitions.test.ts:241` |
| `INVESTIGATE_AVAILABILITY` | Title verified, availability unknown | `availabilityState === 'UNKNOWN'` | `phase13Acquisitions.test.ts:180` |
| `CONTACT_OWNER_OR_AGENT` | Availability affirmative, 0 prior contacts | `availabilityState` affirmative, `contacts.length === 0` | `phase13Acquisitions.test.ts:265` |
| `FOLLOW_UP_CONTACT` | Follow-up due date or `NO_RESPONSE` $\ge$ 7 days | Date comparison against `follow_up_date` or `contact_date` | `phase13Acquisitions.test.ts:296` |
| `OBTAIN_MARKET_EVIDENCE` | Planning & availability known, market comp absent | `!marketSignal || marketSignal.status === 'unknown'` | `phase13Acquisitions.test.ts:333` |
| `REVIEW_PLANNING_HISTORY` | Planning signal unknown, non-brownfield | `!planSignal || planSignal.status === 'unknown'` | `phase13Acquisitions.test.ts:311` |
| `REVIEW_LOCAL_PLAN` | Planning signal unknown on brownfield | `isPdl && (!planSignal || planSignal.status === 'unknown')` | `phase13Acquisitions.test.ts:321` |
| `INVESTIGATE_ENVIRONMENTAL_CONSTRAINT` | Flood or environmental constraint signal | `floodSignal.status === 'known' && floodSignal.value === 0` | `phase13Acquisitions.test.ts:162` |
| `COMPLETE_ACQUISITION_GATE` | Foundational evidence complete | Title verified, 0 contradictions, availability affirmative | `phase13Acquisitions.test.ts:348` |
| `PLACE_ON_HOLD` | Candidate `INVESTIGATING` with active constraint hold | `constraintSignal.status === 'known' && constraintSignal.value < 1` | `phase13Acquisitions.test.ts:287` |
| `REVIEW_REJECTION` | Candidate in terminal rejection state | `isRejectionState(lifecycleStage)` | `phase13Acquisitions.test.ts:70` |

- **Verdict:** `CLOSED`.

---

## 6. DEF-013-04 Evidence: Truth Ledger Classification

### Database & TypeScript Schema Analysis
1. **Migration 0022 (`0022_candidate_truth_ledger.sql`):** Defined 4 layers:
   ```sql
   layer IN ('machine_evidence', 'derived_evidence', 'analyst_interpretation', 'real_world_outcome')
   ```
2. **Migration 0023 (`0023_ownership_intelligence.sql`):** Extended check constraint to 5 layers:
   ```sql
   layer IN ('machine_evidence', 'derived_evidence', 'analyst_interpretation', 'external_evidence', 'real_world_outcome')
   ```
3. **TypeScript Type (`types.ts:1053`):** Declares all 5 layers:
   - `machine_evidence` (Layer 1)
   - `derived_evidence` (Layer 2)
   - `analyst_interpretation` (Layer 3)
   - `external_evidence` (Layer 4)
   - `real_world_outcome` (Layer 5)

### Service Implementation Divergence
- In `src/lib/land-radar/truthLedgerService.ts` (lines 221 and 252):
  ```typescript
  // Automatically append a Layer 4 event to the truth ledger
  await recordTruthEvent({
    site_id: input.site_id,
    site_reference: input.site_reference,
    layer: 'real_world_outcome', // <-- Logs under Layer 5 key instead of external_evidence
    event_type: 'external_evidence_received',
    ...
  });
  ```
- In `src/lib/land-radar/ownership/ownershipService.ts` (lines 126, 344, 589):
  ```typescript
  await recordTruthEvent({
    site_id: record.site_id,
    site_reference: record.site_reference,
    layer: 'external_evidence', // <-- Logs under Layer 4 key
    event_type: 'ownership_evidence_recorded',
    ...
  });
  ```
- **Consequence:** Third-party consultant reports and external documents ingested via `truthLedgerService` are filed under `real_world_outcome`, conflating independent documentary evidence with genuine commercial acquisition outcomes (such as completed acquisitions or confirmed vendor refusals).
- **Verdict:** `OPEN`.

---

## 7. DEF-013-05 Evidence: Immutability & Tamper-Evidence Model

### Forensic Schema & Code Inspection
1. **Database-Level Immutability:**
   - In `0022_candidate_truth_ledger.sql`:
     ```sql
     CREATE POLICY "candidate_truth_ledger_authenticated" ON candidate_truth_ledger
       FOR ALL TO authenticated USING (true) WITH CHECK (true);
     ```
   - Policy allows `UPDATE` and `DELETE` queries to authenticated database roles.
   - There are **no** `BEFORE UPDATE` or `BEFORE DELETE` triggers throwing exceptions.
   - Therefore, the Truth Ledger is **not database-enforced immutable**.
2. **Cryptographic Tamper-Evidence:**
   - Schema does not include `prev_hash`, SHA-256 block hashes, Merkle roots, or digital signatures.
   - Therefore, the Truth Ledger is **not cryptographically tamper-evident**.
3. **Application-Level Enforcement:**
   - `truthLedgerService.ts` exposes only `recordTruthEvent()` (`INSERT`) and read/list queries (`SELECT`).
   - No update or delete operations are exposed in API routes, server actions, or service contracts.
   - The Truth Ledger is genuinely **application-enforced append-only**.
4. **Documentation Alignment:**
   - `docs/land-radar/PHASE_013_DEFECT_CORRECTION.md` explicitly documents this reality, eliminating claims of cryptographic tamper-evidence and defining the boundary as application-enforced append-only.
- **Verdict:** `CLOSED (RECONCILED)`.

---

## 8. Production Data Integrity

An explicit audit was conducted across the production data path for data contamination and synthetic fictions:
1. **Test Fixture Leakage:** No synthetic `TEST_FIXTURE` records appear in live acquisition queues or production database seeds.
2. **Mock / Fallback Data in Production:** `getPersistenceMode()` strictly resolves to `'supabase'` when `NODE_ENV === 'production'`. There are no silent fallback `catch` blocks reverting to in-memory fixtures. If Supabase credentials are missing or database connection fails, the system throws a fatal `PersistenceError`.
3. **Epistemic Integrity of Inferences:**
   - Zero inferred ownership: Registered proprietors are only established from authoritative title registers or verified external evidence.
   - Zero inferred availability: Silence (`NO_RESPONSE`) is never interpreted as unwillingness or rejection.
   - Zero financial fictions: No automated GDVs, RLVs, or synthetic profitability scores exist anywhere in the Acquisition Workbench.

---

## 9. COHORT-LIVE-001 Reconciliation

All 10 genuine investigated candidates from `COHORT-LIVE-001` remain correctly classified and preserved in `src/lib/land-radar/validation/liveCohort.ts`:

1. **`EUK-S-WARWICK-BF-002` (Montague Road Commercial Yard):** `REAL_ACQUISITION_EVENT` / `PROGRESSED`. Freehold title `WK89210` verified; vendor managing agent Bromwich Hardy confirmed.
2. **`EUK-S-WARWICK-BF-004` (Farmer Ward Road, Kenilworth):** `EXTERNAL_EVIDENCE` / `REJECTED` (False Positive). Highways ransom strip under title `WK112044` correctly blocks progression.
3. **`EUK-S-WARWICK-BF-001` (Former Ford Foundry, Princes Drive):** `EXTERNAL_EVIDENCE` / `INVESTIGATING` (Commercial Hold). Emits `PLACE_ON_HOLD` due to active contamination remediation deduction negotiations.
4. **`EUK-HB-WARWICK-001` (Old Warwick Road Gasworks):** `BENCHMARK` / `ANALYST_REVIEW`. Correctly identified as Data False Negative (omitted from DLUHC Brownfield register).
5. **`EUK-S-RUGBY-BF-001` (Former Alstom Works, Mill Road):** `REAL_ACQUISITION_EVENT` / `PROGRESSED`. Freehold title `WK142981` verified; commercial agent Bromwich Hardy actively instructed.
6. **`EUK-S-RUGBY-BF-002` (Railway Terrace Depot / Sidings):** `EXTERNAL_EVIDENCE` / `REJECTED_MARKET`. Negative residual land value due to acoustic rail depression.
7. **`EUK-HB-RUGBY-001` (Newbold Road Commercial Estate):** `BENCHMARK` / `ANALYST_REVIEW`. Correctly identified as Rule False Negative (rigid 1000m settlement buffer boundary).
8. **`EUK-S-WARWICK-BF-003` (Cape Road Works & Depot):** `EXTERNAL_EVIDENCE` / `INVESTIGATING`. Multi-title assembly (`WK29101` + `WK29102`) correctly modelled with separate strengths.
9. **`EUK-S-WARWICK-EX-001` (River Leam Meadow Fringe):** `BENCHMARK` / `REJECTED_ENVIRONMENTAL`. Correct statutory exclusion (Flood Zone 3b functional floodplain).
10. **`EUK-S-RUGBY-BF-003` (Wood Street Depot / Hunters Lane):** `EXTERNAL_EVIDENCE` / `INVESTIGATING`. Unresolved secondary easement and introductory letter awaiting vendor response (`NO_RESPONSE` $\ge$ 21 days).

Zero synthetic data or altered evidence states exist within the cohort.

---

## 10. Regression & Build Verification Results

- **Automated Test Suite:**
  - `npm test`: **211 passed, 0 failed, 61 test suites**.
  - Includes dedicated tests for lifecycle state validation, caller spoofing detection, contact follow-up rules, contradiction resolution audit trails, and next-action engine coverage.
- **TypeScript Static Analysis:**
  - `npx tsc --noEmit`: **0 errors**. Type safety strictly preserved across all modules and server actions.
- **Production Build:**
  - `npm run build`: **51/51 pages statically generated**. Zero compilation warnings or bundle trace failures on Next.js 15.

---

## 11. Remaining Risks

1. **DEF-013-02 (Operational Inconvenience for Agency-Marketed Sites):** Analysts reviewing agency-marketed sites are forced to pull HMLR title registers before the system will emit a formal `CONTACT_OWNER_OR_AGENT` recommendation, even when authorized marketing particulars are in hand.
2. **DEF-013-04 (Truth Ledger Analytical Ambiguity):** Querying `layer === 'real_world_outcome'` returns both genuine acquisition events and third-party documentary evidence logged via `truthLedgerService.recordExternalEvidence()`.

---

## 12. Phase 14 Gate Recommendation

```text
============================================================
PHASE 14 GATE RECOMMENDATION:
NO-GO
============================================================
```

### Gate Decision Rationale
While the platform is stable, compiles cleanly, passes all 211 tests, and is thoroughly protected against lifecycle state spoofing (DEF-013-01), the Phase 14 Gate must remain strictly conditioned on production integrity standards:
1. **DEF-013-02 must be fully closed:** `nextActionEngine.ts` must allow `CONTACT_OWNER_OR_AGENT` when a credible commercial disposal agent is identified via external evidence, without forcing premature title verification while preserving strict separation of agent contact from ownership evidence.
2. **DEF-013-04 must be fully closed:** `truthLedgerService.ts` must log external third-party documents under `external_evidence`, unifying layer assignment across all services.

Once these two defects are resolved and verified, the Acquisition Operations Workbench will achieve an unconditional **`STATE A`** rating, permitting immediate commencement of Phase 14.
