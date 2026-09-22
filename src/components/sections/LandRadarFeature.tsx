import React from "react";
import { Container } from "../ui/Container";
import { Section } from "../ui/Section";
import { Button } from "../ui/Button";
import { Radar, ShieldAlert, FileSearch, TrendingUp, Map, BarChart3 } from "lucide-react";

export function LandRadarFeature() {
  const radarDimensions = [
    { icon: Map, title: "Geospatial & Parcels", text: "Cadastral boundaries, title extents, access points and topography." },
    { icon: FileSearch, title: "Planning History", text: "Decisions, appeals, local plan allocations and SHLAA submissions." },
    { icon: ShieldAlert, title: "Constraint Layering", text: "Green belt, AONB, SSSI, conservation areas, listed curtilages and flood zones." },
    { icon: TrendingUp, title: "Market Signals", text: "Transaction velocity, demographic shifts, commercial yield benchmarks." },
    { icon: BarChart3, title: "Development Economics", text: "Residual land valuation modelling, build costs and gross development value." },
    { icon: Radar, title: "Continuous Radar", text: "Algorithmic scanning for newly deregulated or newly unblocked parcels." },
  ];

  return (
    <Section dark={true} id="land-radar">
      <Container>
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="mb-4">
            <span className="eyebrow eyebrow-dark">Proprietary Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white leading-tight">
            We are building the intelligence layer behind the opportunity search.
          </h2>
          <p className="mt-4 text-base sm:text-lg font-light text-brand-mist/80 leading-relaxed">
            Land Radar is our internal intelligence platform, engineered to continuously scan,
            correlate and evaluate millions of data points across the UK property landscape.
            It serves as proprietary operational infrastructure — not a consumer software tool.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {radarDimensions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-sm bg-brand-carbon border border-brand-edge-dark hover:border-brand-electric/50 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-sm bg-white/[0.04] border border-white/10 flex items-center justify-center text-brand-electric mb-5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-medium text-white mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm font-light text-brand-mist/70 leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-mist/60 font-mono">
              Operational Status
            </span>
            <p className="text-sm font-light text-white mt-1">
              Active internal data ingestion across key English &amp; Scottish planning authorities.
            </p>
          </div>
          <Button href="/technology" variant="primary" size="md" showArrow>
            Explore Land Radar
          </Button>
        </div>
      </Container>
    </Section>
  );
}
