/**
 * Land Radar — Deterministic Planning Description Classifier
 *
 * Classifies planning descriptions into broad categories:
 * - residential: dwellings, apartments, flats, houses, C3, prior approval Class MA
 * - commercial: offices, retail, Class E, commercial hub, trade counter
 * - industrial: B1, B2, B8, manufacturing, workshop, depot, freight
 * - mixed_use: residential + commercial, comprehensive regeneration
 * - infrastructure: highway, access, substation, EV charging, utilities
 * - agricultural: farm, barn, rural diversification
 * - unknown: insufficient details
 *
 * CRITICAL PRINCIPLE:
 * The raw source description is ALWAYS preserved alongside this classification.
 * No AI hallucinations or subjective development assumptions.
 */

import { PlanningClassification } from '../types';

export function classifyPlanningDescription(
  description: string,
  applicationType?: string
): PlanningClassification {
  const text = (description || '').toLowerCase();
  const appType = (applicationType || '').toLowerCase();

  const isRes =
    text.includes('residential') ||
    text.includes('dwelling') ||
    text.includes('apartment') ||
    text.includes('housing') ||
    text.includes('class c3') ||
    text.includes('class ma');

  const isComm =
    text.includes('commercial') ||
    text.includes('retail') ||
    text.includes('office') ||
    text.includes('trade counter') ||
    text.includes('class e');

  const isInd =
    text.includes('industrial') ||
    text.includes('warehouse') ||
    text.includes('depot') ||
    text.includes('manufacturing') ||
    text.includes('workshop') ||
    text.includes('freight') ||
    text.includes('storage') ||
    text.includes('b2') ||
    text.includes('b8');

  const isInfra =
    text.includes('infrastructure') ||
    text.includes('substation') ||
    text.includes('ev charging') ||
    text.includes('spine road') ||
    text.includes('highway improvements');

  const isAgri =
    text.includes('agricultural') ||
    text.includes('farm') ||
    text.includes('barn conversion');

  if (isRes && (isComm || isInd || text.includes('mixed-use') || text.includes('mixed use'))) {
    return 'mixed_use';
  }
  if (isRes) return 'residential';
  if (isInd) return 'industrial';
  if (isComm) return 'commercial';
  if (isInfra) return 'infrastructure';
  if (isAgri) return 'agricultural';

  if (appType.includes('householder')) return 'residential';

  return 'unknown';
}
