# Entire UK Land Radar — Phase 13 Critical Integrity Correction Report

**Audit Reference:** `docs/land-radar/PHASE_013_CORRECTION_VERIFICATION_AUDIT.md`  
**Execution Date:** 2026-10-01  
**Repository:** `PeteCurrey/EntireUK.AG.v001`  
**Scope:** Tightly scoped production integrity correction pass (moving platform from State B to State A).  
**Regression Status:** 237 passing tests (64 suites), 0 TypeScript errors (`npx tsc --noEmit`), 51/51 Next.js routes built cleanly.

---

## 1. Executive Summary

This critical integrity pass addressed and definitively closed all remaining blocking defects and security/data-integrity gaps identified during the Phase 13 Correction Verification Audit:

1. **SEC-013-01 (Internal Acquisition Route Protection):** **`CLOSED`**. Added `/acquisitions`, `/acquisitions/*`, and internal APIs (`/api/map/os-tiles`) to edge `middleware.ts`. Implemented server-side defence in depth inside `src/app/(internal)/layout.tsx` (redirecting unauthenticated requests directly to `/sign-in`). Server actions and RLS maintain multi-layered boundaries. Verified via 13 dedicated security tests.
2. **DATA-013-01 (Submission Intake Persistence):** **`CLOSED`**. Created migration `0025_opportunity_submissions.sql`. Replaced placeholder `console.log` intake with production service `submissionService.ts` executing real database persistence. Sanitized console logs to eliminate PII leakage. Replaced misleading "Persistence Confirmed" UI with honest "Submission Received" status. Verified via 7 dedicated tests.
3. **DEF-013-02 (Contact Gating vs Market-Facing Disposal Contacts):** **`CLOSED`**. Refined `nextActionEngine.ts` to separate registered ownership evidence from market-facing disposal contact evidence. The engine now detects credible commercial disposal agents and recommends `CONTACT_OWNER_OR_AGENT` without forcing premature HMLR title verification, while strictly prohibiting the inference of ownership from agent interactions and enforcing verified title before the formal commercial Acquisition Gate. Verified across 7 test scenarios.
4. **DEF-013-04 (Truth Ledger Classification Consistency):** **`CLOSED`**. Resolved the layer divergence between Phase 10 and Phase 11. Third-party documentary evidence in `truthLedgerService.ts` is now canonically classified under `layer: 'external_evidence'` (Layer 4). `real_world_outcome` (Layer 5) is strictly reserved for genuine commercial acquisition outcomes. Added migration `0026_reclassify_external_evidence_ledger.sql` for historical alignment.
5. **PUBLIC-013-01 (Schema.org Classification Correction):** **`CLOSED`**. Corrected public JSON-LD structured data in `src/lib/metadata.ts`, changing `@type` from `"RealEstateAgent"` to `"Corporation"`, truthfully representing Entire UK Development Limited as a principal property and land acquisition/development corporate entity.
6. **PUBLIC-013-02 (Removal of Internal Telemetry from Public Surfaces):** **`CLOSED`**. Eliminated internal development badges (`"Pilot 001 · Warwick"`, `"Strategy V3 Frozen"`, `"Engine Status: Live In Pilot"`) from public-facing surfaces (`/sign-in` and `LandRadarFeature.tsx`). Replaced with commercial capability and confidential session indicators. Preserved operational telemetry inside authenticated internal routes.

---

## 2. Technical Implementation Details

### SEC-013-01: Multi-Layered Route Security Boundary

#### A. Edge Middleware (`src/middleware.ts`)
- Added `/acquisitions` and `/api/map/os-tiles` to `PROTECTED_PREFIXES` and `config.matcher`.
- Edge middleware checks for valid `sb-access-token` session cookie.
- Unauthenticated requests to internal HTML pages are redirected with 307 to `/sign-in?redirect=<pathname>`.
- Unauthenticated requests to internal API routes (`/api/map/os-tiles`) return HTTP 401 JSON.
- Authenticated users attempting to visit `/sign-in` are redirected to `/dashboard`.
- Public marketing, content, legal, and submission intake routes remain accessible.

#### B. Server-Side Layout Defence in Depth (`src/app/(internal)/layout.tsx`)
- Even if edge middleware were bypassed, the React Server Component layout queries `getCurrentUser()`.
- If `!user`, it invokes `redirect('/sign-in')` server-side, preventing rendering of internal DOM trees, navigation menus, or candidate references.

#### C. Mutation Security (`src/app/(internal)/acquisitions/[siteId]/actions.ts`)
- Every server action invokes `requireAuthenticatedAnalyst()`, ensuring RPC calls without an active session fail immediately and binding user identity server-side.

---

### DATA-013-01: Opportunity Submission Intake Persistence

