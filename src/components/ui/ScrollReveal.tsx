"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  threshold = 0.12,
  as: Component = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setIsRevealed(true);
        return;
      }
    }

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              setTimeout(() => {
                setIsRevealed(true);
              }, delayMs);
            } else {
              setIsRevealed(true);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [delayMs, threshold]);

  const Tag = Component as any;

  return (
    <Tag
      ref={ref}
      className={`euk-reveal ${isRevealed ? "is-revealed" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
