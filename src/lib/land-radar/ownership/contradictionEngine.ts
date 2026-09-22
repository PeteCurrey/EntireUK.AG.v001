/**
 * Land Radar — Candidate Truth Contradiction Engine
 *
 * Phase 11 Section 15 Implementation:
 * Deterministic detection of contradictions across truth layers:
 *   1. Machine vs External Evidence (e.g. machine positive road vs ransom strip)
 *   2. Derived vs Analyst (e.g. system high priority vs analyst rejection)
 *   3. Analyst vs Outcome (e.g. analyst expected available vs owner refused)
 *   4. Source vs Source (e.g. two authoritative sources disagree)
 *
 * Principles:
 * - Contradictions are never auto-resolved by code.
 * - Human review is mandatory for all material contradictions.
 * - Produces an immutable, auditable ContradictionReport.
 */

import {
  SiteSignal,
  CandidateValidationRecord,
  ContradictionRecord,
  ContradictionReport,
  AcquisitionEvidenceRecord,
  ExternalEvidenceRecord,
  OwnershipEvidence,
  PrioritisationResult,
  CreateSignalInput,
} from '../types';

export interface DetectContradictionsParams {
  siteId: string;
  siteReference: string;
  signals?: Array<SiteSignal | CreateSignalInput>;
  prioritisation?: PrioritisationResult;
  validationRecord?: CandidateValidationRecord;
  externalEvidence?: (ExternalEvidenceRecord | AcquisitionEvidenceRecord)[];
  ownershipEvidence?: OwnershipEvidence[];
  analystNotes?: string | null;
}

