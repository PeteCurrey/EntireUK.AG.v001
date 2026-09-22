# Land Radar — Structured Data Gap Register

**Authoritative Reference:** Land Radar Evidence Architecture  
**Phase:** 10 (Real-World Acquisition Validation & Candidate Truth Ledger)  
**Governance Principle:** UNKNOWN IS NOT CLEAR. Absence of data must never be inferred as clearance.

This register formally catalogs the core evidence categories required for residential acquisition intelligence across pilot and national geographies, documenting legal status, technical readiness, epistemic representation, and the actionable ingestion roadmap.

It also records **confirmed data false negatives** identified during real-world validation cohort analysis — cases where a genuine acquisition opportunity was missed because the underlying dataset was incomplete or incorrect.

---

## Phase 10 Confirmed Data False Negatives

These entries record sites that Land Radar failed to surface because the input data was absent or incorrect — **not** because the rule logic was wrong. See [RULE_ERROR_REGISTER.md](./RULE_ERROR_REGISTER.md) for rule logic errors.

### DATA-FN-001 — DLUHC Brownfield Register (Warwick LPA)

| Field | Value |
|-------|-------|
| **Error ID** | DATA-FN-001 |
| **Status** | OPEN |
| **Registered** | September 2026 |
| **Cohort** | COHORT-WARWICK-001 |
| **Site** | Old Warwick Road Gasworks, Warwick |
| **Affected Dataset** | DLUHC Brownfield Register (England) |
| **False Negative Category** | `data_false_negative` |

#### Description

Old Warwick Road Gasworks (a former gas holder site, approximately 0.8 ha) was independently identified as a genuine acquisition opportunity by a qualified analyst. It meets the brownfield land definition under NPPF Annex 2 (previously developed land) and DLUHC's Brownfield Register guidance.

However, the site is **absent from Warwick District Council's DLUHC Brownfield Register submission**. Because the DLUHC Brownfield Register is Land Radar's primary brownfield classification signal, the site received no `brownfield_signal` and was therefore not surfaced.

#### Evidence

- Physical site inspection confirmed former industrial use (gas holder foundations visible)
- Warwick LPA planning officer confirmed the site is known to the authority as brownfield
- The site does not appear in the LPA's current or prior DLUHC submission data

#### Root Cause

Local planning authority submission to the DLUHC Brownfield Register is a statutory duty but compliance and completeness vary. Some sites are omitted due to:

- Sites under active promotion where LPAs defer registration pending planning application
- Sites where the brownfield classification is disputed
- Administrative omissions in the annual data preparation cycle

The LPA submission is the only current source for the brownfield classification signal. Land Radar has no independent brownfield classification capability.

#### Impact

- **False Negative:** Land Radar did not surface a genuine brownfield acquisition opportunity
- **Systematic Risk:** If a single LPA has material omissions, all sites in that LPA affected by the omission will be missed
- **Scale Uncertainty:** Unknown — no audit of LPA submission completeness has been performed

#### Proposed Remediation

Investigate supplementary brownfield classification signals for V4 strategy:

1. **Historic Environment Record (HER)** — records known industrial heritage sites; not limited to LPA submission cycles
2. **Contaminated Land Register (Part IIA, Environment Act 1990)** — local authority records of contaminated land designations; often includes former gas works and industrial land
3. **Historic OS 25-inch mapping series** — identifies industrial land use from 19th/20th century; available via National Library of Scotland tile API
4. **INSPIRE Index Polygon use class crosswalk** — HMLR title class data may indicate industrial use class even where DLUHC register is silent

> [!NOTE]
> Until supplementary sources are integrated, analysts conducting investigations in any LPA should manually verify DLUHC register completeness against the Local Plan's brownfield land schedule.
> 
> **Phase 11 Update:** Under the Phase 11 Contradiction Engine, if an analyst records `external_evidence` showing brownfield status for a site where machine signals report no brownfield record, a `MACHINE_VS_EXTERNAL` contradiction is flagged deterministically, elevating the candidate for human review rather than discarding it.

---


## Evidence Gap Matrix

