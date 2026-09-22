/**
 * Land Radar — Ingestion Adapter Interfaces
 *
 * Each authoritative UK source has an adapter adhering to this interface.
 * Key principles:
 * 1. Licence verification MUST occur before fetching.
 * 2. Never allow one malformed record to crash the dataset ingestion.
 * 3. Unknown CRS is a data-quality failure, not an automatic assumption.
 */

import { GeoJSON, RetrievalMode } from '../types';
import { PilotConfig } from '../pilot/types';

export interface LicenceVerification {
  permitted: boolean;
  licenceName: string;
  attributionText: string;
  commercialUsePermitted: boolean;
  notes?: string;
}

export interface GeometryError {
  isError: true;
  reason: string;
  rawGeometry?: unknown;
}

export interface GeometryValidationResult {
  isValid: boolean;
  type: string;
  crs: string;
  ringCount?: number;
  vertexCount?: number;
  hasSelfIntersection?: boolean;
  issues: string[];
}

export interface AdapterIngestResult<T> {
  sourceId: string;
  retrievalMode: RetrievalMode;
  totalRecordsSeen: number;
  recordsTransformed: number;
  recordsRejected: number;
  geometryErrors: number;
  records: T[];
  errors: Array<{ index: number; reason: string }>;
}

export interface IngestionAdapter<TRaw, TTransformed> {
  sourceId: string;
  datasetName: string;
  verifyLicence(): LicenceVerification;
  fetch(pilot: PilotConfig, options?: { dataDir?: string; useLocalOnly?: boolean }): Promise<TRaw[]>;
  transform(raw: TRaw, index: number): TTransformed | GeometryError;
  validate(record: TTransformed): GeometryValidationResult;
  ingest(pilot: PilotConfig, options?: { dataDir?: string; useLocalOnly?: boolean }): Promise<AdapterIngestResult<TTransformed>>;
}

/**
 * Common shape for an ingested Brownfield record from DLUHC
 */
export interface IngestedBrownfieldRecord {
  sourceId: string;
  siteReference: string;
  name: string;
  address?: string;
  hectares?: number;
  deliverable?: boolean;
  planningStatus?: string;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  point?: GeoJSON.Point;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested Flood Zone record from EA
 */
export interface IngestedFloodRecord {
  sourceId: string;
  floodZone: 'zone_2' | 'zone_3';
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  areaSqm?: number;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested SSSI record from Natural England
 */
export interface IngestedSSSIRecord {
  sourceId: string;
  sssiName: string;
  status: string;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested HMLR INSPIRE parcel
 */
export interface IngestedInspireParcel {
  sourceId: string;
  inspireId: string;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  areaSqmCalculated?: number;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested Built-up Area record from ONS
 */
export interface IngestedBuiltUpArea {
  sourceId: string;
  name: string;
  buaCode: string;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested Green Belt record from DLUHC / LPA
 */
export interface IngestedGreenBeltRecord {
  sourceId: string;
  lpaName: string;
  designationName?: string;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  areaHectares?: number;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested Highways / Road network feature from OS Open Roads
 * CRITICAL SEMANTIC DISTINCTION:
 * Road proximity (geometric feature within distance threshold) != Site access (legally usable vehicular access).
 */
export interface IngestedRoadRecord {
  sourceId: string;
  roadIdentifier: string;
  roadName?: string;
  roadClassification: 'motorway' | 'primary' | 'a_road' | 'b_road' | 'minor' | 'local';
  geometry: GeoJSON.LineString | GeoJSON.MultiLineString | GeoJSON.Polygon | GeoJSON.MultiPolygon;
  isAdoptedHighway?: boolean;
  accessDisclaimer: string;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested planning application from DLUHC Planning Data / LPA Open Registers
 */
export interface IngestedPlanningRecord {
  sourceId: string;
  applicationReference: string;
  lpaCode: string;
  lpaName: string;
  siteLocation: string;
  applicationType: string;
  description: string;
  decision: 'approved' | 'refused' | 'withdrawn' | 'dismissed' | 'pending' | 'unknown' | 'other';
  decisionDate?: string;
  applicationDate?: string;
  geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.Point;
  sourceUrl?: string;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested residential transaction from HM Land Registry Price Paid Data
 */
export interface IngestedPricePaidRecord {
  sourceId: string;
  transactionId: string;
  price: number;
  dateOfTransfer: string;
  postcode: string;
  propertyType: 'detached' | 'semi_detached' | 'terraced' | 'flat' | 'other';
  newBuild: boolean;
  tenure: 'freehold' | 'leasehold' | 'unknown';
  paon?: string;
  saon?: string;
  street?: string;
  locality?: string;
  townCity?: string;
  district: string;
  county?: string;
  geometry: GeoJSON.Point;
  rawRecord: Record<string, unknown>;
}

/**
 * Common shape for an ingested Local Plan allocation from LPA Open Data
 */
export interface IngestedLocalPlanRecord {
  sourceId: string;
  lpaCode: string;
  planName: string;
  policyReference: string;
  siteName?: string;
  allocationType: 'housing' | 'employment' | 'mixed_use' | 'regeneration' | 'infrastructure' | 'other';
  status: 'adopted' | 'emerging' | 'allocated' | 'safeguarded' | 'withdrawn' | 'unknown';
  indicativeCapacityUnits?: number;
  indicativeDensityDph?: number;
  adoptionDate?: string;
  geometry?: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  rawRecord: Record<string, unknown>;
}



