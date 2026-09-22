import React from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  dark?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  dark = false,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`max-w-3xl mb-12 sm:mb-16 ${
        centered ? "mx-auto text-center" : ""
      } ${className}`}
    >
      {eyebrow && (
        <div className="mb-4">
          <span className={`eyebrow ${dark ? "eyebrow-dark" : ""}`}>{eyebrow}</span>
        </div>
      )}
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight leading-[1.15] ${
          dark ? "text-white" : "text-brand-graphite"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base sm:text-lg font-light leading-relaxed ${
            dark ? "text-brand-mist/80" : "text-brand-silver"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
