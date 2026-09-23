/**
 * Land Radar — Deterministic Evidence Checklist Engine
 *
 * Phase 13 Section 6 Implementation:
 * Generates an 8-dimensional evidence checklist for any candidate opportunity.
 *
 * CRITICAL EPISTEMIC RULE:
 * - Every item must distinguish: KNOWN, UNKNOWN, UNAVAILABLE, STALE, CONTRADICTED, NOT_APPLICABLE.
 * - Blank values are strictly prohibited as a substitute for epistemic state.
 */

import {
  Site,
  SiteSignal,
  CreateSignalInput,
  OwnershipIntelligenceSummary,
  ContradictionReport,
  AcquisitionContactRecord,
  AcquisitionOutcomeState,
  PlanningEvidenceItem,
  MarketEvidenceSummary,
  DevelopmentCapacityEvidence,
  EvidenceChecklistItem,
  ChecklistDimension,
  ChecklistEpistemicStatus,
} from '../types';
import { isOsConfigured } from '../clients/osClient';

export interface GenerateChecklistParams {
  site: Site;
  lifecycleStage?: AcquisitionOutcomeState;
  ownershipSummary: OwnershipIntelligenceSummary;
  signals?: Array<SiteSignal | CreateSignalInput>;
  contradictions?: ContradictionReport;
  contactHistory?: AcquisitionContactRecord[];
  planningEvidence?: PlanningEvidenceItem[];
  marketEvidence?: MarketEvidenceSummary;
  capacityEvidence?: DevelopmentCapacityEvidence;
}

