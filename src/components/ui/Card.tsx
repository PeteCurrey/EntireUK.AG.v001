import React from "react";

interface CardProps {
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
  hoverEffect?: boolean;
}

export function Card({
  children,
  dark = false,
  className = "",
  hoverEffect = true,
}: CardProps) {
  const baseClasses = dark
    ? "bg-brand-carbon border-brand-edge-dark text-white"
    : "bg-white border-brand-edge text-brand-graphite";

  const hoverClasses = hoverEffect
    ? dark
      ? "hover:border-brand-electric/50 hover:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.5)] transition-all duration-400 ease-brand"
      : "hover:border-brand-electric/40 hover:shadow-[0_16px_36px_-12px_rgba(11,18,32,0.07)] transition-all duration-400 ease-brand"
    : "";

  return (
    <div
      className={`border rounded-sm p-6 sm:p-8 relative ${baseClasses} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}
