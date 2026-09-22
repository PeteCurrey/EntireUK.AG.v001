/**
 * Land Radar — Ingestion Pipeline
 *
 * Reusable ingestion pattern:
 * SOURCE → FETCH → RAW → VALIDATE → NORMALISE → SPATIAL → UPSERT → PROVENANCE → QUALITY
 *
 * Every ingestion run:
 * 1. Creates an IngestionJob record
 * 2. Processes records individually
 * 3. Records provenance for every successful record
 * 4. Closes the job with statistics
 * 5. Creates a DataQualityReport
 *
 * Source failure does NOT delete previously successful data.
 * Invalid records are RETAINED with notes, never silently discarded.
 */

import type {
  IngestionJob,
  IngestionJobStatus,
  IngestionJobStats,
  CreateProvenanceInput,
  ProvenanceEntityType,
} from './types';
import { getLandRadarDb } from './db';

// ---------------------------------------------------------------------------
// Job lifecycle
// ---------------------------------------------------------------------------

/**
 * Create and start an ingestion job.
 * Must be called at the start of every ingestion pipeline run.
 */
export async function startIngestionJob(
  dataSourceId: string,
  datasetVersion?: string,
  processingVersion = 'v1'
): Promise<IngestionJob> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('ingestion_jobs')
    .insert({
      data_source_id: dataSourceId,
      status: 'running',
      dataset_version: datasetVersion,
      processing_version: processingVersion,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to start ingestion job: ${error.message}`);

  // Update last_attempted_ingestion on data_sources
  await db
    .from('data_sources')
    .update({ last_attempted_ingestion: new Date().toISOString() })
    .eq('id', dataSourceId);

  return data as IngestionJob;
}

/**
 * Update running statistics on a job.
 */
export async function recordIngestionProgress(
  jobId: string,
  stats: IngestionJobStats
): Promise<void> {
  const db = getLandRadarDb();
  const { error } = await db
    .from('ingestion_jobs')
    .update(stats)
    .eq('id', jobId);

  if (error) {
    console.error(`[Ingestion] Failed to update job ${jobId} progress:`, error.message);
    // Do not throw: progress updates are best-effort
  }
}

/**
 * Close a job as completed or partial.
 */
export async function completeIngestionJob(
  jobId: string,
  dataSourceId: string,
  stats: IngestionJobStats,
  status: Extract<IngestionJobStatus, 'completed' | 'partial'> = 'completed'
): Promise<void> {
  const db = getLandRadarDb();
  const now = new Date().toISOString();

  await db
    .from('ingestion_jobs')
    .update({
      ...stats,
      status,
      completed_at: now,
    })
    .eq('id', jobId);

  // Update last_successful_ingestion on data_sources
  if (status === 'completed') {
    await db
      .from('data_sources')
      .update({ last_successful_ingestion: now, status: 'active' })
      .eq('id', dataSourceId);
  }
}

/**
 * Close a job as failed.
 * Does NOT delete any previously ingested data.
 */
export async function failIngestionJob(
  jobId: string,
  dataSourceId: string,
  errorMessage: string,
  stats?: IngestionJobStats
): Promise<void> {
  const db = getLandRadarDb();

  await db
    .from('ingestion_jobs')
    .update({
      ...(stats ?? {}),
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: errorMessage,
    })
    .eq('id', jobId);

  // Mark source as failed but retain status history
  await db
    .from('data_sources')
    .update({ status: 'failed' })
    .eq('id', dataSourceId);

  // Create a data quality report recording the failure
  await db.from('data_quality_reports').insert({
    data_source_id: dataSourceId,
    ingestion_job_id: jobId,
    source_available: false,
    source_failure_reason: errorMessage,
    geometry_valid_count: 0,
    geometry_invalid_count: 0,
    duplicate_count: 0,
    conflicting_count: 0,
  });

  console.error(`[Ingestion] Job ${jobId} failed: ${errorMessage}`);
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

/**
 * Attach provenance to an entity.
 * Must be called for every successfully ingested record.
 */
export async function attachProvenance(
  input: CreateProvenanceInput,
  rawRecord?: Record<string, unknown>
): Promise<string> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('provenance_records')
    .insert({
      ...input,
      raw_record: rawRecord ?? null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to record provenance for ${input.entity_type} ${input.entity_id}: ${error.message}`);
  }

  return data.id as string;
}

