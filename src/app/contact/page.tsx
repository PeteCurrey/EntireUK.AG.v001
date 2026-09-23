"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SITE_CONFIG } from "@/lib/constants";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trees,
  Building2,
  Briefcase,
  Coins,
  HelpCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    channel: "landowner",
    subject: "General Enquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    trackEvent({ name: "cta_contact_clicked", properties: { location: "contact_form" } });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: "general_contact",
          data: formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to submit inquiry at this time. Please try again or reach out directly.");
      }

      setStatus("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Submission failed. Please check your connection and try again.";
      setStatus("error");
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactRoutes = [
    {
      id: "landowner",
      title: "Landowners",
      icon: Trees,
      desc: "For freehold owners of greenfield, agricultural, or edge-of-settlement acreage.",
      actionText: "Submit Land For Appraisal",
      actionHref: "/submit/land",
    },
    {
      id: "property",
      title: "Building & Property Owners",
      icon: Building2,
      desc: "For commercial, industrial, or residential asset owners exploring conversion or sale.",
      actionText: "Submit Property For Review",
      actionHref: "/submit/property",
    },
    {
      id: "agents",
      title: "Commercial Agents & Surveyors",
      icon: Briefcase,
      desc: "For property professionals introducing off-market sites or representing vendors.",
      actionText: "Submit Off-Market Opportunity",
      actionHref: "/submit/opportunity",
    },
    {
      id: "partners",
      title: "Consultants & Capital Partners",
      icon: Coins,
      desc: "For planning consultants, architects, senior lenders, and institutional investors.",
      actionText: "Explore Development Partnership",
      actionHref: "/submit/partner",
    },
  ];

  return (
    <div className="pt-24 sm:pt-28">
      {/* Editorial Header */}
      <section className="bg-brand-void text-white py-16 sm:py-24 border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-dark mb-4">Start a Conversation</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-6">
              START A CONVERSATION.
            </h1>
            <p className="text-base sm:text-xl font-light text-brand-mist/85 leading-relaxed">
              Whether you own land, represent a property vendor, or wish to explore a planning or capital partnership, our principals are directly accessible.
            </p>
          </div>
        </Container>
      </section>

      {/* 4 Distinct Contact Pathways */}
      <section className="bg-brand-surface py-12 sm:py-16 border-b border-brand-edge">
        <Container>
          <div className="max-w-3xl mb-8 space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-electric font-medium">
              Targeted Contact Pathways
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-brand-graphite">
              Choose the right route for your inquiry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactRoutes.map((route, idx) => {
              const Icon = route.icon;
              return (
                <div
                  key={route.id}
                  className="p-6 rounded-sm bg-white border border-brand-edge flex flex-col justify-between h-full space-y-4 card-spatial"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-medium text-brand-graphite">
                      {route.title}
                    </h3>
                    <p className="text-xs font-light text-brand-silver leading-relaxed">
                      {route.desc}
                    </p>
                  </div>
                  <Link
                    href={route.actionHref}
                    className="text-xs font-mono uppercase tracking-wider text-brand-electric hover:underline inline-flex items-center gap-1 font-medium pt-2 border-t border-brand-edge/60"
                  >
                    <span>{route.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Main Form and Direct Contact Details */}
      <section className="py-16 sm:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Direct Contact & Submission Guidance */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="eyebrow mb-2">Direct Contact</span>
                <h2 className="text-2xl sm:text-3xl font-light text-brand-graphite">
                  Head Office &amp; Nationwide Hubs
                </h2>
                <p className="text-xs sm:text-sm font-light text-brand-silver leading-relaxed mt-2">
                  Our acquisitions and development teams operate nationwide to inspect prospective land parcels and commercial assets.
                </p>
              </div>

              <div className="space-y-4 text-xs font-light text-brand-graphite">
                <div className="p-4 rounded-sm bg-brand-surface border border-brand-edge flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm bg-white border border-brand-edge flex items-center justify-center text-brand-electric shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono uppercase text-[10px] text-brand-silver block mb-0.5">
                      Direct Inquiries
                    </span>
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="font-medium text-brand-graphite hover:text-brand-electric text-sm"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-sm bg-brand-surface border border-brand-edge flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm bg-white border border-brand-edge flex items-center justify-center text-brand-electric shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono uppercase text-[10px] text-brand-silver block mb-0.5">
                      Direct Telephone
                    </span>
                    <a
                      href={`tel:${SITE_CONFIG.phone.replace(/[^0-9+]/g, "")}`}
                      className="font-medium text-brand-graphite hover:text-brand-electric text-sm"
                    >
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-sm bg-brand-surface border border-brand-edge flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm bg-white border border-brand-edge flex items-center justify-center text-brand-electric shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono uppercase text-[10px] text-brand-silver block mb-0.5">
                      Head Office &amp; Operations
                    </span>
                    <span className="font-medium text-brand-graphite text-sm block">
                      {SITE_CONFIG.location}
                    </span>
                    <span className="text-[11px] text-brand-silver">
                      Operating across England, Scotland &amp; Wales
                    </span>
                  </div>
                </div>
              </div>

              {/* Useful Submission Guidance Box */}
              <div className="p-6 rounded-sm bg-brand-surface border border-brand-edge space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brand-electric font-medium">
                  <FileText className="w-4 h-4" />
                  <span>Submission Guidance</span>
                </div>
                <h4 className="text-sm font-medium text-brand-graphite">
                  What Information Makes an Inquiry Useful?
                </h4>
                <p className="text-xs font-light text-brand-silver leading-relaxed">
                  When introducing a potential development site, having the following details accelerates our preliminary appraisal:
                </p>
                <ul className="space-y-1.5 text-xs font-light text-brand-graphite">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Exact site address, postcode, or What3Words reference.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Approximate site area (acreage or square metres).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Current physical use and tenancy status (vacant or let).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Known planning history or Local Plan reference if applicable.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Direct Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-sm bg-brand-surface border border-brand-edge shadow-sm">
                <span className="eyebrow mb-2">Message Us Directly</span>
                <h3 className="text-2xl font-light text-brand-graphite mb-2">
                  Send a General Business Enquiry
                </h3>
                <p className="text-xs sm:text-sm font-light text-brand-silver mb-8 leading-relaxed">
                  Fill in the details below. Our team reviews all communications promptly and in total confidence.
                </p>

                {status === "success" ? (
                  <div className="p-8 rounded-sm bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-lg font-medium text-emerald-950">
                      Message Received
                    </h4>
                    <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Entire UK. A member of our acquisitions team will review your message and reply via email or phone.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus("idle");
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          channel: "landowner",
                          subject: "General Enquiry",
                          message: "",
                        });
                      }}
                      className="text-xs text-emerald-700 hover:underline font-mono uppercase tracking-wider pt-2 block"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {status === "error" && (
                      <div className="p-4 rounded-sm bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-brand-silver mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-brand-edge text-sm text-brand-graphite focus:outline-none focus:border-brand-electric"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-brand-silver mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-brand-edge text-sm text-brand-graphite focus:outline-none focus:border-brand-electric"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-brand-silver mb-1.5">
                          Contact Telephone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-brand-edge text-sm text-brand-graphite focus:outline-none focus:border-brand-electric"
                          placeholder="+44 7123 456789"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-brand-silver mb-1.5">
                          Inquiry Type
                        </label>
                        <select
                          value={formData.channel}
                          onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-brand-edge text-sm text-brand-graphite focus:outline-none focus:border-brand-electric"
                        >
                          <option value="landowner">Landowner Inquiry</option>
                          <option value="property_owner">Building / Property Owner</option>
                          <option value="agent">Commercial Agent / Introducer</option>
                          <option value="partner">Consultant / Capital Partner</option>
                          <option value="general">General Business Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-brand-silver mb-1.5">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-brand-edge text-sm text-brand-graphite focus:outline-none focus:border-brand-electric"
                        placeholder="Subject of your message"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-brand-silver mb-1.5">
                        Message &amp; Site Details *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-brand-edge text-sm text-brand-graphite focus:outline-none focus:border-brand-electric"
                        placeholder="Please describe your site, query, or partnership inquiry..."
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                        showArrow
                        className="w-full sm:w-auto"
                      >
                        {isSubmitting ? "Sending Inquiry..." : "Submit Message"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
