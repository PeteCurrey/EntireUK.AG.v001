/**
 * Land Radar — Domain Types
 *
 * PRINCIPLES:
 * 1. UNKNOWN IS NOT CLEAR. IntelligenceStatus.unknown means no data found,
 *    NOT that no constraint exists.
 * 2. Facts, derivations and judgements are separate types.
 * 3. No magic scores. Evidence → signals → rules → explanation.
 */

// ---------------------------------------------------------------------------
// Intelligence Status
// ---------------------------------------------------------------------------

/**
 * The epistemic status of any intelligence attribute.
 * 'unknown' must never be treated as 'no constraint exists'.
 */
export type IntelligenceStatus =
  | 'known'       // fact established from authoritative source
  | 'unknown'     // no data available; absence of record ≠ absence of constraint
  | 'conflicting' // multiple sources disagree
  | 'inferred'    // derived from related evidence, not directly observed
  | 'verified';   // confirmed by human review or additional corroboration

/**
 * The physical or operational origin of an ingested record.
 * Must be transparently exposed in the UI.
 */
export type RetrievalMode =
  | 'live_api'
  | 'cached'
  | 'local_fixture'
  | 'manual_entry'
  | 'synthetic_test';

// ---------------------------------------------------------------------------
// GeoJSON Primitives
// ---------------------------------------------------------------------------

export namespace GeoJSON {
  export type Position = [number, number] | [number, number, number];
  export interface Point {
    type: 'Point';
    coordinates: Position;
  }
  export interface LineString {
    type: 'LineString';
    coordinates: Position[];
  }
  export interface MultiLineString {
    type: 'MultiLineString';
    coordinates: Position[][];
  }
  export interface Polygon {
    type: 'Polygon';
    coordinates: Position[][];
  }
  export interface MultiPolygon {
    type: 'MultiPolygon';
    coordinates: Position[][][];
  }
  export type Geometry = Point | LineString | MultiLineString | Polygon | MultiPolygon;
}

// ---------------------------------------------------------------------------
// Site
// ---------------------------------------------------------------------------

export type SiteStatus =
  | 'candidate'
  | 'screening'
  | 'under_review'
  | 'investigating'
  | 'due_diligence'
  | 'controlled'
  | 'planning'
  | 'development'
  | 'completed'
  | 'declined'
  | 'archived';

