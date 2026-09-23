import React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  children?: React.ReactNode;
  containerSize?: "narrow" | "default" | "wide";
  badge?: string;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  children,
  containerSize = "default",
  badge,
}: PageHeroProps) {
  return (
    <section className="relative min-h-[92vh] min-h-[92dvh] flex items-center pt-28 pb-20 bg-brand-void text-white overflow-hidden">
      {/* Background Image with Layered Atmospheric Gradient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 filter contrast-[1.05] brightness-90"
        />
        {/* Layered vignette and readability gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-void/90 via-brand-void/65 to-brand-void/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-void via-transparent to-brand-void/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.12)_0%,transparent_60%)]" />
      </div>

      <Container size={containerSize} className="relative z-10">
        <div className="max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow eyebrow-dark">{eyebrow}</span>
            {badge && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-sm border border-cyan-500/25">
                {badge}
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight leading-[1.08] text-white">
            {title}
            {subtitle && (
              <>
                <br />
                <span className="font-normal text-white">{subtitle}</span>
              </>
            )}
          </h1>

          {description && (
            <p className="text-base sm:text-xl font-light text-brand-mist/85 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}

          {children && <div className="pt-4">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
