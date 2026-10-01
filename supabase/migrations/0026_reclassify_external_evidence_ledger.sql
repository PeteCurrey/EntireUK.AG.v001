-- ============================================================
-- Migration 0026: Reclassify Historical External Evidence in Truth Ledger
--
-- Phase 13 Critical Integrity: DEF-013-04
--
-- Canonical Rule:
-- Layer 4 ('external_evidence') is reserved for third-party documentary evidence,
-- surveys, agent particulars, and independent reports.
-- Layer 5 ('real_world_outcome') is strictly reserved for verified acquisition
-- decisions, commercial contracts, and empirical outcomes.
--
-- This migration updates any historical events created under the Phase 10
-- 4-layer schema so they align with the canonical 5-layer model introduced
-- in Migration 0023. Preserves all event IDs, timestamps, payloads, and audit trails.
-- ============================================================

UPDATE candidate_truth_ledger
SET layer = 'external_evidence'
WHERE event_type = 'external_evidence_received'
  AND layer = 'real_world_outcome';

COMMENT ON COLUMN candidate_truth_ledger.layer IS
  'Epistemic evidence layer: machine_evidence (L1), derived_evidence (L2), analyst_interpretation (L3), external_evidence (L4), real_world_outcome (L5)';
