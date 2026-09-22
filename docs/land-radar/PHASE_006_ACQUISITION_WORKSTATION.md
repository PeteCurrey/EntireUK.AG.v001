# Phase 6 — Land Radar Acquisition Workstation

## Explainable Prioritisation, Investigation Workflow & Map-First Candidate Explorer

**Phase:** 6  
**Pilot:** EUK-PILOT-001 (Warwick District, Warwickshire)  
**Screening Strategy:** RESIDENTIAL_DEVELOPMENT_V1  
**Build Status:** ✅ Production build clean — 28 static pages  
**Tests:** ✅ 73/73 passing  

---

## 1. Overview

Phase 6 moves the Land Radar system from a backend pipeline into a fully interactive analyst workstation. The objective is to give a qualified Entire UK acquisition analyst a single, coherent interface to:

1. Discover candidate sites generated from Phase 5 real data ingestion
2. Understand **exactly why** each site was surfaced (explainable priority reasoning)
3. Recognise what is **unknown** — without ever mistaking missing data for a clean site
4. Record structured human decisions, next actions, and investigation notes
5. Gate the progression of a candidate to a commercial opportunity behind an explicit human approval

---

## 2. Phase 5 Audit Findings (Pre-Phase 6)

Before designing Phase 6, a structured audit was performed across all Phase 5 outputs:

| Area | Finding | Resolution in Phase 6 |
|---|---|---|
| Retrieval Mode | Adapters had no formal `retrievalMode` tag — analysts could not distinguish live API data from local fixtures | Added `retrievalMode: 'live' \| 'cached' \| 'local_fixture'` to all adapters and surfaced in Data Health + Evidence Ledger |
| Prioritisation | No priority logic existed. A candidate's relative importance was entirely subjective | Built deterministic categorical prioritisation engine (`high / medium / low / unprioritised`) with human-readable rationale — no 0–100 scores |
| Visual Unknowns | Green Belt and Planning History unknowns were not prominently surfaced in the UI | Dedicated amber warning panels on every candidate view. Epistemic state recorded explicitly — absence of record ≠ clearance |
| Investigation Workflow | No tables or models for next actions or investigation notes existed | Built `investigationService.ts` with in-memory/Supabase dual-persistence for actions, notes, and opportunity progressions |
| Opportunity Progression | Candidate-to-opportunity promotion was purely programmatic | Human decision gate introduced: explicit commercial justification + named approver required |

---

## 3. Architecture

### 3.1 Core Domain Modules

```
src/lib/land-radar/
├── types.ts                    — All domain types
│     + CandidatePriority       — 'high' | 'medium' | 'low' | 'unprioritised'
│     + WhySurfacedProfile      — Core driver, key factors, constraints, unknowns
│     + EvidenceCompleteness    — % assessed, evaluated/missing categories
│     + PrioritisationResult    — Full priority output from engine
│     + VisualUnknown           — Prominently rendered missing evidence categories
│     + ActiveConstraint        — Severity-classified constraint with overlap %
├── prioritisation.ts           — NEW Phase 6: deterministic explainable prioritisation
├── investigationService.ts     — NEW Phase 6: investigation workflow service
└── adapters/
    └── types.ts                — AdapterIngestResult now carries retrievalMode
```

### 3.2 Prioritisation Engine (`prioritisation.ts`)

The engine is deterministic and categorical. It evaluates six evidence dimensions:

| Dimension | Signals Evaluated | Priority Impact |
|---|---|---|
| Flood Risk | EA Flood Zone overlap % | HIGH if >50%, MEDIUM if >0% |
| SSSI Proximity | Natural England overlap | Constraint surfaced |
| Settlement Proximity | ONS BUA distance (m) | Positive signal if <500m |
| Brownfield Status | DLUHC register record | HIGH driver if designated |
| Road Proximity | OS Open Roads distance | UNKNOWN if deferred |
| Green Belt | LPA boundaries | UNKNOWN (dataset deferred) |

**Key design decisions:**
- No 0–100 score ever generated — scores create false precision that misleads acquisition decisions
- `VisualUnknown` entries are generated for every deferred dataset — analysts cannot miss them
- `EvidenceCompleteness` is reported as a percentage and a category checklist
- `recommendedNextActions` is deterministically generated from the evidence profile

### 3.3 Investigation Workflow Service (`investigationService.ts`)