| Category ID | Importance | Affected Geography | Authoritative Source Needed | Legal Status / Licence | Technical Status | Epistemic State | Recommended Next Step |
|---|---|---|---|---|---|---|---|
| `GREEN_BELT` | **CRITICAL** | England (All metropolitan green belt authorities, incl. Warwick & Rugby) | DLUHC English Local Authority Green Belt boundaries | Open Government Licence v3.0 (Commercial reuse permitted with attribution) | ✅ Adapter implemented (`GreenBeltAdapter`) with authentic boundary polygons | `known` where evaluated; `unknown` if unassessed | Complete live WFS endpoint automated refresh in Phase 8 |
| `PLANNING_HISTORY` | **HIGH** | England & Wales (National) | LPA Planning Portals (Idox / Northgate / Planning Data Platform) | Public register; OGL v3.0 where published via Planning Data Platform | ✅ **PILOT TESTED** — `PlanningAdapter` implemented; 5-tier spatial matcher; `RESIDENTIAL_DEVELOPMENT_V2` with `RULE-PLAN-001` and `RULE-PLAN-002`; Acquisition Investigation Brief generator | `known` where pilot fixture data exists (Warwick + Rugby); `unknown` for unassessed LPAs | Expand live API ingestion to additional LPAs; integrate live `planning.data.gov.uk` `planning-permission` endpoint for production |
| `ROAD_PROXIMITY` | **HIGH** | Great Britain | Ordnance Survey Open Roads | Open Government Licence v3.0 (Crown copyright attribution) | ✅ Adapter implemented (`RoadAdapter`) with envelope clipping | `known` (geometric proximity); access disclaimer attached | Expand bounding box clipping pipeline for future pilot geographies |
| `OWNERSHIP` | **CRITICAL** | England & Wales | HM Land Registry Commercial & Corporate Ownership (CCOD) / Title Registers | CCOD (OGL v3.0); Private freehold titles require paid HMLR Search/Title Register purchases (£3/title) | Partial (INSPIRE index polygons ingested for parcel boundaries) | `inferred` from INSPIRE parcel references; true beneficial owner is `unknown` | Integrate CCOD open data for corporate owners; provide direct HMLR title lookup hooks |
| `UTILITIES` | **MEDIUM** | Regional Distribution Network Operators (DNOs) & Water Companies | National Grid, Western Power (National Grid Electricity Distribution), Severn Trent Water | Commercial utility asset records; regulated infrastructure security restrictions | No open national API exists | `unknown` | Commission automated desktop utility connection queries during active human investigation |
| `LOCAL_PLAN_ALLOCATION` | **HIGH** | Local Planning Authorities (Warwick, Rugby, etc.) | LPA Strategic Housing Land Availability Assessment (SHLAA) / Local Plan Policies Map Allocations | Published as statutory Local Plan evidence under OGL v3.0 | ✅ **PHASE 9 RESOLVED** — `LocalPlanAdapter` implemented; ingested Warwick DS11/DS15 & Rugby DS7/DS8; capacityEngine calculates gross vs net developable area | `known` where pilot fixture data exists (Warwick + Rugby); `unknown` for unassessed LPAs | Ingest emerging local plan allocations and national call-for-sites feeds |
| `MARKET_PRICE_PAID` | **HIGH** | England & Wales (National) | HM Land Registry Price Paid Data (PPD) | Open Government Licence v3.0 (Crown copyright and database right 2026) | ✅ **PHASE 9 RESOLVED** — `PricePaidAdapter` implemented; 3-tier spatial comparableEngine; deterministic marketClassifier; strict Anti-Valuation Gate enforced | `known` where transactions match search radius; `unknown` where unassessed; absence of sales != absence of market | Integrate national monthly 3GB Land Registry PPD stream |
| `FLOOD_DEFENCE` | **MEDIUM** | England | Environment Agency Recorded Flood Defences & Areas Benefiting from Defences (ABD) | Open Government Licence v3.0 (Defra Data Services Platform) | EA Flood Zone 2 & 3 ingested; Defences dataset identified | `known` for flood hazard; residual defence benefit is `unknown` | Ingest EA Areas Benefiting from Defences layer to refine net risk classification |
| `ACCESS` | **CRITICAL** | Great Britain | Local Highway Authority Highways Register & OS MasterMap Highways Network | Public highway record; Section 36 List of Streets | Street-level proximity calculated; legal right-of-way and ransom strip status requires title review | `unknown` (semantic distinction: proximity != vehicular access) | Keep strict disclaimer; require analyst title verification before opportunity progression |
| `HERITAGE` | **MEDIUM** | England | Historic England National Heritage List for England (NHLE) | Open Government Licence v3.0 | Dataset available via Historic England Open Data GIS (Listed Buildings, Scheduled Monuments, Registered Parks) | `unknown` in Pilot 001/002 | Implement `HistoricEnglandAdapter` for Listed Buildings Grade I, II* and II buffers |

