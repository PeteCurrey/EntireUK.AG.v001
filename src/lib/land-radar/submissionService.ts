/**
 * Entire UK — Opportunity Submission Persistence Service
 *
 * Implements DATA-013-01:
 * - Authoritative persistence for public submissions (land, property, opportunity, partner).
 * - Enforces server-side validation.
 * - In production, persists strictly to Supabase `opportunity_submissions`.
 * - In test/mock mode, uses isolated memory store with full inspection APIs.
 * - Never returns success without confirmed persistence.
 * - Protects personal identifiable information (PII) from server console dumps.
 */

import { getLandRadarDb, getPersistenceMode, PersistenceError } from './db';

export interface CreateSubmissionInput {
  submission_type: 'land' | 'property' | 'opportunity' | 'partner' | 'general_contact';
  submitter_name: string;
  email: string;
  phone?: string | null;
  organisation?: string | null;
  address?: string | null;
  postcode?: string | null;
  site_size_description?: string | null;
  current_use?: string | null;
  planning_status?: string | null;
  ownership_status?: string | null;
  opportunity_description?: string | null;
  submitted_notes?: string | null;
  consent_acknowledged?: boolean;
  raw_payload?: Record<string, unknown>;
}

export interface PersistedSubmission extends CreateSubmissionInput {
  id: string;
  submission_reference: string;
  status: 'received' | 'under_review' | 'screened' | 'archived';
  created_at: string;
  updated_at: string;
}

// In-memory store for isolated unit/integration tests
const memorySubmissions = new Map<string, PersistedSubmission>();

export function _resetSubmissionStore(): void {
  memorySubmissions.clear();
}

export function generateSubmissionReference(): string {
  const dateStr = Date.now().toString(36).toUpperCase();
  const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EUK-SUB-${dateStr}-${randStr}`;
}

export async function createSubmission(input: CreateSubmissionInput): Promise<PersistedSubmission> {
  // 1. Validation
  if (!input.submission_type) {
    throw new Error('Submission type is required.');
  }
  if (!input.submitter_name || input.submitter_name.trim().length === 0) {
    throw new Error('Submitter name is required.');
  }
  if (!input.email || !input.email.includes('@')) {
    throw new Error('Valid email address is required.');
  }
  if (input.submission_type !== 'general_contact' && !input.postcode && !input.address) {
    throw new Error('A valid UK postcode or property address is required.');
  }

  const mode = getPersistenceMode();
  const now = new Date().toISOString();
  const submission_reference = generateSubmissionReference();

  const record: PersistedSubmission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    submission_reference,
    submission_type: input.submission_type,
    submitter_name: input.submitter_name.trim(),
    organisation: input.organisation?.trim() || null,
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    postcode: input.postcode?.trim().toUpperCase() || null,
    site_size_description: input.site_size_description?.trim() || null,
    current_use: input.current_use?.trim() || null,
    planning_status: input.planning_status?.trim() || null,
    ownership_status: input.ownership_status?.trim() || null,
    opportunity_description: input.opportunity_description?.trim() || null,
    submitted_notes: input.submitted_notes?.trim() || null,
    consent_acknowledged: input.consent_acknowledged ?? true,
    status: 'received',
    raw_payload: input.raw_payload ?? {},
    created_at: now,
    updated_at: now,
  };

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('opportunity_submissions')
      .insert({
        submission_reference: record.submission_reference,
        submission_type: record.submission_type,
        submitter_name: record.submitter_name,
        organisation: record.organisation,
        email: record.email,
        phone: record.phone,
        address: record.address,
        postcode: record.postcode,
        site_size_description: record.site_size_description,
        current_use: record.current_use,
        planning_status: record.planning_status,
        ownership_status: record.ownership_status,
        opportunity_description: record.opportunity_description,
        submitted_notes: record.submitted_notes,
        consent_acknowledged: record.consent_acknowledged,
        status: record.status,
        raw_payload: record.raw_payload,
      })
      .select()
      .single();

    if (error || !data) {
      throw new PersistenceError(
        `Failed to persist opportunity submission in database: ${error?.message || 'No record returned'}`,
        error
      );
    }

    return data as PersistedSubmission;
  }

  // Mock / test persistence
  memorySubmissions.set(record.id, record);
  return record;
}

export async function listSubmissions(): Promise<PersistedSubmission[]> {
  const mode = getPersistenceMode();

  if (mode === 'supabase') {
    const db = getLandRadarDb();
    const { data, error } = await db
      .from('opportunity_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new PersistenceError(`Failed to retrieve submissions: ${error.message}`, error);
    }
    return (data || []) as PersistedSubmission[];
  }

  return Array.from(memorySubmissions.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}
