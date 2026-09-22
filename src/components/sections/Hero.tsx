"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowDownRight, Compass, Layers, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [motionAllowed, setMotionAllowed] = useState(true);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== "undefined") {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isFinePointer = window.matchMedia("(pointer: fine)").matches;
      setMotionAllowed(!prefersReduced && isFinePointer);
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!motionAllowed || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    // Clamp between -1 and 1
    const clampedX = Math.max(-1, Math.min(1, x));
    const clampedY = Math.max(-1, Math.min(1, y));
    setPointerOffset({ x: clampedX, y: clampedY });
  };

  const handlePointerLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  return (
    <section
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[92vh] flex items-center pt-28 pb-20 bg-brand-void text-white overflow-hidden"
    >
      {/* 0. Aerial Land Radar Hero Background with Parallax */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out scale-105"
        style={{
          transform: motionAllowed
            ? `translate3d(${pointerOffset.x * -8}px, ${pointerOffset.y * -8}px, 0)`
            : "none",
        }}
        aria-hidden="true"
      >
        <Image
          src="/images/hero-bg.jpg"
          alt="UK land parcels and development potential visualised with spatial intelligence"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 mix-blend-screen"
        />
        {/* Layered vignette & readability gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-void via-brand-void/85 to-brand-void/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-void/70 via-transparent to-brand-void" />
      </div>

      {/* 1. Spatial Background Grid — Responds with subtle inverted parallax (-4px) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 transition-transform duration-300 ease-out"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: motionAllowed
            ? `translate3d(${pointerOffset.x * -4}px, ${pointerOffset.y * -4}px, 0)`
            : "none",
        }}
        aria-hidden="true"
      />

      {/* 2. Ambient Lighting Glows — Parallax shift (10-14px) */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-electric/10 blur-[130px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: motionAllowed
            ? `translate3d(${pointerOffset.x * 14}px, ${pointerOffset.y * 14}px, 0)`
            : "none",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-indigo/10 blur-[140px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: motionAllowed
            ? `translate3d(${pointerOffset.x * -10}px, ${pointerOffset.y * -10}px, 0)`
            : "none",
        }}
        aria-hidden="true"
      />

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Entrance Sequence: Eyebrow */}
            <div className="animate-hero-eyebrow">
              <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-sm bg-white/[0.04] border border-white/10 text-brand-mist/90 text-xs font-light tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-electric animate-pulse" />
                <span>UK Property Acquisition &amp; Development</span>
              </div>
            </div>

            {/* Entrance Sequence: Headline with Mask Reveal */}
            <div className="animate-hero-headline overflow-hidden">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight leading-[1.08] text-white">
                We find the opportunities <br className="hidden sm:inline" />
                <span className="font-normal text-white">others overlook.</span>
              </h1>
            </div>

            {/* Entrance Sequence: Supporting Text */}
            <div className="animate-hero-copy">
              <p className="text-lg sm:text-xl font-light text-brand-mist/85 max-w-2xl leading-relaxed">
                Entire UK identifies land and property with development potential,
                combining proprietary Land Radar spatial intelligence, planning analytics, and experienced human due diligence to unlock lasting commercial value.
              </p>
            </div>

            {/* Entrance Sequence: CTAs */}
            <div className="animate-hero-cta flex flex-wrap items-center gap-4 pt-2">
              <Button href="/submit" variant="primary" size="lg" showArrow>
                Submit an Opportunity
              </Button>
              <Button href="/approach" variant="ghost" size="lg">
                Our 7-Step Model
              </Button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-light tracking-wide text-brand-mist/75 hover:text-white px-3 py-2 rounded-sm border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.02] transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Land Radar Workstation →</span>
              </Link>
            </div>

            {/* Entrance Sequence: Direct Audience Shortcuts */}
            <div className="animate-hero-shortcuts pt-8 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-light text-brand-mist/70">
              <a
                href="/submit/land"
                className="group flex items-center justify-between p-3.5 rounded-sm bg-white/[0.02] border border-white/[0.06] hover:border-brand-electric/50 hover:bg-white/[0.05] transition-all"
              >
                <div>
                  <span className="block text-white font-normal text-sm">Landowners</span>
                  <span className="text-[11px] text-brand-mist/60">Submit acreage or parcels</span>
                </div>
                <ArrowDownRight className="w-4 h-4 text-brand-electric group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="/submit/property"
                className="group flex items-center justify-between p-3.5 rounded-sm bg-white/[0.02] border border-white/[0.06] hover:border-brand-electric/50 hover:bg-white/[0.05] transition-all"
              >
                <div>
                  <span className="block text-white font-normal text-sm">Property Owners</span>
                  <span className="text-[11px] text-brand-mist/60">Repurposing &amp; conversion</span>
                </div>
                <ArrowDownRight className="w-4 h-4 text-brand-electric group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="/submit/opportunity"
                className="group flex items-center justify-between p-3.5 rounded-sm bg-white/[0.02] border border-white/[0.06] hover:border-brand-electric/50 hover:bg-white/[0.05] transition-all"
              >
                <div>
                  <span className="block text-white font-normal text-sm">Site Introducers</span>
                  <span className="text-[11px] text-brand-mist/60">Agents &amp; surveyors</span>
                </div>
                <ArrowDownRight className="w-4 h-4 text-brand-electric group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Architectural Framing Panel — Parallax depth offset (+5px) */}
          <div className="lg:col-span-4 animate-hero-panel">
            <div
              className="p-8 rounded-sm bg-brand-carbon/90 border border-brand-edge-dark backdrop-blur-sm space-y-6 relative transition-transform duration-300 ease-out shadow-2xl shadow-black/40"
              style={{
                transform: motionAllowed
                  ? `translate3d(${pointerOffset.x * 6}px, ${pointerOffset.y * 6}px, 0)`
                  : "none",
              }}
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-mist/60">
                  Acquisition Framework
                </span>
                <span className="text-xs text-brand-electric font-medium">UK Nationwide</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-sm bg-white/[0.04] border border-white/10 text-brand-electric shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Disciplined Sourcing</h3>
                    <p className="text-xs text-brand-mist/70 font-light mt-0.5 leading-relaxed">
                      Assessing planning context, density potential, local plans and physical constraints.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-sm bg-white/[0.04] border border-white/10 text-brand-electric shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Value Engineering</h3>
                    <p className="text-xs text-brand-mist/70 font-light mt-0.5 leading-relaxed">
                      Structuring unconditionals, promotion agreements, option structures and JV models.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-sm bg-white/[0.04] border border-white/10 text-brand-electric shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Execution Viability</h3>
                    <p className="text-xs text-brand-mist/70 font-light mt-0.5 leading-relaxed">
                      Aligning experienced planning teams, institutional development capital and delivery partners.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-brand-mist/50 font-light">
                <span>Part of the Entire built-environment ecosystem.</span>
                <Link href="/technology" className="text-brand-electric hover:underline flex items-center gap-0.5">
                  <span>Technology</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
