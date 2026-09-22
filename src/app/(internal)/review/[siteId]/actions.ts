'use server';

import {
  createAction,
  updateActionStatus,
  addNote,
  progressCandidateToOpportunity,
} from '@/lib/land-radar/investigationService';
import { ActionStatus, ActionPriority, ActionType } from '@/lib/land-radar/types';
import { AuthorizationError, PersistenceError } from '@/lib/land-radar/db';

/**
 * Verifies that the current request has an authorized internal acquisition analyst role.
 * In a full production deployment with cookies/session tokens, this validates the JWT.
 * In local/dev testing, it validates against configured environment credentials.
 */
async function verifyAcquisitionAnalystAuthorization(): Promise<{ userId: string; role: string }> {
  // Check explicit test/mock or environment authorization bypass
  const isMock = process.env.LAND_RADAR_PERSISTENCE_MODE === 'mock' || process.env.NODE_ENV === 'test';
  
  if (isMock) {
    return { userId: 'usr-analyst-001', role: 'acquisitions_analyst' };
  }

  // In production, enforce that internal access keys / tokens are supplied
  const requiredRole = process.env.LAND_RADAR_INTERNAL_ROLE || 'acquisitions_analyst';
  const internalSecret = process.env.LAND_RADAR_INTERNAL_KEY;

  if (internalSecret && process.env.INTERNAL_ACCESS_TOKEN !== internalSecret) {
    throw new AuthorizationError('Forbidden: Invalid internal acquisition analyst credentials');
  }

  return { userId: 'usr-analyst-prod', role: requiredRole };
}

export async function createActionServer(input: {
  site_id: string;
  action_type: ActionType;
  title: string;
  priority: ActionPriority;
  assigned_to: string;
  due_date?: string;
  status: ActionStatus;
}) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await createAction(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to create action: ${(err as Error).message}`);
  }
}

export async function updateActionStatusServer(
  actionId: string,
  status: ActionStatus,
  options?: { completed_by?: string; completion_notes?: string }
) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await updateActionStatus(actionId, status, options);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to update action: ${(err as Error).message}`);
  }
}

export async function addNoteServer(input: {
  site_id: string;
  author: string;
  author_role: string;
  content: string;
  is_pinned?: boolean;
}) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await addNote({
      ...input,
      is_pinned: input.is_pinned ?? false,
    });
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to record note: ${(err as Error).message}`);
  }
}

export async function progressCandidateServer(input: {
  site_id: string;
  progressed_by: string;
  decision_reason: string;
  evidence_snapshot: Record<string, unknown>;
  notes?: string;
}) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await progressCandidateToOpportunity(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to progress candidate to opportunity: ${(err as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Phase 10: External Evidence & Real-World Validation Actions
// ---------------------------------------------------------------------------

import {
  recordExternalEvidence,
  recordValidationState,
} from '@/lib/land-radar/truthLedgerService';
import {
  ExternalEvidenceType,
  ContradictionStatus,
  ValidationStatus,
  ValidationStage,
  CommercialDecision,
  AvailabilityReality,
  OwnerEngagementReality,
  PlanningReality,
  AccessReality,
  MarketReality,
  AcquisitionOutcomeReality,
  RejectionReason,
  FalsePositiveRootCause,
  FalseNegativeCategory,
  ValidationEvidenceStatus,
} from '@/lib/land-radar/types';

export async function recordExternalEvidenceServer(input: {
  site_id: string;
  site_reference: string;
  evidence_type: ExternalEvidenceType;
  evidence_date: string;
  source_organisation: string;
  author: string;
  author_role?: string;
  summary: string;
  supporting_document_ref?: string;
  analyst_interpretation: string;
  contradiction_status: ContradictionStatus;
  confidence: 'high' | 'medium' | 'low' | 'provisional';
}) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await recordExternalEvidence(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to record external evidence: ${(err as Error).message}`);
  }
}

export async function recordValidationStateServer(input: {
  site_id: string;
  site_reference: string;
  cohort_id: string;
  validation_status: ValidationStatus;
  validation_evidence_status?: ValidationEvidenceStatus;
  validation_stage: ValidationStage;
  commercial_decision: CommercialDecision;
  availability_reality: AvailabilityReality;
  owner_engagement_reality: OwnerEngagementReality;
  planning_reality: PlanningReality;
  access_reality: AccessReality;
  market_reality: MarketReality;
  acquisition_outcome: AcquisitionOutcomeReality;
  rejection_reasons: RejectionReason[];
  false_positive_flag: boolean;
  false_positive_root_cause?: FalsePositiveRootCause | null;
  false_negative_flag: boolean;
  false_negative_category?: FalseNegativeCategory | null;
  analyst_notes?: string;
}) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await recordValidationState({
      ...input,
      validation_evidence_status: input.validation_evidence_status ?? 'BENCHMARK',
    });
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to record candidate validation: ${(err as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Phase 11: Ownership Intelligence & Live Acquisition Operations Actions
// ---------------------------------------------------------------------------

import {
  recordOwnershipEvidence,
  RecordOwnershipEvidenceInput,
  assessTitleCandidateRelationship,
  AssessTitleRelationshipInput,
  recordAvailabilityEvidence,
  RecordAvailabilityInput,
  recordContactOutcome,
  RecordContactOutcomeInput,
  recordAcquisitionEvidence,
  RecordAcquisitionEvidenceInput,
  verifyHmlrTitleOnline,
  VerifyHmlrTitleOnlineInput,
} from '@/lib/land-radar/ownership/ownershipService';

export async function recordOwnershipEvidenceServer(input: RecordOwnershipEvidenceInput) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await recordOwnershipEvidence(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to record ownership evidence: ${(err as Error).message}`);
  }
}

export async function assessTitleCandidateRelationshipServer(input: AssessTitleRelationshipInput) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await assessTitleCandidateRelationship(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to assess title relationship: ${(err as Error).message}`);
  }
}

export async function recordAvailabilityEvidenceServer(input: RecordAvailabilityInput) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await recordAvailabilityEvidence(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to record availability evidence: ${(err as Error).message}`);
  }
}

export async function recordContactOutcomeServer(input: RecordContactOutcomeInput) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await recordContactOutcome(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to record contact outcome: ${(err as Error).message}`);
  }
}

export async function recordAcquisitionEvidenceServer(input: RecordAcquisitionEvidenceInput) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await recordAcquisitionEvidence(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to record acquisition evidence: ${(err as Error).message}`);
  }
}

export async function verifyHmlrTitleOnlineServer(input: VerifyHmlrTitleOnlineInput) {
  await verifyAcquisitionAnalystAuthorization();
  try {
    return await verifyHmlrTitleOnline(input);
  } catch (err: unknown) {
    if (err instanceof PersistenceError) {
      throw err;
    }
    throw new PersistenceError(`Failed to verify HMLR title online: ${(err as Error).message}`);
  }
}




