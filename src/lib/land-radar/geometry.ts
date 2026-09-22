/**
 * Land Radar — Geometry utilities
 *
 * COORDINATE REFERENCE SYSTEMS:
 * - Storage:      EPSG:4326  (WGS84, lat/lon)
 * - Calculations: EPSG:27700 (British National Grid, metres)
 *
 * All area and distance calculations must use EPSG:27700.
 * Never call ST_Area or ST_Distance on EPSG:4326 geometries for UK land analysis.
 * Results in degrees are meaningless for land parcel sizing.
 *
 * These utility functions produce PostGIS SQL expressions that can be embedded
 * in Supabase RPC calls or query builders.
 */

import type { GeometryValidationResult } from './types';

// ---------------------------------------------------------------------------
// SQL expression generators
// These return PostGIS SQL fragments for use in RPC functions.
// ---------------------------------------------------------------------------

/**
 * Returns a PostGIS expression that calculates area in m²
 * using British National Grid (EPSG:27700).
 *
 * @param geomColumn - The geometry column name (default: 'geometry')
 */
export function areaSqmExpression(geomColumn = 'geometry'): string {
  return `ST_Area(ST_Transform(${geomColumn}, 27700))`;
}

/**
 * Returns a PostGIS expression for distance in metres between two geometries.
 * Uses EPSG:27700 for metre-accurate results.
 */
export function distanceMetresExpression(geomA: string, geomB: string): string {
  return `ST_Distance(ST_Transform(${geomA}, 27700), ST_Transform(${geomB}, 27700))`;
}

/**
 * Returns a PostGIS expression that checks if two geometries are within
 * a given distance in metres.
 */
export function withinMetresExpression(
  geomA: string,
  geomB: string,
  metres: number
): string {
  return `ST_DWithin(ST_Transform(${geomA}, 27700), ST_Transform(${geomB}, 27700), ${metres})`;
}

/**
 * Returns a PostGIS expression for the percentage of geomA that intersects geomB.
 * Returns 0-100.
 */
export function intersectionPctExpression(geomA: string, geomB: string): string {
  return `CASE
    WHEN ST_Area(ST_Transform(${geomA}, 27700)) = 0 THEN 0
    ELSE ROUND(
      (ST_Area(ST_Intersection(
        ST_Transform(${geomA}, 27700),
        ST_Transform(${geomB}, 27700)
      )) /
      ST_Area(ST_Transform(${geomA}, 27700))) * 100,
      2
    )
  END`;
}

/**
 * Returns a PostGIS expression for a buffered geometry in metres.
 * Transforms to EPSG:27700 for accurate buffering, returns in EPSG:4326.
 */
export function bufferMetresExpression(geomColumn: string, metres: number): string {
  return `ST_Transform(
    ST_Buffer(
      ST_Transform(${geomColumn}, 27700),
      ${metres}
    ),
    4326
  )`;
}

/**
 * Returns a PostGIS expression for the centroid.
 */
export function centroidExpression(geomColumn = 'geometry'): string {
  return `ST_Centroid(${geomColumn})`;
}

// ---------------------------------------------------------------------------
// Client-side geometry validation (GeoJSON)
// Runs before sending to database.
// ---------------------------------------------------------------------------

/**
 * Validate a GeoJSON geometry before database insertion.
 * Detects common issues: null, wrong type, coordinate bounds, etc.
 *
 * Note: This is a lightweight client-side check.
 * Full PostGIS validation (ST_IsValid) runs on the database side.
 */