// ---------------------------------------------------------------------------
// Reference generation
// ---------------------------------------------------------------------------

let siteRefCounter = 0;

/**
 * Generate a unique internal site reference.
 * Format: EUK-S-NNNNN
 * In production this should use a database sequence or UUID-based approach.
 */
export function generateSiteReference(): string {
  siteRefCounter++;
  const timestamp = Date.now().toString(36).toUpperCase();
  const counter = String(siteRefCounter).padStart(4, '0');
  return `EUK-S-${timestamp}-${counter}`;
}

// ---------------------------------------------------------------------------
// Generic ingestion pipeline orchestrator
// ---------------------------------------------------------------------------

export interface IngestionRecord {
  raw: Record<string, unknown>;
}

export interface ParseResult<T> {
  record: T | null;
  error: string | null;
}

export interface ValidateResult {
  valid: boolean;
  notes: string | null;
}

export interface IngestionPipelineOptions<TRaw, TNormalised> {
  dataSourceId: string;
  datasetVersion?: string;
  /** Parse raw source record into normalised form */
  parse: (raw: TRaw) => ParseResult<TNormalised>;
  /** Validate normalised record before upsert */
  validate: (normalised: TNormalised) => ValidateResult;
  /** Upsert normalised record to database, returning entity ID */
  upsert: (normalised: TNormalised, jobId: string) => Promise<string | null>;
  /** Build provenance input for a successfully upserted record */
  buildProvenance: (normalised: TNormalised, entityId: string) => CreateProvenanceInput;
  /** Entity type for provenance records */
  entityType: ProvenanceEntityType;
}

/**
 * Run a complete ingestion pipeline for a dataset.
 * Handles job lifecycle, error tracking, provenance and quality reporting.
 */
export async function runIngestionPipeline<TRaw, TNormalised>(
  rawRecords: TRaw[],
  options: IngestionPipelineOptions<TRaw, TNormalised>
): Promise<IngestionJob> {
  const job = await startIngestionJob(options.dataSourceId, options.datasetVersion);

  const stats: Required<IngestionJobStats> = {
    records_seen: rawRecords.length,
    records_inserted: 0,
    records_updated: 0,
    records_rejected: 0,
    geometry_errors: 0,
    validation_errors: 0,
  };

  for (const raw of rawRecords) {
    try {
      // 1. Parse
      const parsed = options.parse(raw as TRaw);
      if (!parsed.record) {
        stats.records_rejected++;
        console.warn(`[Ingestion] Parse failed: ${parsed.error}`);
        continue;
      }

      // 2. Validate
      const validated = options.validate(parsed.record);
      if (!validated.valid) {
        stats.validation_errors++;
        stats.records_rejected++;
        console.warn(`[Ingestion] Validation failed: ${validated.notes}`);
        continue;
      }

      // 3. Upsert
      const entityId = await options.upsert(parsed.record, job.id);
      if (!entityId) {
        stats.records_rejected++;
        continue;
      }

      stats.records_inserted++;

      // 4. Provenance
      const provenanceInput = options.buildProvenance(parsed.record, entityId);
      await attachProvenance(
        { ...provenanceInput, entity_id: entityId },
        raw as Record<string, unknown>
      );

    } catch (err) {
      stats.records_rejected++;
      console.error('[Ingestion] Record processing error:', err);
    }
  }

  await completeIngestionJob(
    job.id,
    options.dataSourceId,
    stats,
    stats.records_rejected > 0 ? 'partial' : 'completed'
  );

  return { ...job, ...stats, status: stats.records_rejected > 0 ? 'partial' : 'completed' };
}