---

## Detailed Category Assessments

### 1. `GREEN_BELT`
* **Acquisition Impact:** Inappropriate development in Green Belt is restricted under NPPF Chapter 13 unless "Very Special Circumstances" are demonstrated. Mistaking a Green Belt site for unconstrained white land leads to catastrophic acquisition errors.
* **Current Status in Phase 7:** Ingested via `GreenBeltAdapter` under OGL v3.0. For urban brownfield sites (e.g. Princes Drive in Leamington, Mill Road in Rugby), 0% overlap is verified. Rural fringe sites overlapping Green Belt are classified with an active constraint.
* **Roadmap:** Live WFS synchronization with DLUHC planning data platform.

### 2. `ROAD_PROXIMITY` vs `ACCESS`
* **Acquisition Impact:** Sites without adopted highway access are un-developable or subject to ransom demands from third-party ransom strip holders.
* **Semantic Rule:** Land Radar calculates *geometric highway proximity* (metres from centroid/boundary to nearest adopted road). It **never** labels proximity as "verified vehicular access".
* **Current Status in Phase 7:** Ingested via `RoadAdapter`. Every signal includes the statutory disclaimer: *"Road proximity indicates geometric adjacency to the public highways network. It does not confirm physical entrance adequacy, visibility splays, ransom strip absence, or legal vehicular access rights."*

### 3. `OWNERSHIP`
* **Acquisition Impact:** Acquisition requires dealing directly with the legal title holder or optionee.
* **Current Status in Phase 7:** HMLR INSPIRE Index Polygons provide cadastral boundaries and title identifiers. Beneficial ownership details are held in HMLR Title Registers.
* **Roadmap:** Phase 8 will ingest HMLR CCOD (Commercial and Corporate Ownership Data) to surface corporate landholders free of charge under OGL v3.0.

### 4. `PLANNING_HISTORY`
* **Acquisition Impact:** Previous planning refusals or existing permissions dramatically affect residual land value and deliverability risk.
* **Current Status in Phase 7:** Highlighted as a prominent **Visual Unknown** on every candidate dossier.
* **Roadmap:** Automated ingestion of DLUHC planning application feeds (`planning-permission` entities).

---

## Phase 12 Live Acquisition Findings & Material Gaps

During the investigation of the Phase 12 Live Acquisition Validation Cohort (`COHORT-LIVE-001`), the following gaps were identified as materially affecting acquisition decisions:

### 1. Utility Infrastructure Easements (Candidate: EUK-S-RUGBY-BF-003)
- **Gap:** Statutory water company trunk main traversal unknown prior to legal title deed inspection.
- **Impact:** 450mm Severn Trent Water trunk main requires a 10m easement standoff, reducing net developable footprint by 22%.
- **Workaround:** Desktop statutory undertaker utility searches commissioned during active human review.
- **Roadmap:** Investigate LinesearchbeforeUdig (LSBUD) API or digital utility asset mapping integration.

### 2. LPA Annual Brownfield Feed Incompleteness (Candidate: EUK-HB-WARWICK-001 / DATA-FN-001)
- **Impact:** Omission of surplus utility / gas holder land from DLUHC Brownfield submission causes systematic machine omission.
- **Workaround:** Analyst cross-references Local Plan call-for-sites submissions and direct utility landowner dialogues.

---

*Register maintained under Entire UK Land Radar Governance Protocol.*
