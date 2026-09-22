# Entire UK Land Radar — Rule Error Register

**Purpose:** A permanent record of confirmed rule logic errors identified during real-world validation cohort analysis.  
**Maintained by:** Land Radar development team  
**Governed by:** Phase 10 Section 14 — Rule Error Registration Protocol  

---

## Protocol

An entry must be created in this register when **any** of the following conditions are confirmed:

1. External evidence with `contradiction_status = 'CONTRADICTS'` is recorded for a machine signal
2. A false positive is diagnosed with root cause `rule_false_positive`, `access_failure`, or `geometry_false_positive` where the rule logic was the proximate cause
3. A false negative is diagnosed with category `rule_false_negative` or `geometry_false_negative`

> [!IMPORTANT]
> **Entries in this register are immutable once written.** Subsequent validation findings in new cohorts produce new entries. Existing entries may be marked REMEDIATED but must not be edited or deleted. The historical error record must be preserved.

> [!CAUTION]
> **Rule changes are prohibited during an active validation cohort.** Register an error, but do not modify the rule until the cohort is complete and a new cohort is initiated.

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| `OPEN` | Error confirmed, no remediation strategy agreed |
| `REMEDIATION_PROPOSED` | Remediation strategy agreed, awaiting implementation |
| `REMEDIATED` | Rule has been corrected in a new strategy version (V4+), new cohort initiated |
| `ACCEPTED_RISK` | Error acknowledged but accepted as a known limitation (e.g., data unavailability means the error cannot be corrected with current datasets) |

---

## Register

---

### RULE-ROAD-001

| Field | Value |
|-------|-------|
| **Error ID** | RULE-ROAD-001 |
| **Status** | OPEN |
| **Registered** | September 2026 |
| **Cohort** | COHORT-WARWICK-001 |
| **Site** | Farmer Ward Road, Warwick |
| **Rule** | RULE-ACCESS-001 (road proximity signal) |
| **Error Type** | False Positive — access_failure |
| **Strategy Versions Affected** | V1, V2, V3 |

#### Description

The road proximity rule (`RULE-ACCESS-001`) evaluates site access viability by measuring the distance from the site centroid to the nearest OS-mapped road segment. The rule returns a positive signal when a site centroid is within a defined threshold of a road.

#### What Went Wrong

Farmer Ward Road, Warwick scored a **positive access signal** because the site boundary adjoins an OS-mapped road. However, physical site inspection and a desktop highways audit revealed that:

- The road frontage is subject to a **ransom strip** owned by a third party
- The site does not have **direct highway frontage** — it has proximity to a mapped road, which is a different thing
- Obtaining vehicular access would require purchasing the ransom strip at an unquantifiable premium

The machine signal (`road_proximity`, `status: known`, `confidence: 1.0`) was technically correct in that a road is nearby. But the rule logic does not distinguish between:

- **Direct highway frontage** (site boundary abuts an adoptable road)
- **Road proximity** (a road is nearby, but access requires additional land or works)

#### Evidence

External evidence type: `physical_site_inspection` + `highways_audit`  
Contradiction status: `CONTRADICTS`  
Confidence: 0.9  
Source: [Highways consultant desk review, September 2026]

#### Impact

- **False Positive Rate Contribution:** 1 false positive in COHORT-WARWICK-001
- **Investigation Cost:** Analyst investigation time wasted on an unviable site
- **Risk Level:** HIGH — road proximity is a core screening signal; miscalibration affects all three strategies

#### Proposed Remediation

> [!NOTE]
> The following remediation strategy requires new data sources not currently licensed. Implementation is conditional on data acquisition.

Investigate the following data sources for V4 strategy:

1. **OS OpenData Highways Network** — road topology including carriageway classification; could enable distinction between adoptable highway and private road
2. **LLPG/AddressBase Premium** — confirmed postal addresses with UPRN; sites with a confirmed address UPRN on the road boundary are more likely to have direct frontage
3. **OS Rights of Way data** — public footpaths, bridleways, and highways recorded at district level; cross-reference with site boundary

Until data is available: downgrade road proximity confidence from `1.0` to `0.7` when site is accessed via a classified road with no confirmed address UPRN on the boundary. Flag as `access_adequacy: unknown` rather than `known` positive.
 
> [!NOTE]
> **Phase 11 Materiality Assessment:** In Phase 11, RULE-ROAD-001 was formally reviewed. Under the Phase 11 acquisition gate framework, sites with highway proximity but unconfirmed access are held at `HOLD_PENDING_CLARIFICATION` rather than promoted to acquisition without human highways audit. V4 strategy implementation remains pending live highway layer licensing.

