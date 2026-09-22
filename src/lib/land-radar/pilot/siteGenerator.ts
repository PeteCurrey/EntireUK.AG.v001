/**
 * Land Radar — Pilot Site Generation Mechanism
 *
 * Distinct entities:
 * 1. Land Parcel (authoritative boundary from HMLR / open register)
 * 2. Candidate Site (Entire UK investigation entity: EUK-S-xxx)
 * 3. Opportunity (screened candidate meeting strategy criteria)
 *
 * This generator transforms ingested parcels & brownfield register records
 * into candidate sites with canonical internal references, spatial geometry,
 * and calculated area.
 */

import { GeoJSON, Site, SiteStatus } from '../types';
import { PilotConfig } from './types';
import { IngestedBrownfieldRecord, IngestedInspireParcel } from '../adapters/types';
import { approximateGeoJsonAreaSqm, approximateCentroid, hasAreaDiscrepancy } from '../geometry';

export interface GeneratedSiteCandidate {
  site: Site;
  originSource: string;
  sourceReference: string;
  isBrownfield: boolean;
  rawRecord: Record<string, unknown>;
}

export interface SiteGenerationResult {
  pilotId: string;
  totalGenerated: number;
  brownfieldSites: number;
  inspireSites: number;
  deduplicatedCount: number;
  candidates: GeneratedSiteCandidate[];
}

function toMultiPolygon(
  geom: GeoJSON.Polygon | GeoJSON.MultiPolygon
): GeoJSON.MultiPolygon {
  if (geom.type === 'MultiPolygon') return geom;
  return {
    type: 'MultiPolygon',
    coordinates: [geom.coordinates],
  };
}

/**
 * Generate candidate sites from ingested brownfield records and registered parcels
 */
export function generatePilotSites(
  pilot: PilotConfig,
  brownfieldRecords: IngestedBrownfieldRecord[],
  inspireParcels: IngestedInspireParcel[] = []
): SiteGenerationResult {
  const candidates: GeneratedSiteCandidate[] = [];
  let sequence = 1;
  const prefix = `EUK-S-${pilot.lpaCode.toUpperCase()}`;

  // 1. Process Brownfield Records (Priority candidates for development screening)
  for (const bf of brownfieldRecords) {
    const internalReference = `${prefix}-BF-${String(sequence++).padStart(3, '0')}`;
    const calculatedArea = approximateGeoJsonAreaSqm(bf.geometry);
    const sourceArea = bf.hectares ? bf.hectares * 10000 : undefined;
    const hasDiscrepancy = sourceArea
      ? hasAreaDiscrepancy(calculatedArea, sourceArea, 10)
      : false;

    const centroidCoords = approximateCentroid(bf.geometry);

    const site: Site = {
      id: `site-${bf.siteReference}`,
      internal_reference: internalReference,
      name: bf.name ?? null,
      status: 'candidate' as SiteStatus,
      source: bf.sourceId,
      source_reference: bf.siteReference,
      geometry: toMultiPolygon(bf.geometry),
      centroid: centroidCoords
        ? {
            type: 'Point',
            coordinates: centroidCoords,
          }
        : null,
      area_sqm: calculatedArea > 0 ? calculatedArea : sourceArea ?? null,
      area_sqm_source: sourceArea ?? null,
      area_discrepancy_flag: hasDiscrepancy,
      local_authority: pilot.geographyName,
      country: 'england',
      postcode_sector: null,
      location_description: bf.address ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    candidates.push({
      site,
      originSource: bf.sourceId,
      sourceReference: bf.siteReference,
      isBrownfield: true,
      rawRecord: bf.rawRecord,
    });
  }

  // 2. Process INSPIRE Registered Parcels (if any distinct from brownfield)
  let inspireCount = 0;
  for (const parcel of inspireParcels) {
    // Check if parcel overlaps closely with an existing brownfield site
    // Simple centroid/bbox proximity deduplication
    const parcelCentroid = approximateCentroid(parcel.geometry);
    const alreadyCovered = candidates.some((c) => {
      const cCentroid = approximateCentroid(c.site.geometry!);
      if (!parcelCentroid || !cCentroid) return false;
      const dLon = Math.abs(parcelCentroid[0] - cCentroid[0]);
      const dLat = Math.abs(parcelCentroid[1] - cCentroid[1]);
      return dLon < 0.002 && dLat < 0.002;
    });

    if (alreadyCovered) {
      continue;
    }

    const internalReference = `${prefix}-P-${String(sequence++).padStart(3, '0')}`;
    const calculatedArea = approximateGeoJsonAreaSqm(parcel.geometry);

    const site: Site = {
      id: `site-${parcel.inspireId}`,
      internal_reference: internalReference,
      name: `Registered Parcel ${parcel.inspireId}`,
      status: 'candidate' as SiteStatus,
      source: parcel.sourceId,
      source_reference: parcel.inspireId,
      geometry: toMultiPolygon(parcel.geometry),
      centroid: parcelCentroid
        ? {
            type: 'Point',
            coordinates: parcelCentroid,
          }
        : null,
      area_sqm: calculatedArea > 0 ? calculatedArea : parcel.areaSqmCalculated ?? null,
      area_sqm_source: parcel.areaSqmCalculated ?? null,
      area_discrepancy_flag: false,
      local_authority: pilot.geographyName,
      country: 'england',
      postcode_sector: null,
      location_description: `HMLR INSPIRE Registered Parcel in ${pilot.geographyName}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    candidates.push({
      site,
      originSource: parcel.sourceId,
      sourceReference: parcel.inspireId,
      isBrownfield: false,
      rawRecord: parcel.rawRecord,
    });
    inspireCount++;
  }

  return {
    pilotId: pilot.id,
    totalGenerated: candidates.length,
    brownfieldSites: brownfieldRecords.length,
    inspireSites: inspireCount,
    deduplicatedCount: inspireParcels.length - inspireCount,
    candidates,
  };
}