export function validateGeoJsonGeometry(
  geometry: unknown
): GeometryValidationResult {
  const errors: string[] = [];

  if (!geometry) {
    return {
      valid: false,
      notes: 'Geometry is null or undefined',
      errors: ['NULL_GEOMETRY'],
    };
  }

  if (typeof geometry !== 'object') {
    return {
      valid: false,
      notes: 'Geometry is not an object',
      errors: ['INVALID_TYPE'],
    };
  }

  const g = geometry as Record<string, unknown>;

  if (!g.type) {
    errors.push('MISSING_TYPE');
  }

  if (!g.coordinates) {
    errors.push('MISSING_COORDINATES');
  }

  if (g.type !== 'MultiPolygon' && g.type !== 'Polygon') {
    errors.push(`UNEXPECTED_GEOMETRY_TYPE:${g.type}`);
  }

  // Check for empty geometry
  if (Array.isArray(g.coordinates) && g.coordinates.length === 0) {
    errors.push('EMPTY_GEOMETRY');
  }

  // Check coordinate bounds (UK: roughly -10 to 2 lon, 49 to 61 lat)
  if (g.type === 'Polygon' && Array.isArray(g.coordinates)) {
    const ring = (g.coordinates as number[][][])[0];
    if (ring) {
      for (const coord of ring) {
        const [lon, lat] = coord;
        if (lon < -15 || lon > 5 || lat < 45 || lat > 65) {
          errors.push(`COORDINATE_OUT_OF_UK_BOUNDS:${lon},${lat}`);
          break;
        }
      }
    }
  }

  const valid = errors.length === 0;
  return {
    valid,
    notes: valid ? null : `Validation failed: ${errors.join(', ')}`,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Area utility
// ---------------------------------------------------------------------------

/**
 * Convert square metres to hectares.
 */
export function sqmToHectares(sqm: number): number {
  return sqm / 10_000;
}

/**
 * Convert square metres to acres.
 */
export function sqmToAcres(sqm: number): number {
  return sqm / 4_046.86;
}

/**
 * Format area for display.
 */
export function formatArea(sqm: number | null): string {
  if (sqm === null) return 'Unknown';
  const ha = sqmToHectares(sqm);
  if (ha >= 1) {
    return `${ha.toFixed(2)} ha`;
  }
  return `${Math.round(sqm)} m²`;
}

/**
 * Detect material area discrepancy between calculated and source-supplied area.
 * Returns true if discrepancy exceeds threshold (default 5%).
 */
export function hasAreaDiscrepancy(
  calculatedSqm: number,
  sourceSqm: number,
  thresholdPct = 5
): boolean {
  if (calculatedSqm === 0) return sourceSqm !== 0;
  const diffPct = Math.abs((calculatedSqm - sourceSqm) / calculatedSqm) * 100;
  return diffPct > thresholdPct;
}

/**
 * Approximate area in square metres for a GeoJSON polygon in EPSG:4326.
 * Uses ellipsoidal approximation suitable for UK latitudes.
 */
export function approximateGeoJsonAreaSqm(geom: {
  type: string;
  coordinates: any;
}): number {
  if (!geom || !geom.coordinates) return 0;

  const calculateRingArea = (ring: [number, number][]): number => {
    if (ring.length < 3) return 0;
    const R = 6378137; // WGS84 major radius
    let total = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = ring[i];
      const p2 = ring[i + 1];
      const lon1 = (p1[0] * Math.PI) / 180;
      const lat1 = (p1[1] * Math.PI) / 180;
      const lon2 = (p2[0] * Math.PI) / 180;
      const lat2 = (p2[1] * Math.PI) / 180;
      total += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    return Math.abs((total * R * R) / 2);
  };

  if (geom.type === 'Polygon') {
    const rings = geom.coordinates as [number, number][][];
    if (rings.length === 0) return 0;
    let area = calculateRingArea(rings[0]);
    for (let i = 1; i < rings.length; i++) {
      area -= calculateRingArea(rings[i]);
    }
    return Math.max(0, area);
  }

  if (geom.type === 'MultiPolygon') {
    const polygons = geom.coordinates as [number, number][][][];
    let total = 0;
    for (const poly of polygons) {
      if (poly.length === 0) continue;
      let area = calculateRingArea(poly[0]);
      for (let i = 1; i < poly.length; i++) {
        area -= calculateRingArea(poly[i]);
      }
      total += Math.max(0, area);
    }
    return total;
  }

  return 0;
}

/**
 * Compute centroid [lon, lat] from a GeoJSON polygon
 */
export function approximateCentroid(geom: {
  type: string;
  coordinates: any;
}): [number, number] | null {
  if (!geom || !geom.coordinates) return null;
  let sumLon = 0;
  let sumLat = 0;
  let count = 0;

  const sampleRing = (ring: [number, number][]) => {
    for (let i = 0; i < ring.length - 1; i++) {
      sumLon += ring[i][0];
      sumLat += ring[i][1];
      count++;
    }
  };

  if (geom.type === 'Polygon' && Array.isArray(geom.coordinates[0])) {
    sampleRing(geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
    for (const poly of geom.coordinates) {
      if (Array.isArray(poly[0])) sampleRing(poly[0]);
    }
  }

  return count > 0 ? [sumLon / count, sumLat / count] : null;
}

