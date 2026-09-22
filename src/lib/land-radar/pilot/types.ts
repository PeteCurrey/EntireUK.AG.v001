/**
 * Land Radar — Pilot Domain Types
 *
 * Types for pilot configurations, licence gates, and pilot run execution.
 */

import { GeoJSON } from '../types';

export type PilotStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'archived'
  | 'deprecated';

export type DatasetDecisionVerdict =
  | 'ingest'
  | 'defer'
  | 'exclude';

export interface PilotDatasetDecision {
  datasetId: string;
  decision: DatasetDecisionVerdict;
  decisionReason: string;
  licenceName: string;
  licenceConfirmed: boolean;
  licenceConfirmedAt?: string;
  licenceConfirmedBy?: string;
}

export type BoundingBox = [minLon: number, minLat: number, maxLon: number, maxLat: number];

export interface PilotConfig {
  id: string; // e.g. 'EUK-PILOT-001'
  geographyName: string;
  lpaCode: string;
  boundaryGeoJSON: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  boundingBox: BoundingBox;
  crsEpsg: number;
  screeningStrategy: string;
  ruleVersion: string;
  pilotVersion: string;
  status: PilotStatus;
  includedDatasetIds: string[];
  excludedDatasetIds: string[];
  targetOpportunityTypes: string[];
  datasetDecisions: PilotDatasetDecision[];
  notes?: string;
}

export interface PilotRunOptions {
  pilotId: string;
  dryRun?: boolean;
  dataDir?: string;
  verbose?: boolean;
}

export interface PilotRunSummary {
  pilotId: string;
  geographyName: string;
  startedAt: string;
  completedAt: string;
  isDryRun: boolean;
  screeningStrategy: string;
  ruleVersion: string;
  datasetsAttempted: string[];
  datasetsSucceeded: string[];
  datasetsFailed: string[];
  recordsIngested: number;
  sitesEvaluated: number;
  sitesPassedScreening: number;
  opportunitiesGenerated: number;
  signalDistribution: Record<string, number>;
  constraintDistribution: Record<string, number>;
  failures: Array<{ source: string; error: string; count?: number }>;
  retrievalModes?: Record<string, string>;
  sampleCandidates: Array<{
    siteReference: string;
    name?: string;
    areaSqm?: number;
    priority?: string;
    priorityReasons?: string[];
    recommendedNextActions?: string[];
    positiveSignals: string[];
    constraints: string[];
    explanation: string;
    planningRecordsMatched?: number;
    marketStrength?: string;
    medianPrice?: number | null;
    potentiallyDevelopableHa?: number | null;
    developmentPotential?: string;
  }>;
  v1PassedCount?: number;
  v2PassedCount?: number;
  v3PassedCount?: number;
  planningEnhancedCount?: number;
  marketEnhancedCount?: number;
  planningRecordsIngested?: number;
  pricePaidRecordsIngested?: number;
  localPlanAllocationsIngested?: number;
}