Dual-persistence strategy:
1. **Live Supabase** (tables: `investigation_actions`, `investigation_notes`, `opportunity_progressions`) when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured
2. **In-memory store** when Supabase is not configured — seeded with realistic Warwick District investigation data for BF-001, BF-002, P-001

Workflow operations:
- `createAction()` — next action with type, priority, assignee, due date
- `updateActionStatus()` — `open → in_progress → completed` with completion metadata
- `addNote()` — immutable, timestamped, author-attributed notes with pinning
- `progressCandidateToOpportunity()` — human decision gate with frozen evidence snapshot

### 3.4 Retrieval Mode Propagation

All five adapters now implement `fetchWithMode()` returning `{ records, retrievalMode }`:

| Adapter | Dataset | Retrieval Mode Logic |
|---|---|---|
| `BrownfieldAdapter` | PLAN-BROWNFIELD-001 | `live` if DLUHC API responds, else `local_fixture` |
| `FloodAdapter` | EA-FLOOD-001 | `live` if EA WFS responds, else `local_fixture` |
| `SSSIAdapter` | NE-SSSI-001 | `live` if NE ArcGIS responds, else `local_fixture` |
| `HMLRInspireAdapter` | HMLR-INSPIRE-001 | `live` if HMLR WFS responds, else `local_fixture` |
| `BuiltUpAreaAdapter` | ONS-BUILTUP-001 | `live` if ONS API responds, else `local_fixture` |

`retrievalMode` propagates through:
`adapter.ingest()` → `AdapterIngestResult.retrievalMode` → `runPilot.ts` → `WorkstationPage.tsx` → `WorkstationExplorer.tsx` + `/data-health` + `/review/[siteId]` Evidence Ledger

---

## 4. Interface Routes

### `/land-radar` — Map-First Acquisition Workstation

Server component (`page.tsx`) + `'use client'` explorer (`WorkstationExplorer.tsx`).

**Features:**
- 4-filter toolbar: text search, priority, candidate origin, constraint filter
- Left pane: scrollable candidate list with priority badge, evidence completeness %, why-surfaced snippet
- Right pane: interactive `SiteGeoMap` with layer toggles + selected site dossier
- Amber epistemic integrity banner — *"Green Belt & Planning History: UNASSESSED"*
- Color-coded candidate markers: HIGH=emerald, MEDIUM=cyan, LOW=slate
- Multi-layer map: settlement boundary, flood zone hatch, SSSI pattern

### `/review/[siteId]` — Candidate Intelligence File

Full server-rendered Intelligence File per candidate.

**Sections:**
1. Candidate Header (reference, status, priority, area, screening strategy)
2. Why Surfaced Profile (core driver, key positive factors, active constraints)
3. Visual Unknowns Panel — amber warning cards for Green Belt + Planning History
4. Evidence & Provenance Ledger — tabular, retrieval mode badge per dataset
5. Investigation Panel (`'use client'`) — actions + notes + opportunity gate

### `/data-health` — Data Health & Licence Register

Now a server component that runs all 5 adapters at render time and reports:
- Live summary stats (datasets active, records ingested, live vs fixture count)
- Per-dataset retrieval mode badge (Live API / Cached / Local Fixture)
- Per-dataset record count
- Deferred datasets with explicit epistemic impact warnings
- Retrieval mode reference legend

### `/review` — Review Queue

Updated with:
- Priority column in candidates table
- "Open Map Workstation →" CTA button

---

## 5. Database Migration: `0019_investigation_workstation.sql`

Adds tables required for the Phase 6 workflow to the PostgreSQL/PostGIS Supabase schema:

```sql
-- retrieval_mode enum
CREATE TYPE retrieval_mode AS ENUM ('live_api', 'cached', 'local_fixture', 'manual_entry', 'synthetic_test');

-- Alter provenance_records to record how each record was retrieved
ALTER TABLE provenance_records ADD COLUMN retrieval_mode retrieval_mode NOT NULL DEFAULT 'local_fixture';

-- Next Actions per candidate site
CREATE TABLE investigation_actions (...);

-- Immutable Investigation Notes
CREATE TABLE investigation_notes (...);

-- Controlled human-gated Opportunity Progressions
CREATE TABLE opportunity_progressions (...);
```

All tables use:
- Full RLS: authenticated users and service_role only
- `updated_at` auto-update triggers
- Foreign key references to `sites(id)` and `opportunities(id)`

---

## 6. Epistemic Principles Upheld

The following principles govern every Phase 6 intelligence output:

