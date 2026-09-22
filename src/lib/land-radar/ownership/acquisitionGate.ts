/**
 * Land Radar — Acquisition Investigation Gate
 *
 * Phase 11 Section 13 Implementation:
 * A formal intelligence gate report before a candidate progresses beyond INVESTIGATING.
 * Exposes:
 *   - Evidence known & unknown
 *   - Ownership controlling party & complexity
 *   - Availability state & evidence date
 *   - Planning & market evidence summaries
 *   - Active constraints & unresolved unknowns
 *   - Detected contradictions
 *   - Analyst view & recommended next actions
 *
 * Governance Rule:
 * The analyst makes the acquisition decision. This gate surfaces all relevant
 * facts and exposes epistemic gaps — it never issues an automated approval.
 */

import {
  Site,
  SiteSignal,
  CreateSignalInput,
  PrioritisationResult,
  PlanningEvidenceItem,
  MarketEvidenceSummary,
  DevelopmentCapacityEvidence,
  OwnershipIntelligenceSummary,
  AcquisitionGateReport,
  ContradictionReport,
} from '../types';

export interface GenerateAcquisitionGateParams {
  site: Site;
  signals?: Array<SiteSignal | CreateSignalInput>;
  prioritisation?: PrioritisationResult;
  ownershipSummary: OwnershipIntelligenceSummary;
  planningEvidence?: PlanningEvidenceItem[];
  marketEvidence?: MarketEvidenceSummary;
  capacityEvidence?: DevelopmentCapacityEvidence;
  contradictions: ContradictionReport;
  analystView: string;
  nextAction: string;
  generatedBy: string;
}

export function generateAcquisitionGate(
  params: GenerateAcquisitionGateParams
): AcquisitionGateReport {
  const {
    site,
    signals = [],
    prioritisation,
    ownershipSummary,
    planningEvidence = [],
    marketEvidence,
    contradictions,
    analystView,
    nextAction,
    generatedBy,
  } = params;

  const totalSignals = signals.length;
  const knownSignals = signals.filter((s) => s.status === 'known').length;
  const unknownSignals = signals.filter((s) => s.status === 'unknown').length;
  const conflictingSignals = signals.filter((s) => s.status === 'conflicting').length;
  const completenessPct =
    prioritisation?.evidenceCompleteness?.percentage ??
    (totalSignals > 0 ? Math.round((knownSignals / totalSignals) * 100) : 0);

  // Ownership summary
  const controllingNotes =
    ownershipSummary.ownership_evidence_records.length > 0
      ? ownershipSummary.ownership_evidence_records[0].proprietor_notes
      : null;

  // Planning summary
  const hasPlanning = planningEvidence.length > 0;
  const planSig = signals.find((s) => s.signal_type === 'planning_activity');
  const planSigStatus = planSig ? planSig.status : 'unknown';
  const lpaNotes = hasPlanning
    ? `Identified ${planningEvidence.length} planning records in vicinity (e.g. ${planningEvidence[0].application.application_reference}).`
    : 'No planning applications matched within spatial buffer.';

  // Market summary
  const marketStrength = marketEvidence?.market_strength ?? 'UNKNOWN';
  const compCount = marketEvidence?.sample_size ?? 0;
  const marketNotes =
    compCount > 0
      ? `Assessed against ${compCount} HMLR Price Paid transactions within radius.`
      : 'No comparable transactions matched. Absence of sales != absence of market.';

  // Constraints & Unknowns
  const activeConstraints: string[] = [];
  const unresolvedConstraints: string[] = [];
  const unknowns: string[] = [];

  for (const sig of signals) {
    if (sig.status === 'known' && sig.value === 0) {
      activeConstraints.push(`${sig.signal_type}: ${sig.explanation}`);
    } else if (sig.status === 'unknown') {
      unknowns.push(`${sig.signal_type}: data unavailable`);
    } else if (sig.status === 'conflicting') {
      unresolvedConstraints.push(`${sig.signal_type}: conflicting authoritative data`);
    }
  }

  if (ownershipSummary.ownership_evidence_status === 'UNKNOWN') {
    unknowns.push('ownership: no title or proprietor evidence retrieved');
  }
  if (ownershipSummary.availability_state === 'UNKNOWN') {
    unknowns.push('availability: no vendor communication or market availability confirmed');
  }

  return {
    site_id: site.id,
    site_reference: site.internal_reference,
    evidence_summary: {
      signal_count: totalSignals,
      known_signals: knownSignals,
      unknown_signals: unknownSignals,
      conflicting_signals: conflictingSignals,
      evidence_completeness_pct: completenessPct,
    },
    ownership_summary: {
      status: ownershipSummary.ownership_evidence_status,
      complexity: ownershipSummary.complexity,
      controlling_party_notes: controllingNotes,
    },
    availability_summary: {
      state: ownershipSummary.availability_state,
      evidence_date: ownershipSummary.latest_availability_evidence_date,
      confidence: ownershipSummary.availability_history.length > 0
        ? ownershipSummary.availability_history[0].confidence
        : null,
    },
    planning_summary: {
      has_planning_history: hasPlanning,
      planning_signal_status: planSigStatus,
      lpa_position_notes: lpaNotes,
    },
    market_summary: {
      market_strength: marketStrength,
      comparable_count: compCount,
      market_notes: marketNotes,
    },
    constraint_summary: {
      active_constraints: activeConstraints,
      unresolved_constraints: unresolvedConstraints,
    },
    unknowns,
    contradictions: contradictions.contradictions,
    analyst_view: analystView,
    next_action: nextAction,
    generated_at: new Date().toISOString(),
    generated_by: generatedBy,
  };
}
