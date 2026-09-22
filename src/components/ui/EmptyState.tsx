"use client";
import React from "react";
import { Button } from "./Button";
import { Search, AlertCircle, Loader2 } from "lucide-react";

interface EmptyStateProps {
  type?: "empty" | "loading" | "error";
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onRetry?: () => void;
  className?: string;
}

export function EmptyState({
  type = "empty",
  title,
  description,
  actionText,
  actionHref,
  onRetry,
  className = "",
}: EmptyStateProps) {
  const defaultTitle =
    type === "loading"
      ? "Checking opportunity pipeline…"
      : type === "error"
      ? "Opportunities are temporarily unavailable"
      : "Selected opportunities under active assessment";

  const defaultDescription =
    type === "loading"
      ? "Connecting to the property pipeline. Please wait a moment."
      : type === "error"
      ? "We couldn't retrieve the opportunity portfolio. Please try again shortly."
      : "We selectively pursue land and property where there is a credible opportunity to unlock additional value. Confidential pipeline sites will be surfaced here as formal public marketing commences.";

  return (
    <div
      className={`border border-dashed border-brand-edge rounded-sm p-10 sm:p-16 text-center max-w-2xl mx-auto bg-brand-surface/60 ${className}`}
    >
      <div className="w-12 h-12 rounded-sm border border-brand-edge bg-white flex items-center justify-center mx-auto mb-5 text-brand-silver">
        {type === "loading" && <Loader2 className="w-5 h-5 animate-spin text-brand-electric" />}
        {type === "error" && <AlertCircle className="w-5 h-5 text-amber-500" />}
        {type === "empty" && <Search className="w-5 h-5 text-brand-electric" />}
      </div>

      <h3 className="text-xl sm:text-2xl font-light text-brand-graphite mb-3">
        {title || defaultTitle}
      </h3>

      <p className="text-sm sm:text-base text-brand-silver font-light max-w-lg mx-auto leading-relaxed mb-6">
        {description || defaultDescription}
      </p>

      {type === "error" && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}

      {type === "empty" && actionText && actionHref && (
        <Button href={actionHref} variant="primary" size="md" showArrow>
          {actionText}
        </Button>
      )}
    </div>
  );
}
