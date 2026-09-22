import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "brand" | "outline";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantClasses = {
    neutral: "bg-brand-surface text-brand-silver border-brand-edge",
    brand: "bg-brand-electric/10 text-brand-electric border-brand-electric/25",
    outline: "bg-transparent text-brand-mist border-white/15",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium tracking-wider uppercase border rounded-sm ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
