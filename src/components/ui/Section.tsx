import React from "react";

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  dark?: boolean;
  surface?: boolean;
}

export function Section({
  children,
  id,
  className = "",
  dark = false,
  surface = false,
}: SectionProps) {
  let bgClass = "bg-white text-brand-graphite";
  if (dark) {
    bgClass = "on-dark bg-brand-graphite text-white";
  } else if (surface) {
    bgClass = "bg-brand-surface text-brand-graphite border-y border-brand-edge";
  }

  return (
    <section
      id={id}
      className={`py-20 sm:py-28 lg:py-32 relative transition-colors ${bgClass} ${className}`}
    >
      {children}
    </section>
  );
}
