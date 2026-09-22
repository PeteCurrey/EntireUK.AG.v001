/**
 * Land Radar — Pilot Configurations
 *
 * Controlled pilot objects.
 * Primary pilot: EUK-PILOT-001 (Warwick District).
 */

import { PilotConfig, BoundingBox } from './types';

/**
 * Warwick District (EUK-PILOT-001)
 *
 * Geography: Warwick District Council (LPA code: warwick)
 * Settlements: Warwick, Royal Leamington Spa, Kenilworth, Whitnash.
 * Bounding Box: minLon: -1.70, minLat: 52.22, maxLon: -1.45, maxLat: 52.38
 */
export const WARWICK_PILOT: PilotConfig = {
  id: 'EUK-PILOT-001',
  geographyName: 'Warwick District',
  lpaCode: 'warwick',
  boundingBox: [-1.7000, 52.2200, -1.4500, 52.3800],
  crsEpsg: 4326,
  boundaryGeoJSON: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-1.7000, 52.2200],
          [-1.4500, 52.2200],
          [-1.4500, 52.3800],
          [-1.7000, 52.3800],
          [-1.7000, 52.2200],
        ],
      ],
    ],
  },
  screeningStrategy: 'RESIDENTIAL_DEVELOPMENT_V1',
  ruleVersion: 'v1',
  pilotVersion: '1.0.0',
  status: 'active',
  includedDatasetIds: [
    'PLAN-BROWNFIELD-001',
    'EA-FLOOD-001',
    'NE-SSSI-001',
    'HMLR-INSPIRE-001',
    'ONS-BUILTUP-001',
    'OS-OPEN-ROADS-001',
    'LPA-GREENBELT-001',
    'PLANNING-REGISTER-001',
    'HMLR-PRICE-PAID-001',
    'LPA-LOCAL-PLAN-001',
  ],
  excludedDatasetIds: [],
  targetOpportunityTypes: ['development_land', 'brownfield'],
  datasetDecisions: [
    {
      datasetId: 'PLAN-BROWNFIELD-001',
      decision: 'ingest',
      decisionReason:
        'Authoritative DLUHC planning data platform brownfield register. OGL v3 permits commercial use with attribution.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'EA-FLOOD-001',
      decision: 'ingest',
      decisionReason:
        'Defra / Environment Agency Flood Map for Planning. OGL v3 allows spatial screening and derived analysis.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'NE-SSSI-001',
      decision: 'ingest',
      decisionReason:
        'Natural England Sites of Special Scientific Interest. OGL v3 open data geoportal.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'HMLR-INSPIRE-001',
      decision: 'ingest',
      decisionReason:
        'HMLR INSPIRE Index Polygons for Warwick District. Internal spatial processing permitted under post-July 2020 terms.',
      licenceName: 'Open Government Licence v3.0 / HMLR INSPIRE',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'ONS-BUILTUP-001',
      decision: 'ingest',
      decisionReason:
        'ONS Built-up Areas 2022 dataset for settlement proximity boundary derivation.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'OS-OPEN-ROADS-001',
      decision: 'ingest',
      decisionReason:
        'Ordnance Survey Open Roads highways network under OGL v3.0. Envelope-clipped spatial proximity screening for pilot envelope.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'LPA-GREENBELT-001',
      decision: 'ingest',
      decisionReason:
        'DLUHC English Local Authority Green Belt boundaries open data under OGL v3.0. Commercial spatial screening permitted with Crown copyright attribution.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'PLANNING-REGISTER-001',
      decision: 'ingest',
      decisionReason:
        'DLUHC Planning Data Platform and LPA Statutory Planning Registers. OGL v3 permits internal acquisition screening and commercial use with attribution. Warwick District LPA: W/ reference series.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'HMLR-PRICE-PAID-001',
      decision: 'ingest',
      decisionReason:
        'HM Land Registry Price Paid Data. OGL v3 permits residential transaction evidence analysis and commercial screening with attribution.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-08T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'LPA-LOCAL-PLAN-001',
      decision: 'ingest',
      decisionReason:
        'Warwick District Adopted Local Plan 2011-2029 Policies Map site allocations published under OGL v3.0.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-08T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
  ],
  notes:
    'Warwick District pilot geography for Land Radar screening pilot. Covers Warwick, Royal Leamington Spa, Kenilworth, and Whitnash.',
};

/**
 * Rugby Borough (EUK-PILOT-002)
 *
 * Geography: Rugby Borough Council (LPA code: rugby)
 * Settlements: Rugby, Dunchurch, Clifton upon Dunsmore, Long Lawford, Wolston.
 * Bounding Box: minLon: -1.4000, minLat: 52.3000, maxLon: -1.1500, maxLat: 52.4500
 */
