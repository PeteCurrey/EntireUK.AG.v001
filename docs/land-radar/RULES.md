# Entire UK Land Radar — Deterministic Rule Engine

## 1. Design Philosophy

The Land Radar Rule Engine is **deterministic, versioned, and parameterised**.
- **No black-box heuristics**: Every rule outcome is traceable to explicit geometric or documentary evidence.
- **Explainability**: Every rule evaluation returns a human-readable explanation in addition to its classification.
- **Auditability**: Rule version (e.g. `v1`) is recorded alongside every generated signal and constraint.

---

## 2. Classification Taxonomy

The rule engine produces four distinct outcome classes:

1. **`hard_exclusion`**: A fatal obstacle for a *specific* strategy (e.g., standard residential screening).
   - *Example*: A site with 0.02 ha area (below residential thresholds) or a site in Flood Zone 3b (functional floodplain).
   - *Important*: An exclusion from standard residential does not preclude strategic long-term promotion or commercial uses.
2. **`soft_constraint`**: A factor that adds planning friction, design complexity, or infrastructure cost without precluding development.
   - *Example*: Site located 150m from road network (requires private access spur or section 278 agreement), or site partly in Flood Zone 2.
3. **`positive_signal`**: An evidence point that enhances development feasibility.
   - *Example*: Direct road frontage, settlement adjacency (<1,000m), or existing entry on a Brownfield Land Register.
4. **`unknown`**: Insufficient evidence to reach a conclusion.
   - *Example*: The local authority has not published a brownfield register, or Environment Agency coverage is missing for that coordinate.
   - *Rule*: Never treat `unknown` as `clear`.

---

## 3. Core Initial Rules (Strategy: Residential Screening)

| Rule ID | Name | Threshold | Outcome Logic |
| :--- | :--- | :--- | :--- |
| **`RULE-AREA-001`** | Minimum Area | < 1,000 m² (0.1 ha) | `hard_exclusion` (too small for standard development) |
| | Strategic Scale | >= 100,000 m² (10 ha) | `positive_signal` (strategic promotion candidate) |
| | Standard Infill | 1,000 m² – 100,000 m² | `soft_constraint` / viable footprint |
| **`RULE-SETTLE-001`** | Settlement Proximity | <= 1,000m to settlement | `positive_signal` (policy adjacency indicator) |
| | Isolated Rural | > 1,000m | `soft_constraint` (higher planning policy resistance) |
| **`RULE-ACCESS-001`** | Road Proximity | <= 100m to classified road | `positive_signal` (accessible frontage) |
| | Distant Access | > 2,000m from road | `hard_exclusion` (access creation prohibitive) |
| **`RULE-FLOOD-001`** | Flood Zone Overlap | >= 20% in Flood Zone 3 | `hard_exclusion` (requires sequential/exception test) |
| | Moderate Flood | >= 50% in Flood Zone 2 | `soft_constraint` (FRA required) |
| | Zero Overlap | 0% in flood zones | `positive_signal` |
| **`RULE-GREEN-BELT-001`** | Green Belt Overlap | > 0% Green Belt | `hard_exclusion` (strict NPPF policy constraint) |
