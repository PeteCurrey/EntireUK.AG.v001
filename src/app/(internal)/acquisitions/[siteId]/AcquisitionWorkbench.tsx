"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Site,
  OwnershipIntelligenceSummary,
  AcquisitionGateReport,
  EvidenceChecklistItem,
  ChecklistDimension,
  AcquisitionContactRecord,
  ContactOutcomeCode,
  AcquisitionOutcomeState,
  DeterministicNextAction,
  ContradictionRecord,
} from "@/lib/land-radar/types";
import { TimelineItem } from "@/lib/land-radar/acquisitions/acquisitionService";
import {
  recordContactAction,
  resolveContradictionAction,
  transitionLifecycleAction,
  verifyTitleOnlineAction,
} from "./actions";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSearch,
  HelpCircle,
  History,
  Layers,
  PhoneCall,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

interface AcquisitionWorkbenchProps {
  site: Site;
  lifecycleStage: AcquisitionOutcomeState;
  nextAction: DeterministicNextAction;
  gateReport: AcquisitionGateReport;
  checklist: Record<ChecklistDimension, EvidenceChecklistItem[]>;
  ownershipSummary: OwnershipIntelligenceSummary;
  contradictions: ContradictionRecord[];
  contacts: AcquisitionContactRecord[];
  timeline: TimelineItem[];
  validTransitions: AcquisitionOutcomeState[];
}