---

### RULE-SETTLE-001

| Field | Value |
|-------|-------|
| **Error ID** | RULE-SETTLE-001 |
| **Status** | REMEDIATION_PROPOSED |
| **Registered** | September 2026 |
| **Cohort** | COHORT-RUGBY-001 |
| **Site** | Newbold Road, Rugby |
| **Rule** | RULE-SETTLE-001 (settlement proximity signal) |
| **Error Type** | False Negative — rule_false_negative |
| **Strategy Versions Affected** | V1, V2, V3 |

#### Description

The settlement proximity rule (`RULE-SETTLE-001`) evaluates whether a site is within the defined distance of a settlement boundary. Sites beyond the buffer receive a settlement proximity signal of `unknown` or `negative`, which reduces their prioritisation score.

#### What Went Wrong

Newbold Road, Rugby was independently identified by a qualified analyst as a genuine acquisition opportunity (Human Benchmark Candidate). The site is a **suburban-fringe brownfield** parcel adjacent to established residential development, within the urban grain of Rugby borough.

However, Land Radar did not surface the site. Investigation revealed:

- Site centroid is **1040m** from the nearest settlement boundary node
- The V1/V2/V3 settlement proximity buffer is **850m**
- The site therefore received a **negative settlement proximity signal**
- This reduced its total score below the `MEDIUM` threshold

The rule logic was applied correctly per specification. The specification itself is miscalibrated for suburban-fringe markets.

#### Evidence

External evidence type: `physical_site_inspection` + `planning_consultant_advice`  
Contradiction status: `CONTRADICTS` (rule excluded a site the market recognises as within the urban grain)  
Confidence: 0.85  
Source: [Planning consultant review, September 2026]

#### Impact

- **False Negative Rate Contribution:** 1 false negative in COHORT-RUGBY-001
- **Risk Level:** MEDIUM — buffer miscalibration is a systematic bias against suburban-fringe sites in all three strategies
- **False Negative Category:** `rule_false_negative`

#### Proposed Remediation

Introduce **V4 strategy** with the following change:

```
Settlement proximity buffer: 850m → 1200m
```

All other V4 rule parameters identical to V3.

Required steps before V4 can be activated:

1. Re-run full pilot dataset against V4 strategy
2. Compare V4 candidate set against V1/V2/V3 output — measure incremental candidates and check for false positive inflation
3. Initiate `COHORT-WARWICK-002` and `COHORT-RUGBY-002` with V4 strategy frozen
4. Validate new cohort against same external evidence standard

> [!WARNING]
> V4 must not be applied retrospectively to `COHORT-WARWICK-001` or `COHORT-RUGBY-001`. Those cohorts are validated against V1/V2/V3. A wider buffer will generate additional candidates that are not yet validated.

---

## Phase 12 Live Acquisition Cohort Calibration Review (September 2026)

### 1. Recurrence Audit on Live Cohort (COHORT-LIVE-001)

| Error ID | Description | Live Recurrence in Phase 12 | Status / Disposition |
|----------|-------------|-----------------------------|----------------------|
| `RULE-ROAD-001` | Geometric proximity misidentifying sites separated by ransom strips | Recurred on `EUK-S-WARWICK-BF-004` (Farmer Ward Road). 0.5m unadopted verge strip confirmed by WCC Highways. | `MONITOR` / `MODEL_LIMITATION`. Access disclaimer enforced; gate strictly holds site without human highways audit. V4 strategy implementation requires licensed highway boundary polygons. |
| `RULE-SETTLE-001` | Rigid 1000m settlement buffer excluding viable growth-corridor parcels | Recurred on `EUK-HB-RUGBY-001` (Newbold Road Commercial Estate at 1040m). | `REMEDIATION_PROPOSED`. V4 strategy specification documented (expanding buffer to 1200m). V1/V2/V3 strategies remain frozen to preserve audit integrity. |

### 2. Strategy V4 Formulation Principles
- **No retrospective rewriting:** V1/V2/V3 remain immutable and authoritative baselines.
- **Controlled trade-off:** Expanding the settlement buffer to 1200m captures Newbold Road but inflates prospective candidate review volume by approximately 18% in rural fringe sectors.
- **Activation trigger:** Requires execution of formal COHORT-WARWICK-002 and COHORT-RUGBY-002 with dedicated analyst resources.

---


<!-- FUTURE ERRORS APPENDED HERE -->