#### A. PostgreSQL Schema (`supabase/migrations/0025_opportunity_submissions.sql`)
- Table `opportunity_submissions` stores full submission payload:
  - `id`: UUID primary key
  - `submission_reference`: Unique business key (format `EUK-SUB-[A-Z0-9]+-[A-Z0-9]+`)
  - `submission_type`: `land`, `property`, `opportunity`, `partner`, `general_contact`
  - Submitter name, email, phone, organisation
  - Property details: address, postcode, size, current use, planning status, ownership status
  - Submitter notes and raw payload JSONB
  - Audit timestamps and lifecycle status (`received`)
- Row Level Security (RLS) guarantees:
  - `anon` and `authenticated` roles can `INSERT` submissions.
  - `anon` role CANNOT `SELECT`, `UPDATE`, or `DELETE` any submissions (preventing public exposure of competitor submissions or PII).
  - Only `authenticated` internal analysts and `service_role` can `SELECT` and manage submissions.

#### B. Application Service (`src/lib/land-radar/submissionService.ts`)
- Enforces strict server-side validation (names, valid emails, UK postcode/address requirements for land/property).
- Inserts into Supabase in production mode; uses isolated in-memory store in mock/test mode.
- Does not dump personal information (PII) to server console.
- In `src/app/api/submit/route.ts`: returns 201 only after confirmed database persistence; returns 500 on database failure.

#### C. User Facing Alignment (`src/app/submit/success/page.tsx`)
- Status header replaced from `"Persistence Confirmed"` to `"Submission Received"`, truthfully reflecting intake status.

---

### DEF-013-02: Contact Gating vs Market-Facing Disposal Contacts

#### A. Architectural Separation
- **Ownership Evidence (`OwnershipEvidenceRecord`):** Authoritative cadastral registers, INSPIRE polygons, proprietor title details. Statuses: `VERIFIED`, `SUPPORTED`, `INDICATIVE`, `CONFLICTING`, `UNKNOWN`.
- **Contact Records (`AcquisitionContactRecord`):** Communications with individuals or commercial brokerages (`Bromwich Hardy`, `Wareing & Co`, etc.).
- **Epistemic Rule Enforced:** An agent contact record **never** mutates ownership evidence or validates title.

#### B. Engine Logic in `nextActionEngine.ts`
- Added `findCredibleDisposalAgent(ownershipSummary, contactHistory)`:
  - Inspects `acquisition_evidence` for verified agent communications or intelligence.
  - Inspects `availability_history` for active marketing particulars or commercial listings.
  - Inspects `ownership_evidence_records` for commercial disposal sources.
  - Inspects `contact_history` for prior agent intermediary interactions.
- **Step 4 (Cadastral & Ownership Foundation):**
  - If title is unverified AND no disposal agent exists $\rightarrow$ emits `VERIFY_TITLE`.
  - If title is unverified BUT a credible disposal agent exists $\rightarrow$ permits progression toward agent enquiry without forcing title search first.
- **Step 6 (Contact & Availability Workflow):**
  - Emits `CONTACT_OWNER_OR_AGENT` with specific disposal agent rationale:
    - `"Initiate Introductory Enquiry with Disposal Agent"`
    - Trigger evidence records: `agent != owner`.
- **Step 7 (Commercial Acquisition Gate):**
  - If agent contact was completed, but HMLR title remains unverified, the engine halts before the gate and emits `VERIFY_TITLE`. The commercial gate can **never** be convened without formal verified title.

---

### DEF-013-04: Truth Ledger Classification Consistency

#### A. Canonical Classification Model
- **Layer 1 (`machine_evidence`):** Geospatial polygon intersections, buffer measurements, statutory constraint overlaps.
- **Layer 2 (`derived_evidence`):** Filter logic, capacity calculations, composite rule evaluations.
- **Layer 3 (`analyst_interpretation`):** Analyst hypotheses, manual inspection reviews, contradiction resolutions.
- **Layer 4 (`external_evidence`):** All independent third-party evidence: highway audits, utility reports, planning histories, commercial agent marketing particulars, and external title documents.
- **Layer 5 (`real_world_outcome`):** Genuine commercial acquisition outcomes: vendor willingness, accepted options, completed acquisitions, or formal contractual withdrawals.

#### B. Service Alignment
- In `src/lib/land-radar/truthLedgerService.ts`:
  - `recordExternalEvidence()` now logs events with `layer: 'external_evidence'` (changed from `real_world_outcome`).
- In `src/lib/land-radar/ownership/ownershipService.ts`:
  - Continues logging external evidence under `layer: 'external_evidence'`.
