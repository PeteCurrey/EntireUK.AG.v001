import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { generatePageMetadata } from "@/lib/metadata";
import { ArrowUpRight, ShieldCheck, Scale, Compass, CheckCircle2 } from "lucide-react";

export const metadata = generatePageMetadata({
  title: "About Us",
  description:
    "Entire UK is a dedicated land acquisition and property development company operating as a sister company to EntireFM within the Entire built-environment ecosystem.",
  path: "/about",
});

export default function AboutPage() {
  const values = [
    {
      title: "Commercial Discretion",
      desc: "Property transactions are sensitive. All land reviews, owner consultations and financial appraisals are handled under strict confidentiality from the very first conversation.",
    },
    {
      title: "Substance Over Speculation",
      desc: "We do not tie up land without a clear path to deliverability. We only enter contracts where planning rationale, technical viability and capital funding have been robustly verified.",
    },
    {
      title: "Direct Principal Engagement",
      desc: "Landowners and introducing professionals deal directly with the principals responsible for investment and planning decisions, ensuring fast answers and decisive execution.",
    },
    {
      title: "Long-Term Value Creation",
      desc: "Rather than seeking quick intermediation fees, our focus is on unlocking lasting value in the built environment through disciplined planning and high-quality development.",
    },
  ];

  return (
    <div className="pt-24 sm:pt-28">
      {/* Page Hero */}
      <section className="bg-brand-void text-white py-16 sm:py-24 border-b border-brand-edge-dark">
        <Container>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-dark mb-4">About Entire UK</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-6">
              A disciplined UK property <br />
              <span className="font-normal">development company.</span>
            </h1>
            <p className="text-base sm:text-xl font-light text-brand-mist/85 leading-relaxed">
              Entire UK identifies, sources and assesses land and property opportunities
              with development potential, working to unlock that value through planning,
              acquisition, funding and development.
            </p>
          </div>
        </Container>
      </section>

      {/* Corporate Philosophy */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow">Our Philosophy</span>
              <h2 className="text-3xl sm:text-4xl font-extralight text-brand-graphite tracking-tight leading-tight">
                Built on genuine property expertise, enhanced by intelligence.
              </h2>
              <p className="text-base font-light text-brand-silver leading-relaxed">
                The UK property sector has historically relied on informal networks, local rumor and reactive marketing. While relationships remain vital, the landscape has grown substantially more intricate: local planning authority 5-year housing land supply deficits, evolving Permitted Development legislation, biodiversity net gain mandates and fluctuating build economics.
              </p>
              <p className="text-base font-light text-brand-silver leading-relaxed">
                Entire UK was established to bring systematic rigor to the opportunity search. We combine sophisticated data modeling with experienced property professionals to spot development opportunities where others see only complexity.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="p-8 sm:p-10 rounded-sm bg-brand-surface border border-brand-edge space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-electric">
                  The Entire Ecosystem
                </span>
                <h3 className="text-2xl font-light text-brand-graphite">
                  Two Companies. One Unified Built-Environment Vision.
                </h3>
                <p className="text-sm font-light text-brand-silver leading-relaxed">
                  Entire UK operates alongside <strong>EntireFM</strong> within the wider Entire group. This deliberate structure provides deep built-environment capabilities across the asset lifecycle:
                </p>

                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-white border border-brand-edge rounded-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-brand-graphite text-sm">EntireFM</span>
                      <a
                        href="https://www.entirefm.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-electric hover:underline inline-flex items-center gap-1"
                      >
                        Visit entirefm.com <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs font-light text-brand-silver leading-relaxed">
                      Nationwide facilities management, mechanical &amp; electrical engineering, statutory compliance, and built-environment operations across commercial, logistics and public sectors.
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-brand-edge rounded-sm">
                    <span className="font-medium text-brand-graphite text-sm block mb-1">Entire UK</span>
                    <p className="text-xs font-light text-brand-silver leading-relaxed">
                      Land sourcing, development viability, planning promotion, capital structuring and development delivery.
                    </p>
                  </div>
                </div>

                <p className="text-xs font-light text-brand-silver italic">
                  This synergy ensures that every development scheme we deliver is designed with operational longevity, energy efficiency and commercial management in mind from day one.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Core Principles */}
      <Section surface={true}>
        <Container>
          <SectionHeader
            eyebrow="Operating Principles"
            title="How We Conduct Business"
            description="Our reputation in the UK property market is built on transparency, prompt execution and commercial discipline."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {values.map((val, idx) => (
              <div
                key={idx}
                className="p-8 rounded-sm bg-white border border-brand-edge space-y-3"
              >
                <div className="text-xs font-mono text-brand-electric">
                  Principle 0{idx + 1}
                </div>
                <h3 className="text-xl font-medium text-brand-graphite">
                  {val.title}
                </h3>
                <p className="text-sm font-light text-brand-silver leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm font-light text-brand-silver mb-4">
              Interested in collaborating, partnering or submitting a site?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button href="/submit" variant="primary" size="md" showArrow>
                Submit an Opportunity
              </Button>
              <Button href="/contact" variant="outline" size="md">
                Contact Entire UK
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
