'use client';

import React, { useState } from 'react';
import {
  InvestigationAction,
  InvestigationNote,
  OpportunityProgression,
  ActionPriority,
  ActionType,
  ActionStatus,
} from '@/lib/land-radar/types';
import { formatArea } from '@/lib/land-radar/geometry';
import {
  createActionServer,
  updateActionStatusServer,
  addNoteServer,
  progressCandidateServer,
  recordExternalEvidenceServer,
  recordValidationStateServer,
  recordOwnershipEvidenceServer,
  recordAvailabilityEvidenceServer,
  recordContactOutcomeServer,
} from './actions';
import {
  ExternalEvidenceRecord,
  CandidateValidationRecord,
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
  OwnershipIntelligenceSummary,
  OwnershipEvidence,
  OwnershipEvidenceStatus,
  AcquisitionAvailabilityState,
  ContactOutcomeCode,
  AcquisitionContactRecord,
} from '@/lib/land-radar/types';

interface InvestigationPanelProps {
  siteId: string;
  siteReference: string;
  siteName: string;
  initialActions: InvestigationAction[];
  initialNotes: InvestigationNote[];
  initialProgression: OpportunityProgression | null;
  initialExternalEvidence?: ExternalEvidenceRecord[];
  initialValidationRecord?: CandidateValidationRecord | null;
  initialOwnershipSummary?: OwnershipIntelligenceSummary | null;
  evidenceSnapshot: Record<string, unknown>;
  cohortId?: string;
}

