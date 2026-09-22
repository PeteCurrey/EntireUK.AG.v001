-- ============================================================
-- ENTIRE UK — Land Radar Database Foundation
-- Migration 0001: Enable PostGIS Extension
--
-- CANONICAL COORDINATE REFERENCE SYSTEM (CRS) DOCUMENTATION
-- ============================================================
-- Storage CRS:      EPSG:4326  (WGS84 geographic, lat/lon)
--                   Used for storing and exchanging geometries.
--                   Compatible with GeoJSON, most APIs.
--
-- Calculation CRS:  EPSG:27700 (British National Grid / Ordnance Survey)
--                   Used for all area, distance and proximity calculations.
--                   Units are metres. Precision: ~1mm in Great Britain.
--                   Required for accurate UK spatial analysis.
--
-- Transformation:   ST_Transform(geom, 27700) before any area/distance op.
--                   ST_Transform back to 4326 for storage.
--                   PostGIS handles datum shift automatically.
--
-- Precision expectations:
--   - Site boundaries: +/-1m acceptable (polygon generalisation expected)
--   - Distance signals: +/-10m acceptable
--   - Area calculations: +/-1% acceptable for planning-scale polygons
--
-- NOTE: Never perform ST_Area or ST_Distance on EPSG:4326 geometries
--       for UK land analysis. Results will be in degrees, not metres.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

COMMENT ON EXTENSION postgis IS 'Entire UK Land Radar spatial foundation. Canonical CRS: EPSG:4326 for storage, EPSG:27700 for calculations.';
