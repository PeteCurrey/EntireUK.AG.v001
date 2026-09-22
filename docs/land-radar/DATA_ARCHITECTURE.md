# Entire UK Land Radar — Data Architecture & Ingestion Lifecycle

## 1. Pipeline Architecture

Every external data ingestion flow follows a standardized 9-step pipeline:

```
[EXTERNAL SOURCE]
       │
       ▼
   1. FETCH (HTTP / GeoJSON / WFS / CSV / API)
       │
       ▼
   2. RAW DATA (Stored in provenance_records.raw_record unmodified)
       │
       ▼
   3. VALIDATE (Geometry validity, CRS detection, attribute schema)
       │
       ▼
   4. NORMALISE (Mapped to canonical TypeScript domain entities)
       │
       ▼
   5. SPATIAL PROCESSING (PostGIS EPSG:27700 reprojection, ST_Area, buffers)
       │
       ▼
   6. UPSERT (Idempotent database insertion with conflict resolution)
       │
       ▼
   7. PROVENANCE (Traceability record created answering "Where did this come from?")
       │
       ▼
   8. QUALITY REPORT (Coverage, freshness, invalid records, duplicate rates)
       │
       ▼
   9. SIGNAL GENERATION (Deterministic screening rules evaluate new evidence)
```

---

## 2. Raw vs. Normalised Separation

Source data is never mutated or overwritten in-place:
1. **Raw Source Record**: Preserved in `provenance_records.raw_record` as received from the upstream agency.
2. **Normalised Record**: Stored in strongly-typed relational tables (`land_parcels`, `planning_records`, `site_constraints`).

This separation guarantees that if:
- Schema rules change,
- Geodetic parsing algorithms improve, or
- Upstream corrections are published,
the entire intelligence estate can be reprocessed without loss of fidelity.

---

## 3. Resilience to Upstream Source Failure

Land Radar is designed to fail safely:
- If an external agency endpoint fails (timeout, rate limit, schema change):
  1. Previously valid, historical data is **never deleted**.
  2. The ingestion job is marked `status = 'failed'` with an explicit error trace.
  3. A `data_quality_reports` record is logged with `source_available = false`.
  4. The system flags the dataset freshness as degrading.
  5. Downstream rules evaluate the affected attributes as `unknown`, actively surfacing uncertainty to internal analysts rather than silently declaring sites "constraint-free".

---

## 4. Authoritative Source Matrix

| Authority | Dataset | Target Entity | Ingestion Mode |
| :--- | :--- | :--- | :--- |
| **HM Land Registry** | Price Paid Data | `market_comparables` | Monthly Batch (CSV) |
| **HM Land Registry** | INSPIRE Index Polygons | `land_parcels` | Monthly Cadastral Batch |
| **Environment Agency** | Flood Map for Planning (Zones 2 & 3) | `site_constraints` | Geospatial Polygons |
| **Natural England** | SSSI, Ancient Woodland, AONB | `site_constraints` | Vector Boundaries |
| **Historic England** | Listed Buildings, Scheduled Monuments | `site_constraints` | Point / Boundary Geometries |
| **DLUHC / LPAs** | Brownfield Land Registers | `site_signals` | Planning Data Platform API |
| **Ordnance Survey** | OS Open Roads / Greenspace | Spatial Primitives | Vector Tiles / Shapefiles |