- Database Migration `0026_reclassify_external_evidence_ledger.sql`:
  - Updates historical Phase 10 events where `event_type = 'external_evidence_received'` to `layer = 'external_evidence'`, preserving all IDs, timestamps, and audit provenance.

---

### PUBLIC-013-01: Schema.org Correction

- File: `src/lib/metadata.ts`
- Replaced `@type: "RealEstateAgent"` with `@type: "Corporation"`.
- Entire UK Development Limited is a principal acquisition, land promotion, and property development corporation, not a property brokerage.

---

### PUBLIC-013-02: Removal of Internal Telemetry

- File: `src/app/sign-in/page.tsx`
  - Removed: `"Pilot 001 · Warwick"`, `"Pilot 002 · Rugby"`, `"Strategy V3 Frozen"`.
  - Replaced with: `"Authorised Personnel Only"`, `"Encrypted Session"`, `"Strict Audit Logging"`.
- File: `src/components/sections/LandRadarFeature.tsx`
  - Removed: `"Engine Status: Live In Pilot"`.
  - Replaced with: `"Spatial Analysis Platform"`.
- Internal telemetry remains visible and operational on protected internal routes (`/dashboard`, `/land-radar`, `/review`, `/validation`, `/data-health`).

---

## 3. Database Migrations Added

1. **`supabase/migrations/0025_opportunity_submissions.sql`:**
   - DDL for `opportunity_submissions` table.
   - Indices on `submission_reference`, `submission_type`, `created_at`.
   - RLS policies for anonymous public insertion and authenticated internal inspection.
2. **`supabase/migrations/0026_reclassify_external_evidence_ledger.sql`:**
   - DDL update reconciling historical `candidate_truth_ledger` records to canonical `external_evidence` (Layer 4).

---

## 4. Production Data Safety & Epistemic Boundaries

1. **Zero Test Fixture Leakage:** Production database persistence mode (`NODE_ENV === 'production'`) requires Supabase credentials; in-memory mock stores are strictly isolated to test runners and build generation.
2. **Zero Inferred Ownership:** Commercial agent dialogue never mutates cadastral records. Freehold ownership requires official Land Registry title registers.
3. **Zero Inferred Availability:** Silence (`NO_RESPONSE`) is never interpreted as unwillingness or unavailability.
4. **Zero Public Leakage of Internal Opportunities:** All internal candidate routes, review queues, and acquisition files are strictly gated behind edge middleware and server component auth checks.
5. **No False Immutability Claims:** The Truth Ledger is truthfully documented as **application-enforced append-only**. Database triggers and cryptographic hash chaining are absent and not claimed.

---

## 5. Verification Matrix

| ID | Issue | Status | Concrete Evidence |
| :--- | :--- | :--- | :--- |
| **DEF-013-02** | Contact Gating vs Disposal Agent Outreach | **`CLOSED`** | `nextActionEngine.ts` (lines 45–110, 219–232, 342–365, 462–475); verified across 7 scenarios in `phase13Acquisitions.test.ts`. |
| **DEF-013-04** | Truth Ledger Layer Classification | **`CLOSED`** | `truthLedgerService.ts` (lines 221, 252); `0026_reclassify_external_evidence_ledger.sql`; verified in `truthLedger.test.ts`. |
| **SEC-013-01** | Internal Route & Acquisition Exposure | **`CLOSED`** | `src/middleware.ts` (lines 5–11, 24–33, 40–49); `(internal)/layout.tsx` (lines 14–17); 13 tests in `internalRouteSecurity.test.ts`. |
| **DATA-013-01** | Submission Intake Real Persistence | **`CLOSED`** | `0025_opportunity_submissions.sql`; `submissionService.ts`; `api/submit/route.ts`; 7 tests in `submissionPersistence.test.ts`. |
| **PUBLIC-013-01** | Schema.org Classification Correction | **`CLOSED`** | `src/lib/metadata.ts` (line 52: `@type: "Corporation"`). |
| **PUBLIC-013-02** | Removal of Internal Telemetry | **`CLOSED`** | `src/app/sign-in/page.tsx` (lines 318–322); `LandRadarFeature.tsx` (line 107). |

---

## 6. Final Gate Determination

```text
============================================================
CRITICAL INTEGRITY CORRECTION PASS VERDICT:
STATE A — VERIFIED
============================================================
```

### Gate Decision
All six verified defects and security/data-integrity issues are **fully closed and verified in production-quality code**.
- **Automated Tests:** 237 passed, 0 failed across 64 test suites.
- **TypeScript Static Analysis:** 0 errors (`npx tsc --noEmit`).
- **Production Build:** 51/51 pages compiled cleanly (`npm run build`).
- **Phase 14 Gate:** **`GO`** (all technical and epistemic prerequisites satisfied).
