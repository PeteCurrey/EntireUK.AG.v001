/**
 * Land Radar — Deterministic Next Best Action Engine
 *
 * Phase 13 Section 4 Implementation:
 * Generates an attributable, deterministic operational next action based strictly
 * on actual missing, contradictory, or expiring evidence.
 *
 * NON-NEGOTIABLE EPISTEMIC RULES:
 * 1. An action must NEVER recommend "Contact owner" if ownership or title is UNKNOWN.
 * 2. An action must NEVER infer availability from silence or planning activity.
 * 3. The engine must explain WHY an action is recommended and what evidence triggered it.
 * 4. Terminal rejections must produce REVIEW_REJECTION rather than operational progression.
 */

import {
  Site,
  SiteSignal,
  CreateSignalInput,
  OwnershipIntelligenceSummary,
  ContradictionReport,
  AcquisitionContactRecord,
  AcquisitionOutcomeState,
  DeterministicNextAction,
  NextActionCode,
} from '../types';
import { isRejectionState, isTerminalState } from '../outcomeService';

export interface EvaluateNextActionParams {
  site: Site;
  lifecycleStage?: AcquisitionOutcomeState;
  ownershipSummary: OwnershipIntelligenceSummary;
  signals?: Array<SiteSignal | CreateSignalInput>;
  contradictions?: ContradictionReport;
  contactHistory?: AcquisitionContactRecord[];
}