### 6.1 Unknown ≠ Clear
Any dataset that was not ingested (Green Belt, OS Roads) generates an explicit `VisualUnknown` entry. These are rendered as amber warning panels on every candidate view. The absence of a constraint record is **never** interpreted as confirmation that no constraint exists.

### 6.2 No Magic Scores
Priority is categorical: `HIGH`, `MEDIUM`, `LOW`, `UNPRIORITISED`. No numeric scoring is generated at any layer. Priority buckets are determined by deterministic rules in `prioritisation.ts` which are human-readable and auditable.

### 6.3 Immutable Provenance
Every ingested record carries its raw payload, retrieval timestamp, `retrievalMode`, and source dataset ID. The Evidence Ledger on each candidate's Intelligence File surfaces this for analyst review.

### 6.4 Human Decision Gate
Candidates do not automatically become Opportunities. An authorised acquisition professional must explicitly:
1. Confirm the commercial justification
2. Provide a named approver
3. Acknowledge that all visual unknowns have been reviewed

A frozen evidence snapshot is stored at the moment of progression.

---

## 7. Warwick District Pilot Status

### Pilot: EUK-PILOT-001

| Item | Status |
|---|---|
| Geography | Warwick District, Warwickshire |
| Bounding Box | `[-1.70, 52.22, -1.45, 52.38]` EPSG:4326 |
| Screening Strategy | `RESIDENTIAL_DEVELOPMENT_V1` |
| Candidate Sites Generated | 8 |
| Candidates Passing Screening | 8 |
| Sample Priorities | BF-001: MEDIUM (15% flood zone); BF-002: HIGH; BF-003: HIGH |

### Datasets

| Dataset | Status | Retrieval Mode | Records |
|---|---|---|---|
| DLUHC Brownfield Register | ✅ Ingested | Local Fixture* | 4 |
| EA Flood Map for Planning | ✅ Ingested | Local Fixture* | 3 |
| Natural England SSSI | ✅ Ingested | Local Fixture* | 2 |
| HMLR INSPIRE Index Polygons | ✅ Ingested | Local Fixture* | 5 |
| ONS Built-up Areas 2022 | ✅ Ingested | Local Fixture* | 3 |
| LPA Green Belt Boundaries | ⚠ Deferred | — | — |
| OS Open Roads | ⚠ Deferred | — | — |

_*Local fixture = authentic Warwick District snapshot used in offline/sandbox environment. In production with live API credentials, mode will be `live`._

---

## 8. Test Coverage (Phase 6)

| Test File | Tests | Coverage |
|---|---|---|
| `prioritisation.test.ts` | 4 | Priority engine: HIGH/MEDIUM/LOW buckets, no-score guarantee, unknown-not-clear, why-surfaced profile |
| `workflow.test.ts` | 4 | Action creation, status transitions, note immutability, opportunity gate with frozen snapshot |
| All existing Phase 1–5 tests | 65 | Unchanged |
| **Total** | **73** | **73/73 passing** |

---

## 9. Navigation Map

```
/land-radar           ← Map Workstation (Phase 6 primary entry point)
/review               ← Review Queue (updated: priority column, workstation CTA)
/review/[siteId]      ← Intelligence File (Phase 6: why-surfaced, evidence ledger, workflow)
/data-health          ← Data Health & Licence Register (Phase 6: live retrieval modes)
```

---

## 10. Next Steps (Phase 7 Candidates)

The following are not yet implemented and represent natural Phase 7 scope:

1. **Supabase Provisioning** — Apply `0019_investigation_workstation.sql` to a live Supabase project. Replace in-memory fallback with real-time persistence for actions, notes, and progressions.
2. **Expand Static Params** — `generateStaticParams()` in `/review/[siteId]` currently pre-renders 4 candidates. Expand to all 8 pilot candidates.
3. **Green Belt Ingestion** — Obtain LPA data sharing agreements and ingest Green Belt polygons. Remove `UNKNOWN` status for green belt signals.
4. **OS Open Roads** — Ingest OS Open Roads OGL data. Enable road proximity signal with real distance values.
5. **Next Pilot Geography** — Define EUK-PILOT-002 beyond Warwick District. Stratford-upon-Avon or Rugby are logical Warwickshire neighbours for an expanded pilot.
6. **Provenance Trace Modal** — Implement clickable provenance chain from candidate → signal → source record → raw JSON in the Intelligence File.

---

*Document generated: Phase 6 completion, September 2026.*  
*Maintained by: Entire UK Land Radar Team.*
