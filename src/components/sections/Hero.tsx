import React from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowDownRight, Compass, Layers, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-28 pb-20 bg-brand-void text-white overflow-hidden">
      {/* Architectural subtle background grid and ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Subtle architectural gradient glow */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-electric/10 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-indigo/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-sm bg-white/[0.04] border border-white/10 text-brand-mist/90 text-xs font-light tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-electric animate-pulse" />
              <span>UK Property Acquisition &amp; Development</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight leading-[1.08] text-white">
              We find the opportunities <br className="hidden sm:inline" />
              <span className="font-normal text-white">others overlook.</span>
            </h1>

            <p className="text-lg sm:text-xl font-light text-brand-mist/85 max-w-2xl leading-relaxed">
              Entire UK identifies land and property with development potential,
              combining property expertise, planning intelligence and technology to uncover
              opportunities and unlock lasting commercial value.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button href="/submit" variant="primary" size="lg" showArrow>
                Submit an Opportunity
              </Button>
              <Button href="/approach" variant="ghost" size="lg">
                How We Work
              </Button>
            </div>

            {/* Direct Audience Shortcuts */}
            <div className="pt-8 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-light text-brand-mist/70">
              <a
                href="/submit/land"
                className="group flex items-center justify-between p-3 rounded-sm bg-white/[0.02] border border-white/[0.06] hover:border-brand-electric/50 hover:bg-white/[0.05] transition-all"
              >
                <div>
                  <span className="block text-white font-normal text-sm">Landowners</span>
                  <span className="text-[11px] text-brand-mist/60">Submit acreage or parcels</span>
                </div>
                <ArrowDownRight className="w-4 h-4 text-brand-electric group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="/submit/property"
                className="group flex items-center justify-between p-3 rounded-sm bg-white/[0.02] border border-white/[0.06] hover:border-brand-electric/50 hover:bg-white/[0.05] transition-all"
              >
                <div>
                  <span className="block text-white font-normal text-sm">Property Owners</span>
                  <span className="text-[11px] text-brand-mist/60">Repurposing &amp; conversion</span>
                </div>
                <ArrowDownRight className="w-4 h-4 text-brand-electric group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="/submit/opportunity"
                className="group flex items-center justify-between p-3 rounded-sm bg-white/[0.02] border border-white/[0.06] hover:border-brand-electric/50 hover:bg-white/[0.05] transition-all"
              >
                <div>
                  <span className="block text-white font-normal text-sm">Site Introducers</span>
                  <span className="text-[11px] text-brand-mist/60">Agents &amp; surveyors</span>
                </div>
                <ArrowDownRight className="w-4 h-4 text-brand-electric group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Architectural Framing Panel */}
          <div className="lg:col-span-4">
            <div className="p-8 rounded-sm bg-brand-carbon/90 border border-brand-edge-dark backdrop-blur-sm space-y-6 relative">
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

              <div className="pt-4 border-t border-white/[0.08] text-[11px] text-brand-mist/50 font-light">
                Part of the Entire built-environment ecosystem.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
