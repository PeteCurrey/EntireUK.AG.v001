"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "../ui/BrandMark";
import { Button } from "../ui/Button";
import { NAV_LINKS, PRIMARY_CTA } from "@/lib/constants";
import { Menu, X, Compass, Lock } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-brand-void/90 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/20"
            : "bg-brand-void/70 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-8xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="flex h-[72px] items-center justify-between">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center group"
              aria-label="Entire UK Home"
            >
              <BrandLogo onDark={true} />
            </Link>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden lg:flex items-center gap-8"
              aria-label="Primary Navigation"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm tracking-wide transition-colors py-1 relative ${
                      isActive
                        ? "text-white font-normal"
                        : "text-brand-mist/75 hover:text-white font-light"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-px bg-brand-electric" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTAs: Distinct separation between Public Submission and Internal Platform */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-xs font-light tracking-wider uppercase text-brand-mist/80 hover:text-white px-3 py-2 rounded-sm border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.03] transition-all flex items-center gap-2"
                title="Internal Land Radar intelligence platform"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Land Radar Login</span>
              </Link>

              <Button
                href={PRIMARY_CTA.href}
                variant="primary"
                size="sm"
                showArrow
                onClick={() =>
                  trackEvent({
                    name: "cta_submit_opportunity_clicked",
                    properties: { location: "header" },
                  })
                }
              >
                {PRIMARY_CTA.label}
              </Button>
            </div>

            {/* Mobile Menu Controls */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/dashboard"
                className="text-xs text-brand-mist hover:text-white px-2.5 py-1.5 rounded-sm border border-white/10 flex items-center gap-1.5"
                title="Land Radar Login"
              >
                <Compass className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px] font-mono">Radar</span>
              </Link>

              <Button
                href={PRIMARY_CTA.href}
                variant="primary"
                size="sm"
                className="text-xs px-3 py-1.5"
                onClick={() =>
                  trackEvent({
                    name: "cta_submit_opportunity_clicked",
                    properties: { location: "header_mobile" },
                  })
                }
              >
                Submit
              </Button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-white/12 text-brand-mist hover:text-white hover:border-white/30 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`fixed inset-0 z-40 bg-brand-void pt-[72px] transition-all duration-300 lg:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
      >
        <div className="flex flex-col h-full justify-between p-6 sm:p-8 overflow-y-auto">
          <nav className="space-y-4" aria-label="Mobile Links">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-3 text-xl border-b border-white/[0.06] transition-colors ${
                    isActive ? "text-white font-normal" : "text-brand-mist/80 font-light"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/[0.08] space-y-4">
            {/* Dedicated Internal Platform Entry */}
            <div className="p-3.5 rounded-sm bg-brand-carbon border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-medium text-white block">Entire UK Land Radar</span>
                  <span className="text-[10px] text-brand-silver font-light">Internal intelligence workstation</span>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="px-2.5 py-1 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 rounded-sm hover:bg-cyan-500/20"
              >
                Sign In →
              </Link>
            </div>

            {/* Submission shortcuts */}
            <p className="text-xs uppercase tracking-widest text-brand-mist/50 pt-2">
              Submit Land &amp; Property
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/submit/land"
                className="p-3 rounded-sm bg-brand-carbon/60 border border-brand-edge-dark flex items-center justify-between text-xs text-white hover:border-brand-electric/60"
              >
                <span>I own land</span>
                <span className="text-[11px] text-brand-electric font-medium">Submit Land →</span>
              </Link>
              <Link
                href="/submit/property"
                className="p-3 rounded-sm bg-brand-carbon/60 border border-brand-edge-dark flex items-center justify-between text-xs text-white hover:border-brand-electric/60"
              >
                <span>I own a property</span>
                <span className="text-[11px] text-brand-electric font-medium">Submit Property →</span>
              </Link>
              <Link
                href="/submit/opportunity"
                className="p-3 rounded-sm bg-brand-carbon/60 border border-brand-edge-dark flex items-center justify-between text-xs text-white hover:border-brand-electric/60"
              >
                <span>I know of an opportunity</span>
                <span className="text-[11px] text-brand-electric font-medium">Submit Opportunity →</span>
              </Link>
              <Link
                href="/submit/partner"
                className="p-3 rounded-sm bg-brand-carbon/60 border border-brand-edge-dark flex items-center justify-between text-xs text-white hover:border-brand-electric/60"
              >
                <span>Professional / Capital Partner</span>
                <span className="text-[11px] text-brand-mist font-medium">Partner With Us →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