export interface Site {
  id: string;
  internal_reference: string; // EUK-S-NNNNN
  name: string | null;
  status: SiteStatus;
  source: string;
  source_reference: string | null;
  // GeoJSON geometry (EPSG:4326)
  geometry: GeoJSON.MultiPolygon | null;
  centroid: GeoJSON.Point | null;
  // Calculated area: always from ST_Area(ST_Transform(geom, 27700))
  area_sqm: number | null;
  // Source-supplied area (retained, never overwritten)
  area_sqm_source: number | null;
  area_discrepancy_flag: boolean;
  // Location
  local_authority: string | null;
  country: string;
  postcode_sector: string | null;
  location_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteInput {
  name?: string;
  source: string;
  source_reference?: string;
  geometry?: GeoJSON.MultiPolygon;
  area_sqm_source?: number;
  local_authority?: string;
  country?: string;
  postcode_sector?: string;
  location_description?: string;
}

// ---------------------------------------------------------------------------
// Land Parcel
// ---------------------------------------------------------------------------

export interface LandParcel {
  id: string;
  source: string;
  source_id: string | null;
  source_dataset: string | null;
  geometry: GeoJSON.MultiPolygon | null;
  centroid: GeoJSON.Point | null;
  area_sqm_calculated: number | null;
  area_sqm_source: number | null;
  geometry_valid: boolean | null;
  geometry_validation_notes: string | null;
  provenance: Record<string, unknown> | null;
  ingestion_job_id: string | null;
  dataset_version: string | null;
  import_timestamp: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Phase 11: Ownership Intelligence — Primitive Types
// (declared here because LandTitle references OwnershipEvidenceStatus)
// ---------------------------------------------------------------------------

/**
 * Epistemic status of ownership evidence for a parcel or title.
 * UNKNOWN = no evidence retrieved. Do NOT treat as ownership confirmed absent.
 */
export type OwnershipEvidenceStatus =
  | 'VERIFIED'    // confirmed by cross-referenced authoritative sources
  | 'SUPPORTED'   // single credible source supports the conclusion
  | 'INDICATIVE'  // circumstantial evidence only; requires corroboration
  | 'CONFLICTING' // two or more sources disagree — requires human resolution
  | 'STALE'       // evidence exists but retrieval_date exceeds staleness threshold
  | 'UNKNOWN';    // no ownership evidence has been retrieved

/**
 * Complexity of ownership over the candidate site.
 * Do not treat MULTI_TITLE or FRAGMENTED as automatically negative —
 * they expose acquisition complexity for analyst assessment.
 */
export type OwnershipComplexity =
  | 'SINGLE_TITLE'  // one identified title covers the site
  | 'MULTI_TITLE'   // multiple titles identified; acquisition requires multiple dealings
  | 'FRAGMENTED'    // known fragmented ownership, highways land, third-party strips, etc.
  | 'UNKNOWN';      // insufficient evidence to classify

/**
 * Strength of the spatial relationship between a candidate site
 * and an identified land title.
 */
export type TitleRelationshipStrength =
  | 'STRONG'   // candidate boundary closely matches title geometry (>90% overlap)
  | 'PARTIAL'  // partial intersection; candidate may cross multiple titles
  | 'WEAK'     // geometry relationship requires manual confirmation
  | 'UNKNOWN'; // cannot be established without additional data

/**
 * Availability state of a candidate site, as evidenced by external sources.
 * Must only be recorded where supported by actual evidence.
 * Absence of owner response does NOT support NOT_AVAILABLE. Use UNKNOWN.
 */
export type AcquisitionAvailabilityState =
  | 'AVAILABLE'           // owner/agent has confirmed willingness to transact
  | 'POTENTIALLY_AVAILABLE' // indirect indicators suggest possible availability
  | 'UNDER_DISCUSSION'    // active acquisition discussion is in progress
  | 'UNDER_OPTION'        // site is subject to a formal option agreement
  | 'UNDER_PROMOTION'     // site is being promoted through planning by a promoter
  | 'UNDER_CONTRACT'      // site is under a conditional or unconditional contract
  | 'NOT_AVAILABLE'       // owner/agent has explicitly confirmed unavailability
  | 'UNKNOWN';            // no evidence supports any other state

/**
 * Outcome code for an acquisition contact event.
 * Do not infer negative from silence. Use NO_RESPONSE or UNKNOWN.
 */
export type ContactOutcomeCode =
  // Positive
  | 'INTERESTED'
  | 'OPEN_TO_DISCUSSION'
  | 'REQUESTED_INFORMATION'
  // Neutral
  | 'NO_RESPONSE'
  | 'DEFERRED'
  | 'UNKNOWN'
  // Negative
  | 'NOT_INTERESTED'
  | 'NOT_AVAILABLE'
  | 'ALREADY_COMMITTED'
  // Complex
  | 'MULTIPLE_OWNERS'
  | 'AGENT_CONTROLLED'
  | 'LEGAL_COMPLEXITY'
  | 'OTHER';

/**
 * Evidence status classification for Phase 10/11 validation cohort records.
 * Must be applied to ALL CandidateValidationRecords.
 * Explicitly prevents TEST_FIXTURE records from being reported as REAL_ACQUISITION_EVENT.
 */
export type ValidationEvidenceStatus =
  | 'TEST_FIXTURE'          // created solely to exercise the validation infrastructure
  | 'BENCHMARK'             // controlled record used for methodological testing (FP/FN benchmarks)
  | 'EXTERNAL_EVIDENCE'     // supported by a real external document or event
  | 'REAL_ACQUISITION_EVENT' // a genuine acquisition-related event has occurred
  | 'UNKNOWN';              // evidence status has not yet been assessed

/**
 * Type of acquisition evidence. Extends ExternalEvidenceType with
 * acquisition-specific types introduced in Phase 11.
 */
export type AcquisitionEvidenceType =
  | 'title_research'
  | 'owner_communication'
  | 'agent_communication'
  | 'planning_consultant_advice'
  | 'highways_advice'
  | 'site_inspection'
  | 'survey'
  | 'local_authority_discussion'
  | 'market_agent_intelligence'
  | 'legal_advice'
  | 'acquisition_negotiation'
  | 'other_documented_evidence';

/**
 * Category of a detected contradiction between evidence layers.
 */
export type ContradictionCategory =
  | 'MACHINE_VS_EXTERNAL'  // Land Radar positive; external evidence adverse
  | 'DERIVED_VS_ANALYST'   // System classifies strong; analyst rejects
  | 'ANALYST_VS_OUTCOME'   // Analyst expected available; owner says unavailable
  | 'SOURCE_VS_SOURCE';    // Two authoritative data sources conflict

// ---------------------------------------------------------------------------
// Land Title
// ---------------------------------------------------------------------------

export interface LandTitle {
  id: string;
  title_reference: string | null;
  tenure: 'freehold' | 'leasehold' | 'unknown' | null;
  has_geometry: boolean; // EXPLICIT — never infer from geometry IS NULL
  geometry: GeoJSON.MultiPolygon | null;
  source: string;
  source_identifier: string | null;
  data_timestamp: string | null;
  /**
   * When the title data was retrieved. Always explicit — never inferred.
   * null = retrieval date unknown.
   */
  retrieval_date: string | null;
  /**
   * How the title data was obtained. 'manual_entry' = analyst retrieved manually
   * from HMLR. Never 'live_api' unless an actual HMLR API integration exists.
   */
  retrieval_mode: RetrievalMode | null;
  /**
   * Epistemic status of the title evidence.
   * UNKNOWN = no title evidence retrieved. Do NOT infer from geometry.
   */
  evidence_status: OwnershipEvidenceStatus | null;
  provenance: Record<string, unknown> | null;
  ingestion_job_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ParcelTitleRelationshipType =
  | 'one_to_one'
  | 'one_to_many'
  | 'many_to_one'
  | 'partial_overlap'
  | 'unknown';

export interface ParcelTitleRelationship {
  id: string;
  parcel_id: string;
  title_id: string;
  relationship_type: ParcelTitleRelationshipType;
  overlap_pct: number | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Data Source & Ingestion
// ---------------------------------------------------------------------------

export type DataSourceStatus =
  | 'not_configured'
  | 'active'
  | 'paused'
  | 'failed'
  | 'deprecated';

export interface DataSource {
  id: string;
  organisation: string;
  dataset_name: string;
  source_type: string;
  licence: string | null;
  permitted_use: string | null;
  attribution_requirements: string | null;
  redistribution_restrictions: string | null;
  commercial_restrictions: string | null;
  endpoint: string | null;
  update_frequency: string | null;
  geometry_type: string | null;
  coverage: string;
  last_successful_ingestion: string | null;
  last_attempted_ingestion: string | null;
  current_version: string | null;
  status: DataSourceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type IngestionJobStatus = 'running' | 'completed' | 'failed' | 'partial';

export interface IngestionJob {
  id: string;
  data_source_id: string;
  started_at: string;
  completed_at: string | null;
  status: IngestionJobStatus;
  records_seen: number;
  records_inserted: number;
  records_updated: number;
  records_rejected: number;
  geometry_errors: number;
  validation_errors: number;
  error_message: string | null;
  dataset_version: string | null;
  processing_version: string;
  created_at: string;
}

export interface IngestionJobStats {
  records_seen?: number;
  records_inserted?: number;
  records_updated?: number;
  records_rejected?: number;
  geometry_errors?: number;
  validation_errors?: number;
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

export type ProvenanceEntityType =
  | 'site'
  | 'parcel'
  | 'title'
  | 'signal'
  | 'constraint'
  | 'planning_record'
  | 'market_comparable'
  | 'opportunity';

export interface ProvenanceRecord {
  id: string;
  entity_type: ProvenanceEntityType;
  entity_id: string;
  source_organisation: string;
  dataset_name: string;
  source_url: string | null;
  dataset_version: string | null;
  retrieval_timestamp: string;
  effective_date: string | null;
  geometry_source: string | null;
  record_identifier: string | null;
  licence: string | null;
  processing_version: string;
  retrieval_mode?: RetrievalMode;
  raw_record: Record<string, unknown> | null; // original source, never mutated
  created_at: string;
}

export interface CreateProvenanceInput {
  entity_type: ProvenanceEntityType;
  entity_id: string;
  source_organisation: string;
  dataset_name: string;
  source_url?: string;
  dataset_version?: string;
  effective_date?: string;
  geometry_source?: string;
  record_identifier?: string;
  licence?: string;
  processing_version?: string;
  retrieval_mode?: RetrievalMode;
  raw_record?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Investigation Workflow (Phase 6)
// ---------------------------------------------------------------------------

export type ActionPriority = 'high' | 'medium' | 'low';
export type ActionStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ActionType =
  | 'verify_planning_history'
  | 'verify_green_belt'
  | 'verify_ownership'
  | 'investigate_access'
  | 'review_planning_policy'
  | 'commission_site_visit'
  | 'contact_landowner'
  | 'obtain_title'
  | 'other';

export interface InvestigationAction {
  id: string;
  site_id: string;
  action_type: ActionType;
  title: string;
  description?: string;
  priority: ActionPriority;
  assigned_to: string;
  due_date?: string;
  status: ActionStatus;
  completed_at?: string;
  completed_by?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestigationNote {
  id: string;
  site_id: string;
  author: string;
  author_role: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface OpportunityProgression {
  id: string;
  site_id: string;
  opportunity_id: string;
  progressed_by: string;
  progressed_at: string;
  decision_reason: string;
  review_id?: string;
  evidence_snapshot: Record<string, unknown>;
  notes?: string;
  created_at: string;
}

export type CandidatePriority = 'high' | 'medium' | 'low' | 'unprioritised';

export interface VisualUnknown {
  category: string;
  description: string;
  impact: string;
  sourceStatus: 'deferred' | 'unassessed' | 'unavailable';
}

export interface ActiveConstraint {
  name: string;
  severity: 'hard_exclusion' | 'soft_constraint' | 'positive_signal' | 'unknown';
  overlapPct?: number;
  note: string;
}

export interface WhySurfacedProfile {
  coreDriver: string;
  keyPositiveFactors: string[];
  activeConstraints: ActiveConstraint[];
  visualUnknowns: VisualUnknown[];
  recommendedAngle: string;
}

export interface EvidenceCompleteness {
  evaluatedCount: number;
  totalCount: number;
  percentage: number;
  assessedCategories: string[];
  missingCategories: string[];
}

export interface PrioritisationResult {
  priority: CandidatePriority;
  priorityReasons: string[];
  recommendedNextActions: string[];
  evidenceCompleteness: EvidenceCompleteness;
  whySurfaced: WhySurfacedProfile;
}


// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

export type SignalType =
  | 'settlement_proximity'
  | 'road_proximity'
  | 'planning_activity'
  | 'brownfield_signal'
  | 'constraint_signal'
  | 'development_pattern'
  | 'market_signal'
  | 'flood_risk'
  | 'green_belt'
  | 'conservation_area'
  | 'access_adequacy'
  | 'protected_site'
  | 'ancient_woodland'
  | 'listed_building_proximity'
  | 'economic_zone';

export interface SiteSignal {
  id: string;
  site_id: string;
  signal_type: SignalType;
  value: number | null;
  unit: string | null;
  value_text: string | null;
  status: IntelligenceStatus;
  confidence: number | null; // 0-1
  source: string | null;
  data_source_id: string | null;
  explanation: string; // Required: every signal must explain itself
  calculated_at: string;
  rule_version: string;
  ingestion_job_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSignalInput {
  site_id: string;
  signal_type: SignalType;
  value?: number;
  unit?: string;
  value_text?: string;
  status: IntelligenceStatus;
  confidence?: number;
  source?: string;
  data_source_id?: string;
  explanation: string; // Required
  rule_version?: string;
  ingestion_job_id?: string;
}

// ---------------------------------------------------------------------------
// Constraints
// ---------------------------------------------------------------------------

export type ConstraintType =
  | 'flood_risk_zone_1'
  | 'flood_risk_zone_2'
  | 'flood_risk_zone_3'
  | 'flood_risk_zone_3b'
  | 'green_belt'
  | 'conservation_area'
  | 'listed_building'
  | 'ancient_woodland'
  | 'sssi'
  | 'sac'
  | 'spa'
  | 'ramsar'
  | 'aonb'
  | 'national_park'
  | 'heritage_coast'
  | 'scheduled_monument'
  | 'article_4'
  | 'tree_preservation_order'
  | 'contamination'
  | 'infrastructure'
  | 'access_constraint'
  | 'other';

export type ConstraintSeverity =
  | 'hard_exclusion'  // removes from specific strategy; not all strategies
  | 'soft_constraint' // reduces attractiveness; does not eliminate
  | 'positive_signal' // increases investigation priority
  | 'unknown';        // insufficient evidence

export interface SiteConstraint {
  id: string;
  site_id: string;
  constraint_type: ConstraintType;
  constraint_geometry: GeoJSON.MultiPolygon | null;
  overlap_pct: number | null;
  severity_classification: ConstraintSeverity;
  severity_is_derived: boolean; // true = Entire UK derived; false = source-established
  status: IntelligenceStatus;
  confidence: number | null;
  source: string | null;
  data_source_id: string | null;
  provenance_id: string | null;
  calculated_at: string;
  rule_version: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

export type OpportunityTypeId =
  | 'development_land'
  | 'brownfield'
  | 'regeneration'
  | 'property_redevelopment'
  | 'conversion'
  | 'strategic_land'
  | 'assembly'
  | 'mixed_use'
  | 'other';

export type OpportunityStatus =
  | 'identified'
  | 'screening'
  | 'assessed'
  | 'active'
  | 'paused'
  | 'declined'
  | 'archived';

export interface Opportunity {
  id: string;
  site_id: string;
  opportunity_type_id: OpportunityTypeId | null; // null = not yet classified
  status: OpportunityStatus;
  priority: number | null; // 1-5, human-assigned only; no automated score
  assessed_at: string | null;
  assessed_by: string | null;
  assessment_notes: string | null;
  signal_count: number;
  positive_signals: number;
  soft_constraints: number;
  hard_exclusions: number;
  unknown_signals: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Human Review
// ---------------------------------------------------------------------------

export type ReviewDecision =
  | 'investigate'
  | 'monitor'
  | 'decline'
  | 'insufficient_information';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface SiteReview {
  id: string;
  site_id: string;
  reviewer: string;
  reviewed_at: string;
  assessment: string | null;
  notes: string | null;
  decision: ReviewDecision;
  confidence: ConfidenceLevel;
  follow_up_required: boolean;
  follow_up_notes: string | null;
  signals_at_review: Record<string, unknown> | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Geometry validation
// ---------------------------------------------------------------------------

export interface GeometryValidationResult {
  valid: boolean;
  notes: string | null;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Opportunity explanation (evidence-based, not score-based)
// ---------------------------------------------------------------------------

/**
 * Structured explanation of why Land Radar surfaced an opportunity.
 * Every field traces back to evidence.
 */
export interface OpportunityExplanation {
  site: Pick<Site, 'id' | 'internal_reference' | 'name' | 'area_sqm' | 'local_authority'>;
  signals: Array<{
    type: SignalType;
    status: IntelligenceStatus;
    summary: string; // human-readable signal summary
    value: number | null;
    unit: string | null;
    rule_version: string;
  }>;
  constraints: Array<{
    type: ConstraintType;
    severity: ConstraintSeverity;
    overlap_pct: number | null;
    status: IntelligenceStatus;
    derived: boolean;
  }>;
  unknown_count: number; // number of signals with status='unknown'
  explanation_generated_at: string;
  // No score. Evidence only.
}

// ---------------------------------------------------------------------------
// Planning Intelligence Domain Types (Phase 8)
// ---------------------------------------------------------------------------

export type PlanningDecision =
  | 'approved'
  | 'refused'
  | 'withdrawn'
  | 'dismissed'
  | 'pending'
  | 'unknown'
  | 'other';

export type PlanningMatchTier =
  | 'intersects_candidate'       // Tier 1: Highest spatial confidence (polygon intersection)
  | 'intersects_source_parcel'   // Tier 2: Intersects parent registered title/parcel
  | 'nearby_buffer'              // Tier 3: Point/geometry within configured buffer (e.g. 100m)
  | 'address_match'              // Tier 4: Textual address / postcode link
  | 'textual';                   // Tier 5: Reference / naming inference

export type PlanningClassification =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'mixed_use'
  | 'infrastructure'
  | 'agricultural'
  | 'unknown';

export interface PlanningApplicationRecord {
  id: string;
  application_reference: string;
  local_authority: string;
  site_location: string;
  application_type: string;
  description: string;
  classification: PlanningClassification;
  decision: PlanningDecision;
  decision_date: string | null;
  application_date: string | null;
  geometry: GeoJSON.Geometry | null;
  source_url?: string;
  source_dataset: string;
  retrieval_timestamp: string;
}

export interface PlanningEvidenceItem {
  id: string;
  site_id: string;
  application: PlanningApplicationRecord;
  match_tier: PlanningMatchTier;
  distance_m: number | null;
  overlap_pct: number | null;
  is_relevant_to_strategy: boolean;
  relevance_notes: string;
}

export interface PlanningLpaCoverage {
  lpa_code: string;
  lpa_name: string;
  coverage_status: 'known' | 'partial' | 'unknown';
  total_records_ingested: number;
  has_geometry: boolean;
  source_dataset: string;
  licence: string;
  data_quality_notes: string;
  last_retrieval_at: string;
}

export interface AcquisitionInvestigationBrief {
  site_reference: string;
  site_name: string;
  area_ha: number | null;
  local_authority: string;
  why_surfaced: string;
  key_positive_signals: string[];
  active_constraints: string[];
  planning_summary: {
    coverage: 'known' | 'partial' | 'unknown';
    total_found: number;
    relevant_count: number;
    latest_decision: PlanningDecision | 'none';
    latest_decision_date: string | null;
    highest_match_tier: PlanningMatchTier | 'none';
    timeline: Array<{
      reference: string;
      date: string | null;
      decision: PlanningDecision;
      classification: PlanningClassification;
      description: string;
      match_tier: PlanningMatchTier;
    }>;
  };
  market_summary?: {
    coverage: 'known' | 'partial' | 'unknown';
    sample_size: number;
    median_price: number | null;
    p25_price: number | null;
    p75_price: number | null;
    new_build_percentage: number | null;
    market_strength: MarketStrengthClassification;
    rationale: string;
    comparables_count: number;
  } | null;
  development_capacity?: {
    gross_area_ha: number | null;
    constrained_percentage: number;
    developable_area_status: DevelopableAreaStatus;
    potentially_developable_area_ha: number | null;
    indicative_density_range: string;
    development_potential: DevelopmentPotentialClassification;
    rationale: string;
    caveats: string[];
  } | null;
  acquisition_risks?: Array<{
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'unknown';
  }>;
  critical_unknowns: string[];
  recommended_next_actions: string[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Market Intelligence Domain Types (Phase 9)
// ---------------------------------------------------------------------------

export type PropertyType = 'detached' | 'semi_detached' | 'terraced' | 'flat' | 'other';
export type TenureType = 'freehold' | 'leasehold' | 'unknown';
export type ComparableRelevanceTier = 'directly_relevant' | 'contextual' | 'weak';

export interface PricePaidRecord {
  id: string;
  transaction_id: string;
  price: number;
  date_of_transfer: string;
  postcode: string;
  property_type: PropertyType;
  new_build: boolean;
  tenure: TenureType;
  paon?: string | null;
  saon?: string | null;
  street?: string | null;
  locality?: string | null;
  town_city?: string | null;
  district: string;
  county?: string | null;
  geometry: GeoJSON.Point | null;
  source: string;
  licence: string;
  retrieval_mode: RetrievalMode;
}

export interface ComparableMatch {
  id: string;
  site_id: string;
  transaction: PricePaidRecord;
  distance_m: number;
  relevance_tier: ComparableRelevanceTier;
  relevance_rationale: string;
}

export type MarketStrengthClassification =
  | 'STRONG_MARKET_EVIDENCE'
  | 'MODERATE_MARKET_EVIDENCE'
  | 'WEAK_MARKET_EVIDENCE'
  | 'INSUFFICIENT_MARKET_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'UNKNOWN';

export interface MarketEvidenceSummary {
  sample_size: number;
  directly_relevant_count: number;
  contextual_count: number;
  median_price: number | null;
  p25_price: number | null;
  p75_price: number | null;
  min_price: number | null;
  max_price: number | null;
  new_build_count: number;
  new_build_percentage: number | null;
  property_type_distribution: Record<PropertyType, number>;
  search_radius_m: number;
  observation_period_months: number;
  earliest_transaction_date: string | null;
  latest_transaction_date: string | null;
  market_strength: MarketStrengthClassification;
  rationale: string;
  comparables: ComparableMatch[];
}

// ---------------------------------------------------------------------------
// Local Plan Allocation & Development Capacity (Phase 9)
// ---------------------------------------------------------------------------

export interface LocalPlanAllocationRecord {
  id: string;
  lpa_code: string;
  plan_name: string;
  policy_reference: string;
  site_name: string | null;
  allocation_type: 'housing' | 'employment' | 'mixed_use' | 'regeneration' | 'infrastructure' | 'other';
  status: 'adopted' | 'emerging' | 'allocated' | 'safeguarded' | 'withdrawn' | 'unknown';
  indicative_capacity_units: number | null;
  indicative_density_dph: number | null;
  adoption_date: string | null;
  plan_period: string | null;
  geometry: GeoJSON.MultiPolygon | null;
  source: string;
  licence: string;
}

export type DevelopableAreaStatus = 'known' | 'uncertain' | 'unknown';

export type DevelopmentPotentialClassification =
  | 'HIGH_DEVELOPMENT_POTENTIAL'
  | 'MODERATE_DEVELOPMENT_POTENTIAL'
  | 'LOW_DEVELOPMENT_POTENTIAL'
  | 'INSUFFICIENT_EVIDENCE'
  | 'CONFLICTING_EVIDENCE'
  | 'UNKNOWN';

export interface DevelopmentCapacityEvidence {
  gross_area_sqm: number;
  gross_area_ha: number;
  constrained_area_sqm: number;
  constrained_percentage: number;
  developable_area_status: DevelopableAreaStatus;
  potentially_developable_area_sqm: number | null;
  potentially_developable_area_ha: number | null;
  indicative_density_min_dph: number | null;
  indicative_density_max_dph: number | null;
  development_potential: DevelopmentPotentialClassification;
  potential_classification_rationale: string;
  capacity_caveats: string[];
}

// ---------------------------------------------------------------------------
// Acquisition Outcome Lifecycle (Phase 9)
// ---------------------------------------------------------------------------

export type AcquisitionOutcomeState =
  | 'SURFACED'
  | 'SCREENED'
  | 'ANALYST_REVIEW'
  | 'INVESTIGATING'
  | 'CONTACTED'
  | 'UNDER_NEGOTIATION'
  | 'CONTROLLED'
  | 'DUE_DILIGENCE'
  | 'ACQUISITION_AGREED'
  | 'ACQUIRED'
  | 'PLANNING'
  | 'DEVELOPMENT'
  | 'REALISATION'
  | 'REJECTED_PLANNING'
  | 'REJECTED_MARKET'
  | 'REJECTED_ACCESS'
  | 'REJECTED_TITLE'
  | 'REJECTED_ENVIRONMENTAL'
  | 'REJECTED_ECONOMICS'
  | 'REJECTED_OTHER';

/**
 * Immutable audit entry recording a candidate's progression through the
 * acquisition lifecycle. Never fabricated — only created by authenticated
 * human action.
 */
export interface CandidateOutcome {
  id: string;
  site_id: string;
  state: AcquisitionOutcomeState;
  previous_state: AcquisitionOutcomeState | null;
  recorded_by: string;
  rationale: string;
  evidence_snapshot: Record<string, unknown> | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Phase 9 Analyst Usefulness Assessment (Section 19)
// ---------------------------------------------------------------------------

/**
 * Structured record of whether Phase 9 market/capacity evidence changed
 * an analyst's decision vs the Phase 8 baseline.
 *
 * This is the first meaningful measure of Land Radar's acquisition usefulness.
 */
export type AnalystUsefulnessVerdict =
  | 'EVIDENCE_IMPROVED_DECISION'   // Phase 9 evidence caused a different, better decision
  | 'EVIDENCE_CONFIRMED_DECISION'  // Phase 9 evidence confirmed what analyst already thought
  | 'EVIDENCE_NEUTRAL'             // Phase 9 evidence made no difference
  | 'EVIDENCE_MISLEADING'          // Phase 9 evidence pointed in the wrong direction
  | 'INSUFFICIENT_TO_ASSESS';      // Analyst could not determine usefulness

export interface AnalystUsefulnessAssessment {
  id: string;
  site_id: string;
  site_reference: string;
  analyst_name: string;
  analyst_role: string;
  decision_without_phase9: string;    // what the analyst concluded from Phase 1-8 evidence only
  decision_with_phase9: string;       // what the analyst concluded after Phase 9 evidence
  verdict: AnalystUsefulnessVerdict;
  market_evidence_useful: boolean;
  capacity_evidence_useful: boolean;
  evidence_domain_notes: string;      // which specific facts changed the view
  false_positive_risk: 'raised' | 'lowered' | 'unchanged';
  false_negative_risk: 'raised' | 'lowered' | 'unchanged';
  created_at: string;
}

// ---------------------------------------------------------------------------
// Phase 10: Real-World Acquisition Validation & Candidate Truth Ledger
// ---------------------------------------------------------------------------

export type TruthLedgerLayer =
  | 'machine_evidence'       // Layer 1: deterministic rule outputs
  | 'derived_evidence'       // Layer 2: prioritisation, market, capacity
  | 'analyst_interpretation' // Layer 3: analyst hypothesis, notes, investigation
  | 'external_evidence'      // Layer 4: independently gathered external evidence (Phase 11)
  | 'real_world_outcome';    // Layer 5: what actually happened (acquisition outcome)

export interface TruthLedgerEvent {
  id: string;
  site_id: string;
  site_reference: string;
  layer: TruthLedgerLayer;
  event_type: string;
  actor: string;
  actor_role?: string | null;
  evidence_source?: string | null;
  source_reference?: string | null;
  previous_state?: string | null;
  new_state?: string | null;
  payload: Record<string, unknown>;
  notes?: string | null;
  confidence?: number | null;
  event_timestamp: string;
  created_at: string;
}

export type ExternalEvidenceType =
  | 'planning_consultant_advice'
  | 'highways_advice'
  | 'site_inspection'
  | 'owner_conversation'
  | 'agent_conversation'
  | 'title_research'
  | 'survey'
  | 'lpa_correspondence'
  | 'planning_officer_discussion'
  | 'market_research'
  | 'other';

export type ContradictionStatus =
  | 'supports_prioritisation'
  | 'contradicts_prioritisation'
  | 'neutral'
  | 'unresolved';

export interface ExternalEvidenceRecord {
  id: string;
  site_id: string;
  site_reference: string;
  evidence_type: ExternalEvidenceType;
  evidence_date: string;
  source_organisation: string;
  author: string;
  author_role?: string | null;
  summary: string;
  supporting_document_ref?: string | null;
  analyst_interpretation: string;
  contradiction_status: ContradictionStatus;
  confidence: 'high' | 'medium' | 'low' | 'provisional';
  created_at: string;
}

export type ValidationStatus = 'UNVALIDATED' | 'IN_VALIDATION' | 'VALIDATED';

export type ValidationStage =
  | 'SURFACED'
  | 'SCREENED'
  | 'ANALYST_REVIEW'
  | 'INVESTIGATING'
  | 'SITE_VALIDATION'
  | 'OWNER_INTELLIGENCE'
  | 'PLANNING_VALIDATION'
  | 'MARKET_VALIDATION'
  | 'SITE_INSPECTION'
  | 'COMMERCIAL_DECISION';

export type CommercialDecision = 'PROGRESS' | 'HOLD' | 'REJECT' | 'UNDECIDED';

export type AvailabilityReality = 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
export type OwnerEngagementReality = 'INTERESTED' | 'NOT_INTERESTED' | 'NO_RESPONSE' | 'UNKNOWN';
export type PlanningReality = 'SUPPORTIVE' | 'NEUTRAL' | 'ADVERSE' | 'CONFLICTING' | 'UNKNOWN';
export type AccessReality = 'SUPPORTIVE' | 'CONSTRAINED' | 'FAILED' | 'UNKNOWN';
export type MarketReality = 'SUPPORTIVE' | 'NEUTRAL' | 'WEAK' | 'CONFLICTING' | 'UNKNOWN';
export type AcquisitionOutcomeReality = 'PROGRESSED' | 'HELD' | 'REJECTED' | 'CONTROLLED' | 'ACQUIRED' | 'UNKNOWN';

export type RejectionReason =
  | 'planning'
  | 'market'
  | 'access'
  | 'title'
  | 'environmental'
  | 'economics'
  | 'availability'
  | 'ownership'
  | 'infrastructure'
  | 'site_condition'
  | 'strategic_fit'
  | 'insufficient_evidence'
  | 'other';

export type FalsePositiveRootCause =
  | 'planning_mismatch'
  | 'market_mismatch'
  | 'access_failure'
  | 'title_defect'
  | 'environmental_blocker'
  | 'economic_unviability'
  | 'owner_refusal'
  | 'infrastructure_failure'
  | 'other';

export type FalseNegativeCategory =
  | 'data_false_negative'
  | 'rule_false_negative'
  | 'geometry_false_negative'
  | 'classification_false_negative'
  | 'strategy_false_negative';

export interface CandidateValidationRecord {
  id: string;
  site_id: string;
  site_reference: string;
  cohort_id: string;
  validation_status: ValidationStatus;
  /**
   * Phase 11: Explicit classification of the evidence backing this record.
   * Prevents TEST_FIXTURE or BENCHMARK records from claiming REAL_ACQUISITION_EVENT status.
   */
  validation_evidence_status: ValidationEvidenceStatus;
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
  analyst_notes?: string | null;
  validated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface HumanBenchmarkCandidate {
  id: string;
  benchmark_set_id: string;
  geography: string;
  site_reference: string;
  site_name: string;
  identified_by: string;
  identification_date: string;
  identification_method: string;
  rationale: string;
  geometry?: GeoJSON.MultiPolygon | null;
  surfaced_by_land_radar: boolean;
  land_radar_site_reference?: string | null;
  screening_outcome?: string | null;
  exclusion_rule_id?: string | null;
  disagreement_reason?: string | null;
  created_at: string;
}

/**
 * 4-Layer Truth Ledger representation for a candidate site
 */
export interface CandidateTruthLedger {
  site_id: string;
  site_reference: string;
  site_name: string;
  validation_status: ValidationStatus;
  layer1_machine_evidence: {
    observed_facts: Array<{
      attribute: string;
      value: string | number | boolean | null;
      source: string;
      source_id: string;
      licence: string;
      retrieval_mode: string;
      observed_at: string;
    }>;
    geometry_type: string;
    gross_area_sqm: number | null;
    raw_record_summary: Record<string, unknown>;
  };
  layer2_derived_evidence: {
    screening_strategy: string;
    rules_evaluated: Array<{
      rule_id: string;
      result: string;
      rationale: string;
    }>;
    prioritisation: {
      priority: string;
      priority_reasons: string[];
      evidence_completeness_pct: number;
    };
    market_classification: {
      market_strength: string;
      median_price: number | null;
      sample_size: number;
      rationale: string;
    };
    capacity_classification: {
      developable_status: string;
      net_developable_ha: number | null;
      development_potential: string;
      constrained_pct: number;
    };
  };
  layer3_analyst_interpretation: {
    hypothesis?: string | null;
    critical_unknowns: string[];
    risk_assessment: Array<{
      category: string;
      description: string;
      severity: string;
    }>;
    analyst_verdict?: string | null;
    investigation_notes_count: number;
  };
  layer4_real_world_outcome: {
    validation_status: ValidationStatus;
    validation_stage: ValidationStage;
    commercial_decision: CommercialDecision;
    external_evidence_count: number;
    realities: {
      availability: AvailabilityReality;
      owner_engagement: OwnerEngagementReality;
      planning: PlanningReality;
      access: AccessReality;
      market: MarketReality;
      acquisition: AcquisitionOutcomeReality;
    };
    rejection_reasons: RejectionReason[];
    is_false_positive: boolean;
    false_positive_root_cause?: FalsePositiveRootCause | null;
    is_false_negative: boolean;
    false_negative_category?: FalseNegativeCategory | null;
    external_evidence: ExternalEvidenceRecord[];
  };
  events: TruthLedgerEvent[];
}

export interface ValidationDiagnosticMetrics {
  cohort_id: string;
  total_candidates: number;
  validated_count: number;
  unvalidated_count: number;
  in_validation_count: number;
  // Phase 11: Explicit Evidence Status Separation (Sections 1 & 2)
  test_fixture_count: number;
  benchmark_count: number;
  external_evidence_count: number;
  real_acquisition_event_count: number;
  unknown_evidence_status_count: number;
  discovery_overlap_rate: number; // percentage of human benchmark candidates also surfaced
  investigation_yield_rate: number; // percentage of surfaced candidates that justified PROGRESS or detailed investigation
  false_positive_count: number;
  false_positive_rate: number;
  false_positives_by_cause: Record<string, number>;
  false_negative_count: number;
  false_negatives_by_cause: Record<string, number>;
  realities_summary: {
    supportive_planning_pct: number;
    supportive_access_pct: number;
    supportive_market_pct: number;
    available_pct: number;
  };
  commercial_decisions: {
    progress: number;
    hold: number;
    reject: number;
    undecided: number;
  };
}

// ---------------------------------------------------------------------------
// Phase 11: Ownership Intelligence — Complex Interfaces
// ---------------------------------------------------------------------------

/**
 * A record of proprietor/ownership evidence for a candidate site.
 * Every record must have: source, retrieval_date, evidence_status.
 * 'proprietor_notes' is a free-text field — never a structured queryable column —
 * to avoid inadvertent personal data profiling.
 */
export interface OwnershipEvidence {
  id: string;
  site_id: string;
  site_reference: string;
  title_reference: string | null;
  /** Free-text. May include organisation name. Do not store individual names in structured fields. */
  proprietor_notes: string | null;
  ownership_source: string;
  source_reference: string | null;
  retrieval_date: string;
  retrieval_mode: RetrievalMode;
  evidence_status: OwnershipEvidenceStatus;
  ownership_interpretation:
    | 'freehold'
    | 'leasehold'
    | 'multiple_interests'
    | 'uncertain'
    | 'unknown';
  acquisition_relevance:
    | 'likely_single_owner'
    | 'multiple_ownership'
    | 'ownership_complexity'
    | 'unknown';
  analyst_notes: string | null;
  recorded_by: string;
  created_at: string;
}

/**
 * Explicit relationship between a candidate site and an identified land title.
 * Never assume candidate = title.
 */
export interface TitleCandidateRelationship {
  id: string;
  site_id: string;
  title_id: string;
  title_reference: string | null;
  relationship_strength: TitleRelationshipStrength;
  /** Approximate overlap percentage where geometry is available. null = cannot compute. */
  overlap_pct: number | null;
  /** Geometry from title (INSPIRE or manual) is available for comparison. */
  title_geometry_available: boolean;
  analyst_notes: string | null;
  assessed_by: string;
  assessed_at: string;
  created_at: string;
}

/**
 * An ownership complexity summary for a candidate site.
 */
export interface OwnershipComplexitySummary {
  site_id: string;
  complexity: OwnershipComplexity;
  title_count: number | null;
  has_highways_land: boolean | null;
  has_third_party_strips: boolean | null;
  has_access_parcels: boolean | null;
  /** Free text — not structured field — to avoid personal data profiling */
  complexity_notes: string | null;
  assessed_by: string;
  assessed_at: string;
}

/**
 * An availability state record. Append-only — one record per state change.
 * Every record must have explicit evidence_source and evidence_date.
 * Silence does NOT support NOT_AVAILABLE. Use UNKNOWN.
 */
export interface AvailabilityEvidence {
  id: string;
  site_id: string;
  site_reference: string;
  availability_state: AcquisitionAvailabilityState;
  evidence_source: string;
  evidence_date: string;
  /** How confident is the evidence? 0.0–1.0 */
  confidence: number;
  evidence_notes: string | null;
  recorded_by: string;
  created_at: string;
}

/**
 * A contact event record for acquisition purposes.
 * contact_type describes the channel (email, phone, letter, in-person).
 * organisation is the entity contacted — not an individual's name in a structured field.
 */
export interface AcquisitionContactRecord {
  id: string;
  site_id: string;
  site_reference: string;
  contact_type: 'email' | 'phone' | 'letter' | 'in_person' | 'agent_intermediary' | 'other';
  /** Organisation or role contacted. Do not store individual names in structured columns. */
  organisation_or_role: string | null;
  source_of_contact_details: string | null;
  contact_date: string;
  communication_method_notes: string | null;
  outcome: ContactOutcomeCode;
  availability_information: string | null;
  next_action: string | null;
  analyst: string;
  notes: string | null;
  created_at: string;
}

/**
 * A formal acquisition evidence record.
 * Every record must have: date, source, evidence_type, summary, actor.
 * supporting_document_ref is optional (e.g., a file reference for a stored PDF).
 * Do not fabricate any of these records.
 */
export interface AcquisitionEvidenceRecord {
  id: string;
  site_id: string;
  site_reference: string;
  evidence_type: AcquisitionEvidenceType;
  evidence_date: string;
  source: string;
  source_reference: string | null;
  summary: string;
  actor: string;
  actor_role: string | null;
  supporting_document_ref: string | null;
  contradiction_status: ContradictionStatus;
  interpretation: string;
  confidence: 'high' | 'medium' | 'low' | 'provisional';
  recorded_by: string;
  created_at: string;
}

/**
 * A single detected contradiction between evidence layers.
 * Never auto-resolved. Always requires human interpretation.
 */
export interface ContradictionRecord {
  id: string;
  site_id: string;
  site_reference: string;
  category: ContradictionCategory;
  machine_claim: string;
  external_finding: string;
  /** Severity of the contradiction for acquisition purposes */
  severity: 'critical' | 'significant' | 'minor';
  /** Always true for MACHINE_VS_EXTERNAL contradictions */
  requires_human_review: boolean;
  resolved: boolean;
  resolution_notes: string | null;
  detected_at: string;
}

/**
 * Full report from the contradiction engine for a candidate site.
 */
export interface ContradictionReport {
  site_id: string;
  site_reference: string;
  contradictions: ContradictionRecord[];
  unresolved_count: number;
  critical_count: number;
  has_machine_vs_external: boolean;
  generated_at: string;
}

/**
 * Full ownership intelligence summary for a candidate site.
 * Built by ownershipService.buildOwnershipIntelligenceSummary().
 */
export interface OwnershipIntelligenceSummary {
  site_id: string;
  site_reference: string;
  /** Best current title evidence. UNKNOWN if none retrieved. */
  ownership_evidence_status: OwnershipEvidenceStatus;
  complexity: OwnershipComplexity;
  title_relationship_strength: TitleRelationshipStrength;
  title_count: number;
  title_references: string[];
  availability_state: AcquisitionAvailabilityState;
  latest_availability_evidence_date: string | null;
  contact_history_count: number;
  latest_contact_outcome: ContactOutcomeCode | null;
  acquisition_evidence_count: number;
  ownership_evidence_records: OwnershipEvidence[];
  title_relationships: TitleCandidateRelationship[];
  availability_history: AvailabilityEvidence[];
  contact_history: AcquisitionContactRecord[];
  acquisition_evidence: AcquisitionEvidenceRecord[];
  assessed_at: string;
}

/**
 * Report generated by the Acquisition Gate before a candidate
 * progresses beyond INVESTIGATING. The analyst makes the decision —
 * this report only surfaces what is known and unknown.
 */
export interface AcquisitionGateReport {
  site_id: string;
  site_reference: string;
  evidence_summary: {
    signal_count: number;
    known_signals: number;
    unknown_signals: number;
    conflicting_signals: number;
    evidence_completeness_pct: number;
  };
  ownership_summary: {
    status: OwnershipEvidenceStatus;
    complexity: OwnershipComplexity;
    controlling_party_notes: string | null;
  };
  availability_summary: {
    state: AcquisitionAvailabilityState;
    evidence_date: string | null;
    confidence: number | null;
  };
  planning_summary: {
    has_planning_history: boolean;
    planning_signal_status: string;
    lpa_position_notes: string;
  };
  market_summary: {
    market_strength: string;
    comparable_count: number;
    market_notes: string;
  };
  constraint_summary: {
    active_constraints: string[];
    unresolved_constraints: string[];
  };
  unknowns: string[];
  contradictions: ContradictionRecord[];
  analyst_view: string;
  next_action: string;
  generated_at: string;
  generated_by: string;
}


