"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SITE_CONFIG } from "@/lib/constants";
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
      const message = err instanceof Error ? err.message : "Submission failed. Please check your connection and try again.";
      setStatus("error");
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 sm:pt-28">
      {/* Header */}
      <section className="bg-brand-void text-white py-16 sm:py-20 border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-dark mb-4">Get In Touch</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-6">
              Contact Entire UK
            </h1>
            <p className="text-base sm:text-lg font-light text-brand-mist/85 leading-relaxed">
              For general business enquiries, professional advisory discussions, media communications
              or Entire ecosystem coordination.
            </p>
          </div>
        </Container>
      </section>

      {/* Redirect Notice for Opportunities */}
      <section className="bg-brand-surface py-5 border-b border-brand-edge">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-light text-brand-graphite">
            <p>
              <strong>Looking to submit land or a development opportunity?</strong> Please use our dedicated intake portal for expedited planning and commercial review.
            </p>
            <Link
              href="/submit"
              className="text-brand-electric font-medium hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Go to Opportunity Intake</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Direct Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-2xl font-light text-brand-graphite mb-2">
                  Head Office &amp; Regional Hubs
                </h2>
                <p className="text-sm font-light text-brand-silver leading-relaxed">
                  Our acquisitions team travels nationwide to inspect prospective land parcels and buildings.
                </p>
              </div>

              <div className="space-y-6 text-sm font-light text-brand-graphite">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-brand-silver block mb-1">
                      Direct Email
                    </span>
                    <a
                      href={`mailto:${SITE_CONFIG.email}`}
                      className="text-brand-graphite hover:text-brand-electric font-medium transition-colors"
                    >
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-brand-silver block mb-1">
                      Telephone
                    </span>
                    <a
                      href={`tel:${SITE_CONFIG.phone.replace(/[^0-9+]/g, "")}`}
                      className="text-brand-graphite hover:text-brand-electric font-medium transition-colors"
                    >
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-sm bg-brand-surface border border-brand-edge flex items-center justify-center text-brand-electric shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-brand-silver block mb-1">
                      Coverage
                    </span>
                    <span className="text-brand-graphite block">
                      {SITE_CONFIG.location}
                    </span>
                    <span className="text-xs text-brand-silver">
                      Active across England, Scotland &amp; Wales
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-sm bg-brand-surface border border-brand-edge space-y-2">
                <h3 className="text-sm font-medium text-brand-graphite">
                  Entire Ecosystem Coordination
                </h3>
                <p className="text-xs font-light text-brand-silver leading-relaxed">
                  For facilities management, engineering maintenance and building operations inquiries, please contact our sister company at{" "}
                  <a
                    href={SITE_CONFIG.sisterCompanyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-electric hover:underline"
                  >
                    EntireFM.com
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* General Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-sm bg-white border border-brand-edge">
                {status === "success" ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-light text-brand-graphite">
                      Message Received
                    </h3>
                    <p className="text-sm font-light text-brand-silver max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Entire UK. We have received your message and a member of our team will respond in due course.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStatus("idle");
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          subject: "General Enquiry",
                          message: "",
                        });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-normal text-brand-graphite mb-1">
                        Send a Message
                      </h2>
                      <p className="text-xs font-light text-brand-silver">
                        Fields marked with an asterisk (<span className="text-rose-500">*</span>) are required.
                      </p>
                    </div>

                    {status === "error" && (
                      <div className="p-4 rounded-sm bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-medium">We couldn't submit your message</strong>
                          <span>{errorMessage}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-xs font-medium uppercase tracking-wider text-brand-graphite mb-1.5"
                        >
                          Your Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm border border-brand-edge text-sm font-light text-brand-graphite focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-colors"
                          placeholder="Full Name"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-medium uppercase tracking-wider text-brand-graphite mb-1.5"
                        >
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm border border-brand-edge text-sm font-light text-brand-graphite focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-colors"
                          placeholder="name@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs font-medium uppercase tracking-wider text-brand-graphite mb-1.5"
                        >
                          Telephone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm border border-brand-edge text-sm font-light text-brand-graphite focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-colors"
                          placeholder="+44 7... (optional)"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-xs font-medium uppercase tracking-wider text-brand-graphite mb-1.5"
                        >
                          Nature of Inquiry <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-sm border border-brand-edge text-sm font-light text-brand-graphite bg-white focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-colors"
                        >
                          <option value="General Enquiry">General Enquiry</option>
                          <option value="Professional / Advisory">Professional / Advisory</option>
                          <option value="Partnership Enquiry">Partnership Enquiry</option>
                          <option value="Media & Press">Media &amp; Press</option>
                          <option value="Ecosystem Coordination">Ecosystem Coordination</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-xs font-medium uppercase tracking-wider text-brand-graphite mb-1.5"
                      >
                        Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-sm border border-brand-edge text-sm font-light text-brand-graphite focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-colors resize-y"
                        placeholder="Please write your inquiry here..."
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting ? "Sending Message…" : "Send Message"}
                    </Button>
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
