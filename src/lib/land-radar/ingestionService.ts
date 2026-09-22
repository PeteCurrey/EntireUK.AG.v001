/**
 * Land Radar — Ingestion Service
 *
 * Dataset-agnostic ingestion orchestrator.
 * Follows the canonical pipeline:
 * SOURCE → FETCH → RAW DATA → VALIDATE → NORMALISE → SPATIAL PROCESSING → UPSERT → PROVENANCE → QUALITY REPORT
 *
 * Designed for graceful source failures:
 * - If an external source fails, retains previously successful data
 * - Explicitly records source_available = false
 * - Surfaces uncertainty to intelligence layer
 */

import type {
  DataSource,
  IngestionJob,
} from './types';
import { getLandRadarDb } from './db';
import {
  runIngestionPipeline,
  failIngestionJob,
  type IngestionPipelineOptions,
} from './ingestion';

// ---------------------------------------------------------------------------
// Source health & monitoring
// ---------------------------------------------------------------------------

export async function getDataSource(id: string): Promise<DataSource | null> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('data_sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get data source ${id}: ${error.message}`);
  }

  return data as DataSource;
}

export async function listDataSources(): Promise<DataSource[]> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('data_sources')
    .select('*')
    .order('organisation', { ascending: true });

  if (error) throw new Error(`Failed to list data sources: ${error.message}`);
  return (data ?? []) as DataSource[];
}

export async function getRecentIngestionJobs(
  dataSourceId?: string,
  limit = 20
): Promise<IngestionJob[]> {
  const db = getLandRadarDb();
  let query = db
    .from('ingestion_jobs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (dataSourceId) {
    query = query.eq('data_source_id', dataSourceId);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list ingestion jobs: ${error.message}`);
  return (data ?? []) as IngestionJob[];
}

// ---------------------------------------------------------------------------
// Execution Orchestrator
// ---------------------------------------------------------------------------

/**
 * Ingest an arbitrary batch of records with full validation, provenance,
 * and error boundary protection.
 */
export async function ingestDataset<TRaw, TNormalised>(
  rawRecords: TRaw[],
  options: IngestionPipelineOptions<TRaw, TNormalised>
): Promise<IngestionJob> {
  return runIngestionPipeline(rawRecords, options);
}

/**
 * Explicitly handle an upstream fetch or connection failure.
 * Ensures the system records the outage truthfully without deleting valid prior data.
 */
export async function handleSourceFetchFailure(
  dataSourceId: string,
  errorMessage: string
): Promise<void> {
  const db = getLandRadarDb();

  // Create an explicit failed job
  const { data: job, error: jobErr } = await db
    .from('ingestion_jobs')
    .insert({
      data_source_id: dataSourceId,
      status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (jobErr) {
    console.error('[IngestionService] Failed to create failed job record:', jobErr.message);
    return;
  }

  await failIngestionJob(job.id, dataSourceId, errorMessage);
}