export const RUGBY_PILOT: PilotConfig = {
  id: 'EUK-PILOT-002',
  geographyName: 'Rugby Borough',
  lpaCode: 'rugby',
  boundingBox: [-1.4000, 52.3000, -1.1500, 52.4500],
  crsEpsg: 4326,
  boundaryGeoJSON: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [-1.4000, 52.3000],
          [-1.1500, 52.3000],
          [-1.1500, 52.4500],
          [-1.4000, 52.4500],
          [-1.4000, 52.3000],
        ],
      ],
    ],
  },
  screeningStrategy: 'RESIDENTIAL_DEVELOPMENT_V1',
  ruleVersion: 'v1',
  pilotVersion: '1.0.0',
  status: 'active',
  includedDatasetIds: [
    'PLAN-BROWNFIELD-001',
    'EA-FLOOD-001',
    'NE-SSSI-001',
    'HMLR-INSPIRE-001',
    'ONS-BUILTUP-001',
    'OS-OPEN-ROADS-001',
    'LPA-GREENBELT-001',
    'PLANNING-REGISTER-001',
    'HMLR-PRICE-PAID-001',
    'LPA-LOCAL-PLAN-001',
  ],
  excludedDatasetIds: [],
  targetOpportunityTypes: ['development_land', 'brownfield'],
  datasetDecisions: [
    {
      datasetId: 'PLAN-BROWNFIELD-001',
      decision: 'ingest',
      decisionReason:
        'Authoritative DLUHC planning data platform brownfield register for Rugby Borough. OGL v3 permits commercial use with attribution.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'EA-FLOOD-001',
      decision: 'ingest',
      decisionReason:
        'Defra / Environment Agency Flood Map for Planning (River Avon & Swift catchment). OGL v3 permits spatial screening.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'NE-SSSI-001',
      decision: 'ingest',
      decisionReason:
        'Natural England SSSI dataset for Rugby Borough (e.g., Draycote Water, Brandon Marsh SSSI). OGL v3 open data.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'HMLR-INSPIRE-001',
      decision: 'ingest',
      decisionReason:
        'HMLR INSPIRE Index Polygons for Rugby Borough. Spatial screening permitted under post-July 2020 terms.',
      licenceName: 'Open Government Licence v3.0 / HMLR INSPIRE',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'ONS-BUILTUP-001',
      decision: 'ingest',
      decisionReason:
        'ONS Built-up Areas 2022 dataset for Rugby urban area and surrounding village settlement boundaries.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'OS-OPEN-ROADS-001',
      decision: 'ingest',
      decisionReason:
        'Ordnance Survey Open Roads network clipped to Rugby Borough (A426, A428, Technology Drive corridors). OGL v3.0.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'LPA-GREENBELT-001',
      decision: 'ingest',
      decisionReason:
        'DLUHC Green Belt boundaries for Rugby Borough. Identifies West Midlands Green Belt on western edge (Wolston/Brandon) vs unconstrained eastern growth corridors.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'PLANNING-REGISTER-001',
      decision: 'ingest',
      decisionReason:
        'DLUHC Planning Data Platform and LPA Statutory Planning Registers. OGL v3 permits internal acquisition screening and commercial use with attribution. Rugby Borough LPA: R-prefix reference series.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-07T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'HMLR-PRICE-PAID-001',
      decision: 'ingest',
      decisionReason:
        'HM Land Registry Price Paid residential sales data for Rugby Borough under OGL v3.0.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-08T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
    {
      datasetId: 'LPA-LOCAL-PLAN-001',
      decision: 'ingest',
      decisionReason:
        'Rugby Borough Adopted Local Plan 2011-2031 Policies Map site allocations published under OGL v3.0.',
      licenceName: 'Open Government Licence v3.0',
      licenceConfirmed: true,
      licenceConfirmedAt: '2026-09-08T00:00:00Z',
      licenceConfirmedBy: 'compliance@entire-uk.com',
    },
  ],
  notes:
    'Rugby Borough second pilot geography (EUK-PILOT-002). High-growth rail/logistics and residential expansion corridor along M6/M45/West Coast Main Line. Contrast: West Midlands Green Belt covers western fringe (Wolston/Brinklow), while central/eastern areas are unconstrained.',
};

export const PILOT_REGISTRY: Record<string, PilotConfig> = {
  [WARWICK_PILOT.id]: WARWICK_PILOT,
  [RUGBY_PILOT.id]: RUGBY_PILOT,
};

export function getPilotConfig(pilotId: string): PilotConfig | null {
  return PILOT_REGISTRY[pilotId] ?? null;
}

export function getAllPilots(): PilotConfig[] {
  return [WARWICK_PILOT, RUGBY_PILOT];
}

/**
 * Check if coordinates [lon, lat] fall within a bounding box
 */
export function isPointInBBox(lon: number, lat: number, bbox: BoundingBox): boolean {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
}