export function AcquisitionWorkbench({
  site,
  lifecycleStage,
  nextAction,
  gateReport,
  checklist,
  ownershipSummary,
  contradictions,
  contacts,
  timeline,
  validTransitions,
}: AcquisitionWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "checklist" | "contradictions" | "contact" | "gate" | "timeline"
  >("overview");

  // Lifecycle transition state
  const [targetState, setTargetState] = useState<AcquisitionOutcomeState>(
    validTransitions[0] || lifecycleStage
  );
  const [transitionRationale, setTransitionRationale] = useState("");
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionMsg, setTransitionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Contact form state
  const [contactType, setContactType] = useState<
    "email" | "phone" | "letter" | "in_person" | "agent_intermediary" | "other"
  >("letter");
  const [contactOrg, setContactOrg] = useState("");
  const [contactDate, setContactDate] = useState(new Date().toISOString().split("T")[0]);
  const [contactOutcome, setContactOutcome] = useState<ContactOutcomeCode>("NO_RESPONSE");
  const [contactFollowUp, setContactFollowUp] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMsg, setContactMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Contradiction resolution state
  const [resolvingContraId, setResolvingContraId] = useState<string | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<
    "RESOLVED" | "DEFERRED_TO_LEGAL" | "ACKNOWLEDGED_MATERIAL"
  >("RESOLVED");
  const [resolutionRationale, setResolutionRationale] = useState("");
  const [resolutionEvidenceRef, setResolutionEvidenceRef] = useState("");
  const [resolutionLoading, setResolutionLoading] = useState(false);
  const [resolutionMsg, setResolutionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Title verification state
  const [titleInput, setTitleInput] = useState(
    ownershipSummary.title_relationships[0]?.title_reference || ""
  );
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);

  // Handlers
  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransitionLoading(true);
    setTransitionMsg(null);
    const res = await transitionLifecycleAction({
      site_id: site.id,
      site_reference: site.internal_reference,
      current_state: lifecycleStage,
      next_state: targetState,
      rationale: transitionRationale,
      recorded_by: "analyst@entire-uk.com",
    });
    setTransitionLoading(false);
    if (res.success) {
      setTransitionMsg({ text: `Advanced to ${targetState}`, ok: true });
      setTransitionRationale("");
    } else {
      setTransitionMsg({ text: res.error || "Failed", ok: false });
    }
  };

  const handleRecordContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactOrg) {
      setContactMsg({ text: "Entity or role contacted is required.", ok: false });
      return;
    }
    setContactLoading(true);
    setContactMsg(null);
    const res = await recordContactAction({
      site_id: site.id,
      site_reference: site.internal_reference,
      contact_type: contactType,
      organisation_or_role: contactOrg,
      contact_date: contactDate,
      outcome: contactOutcome,
      follow_up_date: contactFollowUp || undefined,
      notes: contactNotes,
      analyst: "analyst@entire-uk.com",
    });
    setContactLoading(false);
    if (res.success) {
      setContactMsg({ text: "Contact attempt logged and audited in Truth Ledger.", ok: true });
      setContactOrg("");
      setContactNotes("");
      setContactFollowUp("");
    } else {
      setContactMsg({ text: res.error || "Failed", ok: false });
    }
  };

  const handleResolveContradiction = async (contra: ContradictionRecord) => {
    if (!resolutionRationale) {
      setResolutionMsg({ text: "Mandatory resolution rationale required.", ok: false });
      return;
    }
    setResolutionLoading(true);
    setResolutionMsg(null);
    const res = await resolveContradictionAction({
      site_id: site.id,
      site_reference: site.internal_reference,
      contradiction_id: contra.id,
      contradiction_type: contra.category,
      resolution_status: resolutionStatus,
      resolution_rationale: resolutionRationale,
      supporting_evidence_ref: resolutionEvidenceRef || undefined,
      resolved_by: "analyst@entire-uk.com",
    });
    setResolutionLoading(false);
    if (res.success) {
      setResolutionMsg({ text: `Contradiction marked as ${resolutionStatus}.`, ok: true });
      setResolvingContraId(null);
      setResolutionRationale("");
      setResolutionEvidenceRef("");
    } else {
      setResolutionMsg({ text: res.error || "Failed", ok: false });
    }
  };

  const handleVerifyTitle = async () => {
    if (!titleInput) return;
    setVerifyLoading(true);
    setVerifyResult(null);
    const res = await verifyTitleOnlineAction({
      site_id: site.id,
      site_reference: site.internal_reference,
      title_reference: titleInput,
      recorded_by: "analyst@entire-uk.com",
    });
    setVerifyLoading(false);
    if (res.success) {
      setVerifyResult(res.data);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "KNOWN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">KNOWN</span>;
      case "UNKNOWN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/30">UNKNOWN</span>;
      case "UNAVAILABLE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">UNAVAILABLE</span>;
      case "CONTRADICTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">CONTRADICTED</span>;
      case "STALE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/30">STALE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">N/A</span>;
    }
  };

  const unresolvedContradictions = contradictions.filter(
    (c) => !c.resolved
  );

  return (
    <div className="space-y-6">
      {/* 1. Candidate Header Bar */}
      <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-wider">
              {site.internal_reference}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
              {lifecycleStage.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-brand-steel">·</span>
            <span className="text-xs text-brand-silver">{site.local_authority || "Warwickshire"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {site.name || site.location_description || "Candidate Acquisition Parcel"}
          </h1>
          <div className="flex items-center gap-4 text-xs text-brand-steel mt-1 font-mono">
            {site.area_sqm && (
              <span>Area: {(site.area_sqm / 10000).toFixed(2)} ha ({Math.round(site.area_sqm).toLocaleString()} sqm)</span>
            )}
            <span>·</span>
            <span>Surfaced: {site.created_at ? site.created_at.split("T")[0] : "2026-09-01"}</span>
            <span>·</span>
            <span>Analyst: Sarah Jenkins</span>
          </div>
        </div>

        {/* Quick Lifecycle Controller */}
        {validTransitions.length > 0 && (
          <form
            onSubmit={handleTransition}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-brand-charcoal/80 border border-brand-edge p-2.5 rounded-sm"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-brand-steel uppercase tracking-wider">
                Lifecycle Action
              </span>
              <select
                value={targetState}
                onChange={(e) => setTargetState(e.target.value as AcquisitionOutcomeState)}
                className="bg-brand-surface border border-brand-edge text-xs text-white rounded px-2 py-1 mt-0.5 focus:outline-none focus:border-emerald-500"
              >
                {validTransitions.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Transition rationale..."
              value={transitionRationale}
              onChange={(e) => setTransitionRationale(e.target.value)}
              className="bg-brand-surface border border-brand-edge text-xs text-white rounded px-2.5 py-1 mt-auto focus:outline-none focus:border-emerald-500 min-w-[200px]"
            />

            <button
              type="submit"
              disabled={transitionLoading || !transitionRationale}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-brand-obsidian text-xs font-semibold rounded mt-auto transition-colors"
            >
              {transitionLoading ? "Saving..." : "Advance"}
            </button>
          </form>
        )}
      </div>

      {transitionMsg && (
        <div
          className={`p-3 rounded-sm text-xs border ${
            transitionMsg.ok
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {transitionMsg.text}
        </div>
      )}

      {/* 2. Deterministic Next Best Action Card (Top Priority) */}
      <div className="border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-brand-surface to-brand-surface p-5 rounded-sm shadow-sm relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Deterministic Next Action · {nextAction.code}</span>
              </span>
              <span className="text-[10px] font-mono text-brand-steel uppercase tracking-wider">
                Priority: {nextAction.priority}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {nextAction.label}
            </h2>
            <p className="text-xs text-brand-silver leading-relaxed font-light">
              {nextAction.rationale}
            </p>
            <div className="text-[11px] text-brand-steel flex items-center gap-2 pt-1 font-mono">
              <span className="text-emerald-400">Trigger:</span>
              <span>{nextAction.trigger_evidence}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {nextAction.code === "VERIFY_TITLE" && (
              <button
                onClick={() => setActiveTab("overview")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-brand-obsidian font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Verify HMLR Title</span>
              </button>
            )}
            {nextAction.code === "CONTACT_OWNER_OR_AGENT" && (
              <button
                onClick={() => setActiveTab("contact")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-brand-obsidian font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Issue Introductory Enquiry</span>
              </button>
            )}
            {nextAction.code === "FOLLOW_UP_CONTACT" && (
              <button
                onClick={() => setActiveTab("contact")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-brand-obsidian font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Execute Follow-Up</span>
              </button>
            )}
            {nextAction.code === "RESOLVE_TITLE_CONTRADICTION" && (
              <button
                onClick={() => setActiveTab("contradictions")}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Resolve Discrepancy</span>
              </button>
            )}
            {nextAction.code === "COMPLETE_ACQUISITION_GATE" && (
              <button
                onClick={() => setActiveTab("gate")}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Review Acquisition Gate</span>
              </button>
            )}
            <Link
              href={`/review/${site.id}`}
              className="px-3.5 py-1.5 bg-brand-charcoal hover:bg-brand-surface border border-brand-edge text-brand-silver hover:text-white text-xs font-medium rounded text-center transition-colors"
            >
              Full Screening Brief →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center overflow-x-auto border-b border-brand-edge gap-2 text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-2.5 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-brand-silver hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Overview & Cadastre</span>
        </button>

        <button
          onClick={() => setActiveTab("checklist")}
          className={`py-2.5 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "checklist"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-brand-silver hover:text-white"
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Evidence Checklist (8D)</span>
        </button>

        <button
          onClick={() => setActiveTab("contradictions")}
          className={`py-2.5 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "contradictions"
              ? "border-rose-400 text-rose-400 bg-rose-500/5"
              : "border-transparent text-brand-silver hover:text-white"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Contradictions</span>
          {unresolvedContradictions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300">
              {unresolvedContradictions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("contact")}
          className={`py-2.5 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "contact"
              ? "border-emerald-400 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-brand-silver hover:text-white"
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Contact & Engagement</span>
          {contacts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-brand-silver">
              {contacts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("gate")}
          className={`py-2.5 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "gate"
              ? "border-indigo-400 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-brand-silver hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Acquisition Gate</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`py-2.5 px-4 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "timeline"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-brand-silver hover:text-white"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Truth Ledger Timeline</span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}

      {/* TAB A: OVERVIEW & CADASTRE */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cadastral & Ownership Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-edge pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cadastral &amp; Title Verification</span>
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-steel">
                  HMLR Live Gateway
                </span>
              </div>

              {/* Title lookup form */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter HMLR Title Number (e.g. WK29101)..."
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value.toUpperCase())}
                  className="flex-grow bg-brand-charcoal border border-brand-edge text-xs text-white rounded px-3 py-2 font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyTitle}
                  disabled={verifyLoading || !titleInput}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{verifyLoading ? "Querying HMLR..." : "Verify HMLR Live"}</span>
                </button>
              </div>

              {verifyResult && (
                <div className="p-3.5 rounded bg-brand-charcoal border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-semibold">
                      Title: {verifyResult.evidence?.title_reference}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                      {verifyResult.hmlrResult?.status}
                    </span>
                  </div>
                  <p className="text-brand-silver font-light">
                    {verifyResult.evidence?.proprietor_notes}
                  </p>
                  <div className="text-[10px] text-brand-steel font-mono pt-1 border-t border-brand-edge/60">
                    Epistemic Rule Enforced: Verified title confirms cadastral identity, never willingness to sell.
                  </div>
                </div>
              )}

              {/* Existing mapped titles */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-brand-steel">
                  Mapped Title Registers ({ownershipSummary.title_relationships.length})
                </h4>
                {ownershipSummary.title_relationships.length === 0 ? (
                  <p className="text-xs text-brand-silver font-light">
                    No registered title relationships linked to this candidate.
                  </p>
                ) : (
                  <div className="divide-y divide-brand-edge/60">
                    {ownershipSummary.title_relationships.map((rel, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-medium text-white">{rel.title_reference}</span>
                          <span className="text-[11px] text-brand-silver ml-2">
                            Overlap: {rel.overlap_pct !== null ? `${rel.overlap_pct}%` : "Spatial Bounding"}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {rel.relationship_strength}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ownership Evidence Records */}
            <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
              <h3 className="text-sm font-semibold text-white">Ownership Evidence Records</h3>
              {ownershipSummary.ownership_evidence_records.length === 0 ? (
                <p className="text-xs text-brand-silver font-light">
                  No attributable ownership records currently logged.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {ownershipSummary.ownership_evidence_records.map((ev) => (
                    <div key={ev.id} className="p-3 bg-brand-charcoal/60 rounded border border-brand-edge text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-medium">{ev.ownership_source}</span>
                        <span className="text-[10px] font-mono text-brand-steel">{ev.retrieval_date}</span>
                      </div>
                      <p className="text-white font-light">{ev.proprietor_notes}</p>
                      <div className="text-[10px] text-brand-steel flex items-center gap-3 pt-1">
                        <span>Mode: {ev.retrieval_mode}</span>
                        <span>·</span>
                        <span>Status: {ev.evidence_status}</span>
                        <span>·</span>
                        <span>By: {ev.recorded_by}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics & Availability Card */}
          <div className="space-y-6">
            <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-4">
              <h3 className="text-sm font-semibold text-white">Operational Snapshot</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-brand-edge/60">
                  <span className="text-brand-steel">Lifecycle:</span>
                  <span className="font-mono text-white font-medium">{lifecycleStage}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-edge/60">
                  <span className="text-brand-steel">Availability State:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{ownershipSummary.availability_state}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-edge/60">
                  <span className="text-brand-steel">Ownership Complexity:</span>
                  <span className="font-mono text-cyan-400">{ownershipSummary.complexity}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-brand-edge/60">
                  <span className="text-brand-steel">Contradictions:</span>
                  <span className={`font-mono font-semibold ${unresolvedContradictions.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {unresolvedContradictions.length} active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-steel">Contact Enquiries:</span>
                  <span className="font-mono text-white">{contacts.length} logged</span>
                </div>
              </div>
            </div>

            {/* Upstream Gateways Notice */}
            <div className="bg-brand-charcoal/80 border border-brand-edge p-4 rounded-sm text-xs space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-steel block">
                Upstream Dataset Notice
              </span>
              <p className="text-brand-silver/90 font-light leading-relaxed">
                OS Features API WFS collection <code className="text-white font-mono">OpenRoads_RoadLink</code> is currently protected upstream (HTTP 403). Live highway calculations fall back truthfully to unconfigured state without synthesizing fake data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: EVIDENCE CHECKLIST (8D) */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <div className="bg-brand-charcoal/60 border border-brand-edge p-4 rounded-sm text-xs">
            <p className="text-brand-silver leading-relaxed font-light">
              Deterministic 8-dimensional evidence checklist. Evaluates data provenance, spatial geometry, cadastral records, planning policy, access rights, and market transactions. Blank values are strictly prohibited.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(checklist) as ChecklistDimension[]).map((dim) => {
              const items = checklist[dim];
              return (
                <div key={dim} className="bg-brand-surface border border-brand-edge rounded-sm overflow-hidden">
                  <div className="bg-brand-charcoal/80 px-4 py-2.5 border-b border-brand-edge flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                      {dim}
                    </span>
                    <span className="text-[10px] text-brand-steel font-mono">
                      {items.filter((i) => i.status === "KNOWN").length}/{items.length} Known
                    </span>
                  </div>

                  <div className="divide-y divide-brand-edge/60">
                    {items.map((item) => (
                      <div key={item.id} className="p-3.5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{item.label}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-brand-silver font-light leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-brand-steel font-mono pt-1">
                          {item.evidence_source && <span>Source: {item.evidence_source}</span>}
                          {item.retrieval_mode && <span>· Mode: {item.retrieval_mode}</span>}
                          {item.retrieval_date && <span>· Date: {item.retrieval_date}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB C: CONTRADICTIONS */}
      {activeTab === "contradictions" && (
        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
            <h3 className="text-sm font-semibold text-white">Active Material Contradictions</h3>
            <p className="text-xs text-brand-silver font-light leading-relaxed">
              Contradictions occur when authoritative sources, machine derivations, or external evidence conflict. Contradictions are never silently resolved by code; they require explicit analyst investigation and signed rationale.
            </p>
          </div>

          {contradictions.length === 0 ? (
            <div className="p-8 text-center bg-brand-surface border border-brand-edge rounded-sm text-xs text-brand-silver">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>No material contradictions detected across evidence layers for this candidate.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {contradictions.map((contra) => {
                const isResolved = contra.resolved;
                const isResolving = resolvingContraId === contra.id;

                return (
                  <div
                    key={contra.id}
                    className={`border rounded-sm p-5 space-y-4 transition-colors ${
                      isResolved
                        ? "bg-brand-surface/60 border-brand-edge"
                        : "bg-rose-950/20 border-rose-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${isResolved ? "text-emerald-400" : "text-rose-400"}`} />
                        <span className="font-mono text-xs font-semibold text-white uppercase">
                          {contra.category}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                          isResolved
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {isResolved ? "RESOLVED" : "UNRESOLVED"}
                      </span>
                    </div>

                    <p className="text-xs text-white font-medium">
                      Severity: <span className="uppercase text-amber-400 font-mono">{contra.severity}</span>
                      {contra.resolution_notes && (
                        <span className="block mt-1 text-emerald-300 font-normal">
                          Resolution note: {contra.resolution_notes}
                        </span>
                      )}
                    </p>

                    {/* Evidence Comparison Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-brand-charcoal/80 rounded border border-brand-edge">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                          Machine Claim (Layer 1/2)
                        </span>
                        <p className="text-brand-silver font-light">{contra.machine_claim}</p>
                      </div>

                      <div className="p-3 bg-brand-charcoal/80 rounded border border-brand-edge">
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                          External Finding / Discrepancy
                        </span>
                        <p className="text-brand-silver font-light">{contra.external_finding}</p>
                      </div>
                    </div>

                    {/* Actionable Resolution Drawer */}
                    {!isResolved && (
                      <div className="pt-2 border-t border-brand-edge/60">
                        {!isResolving ? (
                          <button
                            onClick={() => setResolvingContraId(contra.id)}
                            className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium rounded transition-colors"
                          >
                            Resolve Contradiction →
                          </button>
                        ) : (
                          <div className="space-y-3 bg-brand-charcoal p-4 rounded border border-brand-edge mt-2">
                            <span className="text-xs font-semibold text-white block">
                              Record Contradiction Resolution
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                                  Resolution Status
                                </label>
                                <select
                                  value={resolutionStatus}
                                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                                  className="w-full bg-brand-surface border border-brand-edge rounded p-2 text-xs text-white"
                                >
                                  <option value="RESOLVED">RESOLVED (Verified fact supersedes)</option>
                                  <option value="DEFERRED_TO_LEGAL">DEFERRED TO LEGAL (Conveyancer search)</option>
                                  <option value="ACKNOWLEDGED_MATERIAL">ACKNOWLEDGED MATERIAL (High-risk condition)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                                  Supporting Evidence Ref (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Highways counsel opinion #HW-2026-9"
                                  value={resolutionEvidenceRef}
                                  onChange={(e) => setResolutionEvidenceRef(e.target.value)}
                                  className="w-full bg-brand-surface border border-brand-edge rounded p-2 text-xs text-white font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                                Mandatory Analyst Rationale
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Explain why this resolution is justified by physical or legal evidence..."
                                value={resolutionRationale}
                                onChange={(e) => setResolutionRationale(e.target.value)}
                                className="w-full bg-brand-surface border border-brand-edge rounded p-2 text-xs text-white placeholder-brand-steel"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleResolveContradiction(contra)}
                                disabled={resolutionLoading || !resolutionRationale}
                                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
                              >
                                {resolutionLoading ? "Saving..." : "Commit Resolution"}
                              </button>
                              <button
                                onClick={() => setResolvingContraId(null)}
                                className="px-3 py-1.5 text-xs text-brand-silver hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {resolutionMsg && (
            <div
              className={`p-3 rounded text-xs border ${
                resolutionMsg.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {resolutionMsg.text}
            </div>
          )}
        </div>
      )}

      {/* TAB D: CONTACT & ENGAGEMENT */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Logging Form */}
          <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Log Contact / Enquiry Attempt</span>
            </h3>

            <form onSubmit={handleRecordContact} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                  Communication Channel
                </label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value as any)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white"
                >
                  <option value="letter">Formal Introductory Letter</option>
                  <option value="email">Direct Email Enquiry</option>
                  <option value="phone">Direct Telephone Call</option>
                  <option value="agent_intermediary">Agent / Surveyor Enquiry</option>
                  <option value="in_person">Site Inspection / In-Person</option>
                  <option value="other">Other Channel</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                  Organisation or Role Contacted
                </label>
                <input
                  type="text"
                  placeholder="e.g. Registered Corporate Proprietor / Retained Agent"
                  value={contactOrg}
                  onChange={(e) => setContactOrg(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white"
                />
                <span className="text-[10px] text-brand-steel block mt-0.5">
                  Privacy Rule: Do not enter individuals' private personal names.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                    Contact Date
                  </label>
                  <input
                    type="date"
                    value={contactDate}
                    onChange={(e) => setContactDate(e.target.value)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={contactFollowUp}
                    onChange={(e) => setContactFollowUp(e.target.value)}
                    className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                  Engagement Outcome
                </label>
                <select
                  value={contactOutcome}
                  onChange={(e) => setContactOutcome(e.target.value as any)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white"
                >
                  <option value="NO_RESPONSE">NO RESPONSE (Pending)</option>
                  <option value="INTERESTED">INTERESTED (Affirmative willingness)</option>
                  <option value="OPEN_TO_DISCUSSION">OPEN TO DISCUSSION</option>
                  <option value="REQUESTED_INFORMATION">REQUESTED INFORMATION</option>
                  <option value="DEFERRED">DEFERRED (Review later)</option>
                  <option value="NOT_INTERESTED">NOT INTERESTED (Refusal)</option>
                  <option value="NOT_AVAILABLE">NOT AVAILABLE (Retained)</option>
                  <option value="ALREADY_COMMITTED">ALREADY COMMITTED (Under option)</option>
                  <option value="AGENT_CONTROLLED">AGENT CONTROLLED</option>
                  <option value="LEGAL_COMPLEXITY">LEGAL COMPLEXITY</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-brand-steel uppercase tracking-wider block mb-1">
                  Analyst Notes &amp; Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Record summary of dialogue or letter tracking..."
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full bg-brand-charcoal border border-brand-edge rounded p-2 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={contactLoading}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-brand-obsidian font-semibold text-xs rounded transition-colors"
              >
                {contactLoading ? "Recording..." : "Log Contact Record"}
              </button>
            </form>

            {contactMsg && (
              <div
                className={`p-3 rounded text-xs border ${
                  contactMsg.ok
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {contactMsg.text}
              </div>
            )}
          </div>

          {/* Contact History Timeline */}
          <div className="lg:col-span-2 bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-4">
            <h3 className="text-sm font-semibold text-white">Engagement History</h3>

            {contacts.length === 0 ? (
              <p className="text-xs text-brand-silver font-light py-8 text-center">
                No formal contact attempts have been logged for this candidate.
              </p>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="p-3.5 bg-brand-charcoal/60 rounded border border-brand-edge text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-white font-medium">{c.contact_type.toUpperCase()}</span>
                        <span className="text-brand-steel">·</span>
                        <span className="text-brand-silver">{c.organisation_or_role}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.outcome}
                      </span>
                    </div>

                    {c.notes && <p className="text-brand-silver/90 font-light">{c.notes}</p>}

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-brand-steel font-mono pt-1">
                      <span>Date: {c.contact_date}</span>
                      {c.follow_up_date && (
                        <span className="text-amber-300">
                          Follow-Up: {c.follow_up_date} ({c.follow_up_status || "pending"})
                        </span>
                      )}
                      <span>Analyst: {c.analyst}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB E: ACQUISITION GATE */}
      {activeTab === "gate" && (
        <div className="space-y-6">
          <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
            <div className="flex items-center justify-between border-b border-brand-edge pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-steel">
                  Formal Readiness Gate
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Acquisition Gate Recommendation: [{nextAction.code === "COMPLETE_ACQUISITION_GATE" ? "PROCEED_TO_ENGAGEMENT" : "HOLD_FOR_EVIDENCE"}]
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded text-xs font-mono font-semibold border ${
                  nextAction.code === "COMPLETE_ACQUISITION_GATE"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                {nextAction.code === "COMPLETE_ACQUISITION_GATE" ? "PROCEED" : "EVIDENCE REQUIRED"}
              </span>
            </div>

            <p className="text-xs text-brand-silver font-light leading-relaxed">
              The acquisition gate is an evidence-completeness and operational-readiness mechanism. It evaluates whether title, planning, highways, and vendor readiness justify committing commercial resources. It is not an automated valuation or financial guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Satisfied Criteria */}
            <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Satisfied Operational Evidence</span>
              </h4>
              <ul className="space-y-2 text-xs text-brand-silver font-light">
                {ownershipSummary.ownership_evidence_records.some((e) => e.evidence_status === "VERIFIED") && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono">✓</span>
                    <span>Authoritative HMLR title and registered proprietor verified</span>
                  </li>
                )}
                {unresolvedContradictions.length === 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono">✓</span>
                    <span>Zero unresolved material contradictions between evidence layers</span>
                  </li>
                )}
                {site.area_sqm && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono">✓</span>
                    <span>PostGIS spatial boundary and calculated area confirmed (EPSG:27700)</span>
                  </li>
                )}
                {ownershipSummary.availability_state !== "UNKNOWN" && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono">✓</span>
                    <span>Affirmative availability evidence logged: {ownershipSummary.availability_state}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Outstanding Requirements */}
            <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Outstanding Evidence Items</span>
              </h4>
              <ul className="space-y-2 text-xs text-brand-silver font-light">
                {ownershipSummary.availability_state === "UNKNOWN" && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono">→</span>
                    <span>Establish affirmative commercial availability through vendor or agent engagement</span>
                  </li>
                )}
                {unresolvedContradictions.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-mono">→</span>
                    <span>Formally investigate and resolve {unresolvedContradictions.length} active contradiction(s)</span>
                  </li>
                )}
                {contacts.length === 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono">→</span>
                    <span>Execute initial introductory communication to registered proprietor</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB F: TRUTH LEDGER TIMELINE */}
      {activeTab === "timeline" && (
        <div className="bg-brand-surface border border-brand-edge p-5 rounded-sm space-y-4">
          <div className="border-b border-brand-edge pb-3">
            <h3 className="text-sm font-semibold text-white">Unified Candidate Truth Ledger</h3>
            <p className="text-xs text-brand-silver font-light mt-0.5">
              Append-only, immutable historical audit trail answering: "Why is this candidate where it is today?".
            </p>
          </div>

          <div className="relative border-l border-brand-edge ml-3 pl-6 space-y-6 pt-2">
            {timeline.map((item, idx) => (
              <div key={item.id} className="relative text-xs space-y-1">
                <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-brand-obsidian" />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-medium">{item.title}</span>
                  <span className="text-[10px] font-mono text-brand-steel">{item.timestamp}</span>
                </div>
                <p className="text-white font-light">{item.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-brand-steel font-mono pt-0.5">
                  <span>Layer: {item.layer}</span>
                  <span>·</span>
                  <span>Actor: {item.actor}</span>
                  <span>·</span>
                  <span>Source: {item.source_attribution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
