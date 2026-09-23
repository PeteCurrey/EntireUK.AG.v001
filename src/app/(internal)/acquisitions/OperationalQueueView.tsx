"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  OperationalCandidateSummary,
  OperationalQueueGroup,
} from "@/lib/land-radar/types";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileSearch,
  Filter,
  Layers,
  PhoneCall,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface OperationalQueueViewProps {
  candidates: OperationalCandidateSummary[];
}

export function OperationalQueueView({ candidates }: OperationalQueueViewProps) {
  const [activeTab, setActiveTab] = useState<OperationalQueueGroup | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCandidates = candidates.filter((c) => {
    const matchesTab =
      activeTab === "ALL" || c.queue_groups.includes(activeTab);
    const matchesSearch =
      searchTerm === "" ||
      c.site_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.next_action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.site_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getLifecycleColor = (stage: string) => {
    if (stage.startsWith("REJECTED_")) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (stage === "ACQUIRED" || stage === "ACQUISITION_AGREED")
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (stage === "CONTROLLED" || stage === "UNDER_NEGOTIATION")
      return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    if (stage === "CONTACTED" || stage === "INVESTIGATING")
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    return "text-slate-300 bg-slate-800/60 border-slate-700";
  };

  const tabs: { id: OperationalQueueGroup | "ALL"; label: string; count: number }[] = [
    { id: "ALL", label: "All Opportunities", count: candidates.length },
    {
      id: "ACTION_REQUIRED",
      label: "Action Required",
      count: candidates.filter((c) => c.queue_groups.includes("ACTION_REQUIRED")).length,
    },
    {
      id: "FOLLOW_UPS_DUE",
      label: "Follow-Ups Due",
      count: candidates.filter((c) => c.queue_groups.includes("FOLLOW_UPS_DUE")).length,
    },
    {
      id: "WAITING_FOR_RESPONSE",
      label: "Waiting Response",
      count: candidates.filter((c) => c.queue_groups.includes("WAITING_FOR_RESPONSE")).length,
    },
    {
      id: "CONTRADICTIONS",
      label: "Contradictions",
      count: candidates.filter((c) => c.queue_groups.includes("CONTRADICTIONS")).length,
    },
    {
      id: "EVIDENCE_MISSING",
      label: "Missing Evidence",
      count: candidates.filter((c) => c.queue_groups.includes("EVIDENCE_MISSING")).length,
    },
    {
      id: "READY_FOR_GATE",
      label: "Ready for Gate",
      count: candidates.filter((c) => c.queue_groups.includes("READY_FOR_GATE")).length,
    },
    {
      id: "ON_HOLD",
      label: "On Hold",
      count: candidates.filter((c) => c.queue_groups.includes("ON_HOLD")).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Horizontal Tab Navigation */}
        <div className="flex items-center overflow-x-auto pb-2 sm:pb-0 gap-1.5 scrollbar-thin">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                    : "bg-brand-charcoal/60 text-brand-silver hover:text-white border border-brand-edge hover:bg-brand-surface"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-brand-steel"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search candidate, location, action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface border border-brand-edge rounded-sm px-3 py-1.5 text-xs text-white placeholder-brand-steel focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Candidate Queue Table */}
      <div className="border border-brand-edge rounded-sm bg-brand-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-brand-edge bg-brand-charcoal/80 text-[11px] font-mono uppercase tracking-wider text-brand-steel">
                <th className="py-3 px-4">Opportunity Identity</th>
                <th className="py-3 px-4">Lifecycle & Priority</th>
                <th className="py-3 px-4">Deterministic Next Action</th>
                <th className="py-3 px-4">Evidence Foundation</th>
                <th className="py-3 px-4">Contact & Follow-Up</th>
                <th className="py-3 px-4 text-right">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-edge/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-silver">
                    No acquisition opportunities found matching the selected queue filter.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const areaHa = c.area_sqm ? (c.area_sqm / 10000).toFixed(2) : null;
                  return (
                    <tr
                      key={c.site_id}
                      className="hover:bg-brand-charcoal/40 transition-colors group"
                    >
                      {/* Identity */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-medium text-white text-xs group-hover:text-emerald-400 transition-colors">
                          {c.site_reference}
                        </div>
                        <div className="text-[11px] text-brand-silver mt-0.5">
                          {c.location}
                        </div>
                        <div className="text-[10px] text-brand-steel mt-1 flex items-center gap-1.5">
                          <span>{c.site_type}</span>
                          {areaHa && (
                            <>
                              <span>·</span>
                              <span>{areaHa} ha</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Lifecycle & Priority */}
                      <td className="py-3.5 px-4 align-top">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm border ${getLifecycleColor(
                            c.lifecycle_stage
                          )}`}
                        >
                          {c.lifecycle_stage.replace(/_/g, " ")}
                        </span>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-mono text-brand-steel">Priority:</span>
                          <span
                            className={`text-[10px] font-mono font-semibold ${
                              c.priority_band === "HIGH"
                                ? "text-emerald-400"
                                : c.priority_band === "MEDIUM"
                                ? "text-cyan-400"
                                : "text-slate-400"
                            }`}
                          >
                            {c.priority_band}
                          </span>
                        </div>
                      </td>

                      {/* Deterministic Next Action */}
                      <td className="py-3.5 px-4 align-top max-w-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${getPriorityBadgeClass(
                              c.next_action.priority
                            )}`}
                          >
                            {c.next_action.code}
                          </span>
                        </div>
                        <div className="font-medium text-white text-xs leading-snug">
                          {c.next_action.label}
                        </div>
                        <div className="text-[11px] text-brand-silver/90 mt-1 line-clamp-2 leading-relaxed font-light">
                          {c.next_action.rationale}
                        </div>
                      </td>

                      {/* Evidence Foundation */}
                      <td className="py-3.5 px-4 align-top space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-brand-steel">Completeness:</span>
                          <span className="font-mono text-cyan-400 font-medium">
                            {c.evidence_completeness_pct}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-brand-steel">Ownership:</span>
                          <span
                            className={`font-mono text-[10px] ${
                              c.ownership_status === "VERIFIED"
                                ? "text-emerald-400"
                                : c.ownership_status === "SUPPORTED"
                                ? "text-cyan-400"
                                : "text-amber-400"
                            }`}
                          >
                            {c.ownership_status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-brand-steel">Availability:</span>
                          <span
                            className={`font-mono text-[10px] ${
                              c.availability_state === "AVAILABLE"
                                ? "text-emerald-400"
                                : c.availability_state === "UNDER_DISCUSSION"
                                ? "text-indigo-400"
                                : "text-slate-400"
                            }`}
                          >
                            {c.availability_state}
                          </span>
                        </div>
                        {c.unresolved_contradictions > 0 && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{c.unresolved_contradictions} contradiction(s)</span>
                          </div>
                        )}
                      </td>

                      {/* Contact & Follow-up */}
                      <td className="py-3.5 px-4 align-top">
                        {c.latest_contact ? (
                          <div>
                            <div className="text-[11px] font-medium text-white flex items-center gap-1">
                              <PhoneCall className="w-3 h-3 text-emerald-400" />
                              <span>{c.latest_contact.outcome}</span>
                            </div>
                            <div className="text-[10px] text-brand-steel mt-0.5">
                              {c.latest_contact.contact_date} via {c.latest_contact.contact_type}
                            </div>
                            {c.follow_up_due_date && (
                              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-300 font-mono">
                                <Clock className="w-3 h-3" />
                                <span>Due: {c.follow_up_due_date}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-brand-steel font-light">
                            No contact logged
                          </span>
                        )}
                      </td>

                      {/* Operational Action */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <Link
                          href={`/acquisitions/${c.site_id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-brand-obsidian font-semibold text-xs rounded transition-colors"
                        >
                          <span>Execute</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
