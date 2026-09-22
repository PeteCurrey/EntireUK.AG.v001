/**
 * Land Radar — Site Service
 *
 * Domain service for site operations.
 * The dashboard should consume this service, not embed SQL directly.
 */

import type { Site, CreateSiteInput, OpportunityExplanation, SiteStatus } from './types';
import { getLandRadarDb } from './db';
import { generateSiteReference } from './ingestion';
import { hasAreaDiscrepancy } from './geometry';

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createSite(input: CreateSiteInput): Promise<Site> {
  const db = getLandRadarDb();
  const reference = generateSiteReference();

  const insertData: Record<string, unknown> = {
    internal_reference: reference,
    name: input.name ?? null,
    source: input.source,
    source_reference: input.source_reference ?? null,
    local_authority: input.local_authority ?? null,
    country: input.country ?? 'england',
    postcode_sector: input.postcode_sector ?? null,
    location_description: input.location_description ?? null,
  };

  if (input.geometry) {
    insertData.geometry = JSON.stringify(input.geometry);
  }

  if (input.area_sqm_source !== undefined) {
    insertData.area_sqm_source = input.area_sqm_source;
  }

  const { data, error } = await db
    .from('sites')
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create site: ${error.message}`);

  const site = data as Site;

  // Flag area discrepancy if both values are available
  if (site.area_sqm !== null && input.area_sqm_source !== undefined) {
    const discrepancy = hasAreaDiscrepancy(site.area_sqm, input.area_sqm_source);
    if (discrepancy) {
      await db
        .from('sites')
        .update({ area_discrepancy_flag: true })
        .eq('id', site.id);
      site.area_discrepancy_flag = true;
    }
  }

  return site;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getSite(id: string): Promise<Site | null> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('sites')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw new Error(`Failed to get site ${id}: ${error.message}`);
  }

  return data as Site;
}

export async function getSiteByReference(reference: string): Promise<Site | null> {
  const db = getLandRadarDb();
  const { data, error } = await db
    .from('sites')
    .select('*')
    .eq('internal_reference', reference)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get site by reference ${reference}: ${error.message}`);
  }

  return data as Site;
}

export async function listSites(filters?: {
  status?: SiteStatus;
  local_authority?: string;
  limit?: number;
  offset?: number;
}): Promise<Site[]> {
  const db = getLandRadarDb();
  let query = db.from('sites').select('*').order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.local_authority) {
    query = query.eq('local_authority', filters.local_authority);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list sites: ${error.message}`);
  return (data ?? []) as Site[];
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateSiteStatus(id: string, status: SiteStatus): Promise<void> {
  const db = getLandRadarDb();
  const { error } = await db
    .from('sites')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update site ${id} status: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Explanation (evidence-based, no score)
// ---------------------------------------------------------------------------

/**
 * Returns a structured, evidence-based explanation of why Land Radar
 * surfaced this site. No score. Every field traces back to data.
 *
 * "Why did Land Radar surface this?"
 */
export async function getSiteExplanation(siteId: string): Promise<OpportunityExplanation | null> {
  const db = getLandRadarDb();

  const site = await getSite(siteId);
  if (!site) return null;

  // Get signals
  const { data: signals } = await db
    .from('site_signals')
    .select('*')
    .eq('site_id', siteId)
    .order('calculated_at', { ascending: false });

  // Get constraints
  const { data: constraints } = await db
    .from('site_constraints')
    .select('*')
    .eq('site_id', siteId);

  const signalSummaries = (signals ?? []).map((s: Record<string, unknown>) => ({
    type: s.signal_type as OpportunityExplanation['signals'][0]['type'],
    status: s.status as OpportunityExplanation['signals'][0]['status'],
    summary: s.explanation as string,
    value: s.value as number | null,
    unit: s.unit as string | null,
    rule_version: s.rule_version as string,
  }));

  const constraintSummaries = (constraints ?? []).map((c: Record<string, unknown>) => ({
    type: c.constraint_type as OpportunityExplanation['constraints'][0]['type'],
    severity: c.severity_classification as OpportunityExplanation['constraints'][0]['severity'],
    overlap_pct: c.overlap_pct as number | null,
    status: c.status as OpportunityExplanation['constraints'][0]['status'],
    derived: c.severity_is_derived as boolean,
  }));

  const unknownCount = signalSummaries.filter((s: { status: OpportunityExplanation['signals'][0]['status'] }) => s.status === 'unknown').length;

  return {
    site: {
      id: site.id,
      internal_reference: site.internal_reference,
      name: site.name,
      area_sqm: site.area_sqm,
      local_authority: site.local_authority,
    },
    signals: signalSummaries,
    constraints: constraintSummaries,
    unknown_count: unknownCount,
    explanation_generated_at: new Date().toISOString(),
  };
}