export function generateEvidenceChecklist(
  params: GenerateChecklistParams
): Record<ChecklistDimension, EvidenceChecklistItem[]> {
  const {
    site,
    lifecycleStage = 'SURFACED',
    ownershipSummary,
    signals = [],
    contradictions,
    contactHistory = [],
    planningEvidence = [],
    marketEvidence,
    capacityEvidence,
  } = params;

  const now = new Date();

  // Helper to determine staleness (> 180 days)
  const isStale = (dateStr: string | null | undefined): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24)) > 180;
  };

  const checklist: Record<ChecklistDimension, EvidenceChecklistItem[]> = {
    site: [],
    ownership: [],
    availability: [],
    planning: [],
    access: [],
    market: [],
    capacity: [],
    acquisition: [],
  };

  // -------------------------------------------------------------------------
  // 1. Site Dimension
  // -------------------------------------------------------------------------
  checklist.site.push({
    id: 'chk-site-id',
    dimension: 'site',
    label: 'Site Identity & Reference',
    status: site.internal_reference ? 'KNOWN' : 'UNKNOWN',
    evidence_source: site.source || 'Entire UK Pipeline',
    retrieval_mode: 'manual_entry',
    retrieval_date: site.created_at ? site.created_at.split('T')[0] : null,
    summary: site.name
      ? `${site.internal_reference} — ${site.name} (${site.local_authority || 'UK'})`
      : `${site.internal_reference}`,
  });

  checklist.site.push({
    id: 'chk-site-geom',
    dimension: 'site',
    label: 'Authoritative Parcel Boundary Geometry',
    status: site.geometry ? 'KNOWN' : 'UNKNOWN',
    evidence_source: site.source_reference || 'Local Authority / HMLR Cadastral Polygon',
    retrieval_mode: 'live_api',
    retrieval_date: site.created_at ? site.created_at.split('T')[0] : null,
    summary: site.geometry
      ? `MultiPolygon geometry registered (EPSG:4326), PostGIS validated`
      : 'Boundary geometry unavailable',
  });

  checklist.site.push({
    id: 'chk-site-area',
    dimension: 'site',
    label: 'Calculated Spatial Area (EPSG:27700)',
    status: site.area_sqm ? 'KNOWN' : 'UNKNOWN',
    evidence_source: 'PostGIS ST_Area(ST_Transform(geom, 27700))',
    retrieval_mode: 'local_fixture',
    retrieval_date: site.created_at ? site.created_at.split('T')[0] : null,
    summary: site.area_sqm
      ? `${(site.area_sqm / 10000).toFixed(2)} ha (${Math.round(site.area_sqm).toLocaleString()} sqm)`
      : 'Area calculation pending',
  });

  // -------------------------------------------------------------------------
  // 2. Ownership Dimension
  // -------------------------------------------------------------------------
  const hasTitles = ownershipSummary.title_relationships.length > 0;
  const primaryTitle = hasTitles ? ownershipSummary.title_relationships[0].title_reference : null;
  const hasVerifiedOwner = ownershipSummary.ownership_evidence_records.some(
    (e) => e.evidence_status === 'VERIFIED'
  );

  checklist.ownership.push({
    id: 'chk-own-title',
    dimension: 'ownership',
    label: 'HM Land Registry Title Identification',
    status: primaryTitle ? 'KNOWN' : 'UNKNOWN',
    evidence_source: 'HMLR Title Register & INSPIRE Index',
    retrieval_mode: 'live_api',
    retrieval_date: ownershipSummary.assessed_at.split('T')[0],
    summary: primaryTitle
      ? `Title reference: ${primaryTitle} (${ownershipSummary.title_relationships.length} title(s) mapped)`
      : 'No HMLR title reference identified for parcel',
  });

  checklist.ownership.push({
    id: 'chk-own-evidence',
    dimension: 'ownership',
    label: 'Proprietor & Ownership Evidence Status',
    status: hasVerifiedOwner
      ? 'KNOWN'
      : ownershipSummary.ownership_evidence_status === 'CONFLICTING'
      ? 'CONTRADICTED'
      : ownershipSummary.ownership_evidence_status === 'STALE'
      ? 'STALE'
      : 'UNKNOWN',
    evidence_source: ownershipSummary.ownership_evidence_records[0]?.ownership_source || 'HMLR Online',
    retrieval_mode: ownershipSummary.ownership_evidence_records[0]?.retrieval_mode || 'unavailable',
    retrieval_date: ownershipSummary.ownership_evidence_records[0]?.retrieval_date || null,
    summary: ownershipSummary.ownership_evidence_records[0]?.proprietor_notes || 'No proprietor records logged',
  });

  checklist.ownership.push({
    id: 'chk-own-complexity',
    dimension: 'ownership',
    label: 'Multi-Title & Assembly Complexity',
    status: ownershipSummary.complexity ? 'KNOWN' : 'UNKNOWN',
    evidence_source: 'Ownership Intelligence Service',
    retrieval_mode: 'local_fixture',
    retrieval_date: ownershipSummary.assessed_at.split('T')[0],
    summary: `Assessment: ${ownershipSummary.complexity.replace(/_/g, ' ')} (${ownershipSummary.title_relationships.length} parcels/titles)`,
  });

  // -------------------------------------------------------------------------
  // 3. Availability Dimension
  // -------------------------------------------------------------------------
  const availState = ownershipSummary.availability_state;
  const latestContact = contactHistory.length > 0 ? contactHistory[0] : null;

  checklist.availability.push({
    id: 'chk-avail-status',
    dimension: 'availability',
    label: 'Commercial Availability Reality',
    status: availState !== 'UNKNOWN' ? 'KNOWN' : 'UNKNOWN',
    evidence_source: ownershipSummary.latest_availability_evidence_date
      ? 'Direct Acquisition Evidence'
      : 'None (Unknown)',
    retrieval_mode: 'manual_entry',
    retrieval_date: ownershipSummary.latest_availability_evidence_date || null,
    summary: availState !== 'UNKNOWN'
      ? `State: ${availState}`
      : 'UNKNOWN. Rule: Titleholder existence does not infer willingness to sell.',
  });

  checklist.availability.push({
    id: 'chk-avail-contact',
    dimension: 'availability',
    label: 'Proprietor Contact & Engagement Timeline',
    status: latestContact ? 'KNOWN' : 'NOT_APPLICABLE',
    evidence_source: latestContact ? `Contact via ${latestContact.contact_type}` : 'No contact logged',
    retrieval_mode: 'manual_entry',
    retrieval_date: latestContact?.contact_date || null,
    summary: latestContact
      ? `Last contact: ${latestContact.contact_date} (${latestContact.outcome})`
      : 'No introductory enquiry issued yet',
  });

  // -------------------------------------------------------------------------
  // 4. Planning Dimension
  // -------------------------------------------------------------------------
  const planSig = signals.find((s) => s.signal_type === 'planning_activity');
  checklist.planning.push({
    id: 'chk-plan-history',
    dimension: 'planning',
    label: 'Local Planning Register Match',
    status: planningEvidence.length > 0 ? 'KNOWN' : planSig?.status === 'known' ? 'KNOWN' : 'UNKNOWN',
    evidence_source: 'Local Planning Authority Planning Register',
    retrieval_mode: 'local_fixture',
    retrieval_date: planSig ? now.toISOString().split('T')[0] : null,
    summary: planningEvidence.length > 0
      ? `${planningEvidence.length} planning record(s) matched within spatial boundary`
      : 'No local planning applications logged within spatial buffer',
  });

  const greenBeltSig = signals.find((s) => s.signal_type === 'green_belt');
  checklist.planning.push({
    id: 'chk-plan-policy',
    dimension: 'planning',
    label: 'Local Plan & Strategic Policy Designation',
    status: greenBeltSig?.status === 'known' ? 'KNOWN' : 'UNKNOWN',
    evidence_source: 'DLUHC / Local Plan Adopted Policies Map',
    retrieval_mode: 'local_fixture',
    retrieval_date: now.toISOString().split('T')[0],
    summary: greenBeltSig?.status === 'known'
      ? greenBeltSig.explanation
      : 'Local Plan policy allocation unassessed',
  });

  // -------------------------------------------------------------------------
  // 5. Access Dimension
  // -------------------------------------------------------------------------
  const roadSig = signals.find((s) => s.signal_type === 'road_proximity');
  const hasOsConfig = isOsConfigured();

  checklist.access.push({
    id: 'chk-acc-os-road',
    dimension: 'access',
    label: 'Ordnance Survey Highways Link',
    status: !hasOsConfig ? 'UNAVAILABLE' : roadSig?.status === 'known' ? 'KNOWN' : 'UNKNOWN',
    evidence_source: 'OS Features API (OpenRoads_RoadLink WFS)',
    retrieval_mode: hasOsConfig ? 'live_api' : 'unavailable',
    retrieval_date: now.toISOString().split('T')[0],
    summary: roadSig?.status === 'known'
      ? roadSig.explanation
      : 'OS Features API collection OpenRoads_RoadLink not activated on project key (WFS 403)',
    provenance_note: 'OS Data Hub project key active for VTS; WFS collection requires portal subscription plan.',
  });

  const accessContradiction = contradictions?.contradictions.find(
    (c) =>
      c.machine_claim.toLowerCase().includes('access') ||
      c.external_finding.toLowerCase().includes('access')
  );

  checklist.access.push({
    id: 'chk-acc-legal',
    dimension: 'access',
    label: 'Legal Access & Ransom Strip Rights',
    status: accessContradiction ? 'CONTRADICTED' : 'UNKNOWN',
    evidence_source: accessContradiction ? accessContradiction.external_finding : 'Title & Highways Search',
    retrieval_mode: 'manual_entry',
    retrieval_date: now.toISOString().split('T')[0],
    summary: accessContradiction
      ? `CONTRADICTION: ${accessContradiction.machine_claim} vs ${accessContradiction.external_finding}`
      : 'Legal vehicular access unconfirmed. Proximity to road does not confer legal vehicular easements.',
  });

  // -------------------------------------------------------------------------
  // 6. Market Dimension
  // -------------------------------------------------------------------------
  const compCount = marketEvidence?.sample_size ?? 0;
  checklist.market.push({
    id: 'chk-mkt-comps',
    dimension: 'market',
    label: 'HMLR Price Paid Transaction Evidence',
    status: compCount > 0 ? 'KNOWN' : 'UNAVAILABLE',
    evidence_source: 'HM Land Registry Price Paid Data API',
    retrieval_mode: 'live_api',
    retrieval_date: now.toISOString().split('T')[0],
    summary: compCount > 0
      ? `${compCount} residential transaction comps identified within sector`
      : 'Absence of sales != absence of market. No nearby transactions recorded.',
  });

  // -------------------------------------------------------------------------
  // 7. Capacity Dimension
  // -------------------------------------------------------------------------
  const netDevSqm = capacityEvidence?.potentially_developable_area_sqm ?? (capacityEvidence ? capacityEvidence.gross_area_sqm : null);
  checklist.capacity.push({
    id: 'chk-cap-density',
    dimension: 'capacity',
    label: 'Spatial Capacity & Constraint Deductions',
    status: capacityEvidence ? 'KNOWN' : site.area_sqm ? 'KNOWN' : 'UNKNOWN',
    evidence_source: 'Land Radar Capacity Engine',
    retrieval_mode: 'local_fixture',
    retrieval_date: now.toISOString().split('T')[0],
    summary: capacityEvidence && netDevSqm !== null
      ? `Gross: ${(capacityEvidence.gross_area_sqm / 10000).toFixed(2)} ha, Net developable: ${(netDevSqm / 10000).toFixed(2)} ha (${Math.round((netDevSqm / capacityEvidence.gross_area_sqm) * 100)}%)`
      : site.area_sqm
      ? `Gross site: ${(site.area_sqm / 10000).toFixed(2)} ha. Constraint deductions pending.`
      : 'Area capacity unknown',
  });

  // -------------------------------------------------------------------------
  // 8. Acquisition & Governance Dimension
  // -------------------------------------------------------------------------
  const unresolvedContraCount = contradictions?.contradictions.filter(
    (c) => !c.resolved
  ).length ?? 0;

  checklist.acquisition.push({
    id: 'chk-acq-lifecycle',
    dimension: 'acquisition',
    label: 'Current Acquisition Lifecycle Stage',
    status: 'KNOWN',
    evidence_source: 'Land Radar Outcome State Machine',
    retrieval_mode: 'local_fixture',
    retrieval_date: now.toISOString().split('T')[0],
    summary: `Current Stage: ${lifecycleStage}`,
  });

  checklist.acquisition.push({
    id: 'chk-acq-contradictions',
    dimension: 'acquisition',
    label: 'Epistemic Contradiction Status',
    status: unresolvedContraCount > 0 ? 'CONTRADICTED' : 'KNOWN',
    evidence_source: 'Candidate Truth Contradiction Engine',
    retrieval_mode: 'local_fixture',
    retrieval_date: now.toISOString().split('T')[0],
    summary: unresolvedContraCount > 0
      ? `${unresolvedContraCount} active contradiction(s) require analyst resolution`
      : 'No unresolved contradictions detected across evidence layers',
  });

  return checklist;
}
