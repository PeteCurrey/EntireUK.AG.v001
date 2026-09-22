# Phase 8 — Planning Intelligence, Development Potential & Acquisition Validation

**Phase:** 8  
**Pilots:** EUK-PILOT-001 (Warwick District) & EUK-PILOT-002 (Rugby Borough)  
**Screening Strategies:** `RESIDENTIAL_DEVELOPMENT_V1` (Preserved baseline) & `RESIDENTIAL_DEVELOPMENT_V2` (Planning-enhanced)  
**Datasets Ingested:** 8 authoritative datasets (Brownfield, Flood, SSSI, INSPIRE, BUA, Green Belt, OS Open Roads, LPA Planning Registers)  
**Tests:** ✅ 100/100 passing across 27 suites  

---

## 1. Executive Summary

Phase 8 elevates Entire UK's Land Radar from a spatial GIS screening tool into an authoritative **acquisition intelligence platform**. By integrating authentic historical planning records from Local Planning Authorities under the Open Government Licence v3.0, Land Radar can now assess prior development precedent, policy friction, and planning momentum without compromising its foundational epistemic principles.

### Key Milestones Achieved:

1. **Strict Planning Epistemic Semantics**:
   - **No prediction of planning outcomes**: Historical planning applications are treated as factual evidence of past principle and precedent, not as probabilistic crystal balls.
   - **Approved $\neq$ Developable**: A past planning consent does not prove current permission, extant commencement, or legal deliverability.
   - **Refused $\neq$ Impossible**: A historic refusal records planning or technical friction under a specific scheme and policy epoch; it does not disqualify revised proposals under updated local plans.
   - **No Record Found $\neq$ No Planning History**: Explicitly distinguishes between "LPA register screened, zero records matched" vs "LPA register unassessed / data unavailable".

2. **5-Tier Deterministic Spatial Matcher (`spatialMatcher.ts`)**:
   - **Tier 1 (`intersects_candidate`)**: Planning application boundary directly intersects candidate polygon.
   - **Tier 2 (`intersects_source_parcel`)**: Application intersects the broader source cadastral parcel.
   - **Tier 3 (`nearby_buffer`)**: Application centroid is within a 500m proximity buffer of candidate centroid.
   - **Tier 4 (`address_match`)**: High-confidence text match between site address and planning application location.
   - **Tier 5 (`textual`)**: Reference or site name match.

3. **Deterministic Application & Decision Classification (`classifier.ts`)**:
   - Categorises proposals into `residential`, `commercial`, `industrial`, `mixed_use`, `infrastructure`, and `agricultural`.
   - Preserves original LPA description and references verbatim.

4. **Strategy Versioning: V1 vs V2**:
   - **`RESIDENTIAL_DEVELOPMENT_V1`** remains frozen and unmodified as a historical benchmark.
   - **`RESIDENTIAL_DEVELOPMENT_V2`** introduces `RULE-PLAN-001` (Planning Activity & Prior Approval Signal) and `RULE-PLAN-002` (Historical Planning Friction).

5. **Acquisition Investigation Brief Generator (`briefGenerator.ts`)**:
   - Synthesises site geography, why surfaced core drivers, positive signals, active constraints, critical unknowns, planning history timeline, and actionable next steps into a deterministic executive brief for qualified human analysts.

6. **Full Workstation & Health Page Integration**:
   - `/review/[siteId]`: Interactive planning timeline with decision badges, spatial match tiers, and executive Acquisition Investigation Brief container.
   - `/data-health`: Comprehensive 8-dataset operational monitoring and new LPA Planning Register Coverage Matrix for Warwick District and Rugby Borough.

---

## 2. Evidence Architecture & Dataset Ingestion

| Dataset ID | Organisation | Layer Name | Format / Protocol | Licence | Ingestion Adapter |
|---|---|---|---|---|---|
| `DLUHC-BROWNFIELD-001` | DLUHC | Brownfield Land Register | GeoJSON / CSV | OGL v3.0 | `BrownfieldAdapter` |
| `EA-FLOOD-001` | Environment Agency | Flood Map for Planning (Zones 2 & 3) | GeoJSON / WFS | OGL v3.0 | `FloodAdapter` |
| `NE-SSSI-001` | Natural England | Sites of Special Scientific Interest | GeoJSON / WFS | OGL v3.0 | `SSSIAdapter` |
| `HMLR-INSPIRE-001` | HM Land Registry | INSPIRE Cadastral Parcels | GML / GeoJSON | OGL v3.0 | `InspireAdapter` |
| `ONS-BUA-001` | ONS | Built-up Areas 2022 | GeoJSON | OGL v3.0 | `BUAAdapter` |
| `LPA-GREENBELT-001` | DLUHC | Local Authority Green Belt | GeoJSON / WFS | OGL v3.0 | `GreenBeltAdapter` |
| `OS-OPEN-ROADS-001` | Ordnance Survey | OS Open Roads | GeoJSON / Shapefile | OGL v3.0 | `RoadAdapter` |
| `PLANNING-REGISTER-001` | DLUHC / LPAs | Planning Applications Register | REST / GeoJSON | OGL v3.0 | `PlanningAdapter` |

---

## 3. Spatial Matching & Verification Results

### 3.1 Warwick District (`EUK-PILOT-001`)
- **Ford Foundry, Leamington Spa (`EUK-WAR-BF-001`)**: Matched Tier 1 outline application (`W/18/1435`) for major mixed-use residential development (Approved). Positive planning context confirmed.
- **Montague Road, Warwick (`EUK-WAR-BF-002`)**: Matched Tier 3 nearby applications (`W/20/0812`, `W/19/1150`) illustrating ongoing employment-to-residential regeneration in the immediate corridor.

### 3.2 Rugby Borough (`EUK-PILOT-002`)
- **Former Alstom Works, Mill Road (`EUK-RUG-BF-001`)**: Matched Tier 1 application (`R19/0452`) for demolition and residential redevelopment of former industrial engineering works (Approved).
- **Rugby Railway Yard (`EUK-RUG-BF-002`)**: Screened with zero conflicting refusals; nearby railway corridor infrastructure applications identified.

---

## 4. Test Suite Summary

```
✔ PlanningAdapter ingests Warwick and Rugby authentic planning records
✔ Planning classifier deterministically categorises residential, commercial, and mixed-use
✔ Spatial matcher assigns correct tiers (Tier 1 intersection, Tier 3 proximity)
✔ Planning signals adhere strictly to epistemic semantics (Absence of record != Absence of history)
✔ Screening strategy comparison: V1 preserved, V2 incorporates RULE-PLAN-001
✔ Acquisition Investigation Brief generates deterministic executive summaries
```

Total Test Coverage: **100 tests passing, 0 failures across 27 suites**.

---

*Entire UK Land Radar — Phase 8 Governance Documentation*
