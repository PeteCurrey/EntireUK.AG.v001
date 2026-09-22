# Entire UK Land Radar — Geospatial Standards & Coordinate Reference Systems

## 1. Dual Coordinate Reference System (CRS) Standard

Land Radar uses two specific coordinate reference systems with deliberate separation of roles:

### Storage & Interchange: EPSG:4326 (WGS84)
- **Format**: Latitude and Longitude in decimal degrees.
- **Role**: Universal database storage, GeoJSON API payloads, and frontend map visualisation.
- **Precision**: 6-7 decimal places (~10cm to 1m resolution at UK latitudes).

### Calculation & Spatial Analysis: EPSG:27700 (British National Grid / OSGB36)
- **Format**: Projected coordinate system with Cartesian coordinates (Easting and Northing) in metres.
- **Role**: All spatial calculations:
  - `ST_Area` (area in m²)
  - `ST_Distance` (proximity in metres)
  - `ST_DWithin` (radius and adjacency queries)
  - `ST_Buffer` (spatial buffers)
  - `ST_Intersection` (constraint overlap percentages)
- **Rationale**: Calculating distance or area directly on EPSG:4326 in the UK yields distortions and degree-based metrics that cannot be used for accurate property development or land valuation.

---

## 2. Standard Spatial Operations in PostGIS

All spatial primitives must reproject before calculating:

### Area Calculation
```sql
ST_Area(ST_Transform(geometry, 27700))
```

### Proximity Check (e.g. Within 50m of Road Network)
```sql
ST_DWithin(
  ST_Transform(site.geometry, 27700),
  ST_Transform(road.geometry, 27700),
  50.0
)
```

### Percentage Overlap Calculation
```sql
ROUND(
  (ST_Area(ST_Intersection(
    ST_Transform(site.geometry, 27700),
    ST_Transform(constraint.geometry, 27700)
  )) / ST_Area(ST_Transform(site.geometry, 27700))) * 100,
  2
)
```

---

## 3. Geometry Validation Pipeline

Before any geometry is accepted into `sites` or `land_parcels`, it undergoes two-stage validation:

1. **Application Pre-check** (`validateGeoJsonGeometry`):
   - Type verification (`Polygon` or `MultiPolygon`).
   - Non-empty coordinate arrays.
   - Bounding box sanity check (Great Britain bounds: longitude -9° to +2°, latitude 49° to 61°).
2. **Database Engine Check** (`ST_IsValid` & `ST_MakeValid`):
   - Detection of self-intersecting rings.
   - Closure of exterior boundary loops.
   - Orientation of outer (clockwise) and inner holes (counter-clockwise).
   - Degenerate collapses and zero-area geometries.

Invalid geometries are never silently dropped; they are stored with `geometry_valid = false` and logged for data engineering review.
