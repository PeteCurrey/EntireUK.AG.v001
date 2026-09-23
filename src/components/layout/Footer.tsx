import React from "react";
import Link from "next/link";
import { BrandLogo } from "../ui/BrandMark";
import { FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="on-dark bg-brand-void border-t border-brand-edge-dark text-white pt-16 sm:pt-20 pb-12">
      <div className="max-w-8xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-white/[0.08]">
          {/* Company identity & thesis */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" aria-label="Entire UK Home">
              <BrandLogo onDark={true} />
            </Link>
            <p className="text-sm font-light text-brand-mist/80 max-w-sm leading-relaxed">
              Entire UK identifies, sources and assesses land and property opportunities with
              development potential, working to unlock commercial value through planning,
              acquisition, funding and development.
            </p>
            <div className="pt-2 text-xs font-light text-brand-mist/60 space-y-1">
              <p>Sister company to EntireFM within the Entire ecosystem.</p>
              <p>Operating across England, Scotland and Wales.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-widest text-brand-mist/50">
              Overview &amp; Method
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-brand-mist/80">
              {FOOTER_LINKS.company.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors block"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Acquisition Criteria & Workstation */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-widest text-brand-mist/50">
              Acquisition &amp; Radar
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-brand-mist/80">
              {FOOTER_LINKS.acquisition.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Submission Gateways */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-widest text-brand-mist/50">
              Opportunity Intake
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-brand-mist/80">
              {FOOTER_LINKS.submissions.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-medium uppercase tracking-widest text-brand-mist/50">
              Contact &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-sm font-light text-brand-mist/80">
              {FOOTER_LINKS.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-brand-mist/50">
          <p>
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-center sm:text-right max-w-md">
            Entire UK assesses land and property opportunities for development potential.
            Information provided on this site does not constitute financial or investment advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