export function InvestigationPanel({
  siteId,
  siteReference,
  siteName,
  initialActions,
  initialNotes,
  initialProgression,
  initialExternalEvidence = [],
  initialValidationRecord = null,
  initialOwnershipSummary = null,
  evidenceSnapshot,
  cohortId = 'COHORT-WARWICK-001',
}: InvestigationPanelProps) {
  // Actions state
  const [actions, setActions] = useState<InvestigationAction[]>(initialActions);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionType, setNewActionType] = useState<ActionType>('verify_green_belt');
  const [newActionPriority, setNewActionPriority] = useState<ActionPriority>('high');
  const [newActionAssignee, setNewActionAssignee] = useState('Sarah Jenkins');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [isAddingAction, setIsAddingAction] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<InvestigationNote[]>(initialNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Sarah Jenkins');
  const [newNoteRole, setNewNoteRole] = useState('Lead Acquisitions Analyst');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Progression state
  const [progression, setProgression] = useState<OpportunityProgression | null>(initialProgression);
  const [decisionReason, setDecisionReason] = useState('');
  const [progressionNotes, setProgressionNotes] = useState('');
  const [progressedBy, setProgressedBy] = useState('Marcus Sterling (Acquisitions Committee)');
  const [isProgressing, setIsProgressing] = useState(false);
  const [showProgressionModal, setShowProgressionModal] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Phase 10: External Evidence State
  const [externalEvidence, setExternalEvidence] = useState<ExternalEvidenceRecord[]>(initialExternalEvidence);
  const [showAddExtEvidence, setShowAddExtEvidence] = useState(false);
  const [extType, setExtType] = useState<ExternalEvidenceType>('planning_consultant_advice');
  const [extDate, setExtDate] = useState(new Date().toISOString().split('T')[0]);
  const [extOrg, setExtOrg] = useState('');
  const [extAuthor, setExtAuthor] = useState('Sarah Jenkins');
  const [extRole, setExtRole] = useState('Lead Acquisitions Analyst');
  const [extSummary, setExtSummary] = useState('');
  const [extDocRef, setExtDocRef] = useState('');
  const [extInterpretation, setExtInterpretation] = useState('');
  const [extContradiction, setExtContradiction] = useState<ContradictionStatus>('neutral');
  const [extConfidence, setExtConfidence] = useState<'high' | 'medium' | 'low' | 'provisional'>('high');
  const [isAddingExtEvidence, setIsAddingExtEvidence] = useState(false);

  // Phase 10: Validation Record State
  const [validationRecord, setValidationRecord] = useState<CandidateValidationRecord | null>(initialValidationRecord);
  const [valStatus, setValStatus] = useState<ValidationStatus>(initialValidationRecord?.validation_status ?? 'UNVALIDATED');
  const [valStage, setValStage] = useState<ValidationStage>(initialValidationRecord?.validation_stage ?? 'SURFACED');
  const [valDecision, setValDecision] = useState<CommercialDecision>(initialValidationRecord?.commercial_decision ?? 'UNDECIDED');
  const [valAvailability, setValAvailability] = useState<AvailabilityReality>(initialValidationRecord?.availability_reality ?? 'UNKNOWN');
  const [valOwner, setValOwner] = useState<OwnerEngagementReality>(initialValidationRecord?.owner_engagement_reality ?? 'UNKNOWN');
  const [valPlanning, setValPlanning] = useState<PlanningReality>(initialValidationRecord?.planning_reality ?? 'UNKNOWN');
  const [valAccess, setValAccess] = useState<AccessReality>(initialValidationRecord?.access_reality ?? 'UNKNOWN');
  const [valMarket, setValMarket] = useState<MarketReality>(initialValidationRecord?.market_reality ?? 'UNKNOWN');
  const [valAcquisition, setValAcquisition] = useState<AcquisitionOutcomeReality>(initialValidationRecord?.acquisition_outcome ?? 'UNKNOWN');
  const [valFalsePositive, setValFalsePositive] = useState<boolean>(initialValidationRecord?.false_positive_flag ?? false);
  const [valFpRootCause, setValFpRootCause] = useState<FalsePositiveRootCause | ''>(initialValidationRecord?.false_positive_root_cause ?? '');
  const [valNotes, setValNotes] = useState(initialValidationRecord?.analyst_notes ?? '');
  const [isUpdatingValidation, setIsUpdatingValidation] = useState(false);
  const [valSuccessMsg, setValSuccessMsg] = useState<string | null>(null);

  // Phase 11: Ownership Intelligence State
  const [ownershipRecords, setOwnershipRecords] = useState<OwnershipEvidence[]>(
    initialOwnershipSummary?.ownership_evidence_records ?? []
  );
  const [showAddOwnership, setShowAddOwnership] = useState(false);
  const [ownTitleRef, setOwnTitleRef] = useState('');
  const [ownProprietor, setOwnProprietor] = useState('');
  const [ownSource, setOwnSource] = useState('HMLR Title Register (Manual Retrieval)');
  const [ownDate, setOwnDate] = useState(new Date().toISOString().split('T')[0]);
  const [ownStatus, setOwnStatus] = useState<OwnershipEvidenceStatus>('SUPPORTED');
  const [ownTenure, setOwnTenure] = useState<'freehold' | 'leasehold' | 'multiple_interests' | 'uncertain' | 'unknown'>('freehold');
  const [ownRelevance, setOwnRelevance] = useState<'likely_single_owner' | 'multiple_ownership' | 'ownership_complexity' | 'unknown'>('likely_single_owner');
  const [ownNotes, setOwnNotes] = useState('');
  const [isRecordingOwnership, setIsRecordingOwnership] = useState(false);

  // Phase 11: Availability State
  const [availabilityList, setAvailabilityList] = useState(
    initialOwnershipSummary?.availability_history ?? []
  );
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [availState, setAvailState] = useState<AcquisitionAvailabilityState>('POTENTIALLY_AVAILABLE');
  const [availSource, setAvailSource] = useState('Direct Vendor Contact / Broker Note');
  const [availDate, setAvailDate] = useState(new Date().toISOString().split('T')[0]);
  const [availConfidence, setAvailConfidence] = useState(1.0);
  const [availNotes, setAvailNotes] = useState('');
  const [isRecordingAvail, setIsRecordingAvail] = useState(false);

  // Phase 11: Contact Outcome State
  const [contactList, setContactList] = useState<AcquisitionContactRecord[]>(
    initialOwnershipSummary?.contact_history ?? []
  );
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactType, setContactType] = useState<'email' | 'phone' | 'letter' | 'in_person' | 'agent_intermediary' | 'other'>('email');
  const [contactOrg, setContactOrg] = useState('');
  const [contactDate, setContactDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactOutcome, setContactOutcome] = useState<ContactOutcomeCode>('OPEN_TO_DISCUSSION');
  const [contactNextAction, setContactNextAction] = useState('Follow up in 5 business days');
  const [contactNotes, setContactNotes] = useState('');
  const [isRecordingContact, setIsRecordingContact] = useState(false);

  // Handle record ownership
  const handleRecordOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownSource.trim()) return;
    setErrorBanner(null);
    setIsRecordingOwnership(true);
    try {
      const created = await recordOwnershipEvidenceServer({
        site_id: siteId,
        site_reference: siteReference,
        title_reference: ownTitleRef.trim() || undefined,
        proprietor_notes: ownProprietor.trim() || undefined,
        ownership_source: ownSource.trim(),
        retrieval_date: ownDate,
        retrieval_mode: 'manual_entry',
        evidence_status: ownStatus,
        ownership_interpretation: ownTenure,
        acquisition_relevance: ownRelevance,
        analyst_notes: ownNotes.trim() || undefined,
        recorded_by: 'Sarah Jenkins',
      });
      if (created) {
        setOwnershipRecords((prev) => [created, ...prev]);
        setOwnTitleRef('');
        setOwnProprietor('');
        setOwnNotes('');
        setShowAddOwnership(false);
      }
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to record ownership evidence');
    } finally {
      setIsRecordingOwnership(false);
    }
  };

  // Handle record availability
  const handleRecordAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availSource.trim()) return;
    setErrorBanner(null);
    setIsRecordingAvail(true);
    try {
      const created = await recordAvailabilityEvidenceServer({
        site_id: siteId,
        site_reference: siteReference,
        availability_state: availState,
        evidence_source: availSource.trim(),
        evidence_date: availDate,
        confidence: availConfidence,
        evidence_notes: availNotes.trim() || undefined,
        recorded_by: 'Sarah Jenkins',
      });
      if (created) {
        setAvailabilityList((prev) => [created, ...prev]);
        setAvailNotes('');
        setShowAddAvailability(false);
      }
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to record availability evidence');
    } finally {
      setIsRecordingAvail(false);
    }
  };

  // Handle record contact
  const handleRecordContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setIsRecordingContact(true);
    try {
      const created = await recordContactOutcomeServer({
        site_id: siteId,
        site_reference: siteReference,
        contact_type: contactType,
        organisation_or_role: contactOrg.trim() || undefined,
        contact_date: contactDate,
        outcome: contactOutcome,
        next_action: contactNextAction.trim() || undefined,
        analyst: 'Sarah Jenkins',
        notes: contactNotes.trim() || undefined,
      });
      if (created) {
        setContactList((prev) => [created, ...prev]);
        setContactOrg('');
        setContactNotes('');
        setShowAddContact(false);
      }
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to record contact outcome');
    } finally {
      setIsRecordingContact(false);
    }
  };

  // Handle record external evidence
  const handleRecordExternalEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extSummary.trim() || !extOrg.trim()) return;

    setErrorBanner(null);
    setIsAddingExtEvidence(true);
    try {
      const created = await recordExternalEvidenceServer({
        site_id: siteId,
        site_reference: siteReference,
        evidence_type: extType,
        evidence_date: extDate,
        source_organisation: extOrg.trim(),
        author: extAuthor.trim(),
        author_role: extRole.trim(),
        summary: extSummary.trim(),
        supporting_document_ref: extDocRef.trim() || undefined,
        analyst_interpretation: extInterpretation.trim(),
        contradiction_status: extContradiction,
        confidence: extConfidence,
      });

      if (created) {
        setExternalEvidence((prev) => [created, ...prev]);
        setExtSummary('');
        setExtDocRef('');
        setExtInterpretation('');
        setShowAddExtEvidence(false);
        // Automatically transition validation status to IN_VALIDATION if currently UNVALIDATED
        if (valStatus === 'UNVALIDATED') {
          setValStatus('IN_VALIDATION');
        }
      }
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to record external evidence');
    } finally {
      setIsAddingExtEvidence(false);
    }
  };

  // Handle update validation state
  const handleUpdateValidationState = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setValSuccessMsg(null);
    setIsUpdatingValidation(true);

    try {
      const updated = await recordValidationStateServer({
        site_id: siteId,
        site_reference: siteReference,
        cohort_id: cohortId,
        validation_status: valStatus,
        validation_stage: valStage,
        commercial_decision: valDecision,
        availability_reality: valAvailability,
        owner_engagement_reality: valOwner,
        planning_reality: valPlanning,
        access_reality: valAccess,
        market_reality: valMarket,
        acquisition_outcome: valAcquisition,
        rejection_reasons: [],
        false_positive_flag: valFalsePositive,
        false_positive_root_cause: valFalsePositive && valFpRootCause ? (valFpRootCause as FalsePositiveRootCause) : null,
        false_negative_flag: false,
        false_negative_category: null,
        analyst_notes: valNotes.trim() || undefined,
      });

      if (updated) {
        setValidationRecord(updated);
        setValSuccessMsg('Validation realities successfully updated & recorded in Truth Ledger.');
        setTimeout(() => setValSuccessMsg(null), 4000);
      }
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to update validation state');
    } finally {
      setIsUpdatingValidation(false);
    }
  };


  // Handle action status toggle
  const handleToggleStatus = async (action: InvestigationAction) => {
    setErrorBanner(null);
    const nextStatus: ActionStatus =
      action.status === 'completed'
        ? 'in_progress'
        : action.status === 'in_progress'
        ? 'completed'
        : 'in_progress';

    try {
      const updated = await updateActionStatusServer(action.id, nextStatus, {
        completed_by: newNoteAuthor,
        completion_notes: nextStatus === 'completed' ? 'Verified by acquisitions analyst' : undefined,
      });

      if (updated) {
        setActions((prev) => prev.map((a) => (a.id === action.id ? updated : a)));
      }
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to update action status');
    }
  };

  // Handle create new action
  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    setErrorBanner(null);
    setIsAddingAction(true);
    try {
      const created = await createActionServer({
        site_id: siteId,
        action_type: newActionType,
        title: newActionTitle.trim(),
        priority: newActionPriority,
        assigned_to: newActionAssignee,
        due_date: newActionDueDate || undefined,
        status: 'open',
      });

      setActions((prev) => [created, ...prev]);
      setNewActionTitle('');
      setNewActionDueDate('');
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to create action');
    } finally {
      setIsAddingAction(false);
    }
  };

  // Handle create new note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    setErrorBanner(null);
    setIsAddingNote(true);
    try {
      const created = await addNoteServer({
        site_id: siteId,
        author: newNoteAuthor,
        author_role: newNoteRole,
        content: newNoteContent.trim(),
        is_pinned: false,
      });

      setNotes((prev) => [created, ...prev]);
      setNewNoteContent('');
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to record note');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle progression to Opportunity
  const handleProgressToOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionReason.trim()) return;

    setErrorBanner(null);
    setIsProgressing(true);
    try {
      const prog = await progressCandidateServer({
        site_id: siteId,
        progressed_by: progressedBy,
        decision_reason: decisionReason.trim(),
        evidence_snapshot: evidenceSnapshot,
        notes: progressionNotes.trim() || undefined,
      });

      setProgression(prog);
      setShowProgressionModal(false);
    } catch (err: unknown) {
      setErrorBanner((err as Error).message || 'Failed to progress candidate to opportunity');
    } finally {
      setIsProgressing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Alert Banner */}
      {errorBanner && (
        <div className="bg-red-950/60 border border-red-500/60 rounded-sm p-4 text-xs text-red-200 flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start space-x-2">
            <span className="text-red-400 font-bold font-mono">⚠ PERSISTENCE ERROR:</span>
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-red-400 hover:text-white font-mono uppercase text-[10px] shrink-0 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 1. Opportunity Progression Status Banner */}
      {/* ------------------------------------------------------------------ */}
      {progression ? (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-sm p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                OPPORTUNITY STATUS: PROGRESSED ({progression.opportunity_id})
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-300">
              Approved on {new Date(progression.progressed_at).toLocaleDateString()} by {progression.progressed_by}
            </span>
          </div>
          <div className="text-xs text-emerald-100/90 leading-relaxed">
            <strong className="text-emerald-300">Commercial Decision Rationale:</strong> {progression.decision_reason}
          </div>
          {progression.notes && (
            <div className="text-xs text-emerald-200/80">
              <strong className="text-emerald-300">Acquisition Directives:</strong> {progression.notes}
            </div>
          )}
          <div className="pt-2 border-t border-emerald-500/30 text-[10px] font-mono text-emerald-400/80 flex items-center justify-between">
            <span>Evidence Snapshot Locked: {Object.keys(progression.evidence_snapshot).length} data points frozen</span>
            <span>RLS Protected · Commercial Secret</span>
          </div>
        </div>
      ) : (
        <div className="bg-brand-surface border border-brand-edge rounded-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>STAGE: CANDIDATE INVESTIGATION</span>
            </div>
            <h4 className="text-sm font-bold text-white">Controlled Opportunity Progression Gate</h4>
            <p className="text-xs text-brand-silver mt-0.5">
              Progressing this candidate into an active Opportunity requires a documented human decision and freezes an immutable evidence snapshot.
            </p>
          </div>

          <button
            onClick={() => setShowProgressionModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-brand-obsidian font-semibold text-xs rounded transition-colors whitespace-nowrap"
          >
            Progress to Opportunity Gate →
          </button>
        </div>
      )}

      {/* Progression Modal */}
      {showProgressionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-charcoal border border-brand-edge max-w-xl w-full rounded-sm p-6 space-y-5 shadow-2xl">
            <div className="border-b border-brand-edge pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Controlled Commercial Gateway
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Progress {siteReference} to Active Opportunity
              </h3>
              <p className="text-xs text-brand-silver mt-1">
                This action creates an Opportunity record and freezes the current screening facts, signals, and constraints as an immutable audit snapshot.
              </p>
            </div>

            <form onSubmit={handleProgressToOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-brand-steel uppercase mb-1">
                  Authorising Professional / Committee *
                </label>
                <input
                  type="text"
                  required
                  value={progressedBy}
                  onChange={(e) => setProgressedBy(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-edge rounded text-xs text-white p-2.5 focus:border-cyan-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-steel uppercase mb-1">
                  Commercial Decision Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Candidate meets residential threshold; brownfield deliverability confirmed with LPA; initial title check clean..."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-edge rounded text-xs text-white p-2.5 focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brand-steel uppercase mb-1">
                  Immediate Instructions & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Instruct Phase 1 contamination desktop audit; obtain official copies from Land Registry..."
                  value={progressionNotes}
                  onChange={(e) => setProgressionNotes(e.target.value)}
                  className="w-full bg-brand-surface border border-brand-edge rounded text-xs text-white p-2.5 focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="bg-brand-surface p-3 rounded text-[11px] font-mono text-brand-steel space-y-1">
                <div className="text-brand-silver font-semibold">Frozen Evidence Snapshot will include:</div>
                <div>• Spatial extent & calculated area ({formatArea((evidenceSnapshot as any).area_sqm)})</div>
                <div>• Evaluated signals (Settlement, Highway, Brownfield, Flood, SSSI)</div>
                <div>• Epistemic unknowns (Green Belt unassessed, Planning history unassessed)</div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-brand-edge">
                <button
                  type="button"
                  onClick={() => setShowProgressionModal(false)}
                  className="px-3.5 py-2 text-xs text-brand-silver hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProgressing || !decisionReason.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
                >
                  {isProgressing ? 'Recording Snapshot...' : 'Confirm Opportunity Progression'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. Next Actions Manager */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-edge pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Human Due Diligence
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Investigation Next Actions ({actions.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-brand-steel">
            {actions.filter((a) => a.status === 'completed').length} completed · {actions.filter((a) => a.status !== 'completed').length} pending
          </span>
        </div>

        {/* Action List */}
        <div className="space-y-2.5">
          {actions.length === 0 ? (
            <p className="text-xs text-brand-steel italic py-2">No investigation actions logged yet.</p>
          ) : (
            actions.map((act) => {
              const isDone = act.status === 'completed';
              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-brand-charcoal/40 border-brand-edge/60 text-brand-steel'
                      : 'bg-brand-charcoal border-brand-edge text-brand-silver'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${
                          act.priority === 'high'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : act.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {act.priority}
                      </span>
                      <span className="text-[10px] font-mono text-brand-steel">
                        {act.action_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className={`text-xs font-semibold ${isDone ? 'line-through text-brand-steel' : 'text-white'}`}>
                      {act.title}
                    </div>
                    {act.description && (
                      <p className="text-[11px] text-brand-silver leading-relaxed">{act.description}</p>
                    )}
                    <div className="text-[10px] font-mono text-brand-steel flex items-center space-x-3 pt-0.5">
                      <span>Assigned to: <strong className="text-brand-silver">{act.assigned_to}</strong></span>
                      {act.due_date && <span>Due: {act.due_date}</span>}
                      {act.completed_by && <span>Completed by: {act.completed_by}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(act)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-brand-surface text-brand-silver border border-brand-edge hover:border-cyan-400 hover:text-white'
                      }`}
                    >
                      {isDone ? '✓ Completed' : act.status === 'in_progress' ? 'In Progress' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Action Form */}
        <form onSubmit={handleCreateAction} className="pt-4 border-t border-brand-edge space-y-3">
          <span className="text-xs font-mono text-cyan-400 uppercase font-semibold block">
            + Add New Investigation Action
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                placeholder="Action title (e.g. Verify Title register for restrictive covenants)..."
                value={newActionTitle}
                onChange={(e) => setNewActionTitle(e.target.value)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 focus:border-cyan-400 outline-none"
              />
            </div>
            <div>
              <select
                value={newActionType}
                onChange={(e) => setNewActionType(e.target.value as any)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 focus:border-cyan-400 outline-none font-mono"
              >
                <option value="verify_green_belt">Verify Green Belt</option>
                <option value="verify_planning_history">Verify Planning History</option>
                <option value="obtain_title">Obtain Title</option>
                <option value="commission_site_visit">Site Visit / Survey</option>
                <option value="investigate_access">Investigate Access</option>
                <option value="review_planning_policy">Review Policy</option>
                <option value="other">Other Action</option>
              </select>
            </div>
            <div>
              <select
                value={newActionPriority}
                onChange={(e) => setNewActionPriority(e.target.value as any)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 focus:border-cyan-400 outline-none font-mono"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs font-mono text-brand-steel">
              <input
                type="text"
                placeholder="Assignee"
                value={newActionAssignee}
                onChange={(e) => setNewActionAssignee(e.target.value)}
                className="bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-2.5 py-1.5 focus:border-cyan-400 outline-none w-36"
              />
              <input
                type="date"
                value={newActionDueDate}
                onChange={(e) => setNewActionDueDate(e.target.value)}
                className="bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-2.5 py-1.5 focus:border-cyan-400 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingAction || !newActionTitle.trim()}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
            >
              Add Action
            </button>
          </div>
        </form>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Investigation Notes Feed */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-brand-edge pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
              Audit Trail
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Analyst Investigation Notes ({notes.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-brand-steel">Immutable & Timestamped</span>
        </div>

        {/* Notes Timeline */}
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded border space-y-2 ${
                n.is_pinned
                  ? 'bg-brand-charcoal/90 border-cyan-500/40 shadow-sm'
                  : 'bg-brand-charcoal/50 border-brand-edge'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{n.author}</span>
                  <span className="text-brand-steel text-[11px]">({n.author_role})</span>
                  {n.is_pinned && (
                    <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-500/20">
                      PINNED
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-brand-steel">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-brand-silver leading-relaxed whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="pt-4 border-t border-brand-edge space-y-3">
          <span className="text-xs font-mono text-cyan-400 uppercase font-semibold block">
            + Record Professional Note
          </span>
          <textarea
            rows={3}
            required
            placeholder="Record verifiable commentary on planning context, highways inspection, contamination risk, or landowner dialogue..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-3 focus:border-cyan-400 outline-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-brand-steel">
              <span>Author:</span>
              <input
                type="text"
                value={newNoteAuthor}
                onChange={(e) => setNewNoteAuthor(e.target.value)}
                className="bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-2 py-1 focus:border-cyan-400 outline-none w-36"
              />
              <span className="hidden sm:inline">Role:</span>
              <input
                type="text"
                value={newNoteRole}
                onChange={(e) => setNewNoteRole(e.target.value)}
                className="hidden sm:inline bg-brand-charcoal border border-brand-edge rounded text-xs text-white px-2 py-1 focus:border-cyan-400 outline-none w-44"
              />
            </div>
            <button
              type="submit"
              disabled={isAddingNote || !newNoteContent.trim()}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
            >
              Add Note
            </button>
          </div>
        </form>
      </div>

      {/* =================================================================== */}
      {/* Phase 10: Real-World External Evidence Register                     */}
      {/* =================================================================== */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-brand-edge">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Real-World External Evidence Register (Phase 10)
              </h3>
            </div>
            <p className="text-[11px] text-brand-steel mt-0.5">
              Independent corroboration: planning consultant advice, highways engineer audits, surveys, owner dialogue.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddExtEvidence(!showAddExtEvidence)}
            className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded text-xs font-mono transition-colors"
          >
            {showAddExtEvidence ? 'Cancel' : '+ Record External Evidence'}
          </button>
        </div>

        {/* External Evidence List */}
        <div className="space-y-3">
          {externalEvidence.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-brand-edge/80 text-center">
              <p className="text-xs text-brand-steel font-mono">
                No external evidence records logged yet.
              </p>
              <p className="text-[11px] text-brand-steel/80 mt-1">
                Under Phase 10 principles, a candidate remains <span className="text-amber-300 font-semibold">UNVALIDATED</span> until independent external evidence is corroborated.
              </p>
            </div>
          ) : (
            externalEvidence.map((ev) => (
              <div
                key={ev.id}
                className="bg-brand-charcoal/40 border border-brand-edge/70 rounded p-3.5 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      {ev.evidence_type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-white">{ev.source_organisation}</span>
                    <span className="text-brand-steel text-[11px]">({ev.author})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        ev.contradiction_status === 'supports_prioritisation'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : ev.contradiction_status === 'contradicts_prioritisation'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-brand-edge text-brand-steel'
                      }`}
                    >
                      {ev.contradiction_status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-brand-steel">{ev.evidence_date}</span>
                  </div>
                </div>

                <p className="text-brand-silver leading-relaxed">{ev.summary}</p>

                {ev.supporting_document_ref && (
                  <div className="text-[11px] font-mono text-cyan-400/90">
                    Doc Ref: {ev.supporting_document_ref}
                  </div>
                )}

                <div className="pt-2 border-t border-brand-edge/50 text-[11px] text-brand-steel">
                  <span className="text-white font-medium">Analyst Interpretation: </span>
                  {ev.analyst_interpretation}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add External Evidence Form */}
        {showAddExtEvidence && (
          <form onSubmit={handleRecordExternalEvidence} className="p-4 bg-brand-charcoal/60 border border-emerald-500/30 rounded space-y-3">
            <span className="text-xs font-mono text-emerald-400 uppercase font-semibold block">
              New External Corroboration Record
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Evidence Type</label>
                <select
                  value={extType}
                  onChange={(e) => setExtType(e.target.value as ExternalEvidenceType)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
                >
                  <option value="planning_consultant_advice">Planning Consultant Advice</option>
                  <option value="highways_advice">Highways Engineer Advice</option>
                  <option value="site_inspection">Physical Site Inspection</option>
                  <option value="owner_conversation">Direct Landowner Conversation</option>
                  <option value="agent_conversation">Commercial Agent Conversation</option>
                  <option value="title_research">Title Deed & Covenants Research</option>
                  <option value="survey">Environmental / Contamination Survey</option>
                  <option value="planning_officer_discussion">Planning Officer Discussion</option>
                  <option value="market_research">Independent Market Research</option>
                  <option value="other">Other External Evidence</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Evidence Date</label>
                <input
                  type="date"
                  required
                  value={extDate}
                  onChange={(e) => setExtDate(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Source Organisation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WDC Planning Policy Team, Knight Frank, Delta Consulting"
                  value={extOrg}
                  onChange={(e) => setExtOrg(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Author & Role</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="Author name"
                    value={extAuthor}
                    onChange={(e) => setExtAuthor(e.target.value)}
                    className="w-1/2 bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={extRole}
                    onChange={(e) => setExtRole(e.target.value)}
                    className="w-1/2 bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Evidence Summary</label>
              <textarea
                rows={2}
                required
                placeholder="Factual findings from the external source..."
                value={extSummary}
                onChange={(e) => setExtSummary(e.target.value)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Document Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WCC-HIGHWAYS-041"
                  value={extDocRef}
                  onChange={(e) => setExtDocRef(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Contradiction vs Land Radar</label>
                <select
                  value={extContradiction}
                  onChange={(e) => setExtContradiction(e.target.value as ContradictionStatus)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
                >
                  <option value="supports_prioritisation">Supports Prioritisation</option>
                  <option value="contradicts_prioritisation">Contradicts Prioritisation (False Positive Signal)</option>
                  <option value="neutral">Neutral / Informational</option>
                  <option value="unresolved">Unresolved Uncertainty</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Analyst Interpretation</label>
              <input
                type="text"
                required
                placeholder="What this external evidence means for commercial acquisition..."
                value={extInterpretation}
                onChange={(e) => setExtInterpretation(e.target.value)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddExtEvidence(false)}
                className="px-3 py-1.5 bg-brand-charcoal border border-brand-edge text-brand-silver rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingExtEvidence}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
              >
                {isAddingExtEvidence ? 'Saving...' : 'Save & Record in Truth Ledger'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* =================================================================== */}
      {/* Phase 10: Real-World Validation & Ground Truth Realities            */}
      {/* =================================================================== */}
      <div className="bg-brand-surface border border-brand-edge rounded-sm p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-edge">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Real-World Validation &amp; Ground Truth Realities
              </h3>
            </div>
            <p className="text-[11px] text-brand-steel mt-0.5">
              Record ground truth availability, planning reality, legal access, market reality, and FP/FN diagnosis.
            </p>
          </div>
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded uppercase font-semibold ${
              valStatus === 'VALIDATED'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : valStatus === 'IN_VALIDATION'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            STATUS: {valStatus}
          </span>
        </div>

        {valSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-300 font-mono">
            {valSuccessMsg}
          </div>
        )}

        {/* Validation Form */}
        <form onSubmit={handleUpdateValidationState} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Validation Stage</label>
              <select
                value={valStage}
                onChange={(e) => setValStage(e.target.value as ValidationStage)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-amber-400"
              >
                <option value="SURFACED">SURFACED</option>
                <option value="SCREENED">SCREENED</option>
                <option value="ANALYST_REVIEW">ANALYST_REVIEW</option>
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="SITE_VALIDATION">SITE_VALIDATION</option>
                <option value="OWNER_INTELLIGENCE">OWNER_INTELLIGENCE</option>
                <option value="PLANNING_VALIDATION">PLANNING_VALIDATION</option>
                <option value="MARKET_VALIDATION">MARKET_VALIDATION</option>
                <option value="SITE_INSPECTION">SITE_INSPECTION</option>
                <option value="COMMERCIAL_DECISION">COMMERCIAL_DECISION</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Validation Status</label>
              <select
                value={valStatus}
                onChange={(e) => setValStatus(e.target.value as ValidationStatus)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-amber-400"
              >
                <option value="UNVALIDATED">UNVALIDATED (No external proof)</option>
                <option value="IN_VALIDATION">IN_VALIDATION (Evidence pending)</option>
                <option value="VALIDATED">VALIDATED (External proof corroborated)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Commercial Decision</label>
              <select
                value={valDecision}
                onChange={(e) => setValDecision(e.target.value as CommercialDecision)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-amber-400 font-bold"
              >
                <option value="UNDECIDED">UNDECIDED</option>
                <option value="PROGRESS">PROGRESS (Advance to acquisition)</option>
                <option value="HOLD">HOLD (Remediation / Price gap)</option>
                <option value="REJECT">REJECT (Terminal exit)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-brand-edge">
            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Planning Reality</label>
              <select
                value={valPlanning}
                onChange={(e) => setValPlanning(e.target.value as PlanningReality)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none"
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="SUPPORTIVE">SUPPORTIVE</option>
                <option value="NEUTRAL">NEUTRAL</option>
                <option value="ADVERSE">ADVERSE</option>
                <option value="CONFLICTING">CONFLICTING</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Legal Access Reality</label>
              <select
                value={valAccess}
                onChange={(e) => setValAccess(e.target.value as AccessReality)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none"
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="SUPPORTIVE">SUPPORTIVE</option>
                <option value="CONSTRAINED">CONSTRAINED</option>
                <option value="FAILED">FAILED (Ransom/No access)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Market Reality</label>
              <select
                value={valMarket}
                onChange={(e) => setValMarket(e.target.value as MarketReality)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none"
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="SUPPORTIVE">SUPPORTIVE</option>
                <option value="NEUTRAL">NEUTRAL</option>
                <option value="WEAK">WEAK / UNVIABLE</option>
                <option value="CONFLICTING">CONFLICTING</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Availability Reality</label>
              <select
                value={valAvailability}
                onChange={(e) => setValAvailability(e.target.value as AvailabilityReality)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none"
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </select>
            </div>
          </div>

          {/* False Positive Diagnosis */}
          <div className="pt-2 border-t border-brand-edge flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-center space-x-2 text-xs font-mono text-brand-silver">
              <input
                type="checkbox"
                checked={valFalsePositive}
                onChange={(e) => setValFalsePositive(e.target.checked)}
                className="rounded border-brand-edge bg-brand-charcoal text-amber-500"
              />
              <span className="text-amber-400 font-semibold">Mark as Documented False Positive</span>
            </label>

            {valFalsePositive && (
              <div className="flex-1">
                <select
                  value={valFpRootCause}
                  onChange={(e) => setValFpRootCause(e.target.value as FalsePositiveRootCause)}
                  className="w-full bg-brand-charcoal border border-amber-500/40 rounded text-xs text-amber-300 p-2 outline-none"
                >
                  <option value="">Select Root Cause...</option>
                  <option value="access_failure">Access Failure (Ransom strip / unadopted road)</option>
                  <option value="market_mismatch">Market Mismatch (Acoustic / noise unviable)</option>
                  <option value="planning_mismatch">Planning Mismatch (Precedent differed)</option>
                  <option value="title_defect">Title Defect (Restrictive covenant)</option>
                  <option value="environmental_blocker">Environmental Blocker (Contamination)</option>
                  <option value="economic_unviability">Economic Unviability</option>
                  <option value="owner_refusal">Owner Refusal</option>
                  <option value="other">Other Root Cause</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Analyst Ground Truth Notes</label>
            <textarea
              rows={2}
              placeholder="Detailed reasons for validation verdict, ground truth observations, or commercial hold..."
              value={valNotes}
              onChange={(e) => setValNotes(e.target.value)}
              className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingValidation}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
            >
              {isUpdatingValidation ? 'Recording...' : 'Update Real-World Truth Record'}
            </button>
          </div>
        </form>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Phase 11: Ownership Evidence Recording (Sections 3 & 4)            */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-brand-surface border border-brand-edge rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-brand-edge pb-3">
          <div>
            <div className="text-xs font-mono text-cyan-400 mb-0.5">PHASE 11 CADASTRE INTELLIGENCE</div>
            <h3 className="text-base font-bold text-white">Record Ownership Evidence</h3>
            <p className="text-xs text-brand-silver">
              Log attributable title deeds, registered proprietors, or cadastral observations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddOwnership(!showAddOwnership)}
            className="px-3 py-1.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded text-xs font-mono font-medium hover:bg-cyan-500/25 transition-colors"
          >
            {showAddOwnership ? 'Cancel' : '+ Add Title / Ownership Record'}
          </button>
        </div>

        {showAddOwnership && (
          <form onSubmit={handleRecordOwnership} className="p-4 bg-brand-charcoal/60 border border-brand-edge rounded space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Title Reference</label>
                <input
                  type="text"
                  placeholder="e.g. WK184920"
                  value={ownTitleRef}
                  onChange={(e) => setOwnTitleRef(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Evidence Status</label>
                <select
                  value={ownStatus}
                  onChange={(e) => setOwnStatus(e.target.value as OwnershipEvidenceStatus)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 font-mono outline-none"
                >
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="SUPPORTED">SUPPORTED</option>
                  <option value="INDICATIVE">INDICATIVE</option>
                  <option value="CONFLICTING">CONFLICTING</option>
                  <option value="STALE">STALE</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Tenure</label>
                <select
                  value={ownTenure}
                  onChange={(e) => setOwnTenure(e.target.value as any)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 font-mono outline-none"
                >
                  <option value="freehold">Freehold</option>
                  <option value="leasehold">Leasehold</option>
                  <option value="multiple_interests">Multiple Interests</option>
                  <option value="uncertain">Uncertain</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Ownership Source</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HMLR Title Register / CCOD"
                  value={ownSource}
                  onChange={(e) => setOwnSource(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Retrieval Date</label>
                <input
                  type="date"
                  required
                  value={ownDate}
                  onChange={(e) => setOwnDate(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Acquisition Relevance</label>
                <select
                  value={ownRelevance}
                  onChange={(e) => setOwnRelevance(e.target.value as any)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 font-mono outline-none"
                >
                  <option value="likely_single_owner">Likely Single Owner</option>
                  <option value="multiple_ownership">Multiple Ownership</option>
                  <option value="ownership_complexity">Ownership Complexity / Strips</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Proprietor / Entity Notes (No personal PII)</label>
              <input
                type="text"
                placeholder="e.g. Corporate Freeholder: Network Rail Infrastructure Ltd / Private Trust"
                value={ownProprietor}
                onChange={(e) => setOwnProprietor(e.target.value)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Analyst Observations</label>
              <textarea
                rows={2}
                placeholder="Covenants, easements, or acquisition complexity notes..."
                value={ownNotes}
                onChange={(e) => setOwnNotes(e.target.value)}
                className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isRecordingOwnership}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
              >
                {isRecordingOwnership ? 'Saving...' : 'Save Ownership Evidence'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Phase 11: Availability & Contact Operations (Sections 8, 10 & 11)  */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Record Availability State */}
        <div className="bg-brand-surface border border-brand-edge rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-edge pb-3">
            <div>
              <div className="text-xs font-mono text-emerald-400 mb-0.5">AVAILABILITY TRACKING</div>
              <h3 className="text-base font-bold text-white">Record Availability Evidence</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddAvailability(!showAddAvailability)}
              className="px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono hover:bg-emerald-500/25 transition-colors"
            >
              {showAddAvailability ? 'Cancel' : '+ Update Availability'}
            </button>
          </div>

          {showAddAvailability ? (
            <form onSubmit={handleRecordAvailability} className="p-4 bg-brand-charcoal/60 border border-brand-edge rounded space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Availability State</label>
                <select
                  value={availState}
                  onChange={(e) => setAvailState(e.target.value as AcquisitionAvailabilityState)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded text-xs text-white p-2 font-mono outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="POTENTIALLY_AVAILABLE">POTENTIALLY_AVAILABLE</option>
                  <option value="UNDER_DISCUSSION">UNDER_DISCUSSION</option>
                  <option value="UNDER_OPTION">UNDER_OPTION</option>
                  <option value="UNDER_PROMOTION">UNDER_PROMOTION</option>
                  <option value="UNDER_CONTRACT">UNDER_CONTRACT</option>
                  <option value="NOT_AVAILABLE">NOT_AVAILABLE</option>
                  <option value="UNKNOWN">UNKNOWN</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Evidence Source</label>
                  <input
                    type="text"
                    required
                    value={availSource}
                    onChange={(e) => setAvailSource(e.target.value)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={availDate}
                    onChange={(e) => setAvailDate(e.target.value)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Evidence Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details supporting this availability determination..."
                  value={availNotes}
                  onChange={(e) => setAvailNotes(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isRecordingAvail}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-brand-obsidian font-semibold rounded"
                >
                  {isRecordingAvail ? 'Saving...' : 'Record Availability'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-mono text-brand-steel uppercase block">Availability Log</span>
              {availabilityList.length === 0 ? (
                <p className="text-xs text-brand-steel italic">No availability evidence recorded yet. State defaults to UNKNOWN.</p>
              ) : (
                <div className="space-y-2">
                  {availabilityList.slice(0, 3).map((av) => (
                    <div key={av.id} className="bg-brand-charcoal/40 border border-brand-edge/60 rounded p-2.5 text-xs font-mono flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">{av.availability_state}</span>
                        <span className="text-[10px] text-brand-steel">{av.evidence_source}</span>
                      </div>
                      <span className="text-[10px] text-brand-steel">{av.evidence_date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Record Contact Outcome */}
        <div className="bg-brand-surface border border-brand-edge rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-edge pb-3">
            <div>
              <div className="text-xs font-mono text-purple-400 mb-0.5">ACQUISITION OUTREACH LOG</div>
              <h3 className="text-base font-bold text-white">Owner &amp; Agent Contact</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddContact(!showAddContact)}
              className="px-3 py-1 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded text-xs font-mono hover:bg-purple-500/25 transition-colors"
            >
              {showAddContact ? 'Cancel' : '+ Log Contact Event'}
            </button>
          </div>

          {showAddContact ? (
            <form onSubmit={handleRecordContact} className="p-4 bg-brand-charcoal/60 border border-brand-edge rounded space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Communication Method</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as any)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white font-mono outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Telephone Call</option>
                    <option value="letter">Letter / Direct Mail</option>
                    <option value="in_person">In-Person Meeting</option>
                    <option value="agent_intermediary">Agent Intermediary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Outcome</label>
                  <select
                    value={contactOutcome}
                    onChange={(e) => setContactOutcome(e.target.value as ContactOutcomeCode)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white font-mono outline-none"
                  >
                    <option value="INTERESTED">INTERESTED</option>
                    <option value="OPEN_TO_DISCUSSION">OPEN_TO_DISCUSSION</option>
                    <option value="REQUESTED_INFORMATION">REQUESTED_INFORMATION</option>
                    <option value="NO_RESPONSE">NO_RESPONSE</option>
                    <option value="DEFERRED">DEFERRED</option>
                    <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                    <option value="NOT_AVAILABLE">NOT_AVAILABLE</option>
                    <option value="ALREADY_COMMITTED">ALREADY_COMMITTED</option>
                    <option value="MULTIPLE_OWNERS">MULTIPLE_OWNERS</option>
                    <option value="AGENT_CONTROLLED">AGENT_CONTROLLED</option>
                    <option value="LEGAL_COMPLEXITY">LEGAL_COMPLEXITY</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Organisation / Role (No personal names)</label>
                  <input
                    type="text"
                    placeholder="e.g. Knight Frank Commercial / Site Freeholder"
                    value={contactOrg}
                    onChange={(e) => setContactOrg(e.target.value)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Contact Date</label>
                  <input
                    type="date"
                    required
                    value={contactDate}
                    onChange={(e) => setContactDate(e.target.value)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-brand-steel block mb-1">Next Action</label>
                <input
                  type="text"
                  value={contactNextAction}
                  onChange={(e) => setContactNextAction(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isRecordingContact}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-brand-obsidian font-semibold rounded"
                >
                  {isRecordingContact ? 'Logging...' : 'Log Contact Event'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-mono text-brand-steel uppercase block">Outreach History</span>
              {contactList.length === 0 ? (
                <p className="text-xs text-brand-steel italic">No communication events recorded. Automated outreach is strictly prohibited.</p>
              ) : (
                <div className="space-y-2">
                  {contactList.slice(0, 3).map((cnt) => (
                    <div key={cnt.id} className="bg-brand-charcoal/40 border border-brand-edge/60 rounded p-2.5 text-xs font-mono flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold block">{cnt.outcome} via {cnt.contact_type}</span>
                        <span className="text-[10px] text-brand-steel">{cnt.organisation_or_role ?? 'Vendor'}</span>
                      </div>
                      <span className="text-[10px] text-brand-steel">{cnt.contact_date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