export function evaluateDeterministicNextAction(
  params: EvaluateNextActionParams
): DeterministicNextAction {
  const {
    site,
    lifecycleStage = 'SURFACED',
    ownershipSummary,
    signals = [],
    contradictions,
    contactHistory = [],
  } = params;

  // -------------------------------------------------------------------------
  // 1. Terminal / Rejection Branch Check
  // -------------------------------------------------------------------------
  if (isRejectionState(lifecycleStage)) {
    return {
      code: 'REVIEW_REJECTION',
      label: 'Review Terminal Rejection Rationale',
      category: 'lifecycle',
      priority: 'low',
      rationale: `Candidate site is in terminal rejection branch (${lifecycleStage}). Re-evaluating requires formal evidence refuting the original rejection ground.`,
      trigger_evidence: `Lifecycle state = ${lifecycleStage}`,
      blocked_by: 'Terminal rejection state',
      prerequisites_met: false,
    };
  }

  // -------------------------------------------------------------------------
  // 2. Active Material Contradictions (Must be resolved before progression)
  // -------------------------------------------------------------------------
  const unresolvedContradictions = contradictions?.contradictions.filter(
    (c) => !c.resolved
  ) ?? [];

  if (unresolvedContradictions.length > 0) {
    const firstContra = unresolvedContradictions[0];
    const isAccess =
      firstContra.machine_claim.toLowerCase().includes('access') ||
      firstContra.external_finding.toLowerCase().includes('access');

    const contraSummary = `${firstContra.category}: ${firstContra.machine_claim} vs ${firstContra.external_finding}`;

    if (isAccess) {
      return {
        code: 'VERIFY_ACCESS',
        label: 'Resolve Highways & Access Contradiction',
        category: 'access',
        priority: 'critical',
        rationale: `Access evidence conflict detected: ${contraSummary}. Physical road adjacency does not guarantee legal vehicular ransom clearance.`,
        trigger_evidence: `Contradiction ${firstContra.id}: ${contraSummary}`,
        blocked_by: 'Unresolved highways discrepancy',
        prerequisites_met: true,
      };
    }

    return {
      code: 'RESOLVE_TITLE_CONTRADICTION',
      label: 'Resolve Title / Ownership Contradiction',
      category: 'title',
      priority: 'critical',
      rationale: `Authoritative evidence conflicts: ${contraSummary}. The discrepancy must be formally investigated and resolved before advancing.`,
      trigger_evidence: `Contradiction ${firstContra.id}: ${firstContra.machine_claim} vs ${firstContra.external_finding}`,
      blocked_by: 'Conflicting source records',
      prerequisites_met: true,
    };
  }

  // -------------------------------------------------------------------------
  // 3. Severe Physical or Access Constraints
  // -------------------------------------------------------------------------
  const accessSignal = signals.find((s) => s.signal_type === 'road_proximity');
  const floodSignal = signals.find((s) => s.signal_type === 'flood_risk');

  if (accessSignal && accessSignal.status === 'known' && accessSignal.value === 0) {
    return {
      code: 'VERIFY_ACCESS',
      label: 'Investigate Legal & Physical Access',
      category: 'access',
      priority: 'high',
      rationale: `Access signal indicates constraint or ransom strip potential (${accessSignal.explanation}). Legal right-of-way and visibility splay must be verified.`,
      trigger_evidence: `Signal road_proximity: ${accessSignal.explanation}`,
      blocked_by: null,
      prerequisites_met: true,
    };
  }

  if (floodSignal && floodSignal.status === 'known' && floodSignal.value === 0) {
    return {
      code: 'INVESTIGATE_ENVIRONMENTAL_CONSTRAINT',
      label: 'Commission Flood & Environmental Desk Study',
      category: 'environmental',
      priority: 'high',
      rationale: `Site overlaps significant environmental constraint (${floodSignal.explanation}). Sequential test and mitigation requirements must be scoped.`,
      trigger_evidence: `Signal flood_risk: ${floodSignal.explanation}`,
      blocked_by: null,
      prerequisites_met: true,
    };
  }

  // -------------------------------------------------------------------------
  // 4. Cadastral & Ownership Foundation
  // -------------------------------------------------------------------------
  const hasVerifiedTitle =
    ownershipSummary.ownership_evidence_records.some((e) => e.evidence_status === 'VERIFIED') ||
    ownershipSummary.title_relationships.some((r) => r.relationship_strength === 'STRONG');

  if (!hasVerifiedTitle) {
    return {
      code: 'VERIFY_TITLE',
      label: 'Verify Official Title Register (HMLR)',
      category: 'title',
      priority: 'high',
      rationale: 'Cadastral identity is unverified. Official HM Land Registry title search required to confirm registered proprietor, tenure and easements.',
      trigger_evidence: `Ownership status: ${ownershipSummary.ownership_evidence_status}, Titles mapped: ${ownershipSummary.title_relationships.length}`,
      blocked_by: null,
      prerequisites_met: true,
    };
  }

  if (
    ownershipSummary.complexity === 'MULTI_TITLE' ||
    ownershipSummary.complexity === 'FRAGMENTED'
  ) {
    const unverifiedTitles = ownershipSummary.title_relationships.filter(
      (r) => r.relationship_strength === 'UNKNOWN' || r.relationship_strength === 'WEAK'
    );
    if (unverifiedTitles.length > 0) {
      return {
        code: 'OBTAIN_ADDITIONAL_TITLE',
        label: 'Obtain Overlapping Title Plans',
        category: 'title',
        priority: 'high',
        rationale: `Site is fragmented across multiple titles (${ownershipSummary.title_relationships.length} identified). Complete assembly requires resolving secondary title registers.`,
        trigger_evidence: `Ownership complexity: ${ownershipSummary.complexity}, ${unverifiedTitles.length} secondary titles pending.`,
        blocked_by: null,
        prerequisites_met: true,
      };
    }
  }

  // -------------------------------------------------------------------------
  // 5. Planning & Local Policy Foundation
  // -------------------------------------------------------------------------
  const planSignal = signals.find((s) => s.signal_type === 'planning_activity');
  if (!planSignal || planSignal.status === 'unknown') {
    return {
      code: 'REVIEW_PLANNING_HISTORY',
      label: 'Review LPA Planning History & SHLAA',
      category: 'planning',
      priority: 'medium',
      rationale: 'Local planning register and SHLAA allocation status unverified. Search local authority portal for prior applications and draft allocations.',
      trigger_evidence: 'Planning signal = unknown / unreviewed',
      blocked_by: null,
      prerequisites_met: true,
    };
  }

  // -------------------------------------------------------------------------
  // 6. Contact & Availability Workflow
  // -------------------------------------------------------------------------
  const availabilityState = ownershipSummary.availability_state;

  // Rule 1 Enforcement: If ownership is verified, but availability is unknown
  if (availabilityState === 'UNKNOWN') {
    return {
      code: 'INVESTIGATE_AVAILABILITY',
      label: 'Investigate Commercial Availability',
      category: 'availability',
      priority: 'high',
      rationale: 'Title and proprietor confirmed, but commercial availability is UNKNOWN. Conduct market intelligence or soft vendor enquiries to establish sale intent.',
      trigger_evidence: 'Availability state = UNKNOWN. Epistemic rule: title existence != available for sale.',
      blocked_by: null,
      prerequisites_met: true,
    };
  }

  // If availability is affirmative or under discussion, evaluate contact state
  if (
    availabilityState === 'AVAILABLE' ||
    availabilityState === 'POTENTIALLY_AVAILABLE' ||
    availabilityState === 'UNDER_DISCUSSION'
  ) {
    if (contactHistory.length === 0) {
      return {
        code: 'CONTACT_OWNER_OR_AGENT',
        label: 'Initiate Introductory Acquisition Enquiry',
        category: 'contact',
        priority: 'high',
        rationale: `Foundational title and positive availability signals established (${availabilityState}). Issue formal introductory communication to proprietor or controlling agent.`,
        trigger_evidence: `Proprietor identified, availability = ${availabilityState}, contact count = 0`,
        blocked_by: null,
        prerequisites_met: true,
      };
    }

    // Contact exists: check follow-up dates and outcomes
    const sortedContacts = [...contactHistory].sort((a, b) =>
      b.contact_date.localeCompare(a.contact_date)
    );
    const latestContact = sortedContacts[0];

    // Follow-up due check
    const now = new Date();
    if (latestContact.follow_up_date) {
      const followUp = new Date(latestContact.follow_up_date);
      if (now >= followUp && latestContact.follow_up_status !== 'completed') {
        return {
          code: 'FOLLOW_UP_CONTACT',
          label: 'Execute Scheduled Contact Follow-Up',
          category: 'contact',
          priority: 'high',
          rationale: `Scheduled follow-up date reached (${latestContact.follow_up_date}). Prior outcome: ${latestContact.outcome}. Contact proprietor or agent with progress update.`,
          trigger_evidence: `Follow-up date = ${latestContact.follow_up_date}, status = ${latestContact.follow_up_status}`,
          blocked_by: null,
          prerequisites_met: true,
        };
      }
    }

    // Default follow-up if NO_RESPONSE > 7 days ago
    if (latestContact.outcome === 'NO_RESPONSE') {
      const contactDate = new Date(latestContact.contact_date);
      const daysSince = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 3600 * 24));
      if (daysSince >= 7) {
        return {
          code: 'FOLLOW_UP_CONTACT',
          label: 'Issue Secondary Contact Follow-Up',
          category: 'contact',
          priority: 'medium',
          rationale: `Initial contact sent ${daysSince} days ago with no response. Issue polite follow-up or attempt alternate communication channel (phone/letter).`,
          trigger_evidence: `Latest contact: ${latestContact.contact_date} (${latestContact.outcome})`,
          blocked_by: null,
          prerequisites_met: true,
        };
      }
    }
  }

  // -------------------------------------------------------------------------
  // 7. Ready for Formal Acquisition Gate Decision
  // -------------------------------------------------------------------------
  if (
    hasVerifiedTitle &&
    unresolvedContradictions.length === 0 &&
    (availabilityState === 'AVAILABLE' || availabilityState === 'UNDER_DISCUSSION')
  ) {
    return {
      code: 'COMPLETE_ACQUISITION_GATE',
      label: 'Convene Formal Acquisition Gate Review',
      category: 'gate',
      priority: 'high',
      rationale: 'All foundational evidence verified: title mapped, proprietor engaged, availability affirmed, no active blockers. Proceed to formal commercial gate decision.',
      trigger_evidence: `Title verified, availability = ${availabilityState}, contradictions = 0`,
      blocked_by: null,
      prerequisites_met: true,
    };
  }

  // -------------------------------------------------------------------------
  // 8. General Default Action
  // -------------------------------------------------------------------------
  return {
    code: 'INVESTIGATE_AVAILABILITY',
    label: 'Deepen Acquisition Due Diligence',
    category: 'availability',
    priority: 'medium',
    rationale: 'Continue progressive acquisition due diligence across title, access and commercial availability.',
    trigger_evidence: `Lifecycle = ${lifecycleStage}, Site ref = ${site.internal_reference}`,
    blocked_by: null,
    prerequisites_met: true,
  };
}
