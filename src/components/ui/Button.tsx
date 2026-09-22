"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  showArrow?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  external?: boolean;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  showArrow = false,
  type = "button",
  disabled = false,
  onClick,
  external = false,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-normal tracking-wide transition-all duration-300 ease-brand rounded-sm cursor-pointer disabled:opacity-50 disabled:pointer-events-none group select-none";

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-brand-electric hover:bg-blue-600 text-white shadow-sm border border-brand-electric/30 hover:border-brand-electric hover:shadow-[0_8px_24px_-6px_rgba(37,99,235,0.4)]",
    secondary:
      "bg-brand-carbon text-white border border-brand-edge-dark hover:border-brand-electric/70 hover:bg-brand-void hover:shadow-md",
    outline:
      "bg-transparent text-brand-graphite border border-brand-edge hover:border-brand-electric/60 hover:bg-brand-surface",
    ghost:
      "bg-white/[0.04] text-brand-mist hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/[0.08]",
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 shrink-0" />
      )}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
          onClick={onClick}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClasses} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