export function detectContradictions(params: {
  siteId: string;
  siteReference: string;
  signals?: Array<SiteSignal | CreateSignalInput>;
  prioritisation?: PrioritisationResult;
  validationRecord?: CandidateValidationRecord;
  externalEvidence?: (ExternalEvidenceRecord | AcquisitionEvidenceRecord)[];
  ownershipEvidence?: OwnershipEvidence[];
  analystNotes?: string | null;
}): ContradictionReport {
  const contradictions: ContradictionRecord[] = [];
  const now = new Date().toISOString();
  const {
    siteId,
    siteReference,
    signals = [],
    prioritisation,
    validationRecord,
    externalEvidence = [],
    ownershipEvidence = [],
  } = params;

  // -------------------------------------------------------------------------
  // 1. Machine vs External Evidence
  // -------------------------------------------------------------------------
  for (const ev of externalEvidence) {
    if (ev.contradiction_status === 'contradicts_prioritisation') {
      const isAccess =
        ('evidence_type' in ev && ev.evidence_type === 'highways_advice') ||
        ev.summary.toLowerCase().includes('ransom') ||
        ev.summary.toLowerCase().includes('highway');

      const isContamination =
        ('evidence_type' in ev && (ev.evidence_type === 'survey' || ev.evidence_type === 'site_inspection')) ||
        ev.summary.toLowerCase().includes('contamination');

      if (isAccess) {
        contradictions.push({
          id: `contra-${Date.now()}-${contradictions.length + 1}`,
          site_id: siteId,
          site_reference: siteReference,
          category: 'MACHINE_VS_EXTERNAL',
          machine_claim: 'Road proximity signal classified site as accessible based on geometric road adjacency.',
          external_finding: ev.summary,
          severity: 'critical',
          requires_human_review: true,
          resolved: false,
          resolution_notes: null,
          detected_at: now,
        });
      } else if (isContamination) {
        contradictions.push({
          id: `contra-${Date.now()}-${contradictions.length + 1}`,
          site_id: siteId,
          site_reference: siteReference,
          category: 'MACHINE_VS_EXTERNAL',
          machine_claim: 'Brownfield screening did not identify site condition remediation impediment.',
          external_finding: ev.summary,
          severity: 'significant',
          requires_human_review: true,
          resolved: false,
          resolution_notes: null,
          detected_at: now,
        });
      } else {
        contradictions.push({
          id: `contra-${Date.now()}-${contradictions.length + 1}`,
          site_id: siteId,
          site_reference: siteReference,
          category: 'MACHINE_VS_EXTERNAL',
          machine_claim: 'Machine prioritisation supported candidate viability.',
          external_finding: ev.summary,
          severity: 'significant',
          requires_human_review: true,
          resolved: false,
          resolution_notes: null,
          detected_at: now,
        });
      }
    }
  }

  // Check road proximity signal vs access_reality failed in validationRecord
  const roadSignal = signals.find((s) => s.signal_type === 'road_proximity');
  if (
    roadSignal &&
    roadSignal.status === 'known' &&
    roadSignal.value === 1 &&
    validationRecord?.access_reality === 'FAILED'
  ) {
    const alreadyLogged = contradictions.some(
      (c) => c.category === 'MACHINE_VS_EXTERNAL' && c.external_finding.toLowerCase().includes('access')
    );
    if (!alreadyLogged) {
      contradictions.push({
        id: `contra-${Date.now()}-${contradictions.length + 1}`,
        site_id: siteId,
        site_reference: siteReference,
        category: 'MACHINE_VS_EXTERNAL',
        machine_claim: 'Machine road proximity signal indicated highway adjacency (value = 1).',
        external_finding: 'Ground truth validation recorded access_reality = FAILED (physical/legal access barrier).',
        severity: 'critical',
        requires_human_review: true,
        resolved: false,
        resolution_notes: null,
        detected_at: now,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 2. Derived vs Analyst
  // -------------------------------------------------------------------------
  const priority = prioritisation?.priority;
  if (priority === 'high' || priority === 'medium') {
    if (
      validationRecord?.commercial_decision === 'REJECT' ||
      validationRecord?.acquisition_outcome === 'REJECTED'
    ) {
      contradictions.push({
        id: `contra-${Date.now()}-${contradictions.length + 1}`,
        site_id: siteId,
        site_reference: siteReference,
        category: 'DERIVED_VS_ANALYST',
        machine_claim: `Derived prioritisation engine classified candidate as ${priority.toUpperCase()} priority.`,
        external_finding: `Analyst rejected candidate (${validationRecord.rejection_reasons.join(', ') || 'commercial rejection'}).`,
        severity: 'significant',
        requires_human_review: true,
        resolved: false,
        resolution_notes: null,
        detected_at: now,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. Analyst vs Outcome
  // -------------------------------------------------------------------------
  if (
    validationRecord?.availability_reality === 'UNAVAILABLE' ||
    validationRecord?.owner_engagement_reality === 'NOT_INTERESTED'
  ) {
    if (
      validationRecord.commercial_decision === 'PROGRESS' ||
      (params.analystNotes && params.analystNotes.toLowerCase().includes('available'))
    ) {
      contradictions.push({
        id: `contra-${Date.now()}-${contradictions.length + 1}`,
        site_id: siteId,
        site_reference: siteReference,
        category: 'ANALYST_VS_OUTCOME',
        machine_claim: 'Analyst hypothesis anticipated positive opportunity availability or progress.',
        external_finding: `Owner engagement confirmed ${validationRecord.availability_reality} / ${validationRecord.owner_engagement_reality}.`,
        severity: 'significant',
        requires_human_review: true,
        resolved: false,
        resolution_notes: null,
        detected_at: now,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 4. Source vs Source
  // -------------------------------------------------------------------------
  // Signals with conflicting status
  const conflictingSignals = signals.filter((s) => s.status === 'conflicting');
  for (const sig of conflictingSignals) {
    contradictions.push({
      id: `contra-${Date.now()}-${contradictions.length + 1}`,
      site_id: siteId,
      site_reference: siteReference,
      category: 'SOURCE_VS_SOURCE',
      machine_claim: `Source data conflict on signal: ${sig.signal_type}.`,
      external_finding: sig.explanation,
      severity: 'minor',
      requires_human_review: true,
      resolved: false,
      resolution_notes: null,
      detected_at: now,
    });
  }

  // Ownership evidence reporting conflicting status
  if (ownershipEvidence.some((e) => e.evidence_status === 'CONFLICTING')) {
    contradictions.push({
      id: `contra-${Date.now()}-${contradictions.length + 1}`,
      site_id: siteId,
      site_reference: siteReference,
      category: 'SOURCE_VS_SOURCE',
      machine_claim: 'Title / proprietor research produced conflicting ownership evidence records.',
      external_finding: 'Multiple ownership sources disagree on registered proprietor or tenure status.',
      severity: 'significant',
      requires_human_review: true,
      resolved: false,
      resolution_notes: null,
      detected_at: now,
    });
  }

  const unresolvedCount = contradictions.filter((c) => !c.resolved).length;
  const criticalCount = contradictions.filter((c) => c.severity === 'critical' && !c.resolved).length;
  const hasMachineVsExternal = contradictions.some((c) => c.category === 'MACHINE_VS_EXTERNAL');

  return {
    site_id: siteId,
    site_reference: siteReference,
    contradictions,
    unresolved_count: unresolvedCount,
    critical_count: criticalCount,
    has_machine_vs_external: hasMachineVsExternal,
    generated_at: now,
  };
}
