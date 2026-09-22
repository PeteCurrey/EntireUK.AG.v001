-- ============================================================
-- Migration 0008: Opportunity Types
-- Controlled vocabulary. Classification is never forced prematurely.
-- Unknown/unclassified is always a valid state.
-- ============================================================

CREATE TABLE IF NOT EXISTS opportunity_types (
  id text PRIMARY KEY, -- slug, e.g. 'development_land'
  label text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

INSERT INTO opportunity_types (id, label, description, sort_order) VALUES
  ('development_land',       'Development Land',
   'Greenfield or edge-of-settlement land with potential for residential or mixed development.', 10),
  ('brownfield',             'Brownfield Regeneration',
   'Previously developed land with planning policy support for redevelopment.', 20),
  ('regeneration',           'Regeneration',
   'Areas identified for wider regeneration under local or national policy frameworks.', 30),
  ('property_redevelopment', 'Property Redevelopment',
   'Existing built property with development, intensification or conversion potential.', 40),
  ('conversion',             'Conversion',
   'Buildings suitable for permitted development or policy-supported change of use.', 50),
  ('strategic_land',         'Strategic Land',
   'Large-scale sites suitable for long-term promotion through emerging Local Plans.', 60),
  ('assembly',               'Land Assembly',
   'Multiple parcels or titles requiring coordinated acquisition strategy.', 70),
  ('mixed_use',              'Mixed Use',
   'Sites with potential for combined residential, commercial or community development.', 80),
  ('other',                  'Other',
   'Opportunity type not fitting standard categories. Review and reclassify when possible.', 990);

COMMENT ON TABLE opportunity_types IS
  'Controlled vocabulary for opportunity classification. '
  'Do not force classification prematurely. opportunity_type_id is nullable in opportunities. '
  'unknown is represented by a null FK, not a special value.';
