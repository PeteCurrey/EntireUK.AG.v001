/**
 * Land Radar — Constants & Rule Thresholds
 *
 * Rule thresholds are configurable here rather than hardcoded in logic.
 * All distances are in metres unless otherwise noted.
 */

// ---------------------------------------------------------------------------
// Spatial thresholds (all in metres)
// ---------------------------------------------------------------------------

export const THRESHOLDS = {
  /** Maximum distance from a settlement boundary to qualify as settlement-adjacent */
  SETTLEMENT_PROXIMITY_M: 1_000,

  /** Maximum distance from a classified road to qualify as road-accessible */
  ROAD_PROXIMITY_M: 100,

  /** Minimum site area in m² for residential screening (default: 0.1 ha = 1,000 m²) */
  MIN_SITE_AREA_SQM: 1_000,

  /** Site area in m² above which it is considered strategic-scale (default: 10 ha = 100,000 m²) */
  STRATEGIC_AREA_SQM: 100_000,

  /** Flood Zone 3 overlap percentage above which to flag as material constraint */
  FLOOD_ZONE_3_MATERIAL_PCT: 20,

  /** Flood Zone 2 overlap percentage above which to flag as soft constraint */
  FLOOD_ZONE_2_SOFT_PCT: 50,

  /** Proximity to listed buildings that triggers a soft constraint signal (m) */
  LISTED_BUILDING_PROXIMITY_M: 150,

  /** Planning activity within this radius is considered 'nearby' (m) */
  PLANNING_ACTIVITY_RADIUS_M: 250,

  /** Development pattern detection radius (m) */
  DEVELOPMENT_PATTERN_RADIUS_M: 500,

  /** Area discrepancy threshold: flag if source area differs from calculated by >X% */
  AREA_DISCREPANCY_THRESHOLD_PCT: 5,
} as const;

// ---------------------------------------------------------------------------
// Rule versioning
// ---------------------------------------------------------------------------

export const CURRENT_RULE_VERSION = 'v1' as const;

// ---------------------------------------------------------------------------
// Site reference format
// ---------------------------------------------------------------------------

export const SITE_REFERENCE_PREFIX = 'EUK-S' as const;

// ---------------------------------------------------------------------------
// Signal type display labels
// ---------------------------------------------------------------------------

export const SIGNAL_TYPE_LABELS: Record<string, string> = {
  settlement_proximity: 'Settlement Proximity',
  road_proximity: 'Road Proximity',
  planning_activity: 'Planning Activity',
  brownfield_signal: 'Brownfield Indicator',
  constraint_signal: 'Constraint Detection',
  development_pattern: 'Development Pattern',
  market_signal: 'Market Signal',
  flood_risk: 'Flood Risk',
  green_belt: 'Green Belt',
  conservation_area: 'Conservation Area',
  access_adequacy: 'Access Adequacy',
  protected_site: 'Protected Site',
  ancient_woodland: 'Ancient Woodland',
  listed_building_proximity: 'Listed Building Proximity',
  economic_zone: 'Economic Zone',
};

// ---------------------------------------------------------------------------
// Constraint type display labels
// ---------------------------------------------------------------------------

export const CONSTRAINT_TYPE_LABELS: Record<string, string> = {
  flood_risk_zone_1: 'Flood Zone 1 (Low Risk)',
  flood_risk_zone_2: 'Flood Zone 2 (Medium Risk)',
  flood_risk_zone_3: 'Flood Zone 3 (High Risk)',
  flood_risk_zone_3b: 'Flood Zone 3b (Functional Floodplain)',
  green_belt: 'Green Belt',
  conservation_area: 'Conservation Area',
  listed_building: 'Listed Building',
  ancient_woodland: 'Ancient Woodland',
  sssi: 'SSSI',
  sac: 'Special Area of Conservation',
  spa: 'Special Protection Area',
  ramsar: 'Ramsar Wetland',
  aonb: 'Area of Outstanding Natural Beauty',
  national_park: 'National Park',
  heritage_coast: 'Heritage Coast',
  scheduled_monument: 'Scheduled Monument',
  article_4: 'Article 4 Direction',
  tree_preservation_order: 'Tree Preservation Order',
  contamination: 'Contamination',
  infrastructure: 'Infrastructure Constraint',
  access_constraint: 'Access Constraint',
  other: 'Other',
};

// ---------------------------------------------------------------------------
// Site status display
// ---------------------------------------------------------------------------

export const SITE_STATUS_LABELS: Record<string, string> = {
  candidate: 'Candidate',
  screening: 'Screening',
  under_review: 'Under Review',
  investigating: 'Investigating',
  due_diligence: 'Due Diligence',
  controlled: 'Controlled',
  planning: 'Planning',
  development: 'Development',
  completed: 'Completed',
  declined: 'Declined',
  archived: 'Archived',
};
