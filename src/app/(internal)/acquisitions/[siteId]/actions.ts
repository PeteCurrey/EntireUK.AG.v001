"use server";

import { revalidatePath } from "next/cache";
import {
  recordContactAttempt,
  recordContradictionResolution,
} from "@/lib/land-radar/acquisitions/acquisitionService";
import { recordOutcome } from "@/lib/land-radar/outcomeService";
import { verifyHmlrTitleOnline } from "@/lib/land-radar/ownership/ownershipService";
import { ContactOutcomeCode, AcquisitionOutcomeState } from "@/lib/land-radar/types";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * DEF-013-01 guard — call at the top of every mutation action.
 * Returns the authenticated user's email for use as the audit `recorded_by` value.
 * Throws if no valid session exists, blocking the action entirely.
 */
async function requireAuthenticatedAnalyst(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorised: a valid analyst session is required to perform this action.");
  }
  return user.email;
}

export interface RecordContactServerInput {
  site_id: string;
  site_reference: string;
  contact_type: 'email' | 'phone' | 'letter' | 'in_person' | 'agent_intermediary' | 'other';
  organisation_or_role: string;
  source_of_contact_details?: string;
  contact_date: string;
  outcome: ContactOutcomeCode;
  availability_information?: string;
  next_action?: string;
  follow_up_date?: string;
  analyst: string;
  notes?: string;
}

export async function recordContactAction(input: RecordContactServerInput) {
  try {
    const analystEmail = await requireAuthenticatedAnalyst();
    const record = await recordContactAttempt({
      site_id: input.site_id,
      site_reference: input.site_reference,
      contact_type: input.contact_type,
      organisation_or_role: input.organisation_or_role,
      source_of_contact_details: input.source_of_contact_details,
      contact_date: input.contact_date,
      outcome: input.outcome,
      availability_information: input.availability_information,
      next_action: input.next_action,
      follow_up_date: input.follow_up_date,
      analyst: analystEmail,
      notes: input.notes,
    });

    revalidatePath(`/acquisitions/${input.site_id}`);
    revalidatePath("/acquisitions");
    return { success: true, record };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to record contact attempt." };
  }
}

export interface ResolveContradictionServerInput {
  site_id: string;
  site_reference: string;
  contradiction_id: string;
  contradiction_type: string;
  resolution_status: 'RESOLVED' | 'UNRESOLVED' | 'DEFERRED_TO_LEGAL' | 'ACKNOWLEDGED_MATERIAL';
  resolution_rationale: string;
  supporting_evidence_ref?: string;
  resolved_by: string;
}

export async function resolveContradictionAction(input: ResolveContradictionServerInput) {
  try {
    const analystEmail = await requireAuthenticatedAnalyst();

    if (!input.resolution_rationale || input.resolution_rationale.trim().length < 5) {
      return { success: false, error: "A detailed resolution rationale is required." };
    }

    const record = await recordContradictionResolution({
      site_id: input.site_id,
      site_reference: input.site_reference,
      contradiction_id: input.contradiction_id,
      contradiction_type: input.contradiction_type,
      resolution_status: input.resolution_status,
      resolution_rationale: input.resolution_rationale,
      supporting_evidence_ref: input.supporting_evidence_ref,
      resolved_by: analystEmail,
    });

    revalidatePath(`/acquisitions/${input.site_id}`);
    revalidatePath("/acquisitions");
    return { success: true, record };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to resolve contradiction." };
  }
}

export interface TransitionLifecycleServerInput {
  site_id: string;
  site_reference: string;
  current_state: AcquisitionOutcomeState;
  next_state: AcquisitionOutcomeState;
  rationale: string;
  recorded_by: string;
}

export async function transitionLifecycleAction(input: TransitionLifecycleServerInput) {
  try {
    const analystEmail = await requireAuthenticatedAnalyst();

    if (!input.rationale || input.rationale.trim().length < 5) {
      return { success: false, error: "Lifecycle transition rationale is required." };
    }

    // Note: previous_state is passed to recordOutcome but is validated server-side
    // against the actual DB state. The client-supplied current_state is cross-checked
    // and will cause an error if it does not match the real current state.
    const outcome = await recordOutcome({
      site_id: input.site_id,
      previous_state: input.current_state,
      state: input.next_state,
      rationale: input.rationale,
      recorded_by: analystEmail,
    });

    revalidatePath(`/acquisitions/${input.site_id}`);
    revalidatePath("/acquisitions");
    return { success: true, outcome };
  } catch (err: any) {
    return { success: false, error: err.message || "Invalid lifecycle transition." };
  }
}

export async function verifyTitleOnlineAction(input: {
  site_id: string;
  site_reference: string;
  title_reference: string;
  recorded_by: string;
}) {
  try {
    const analystEmail = await requireAuthenticatedAnalyst();

    const res = await verifyHmlrTitleOnline({
      site_id: input.site_id,
      site_reference: input.site_reference,
      title_reference: input.title_reference,
      recorded_by: analystEmail,
    });

    revalidatePath(`/acquisitions/${input.site_id}`);
    revalidatePath("/acquisitions");
    return { success: true, data: res };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to verify HMLR title." };
  }
}
