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

/**
 * Detects whether credible market-facing disposal contact evidence exists
 * independently of registered HMLR ownership verification (DEF-013-02).
 *
 * Epistemic boundary:
 * A commercial selling agent or disposal instruction can justify early commercial contact.
 * However, agent contact NEVER validates or infers registered title ownership.
 */
export function findCredibleDisposalAgent(
  ownershipSummary: OwnershipIntelligenceSummary,
  contactHistory: AcquisitionContactRecord[] = []
): { hasAgent: boolean; agentDetail?: string } {
  // 1. Check acquisition evidence records for agent communications or market intelligence
  const agentAcq = ownershipSummary.acquisition_evidence?.find(
    (e) =>
      (e.evidence_type === 'agent_communication' || e.evidence_type === 'market_agent_intelligence') &&
      e.confidence !== 'low'
  );
  if (agentAcq) {
    return { hasAgent: true, agentDetail: `${agentAcq.actor} (${agentAcq.summary})` };
  }

  // 2. Check availability history for agent marketing / particulars
  const agentAvail = ownershipSummary.availability_history?.find(
    (a) =>
      (a.availability_state === 'AVAILABLE' ||
        a.availability_state === 'POTENTIALLY_AVAILABLE' ||
        a.availability_state === 'UNDER_DISCUSSION') &&
      Boolean(
        a.evidence_source?.toLowerCase().includes('agent') ||
        a.evidence_source?.toLowerCase().includes('particulars') ||
        a.evidence_source?.toLowerCase().includes('listing') ||
        a.evidence_source?.toLowerCase().includes('broker') ||
        a.evidence_notes?.toLowerCase().includes('agent')
      )
  );
  if (agentAvail) {
    return {
      hasAgent: true,
      agentDetail: `${agentAvail.evidence_source || 'Agent'}: ${agentAvail.evidence_notes || 'Marketed disposal'}`,
    };
  }

  // 3. Check ownership evidence for marketing particulars or commercial agent source
  const agentOwner = ownershipSummary.ownership_evidence_records?.find(
    (o) =>
      (o.evidence_status === 'SUPPORTED' || o.evidence_status === 'INDICATIVE' || o.evidence_status === 'VERIFIED') &&
      Boolean(
        o.ownership_source?.toLowerCase().includes('agent') ||
        o.ownership_source?.toLowerCase().includes('particulars') ||
        o.ownership_source?.toLowerCase().includes('disposal') ||
        o.proprietor_notes?.toLowerCase().includes('agent') ||
        o.analyst_notes?.toLowerCase().includes('agent')
      )
  );
  if (agentOwner) {
    return {
      hasAgent: true,
      agentDetail: `${agentOwner.ownership_source || 'Agent'}: ${agentOwner.proprietor_notes || agentOwner.analyst_notes || 'Agent identified'}`,
    };
  }

  // 4. Check contact history for existing agent intermediary interactions
  const agentContact = contactHistory.find(
    (c) =>
      c.contact_type === 'agent_intermediary' ||
      Boolean(c.organisation_or_role && c.organisation_or_role.toLowerCase().includes('agent')) ||
      Boolean(c.organisation_or_role && c.organisation_or_role.toLowerCase().includes('broker'))
  );
  if (agentContact) {
    return {
      hasAgent: true,
      agentDetail: `${agentContact.organisation_or_role || 'Agent intermediary'}`,
    };
  }

  return { hasAgent: false };
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

  const disposalAgent = findCredibleDisposalAgent(ownershipSummary, contactHistory);

  if (!hasVerifiedTitle && !disposalAgent.hasAgent) {
    return {
      code: 'VERIFY_TITLE',
      label: 'Verify Official Title Register (HMLR)',
      category: 'title',
      priority: 'high',
      rationale:
        'Cadastral identity is unverified and no market-facing disposal agent is on record. ' +
        'Official HM Land Registry title search required to confirm registered proprietor, tenure and easements before direct owner contact.',
      trigger_evidence: `Ownership status: ${ownershipSummary.ownership_evidence_status}, Titles mapped: ${ownershipSummary.title_relationships.length}, Disposal agent: none`,
      blocked_by: null,
      prerequisites_met: true,
    };
  }

  if (
    hasVerifiedTitle &&
    (ownershipSummary.complexity === 'MULTI_TITLE' || ownershipSummary.complexity === 'FRAGMENTED')
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
  const brownfieldSignal = signals.find((s) => s.signal_type === 'brownfield_signal');
  const isPdl = brownfieldSignal && brownfieldSignal.status === 'known' && Number(brownfieldSignal.value) > 0;

  if (!planSignal || planSignal.status === 'unknown') {
    // DEF-013-03 FIX: REVIEW_LOCAL_PLAN was declared but never emitted.
    // For brownfield / previously developed land, emit the more specific action.
    if (isPdl) {
      return {
        code: 'REVIEW_LOCAL_PLAN',
        label: 'Review Local Plan & SHLAA Allocation',
        category: 'planning',
        priority: 'medium',
        rationale:
          `Site is previously developed land (brownfield_signal confirmed) but Local Plan ` +
          `allocation and planning history are unknown. Emerging policy status, SHLAA ` +
          `call-for-sites and any allocations in the Local Development Scheme must be ` +
          `confirmed before commercial gate.`,
        trigger_evidence: `brownfield_signal = ${brownfieldSignal!.value}; planning_activity = ${planSignal?.status ?? 'absent'}`,
        blocked_by: null,
        prerequisites_met: true,
      };
    }
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
  // 5b. Commercial Hold — must be evaluated before the contact/availability
  //     workflow so that a held candidate is not incorrectly asked to make
  //     contact or investigate availability when the site is deliberately paused.
  //     DEF-013-03 FIX: PLACE_ON_HOLD was declared but never emitted.
  //     Uses 'constraint_signal' (the existing SignalType) to detect hold conditions.
  // -------------------------------------------------------------------------
  if (lifecycleStage === 'INVESTIGATING') {
    const constraintSignal = signals.find((s) => s.signal_type === 'constraint_signal');
    const hasActiveHoldReason =
      constraintSignal && constraintSignal.status === 'known' && Number(constraintSignal.value) < 1;

    if (hasActiveHoldReason) {
      const holdDetail = constraintSignal!.explanation || constraintSignal!.value_text || constraintSignal!.status;
      return {
        code: 'PLACE_ON_HOLD',
        label: 'Place Candidate on Commercial Hold',
        category: 'lifecycle',
        priority: 'medium',
        rationale:
          `Active commercial hold condition prevents progression. Site is INVESTIGATING but ` +
          `a material constraint has been identified that requires third-party resolution ` +
          `before acquisition discussions can continue: constraint_signal = ${holdDetail}.`,
        trigger_evidence: `Lifecycle = INVESTIGATING; constraint_signal: ${holdDetail}`,
        blocked_by: 'Active constraint hold condition (contamination, infrastructure or ransom)',
        prerequisites_met: true,
      };
    }
  }

  // -------------------------------------------------------------------------
  // 6. Contact & Availability Workflow
  // -------------------------------------------------------------------------
  const availabilityState = ownershipSummary.availability_state;

  const isPositiveAvailability =
    availabilityState === 'AVAILABLE' ||
    availabilityState === 'POTENTIALLY_AVAILABLE' ||
    availabilityState === 'UNDER_DISCUSSION';

  const isAgentOutreachEligible =
    disposalAgent.hasAgent && availabilityState !== 'NOT_AVAILABLE';

  // Rule 1 Enforcement: If ownership is verified without disposal agent, but availability is unknown
  if (availabilityState === 'UNKNOWN' && !disposalAgent.hasAgent) {
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

  // If availability is affirmative or under discussion, OR credible disposal agent identified
  if (isPositiveAvailability || isAgentOutreachEligible) {
    if (contactHistory.length === 0) {
      const isAgentOnly = !hasVerifiedTitle && disposalAgent.hasAgent;
      return {
        code: 'CONTACT_OWNER_OR_AGENT',
        label: isAgentOnly
          ? 'Initiate Introductory Enquiry with Disposal Agent'
          : 'Initiate Introductory Acquisition Enquiry',
        category: 'contact',
        priority: 'high',
        rationale: isAgentOnly
          ? `Credible market-facing disposal agent identified (${disposalAgent.agentDetail}). ` +
            `Initiate introductory commercial enquiry with instructed agent while formal HMLR title verification proceeds in parallel.`
          : `Foundational title and positive availability signals established (${availabilityState}). Issue formal introductory communication to proprietor or controlling agent.`,
        trigger_evidence: isAgentOnly
          ? `Market-facing disposal agent: ${disposalAgent.agentDetail}; HMLR title unverified. Epistemic rule: agent != owner.`
          : `Proprietor identified, availability = ${availabilityState}, contact count = 0`,
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
  // 6b. Market Evidence Gap (Requires Cadastral & Contact/Availability Foundation)
  //     DEF-013-03 FIX: OBTAIN_MARKET_EVIDENCE was declared but never emitted.
  //     Uses 'market_signal' (the existing SignalType). Planning is confirmed
  //     assessed and availability is addressed. Fires before commercial gate
  //     when market comparable evidence is absent.
  // -------------------------------------------------------------------------
  const marketSignal = signals.find((s) => s.signal_type === 'market_signal');
  if (!marketSignal || marketSignal.status === 'unknown') {
    return {
      code: 'OBTAIN_MARKET_EVIDENCE',
      label: 'Source Market Comparable Evidence',
      category: 'availability',
      priority: 'medium',
      rationale:
        `Planning history assessed but no market comparable evidence on record. ` +
        `Land value context requires comparable transactions or listed pricing ` +
        `before a commercial gate decision can be grounded in evidence.`,
      trigger_evidence: `planning_activity = ${planSignal.status}; market_signal = ${marketSignal?.status ?? 'absent'}`,
      blocked_by: null,
      prerequisites_met: true,
    };
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

  // If agent outreach occurred but HMLR title remains unverified, require title verification before commercial gate
  if (!hasVerifiedTitle) {
    return {
      code: 'VERIFY_TITLE',
      label: 'Verify Official Title Register (HMLR)',
      category: 'title',
      priority: 'high',
      rationale:
        'Market enquiries or disposal agent dialogue initiated, but official cadastral title remains unverified. ' +
        'HM Land Registry title search required before convening formal commercial acquisition gate.',
      trigger_evidence: `Ownership status: ${ownershipSummary.ownership_evidence_status}, HMLR title pending.`,
      blocked_by: 'Unverified HMLR title register',
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
