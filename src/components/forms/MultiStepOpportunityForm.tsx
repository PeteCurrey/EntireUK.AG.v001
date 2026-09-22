"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";
import { FileUploadDropzone, UploadedFileInfo } from "./FileUploadDropzone";
import { Button } from "../ui/Button";
import { Check, ArrowRight, ArrowLeft, AlertCircle, Loader2, Save } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export type SubmissionCategory = "land" | "property" | "opportunity" | "partner";

interface MultiStepOpportunityFormProps {
  category: SubmissionCategory;
  categoryTitle: string;
  categorySubtitle: string;
}

export function MultiStepOpportunityForm({
  category,
  categoryTitle,
  categorySubtitle,
}: MultiStepOpportunityFormProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = category === "partner" ? 4 : 5;

  const [formData, setFormData] = useState({
    // Step 1: Property / Land
    address: "",
    postcode: "",
    siteSize: "",
    siteSizeUnknown: false,
    currentUse: "",
    // Step 2: Opportunity & Planning
    opportunityPotential: "",
    planningStatus: "unknown",
    planningReference: "",
    currentlyMarketed: "no",
    askingPrice: "",
    askingPriceUnknown: false,
    ownershipStatus: category === "land" ? "sole_owner" : category === "property" ? "owner" : "third_party",
    // Step 3: Partner Specific (if partner)
    organisationType: "developer",
    proposedCollaboration: "",
    // Step 4: Your Details
    fullName: "",
    organisation: "",
    email: "",
    telephone: "",
    notes: "",
  });

  const [files, setFiles] = useState<UploadedFileInfo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [sessionSavedNotice, setSessionSavedNotice] = useState(false);

  // Restore session data on mount if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`euk_form_${category}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
        setSessionSavedNotice(true);
      }
    } catch {
      // Ignore sessionStorage issues
    }

    trackEvent({
      name: "submission_started",
      properties: { submission_type: category },
    });
  }, [category]);

  // Save to session storage as user edits
  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        sessionStorage.setItem(`euk_form_${category}`, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Validation logic per step
  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (category === "partner") {
      if (step === 1) {
        if (!formData.proposedCollaboration.trim()) {
          stepErrors.proposedCollaboration = "Please describe the nature of your interest or partnership.";
        }
      } else if (step === 2) {
        if (!formData.fullName.trim()) stepErrors.fullName = "Please enter your full name.";
        if (!formData.email.trim() || !formData.email.includes("@")) {
          stepErrors.email = "Please enter a valid email address.";
        }
      }
    } else {
      if (step === 1) {
        if (!formData.postcode.trim() && !formData.address.trim()) {
          stepErrors.postcode = "Please enter a valid UK postcode or property address.";
        }
        if (!formData.currentUse.trim()) {
          stepErrors.currentUse = "Please state or select the current use.";
        }
      } else if (step === 2) {
        if (!formData.opportunityPotential.trim()) {
          stepErrors.opportunityPotential = "Please briefly explain what development potential you believe exists.";
        }
      } else if (step === 4) {
        if (!formData.fullName.trim()) stepErrors.fullName = "Please enter your name.";
        if (!formData.email.trim() || !formData.email.includes("@")) {
          stepErrors.email = "Please enter a valid email address.";
        }
        if (!formData.telephone.trim()) {
          stepErrors.telephone = "Please provide a telephone number for direct contact.";
        }
      }
    }

    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) {
      const firstField = Object.keys(stepErrors)[0];
      trackEvent({
        name: "submission_validation_error",
        properties: { submission_type: category, step, field_name: firstField },
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      trackEvent({
        name: "submission_step_completed",
        properties: { submission_type: category, step: currentStep, step_name: `Step_${currentStep}` },
      });
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setIsDuplicate(false);

    trackEvent({
      name: "submission_attempted",
      properties: { submission_type: category },
    });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: category,
          data: {
            ...formData,
            files_count: files.length,
            files: files.map((f) => ({ name: f.name, size: f.size })),
          },
        }),
      });

      const responseData = await res.json();

      if (res.status === 409) {
        setIsDuplicate(true);
        setSubmitError(responseData.error);
        trackEvent({ name: "submission_failed", properties: { submission_type: category, error_code: "DUPLICATE" } });
        return;
      }

      if (!res.ok) {
        throw new Error(responseData.error || "Submission could not be completed.");
      }

      // Success! Clear session draft and redirect
      try {
        sessionStorage.removeItem(`euk_form_${category}`);
      } catch {
        // Ignore
      }

      trackEvent({
        name: "submission_completed",
        properties: { submission_type: category, submission_id: responseData.submission_id },
      });

      router.push(`/submit/success?type=${category}&ref=${responseData.submission_id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't complete your submission. We haven't been able to confirm that your information was received. Please check your connection and try again.";
      setSubmitError(message);
      trackEvent({
        name: "submission_failed",
        properties: { submission_type: category, error_code: "NETWORK_ERROR" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step names
  const stepTitles =
    category === "partner"
      ? ["1. Partnership Scope", "2. Your Details", "3. Supporting Info", "4. Review & Submit"]
      : ["1. Site Location", "2. Potential", "3. Documents", "4. Your Details", "5. Review & Submit"];

  return (
    <div className="bg-white border border-brand-edge rounded-sm p-6 sm:p-10 lg:p-12 shadow-sm">
      {/* Form Header */}
      <div className="border-b border-brand-edge pb-6 mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-electric">
            {categoryTitle}
          </span>
          <span className="text-xs font-light text-brand-silver">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-brand-graphite">
          {categorySubtitle}
        </h2>

        {sessionSavedNotice && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-silver bg-brand-surface px-2.5 py-1 rounded-sm border border-brand-edge">
            <Save className="w-3.5 h-3.5 text-brand-electric" />
            <span>Resumed from local session draft</span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 text-[11px] font-mono mb-2">
          {stepTitles.map((title, idx) => (
            <div
              key={idx}
              className={`truncate ${
                currentStep === idx + 1
                  ? "text-brand-electric font-medium"
                  : currentStep > idx + 1
                  ? "text-brand-graphite font-normal"
                  : "text-brand-silver font-light"
              }`}
            >
              {title}
            </div>
          ))}
        </div>
        <div className="w-full bg-brand-edge h-1 rounded-full overflow-hidden">
          <div
            className="bg-brand-electric h-full transition-all duration-300 ease-brand"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Submission Error Banner */}
      {submitError && (
        <div
          role="alert"
          className={`p-5 rounded-sm mb-8 flex items-start gap-3 text-sm leading-relaxed ${
            isDuplicate
              ? "bg-amber-50 border border-amber-200 text-amber-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-medium">
              {isDuplicate
                ? "Potential Duplicate Submission"
                : "We couldn't complete your submission"}
            </strong>
            <p className="text-xs font-light">{submitError}</p>
            {!isDuplicate && (
              <p className="text-xs font-normal pt-1">
                Your entered data has been preserved. Please check your connection and press Submit again.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Form Steps */}
      <form onSubmit={handleSubmit} noValidate>
        {/* STEP 1: Property / Land Location (or Partner Scope) */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {category === "partner" ? (
              <>
                <SelectField
                  id="organisationType"
                  name="organisationType"
                  label="Organisation Type"
                  required
                  value={formData.organisationType}
                  onChange={(e) => updateField("organisationType", e.target.value)}
                  options={[
                    { value: "developer", label: "Property Developer / Housebuilder" },
                    { value: "planning_consultancy", label: "Planning Consultancy / Architect" },
                    { value: "institutional_capital", label: "Institutional Capital / Fund" },
                    { value: "senior_lender", label: "Senior Debt / Development Finance Provider" },
                    { value: "family_office", label: "Family Office / Private Investor" },
                    { value: "contractor", label: "Main Building Contractor" },
                    { value: "other", label: "Other Professional Service" },
                  ]}
                />

                <FormField
                  id="proposedCollaboration"
                  name="proposedCollaboration"
                  label="Collaboration Focus"
                  type="textarea"
                  rows={4}
                  required
                  value={formData.proposedCollaboration}
                  onChange={(e) => updateField("proposedCollaboration", e.target.value)}
                  placeholder="Describe your capabilities, geographic preference, or how you would like to partner with Entire UK..."
                  error={errors.proposedCollaboration}
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    id="postcode"
                    name="postcode"
                    label="UK Postcode"
                    required
                    placeholder="e.g. OX1 2JD"
                    value={formData.postcode}
                    onChange={(e) => updateField("postcode", e.target.value.toUpperCase())}
                    error={errors.postcode}
                    helpText="Enter the full or partial postcode of the parcel."
                  />

                  <FormField
                    id="address"
                    name="address"
                    label="Property / Site Address"
                    required
                    placeholder="e.g. Land adjacent to Mill Lane"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    error={errors.address}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    id="siteSize"
                    name="siteSize"
                    label="Approximate Site Size"
                    placeholder={formData.siteSizeUnknown ? "Unknown" : "e.g. 4.5 acres or 15,000 sq ft"}
                    value={formData.siteSizeUnknown ? "" : formData.siteSize}
                    onChange={(e) => updateField("siteSize", e.target.value)}
                    optional
                    helpText="Approximate acreage, hectares or square footage."
                  />

                  <div className="pt-6 sm:pt-7">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-brand-graphite font-light select-none">
                      <input
                        type="checkbox"
                        checked={formData.siteSizeUnknown}
                        onChange={(e) => {
                          updateField("siteSizeUnknown", e.target.checked);
                          if (e.target.checked) updateField("siteSize", "Unknown");
                        }}
                        className="rounded-sm border-brand-edge text-brand-electric focus:ring-brand-electric"
                      />
                      <span>I don&apos;t know the exact site size</span>
                    </label>
                  </div>
                </div>

                <SelectField
                  id="currentUse"
                  name="currentUse"
                  label="Current Land / Property Use"
                  required
                  value={formData.currentUse}
                  onChange={(e) => updateField("currentUse", e.target.value)}
                  error={errors.currentUse}
                  options={[
                    { value: "", label: "Select current use..." },
                    { value: "agricultural", label: "Agricultural / Pasture / Arable Land" },
                    { value: "commercial_office", label: "Commercial Office Building" },
                    { value: "industrial_warehouse", label: "Industrial / Warehouse / Trade Yard" },
                    { value: "retail_leisure", label: "Retail / Leisure / High Street Property" },
                    { value: "brownfield_redundant", label: "Brownfield / Redundant Yard" },
                    { value: "residential_plot", label: "Large Residential Plot / Garden Land" },
                    { value: "other", label: "Other / Mixed Use" },
                    { value: "unknown", label: "I don't know / Unclassified" },
                  ]}
                />
              </>
            )}
          </div>
        )}

        {/* STEP 2: Opportunity Assessment */}
        {currentStep === 2 && category !== "partner" && (
          <div className="space-y-6">
            <FormField
              id="opportunityPotential"
              name="opportunityPotential"
              label="Development Potential"
              type="textarea"
              rows={4}
              required
              value={formData.opportunityPotential}
              onChange={(e) => updateField("opportunityPotential", e.target.value)}
              placeholder="What do you believe could be possible here? (e.g. Residential scheme, conversion to flats, commercial expansion, strategic promotion...)"
              error={errors.opportunityPotential}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                id="planningStatus"
                name="planningStatus"
                label="Planning History"
                value={formData.planningStatus}
                onChange={(e) => updateField("planningStatus", e.target.value)}
                options={[
                  { value: "unknown", label: "I don't know" },
                  { value: "none", label: "No previous applications submitted" },
                  { value: "lapsed", label: "Historical / Lapsed planning permission" },
                  { value: "refused", label: "Previously refused permission" },
                  { value: "active", label: "Current planning permission exists" },
                  { value: "allocated", label: "Allocated in draft or adopted Local Plan" },
                ]}
              />

              <FormField
                id="planningReference"
                name="planningReference"
                label="Planning Reference Number"
                optional
                placeholder="e.g. 23/01492/OUT (if known)"
                value={formData.planningReference}
                onChange={(e) => updateField("planningReference", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                id="currentlyMarketed"
                name="currentlyMarketed"
                label="Is the site currently marketed?"
                value={formData.currentlyMarketed}
                onChange={(e) => updateField("currentlyMarketed", e.target.value)}
                options={[
                  { value: "no", label: "No — Completely off-market / direct" },
                  { value: "yes_open", label: "Yes — Openly marketed by agent" },
                  { value: "quietly", label: "Discreetly / Quietly marketed" },
                  { value: "unknown", label: "I don't know" },
                ]}
              />

              <FormField
                id="askingPrice"
                name="askingPrice"
                label="Guide / Asking Price (if applicable)"
                optional
                placeholder={formData.askingPriceUnknown ? "Open to discussion" : "e.g. £750,000 or Unconditional"}
                value={formData.askingPriceUnknown ? "" : formData.askingPrice}
                onChange={(e) => updateField("askingPrice", e.target.value)}
                helpText="Leave blank or select 'open to discussion' if unset."
              />
            </div>

            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-brand-graphite font-light select-none">
                <input
                  type="checkbox"
                  checked={formData.askingPriceUnknown}
                  onChange={(e) => {
                    updateField("askingPriceUnknown", e.target.checked);
                    if (e.target.checked) updateField("askingPrice", "Open to discussion");
                  }}
                  className="rounded-sm border-brand-edge text-brand-electric focus:ring-brand-electric"
                />
                <span>Price is open to discussion / dependent on planning review</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: Supporting Documents (or Documents step) */}
        {((currentStep === 3 && category !== "partner") ||
          (currentStep === 3 && category === "partner")) && (
          <div className="space-y-6">
            <FileUploadDropzone
              onFilesChanged={(newFiles) => setFiles(newFiles)}
              maxFiles={5}
              maxSizeMb={15}
            />
            <p className="text-xs font-light text-brand-silver leading-relaxed">
              Uploading documents now helps us review the site faster. If you do not have documents to hand, you can skip this step and proceed to the next section.
            </p>
          </div>
        )}

        {/* STEP 4 (or STEP 2 for Partner): Contact Details */}
        {((currentStep === 4 && category !== "partner") ||
          (currentStep === 2 && category === "partner")) && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="fullName"
                name="fullName"
                label="Full Name"
                required
                placeholder="First & Last Name"
                autoComplete="name"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                error={errors.fullName}
              />

              <FormField
                id="organisation"
                name="organisation"
                label="Organisation / Company"
                optional
                placeholder="Company or Estate name"
                value={formData.organisation}
                onChange={(e) => updateField("organisation", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="email"
                name="email"
                label="Email Address"
                type="email"
                required
                placeholder="your.name@example.com"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
              />

              <FormField
                id="telephone"
                name="telephone"
                label="Telephone Number"
                type="tel"
                required
                placeholder="+44 7..."
                autoComplete="tel"
                value={formData.telephone}
                onChange={(e) => updateField("telephone", e.target.value)}
                error={errors.telephone}
              />
            </div>

            {category !== "partner" && (
              <SelectField
                id="ownershipStatus"
                name="ownershipStatus"
                label="Your Relationship to the Site"
                value={formData.ownershipStatus}
                onChange={(e) => updateField("ownershipStatus", e.target.value)}
                options={[
                  { value: "sole_owner", label: "Sole Freehold Owner" },
                  { value: "joint_owner", label: "Joint Freehold Owner / Family Estate" },
                  { value: "introducing_agent", label: "Retained Commercial Agent / Surveyor" },
                  { value: "third_party", label: "Third-Party Introducer / Site Finder" },
                  { value: "prospective_buyer", label: "Under Option / Prospective Buyer" },
                  { value: "other", label: "Other" },
                ]}
              />
            )}
          </div>
        )}

        {/* STEP 5 (or STEP 4 for Partner): Review & Final Submit */}
        {currentStep === totalSteps && (
          <div className="space-y-6">
            <div className="p-6 rounded-sm bg-brand-surface border border-brand-edge space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-brand-graphite border-b border-brand-edge pb-2">
                Submission Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light">
                {category !== "partner" ? (
                  <>
                    <div>
                      <span className="text-brand-silver block">Location:</span>
                      <span className="font-medium text-brand-graphite">
                        {formData.address || "Address not provided"}, {formData.postcode}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-silver block">Current Use:</span>
                      <span className="font-medium text-brand-graphite">
                        {formData.currentUse || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-silver block">Site Size:</span>
                      <span className="font-medium text-brand-graphite">
                        {formData.siteSize || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-silver block">Market Status:</span>
                      <span className="font-medium text-brand-graphite">
                        {formData.currentlyMarketed}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-brand-silver block">Organisation Type:</span>
                      <span className="font-medium text-brand-graphite">
                        {formData.organisationType}
                      </span>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-brand-silver block">Contact Person:</span>
                  <span className="font-medium text-brand-graphite">
                    {formData.fullName} ({formData.email})
                  </span>
                </div>
                <div>
                  <span className="text-brand-silver block">Attached Documents:</span>
                  <span className="font-medium text-brand-graphite">
                    {files.length > 0 ? `${files.length} file(s) attached` : "No files attached"}
                  </span>
                </div>
              </div>
            </div>

            <FormField
              id="notes"
              name="notes"
              label="Additional Confidential Notes (Optional)"
              type="textarea"
              rows={3}
              optional
              placeholder="Any specific constraints, timings, or considerations our acquisitions team should know..."
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />

            <div className="p-4 rounded-sm bg-brand-surface/80 border border-brand-edge text-xs font-light text-brand-silver space-y-1.5">
              <p className="font-medium text-brand-graphite">Important Disclaimers:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Submissions are held in strict commercial confidence.</li>
                <li>Submission of information does not constitute an offer to purchase, an acceptance of the opportunity, or a commitment to proceed.</li>
                <li>We verify all data against planning and title records prior to progressing.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation & Submission Controls */}
        <div className="pt-8 mt-8 border-t border-brand-edge flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              showArrow
            >
              Continue to Step {currentStep + 1}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting your opportunity…
                </>
              ) : (
                "Submit Opportunity"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
