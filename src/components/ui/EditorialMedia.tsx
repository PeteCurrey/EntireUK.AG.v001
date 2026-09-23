import React from "react";
import Image from "next/image";

interface EditorialMediaProps {
  variant?: "full" | "split" | "dual" | "inset";
  primaryImage: {
    src: string;
    alt: string;
    caption?: string;
    badge?: string;
    aspectRatio?: "video" | "square" | "tall" | "wide";
  };
  secondaryImage?: {
    src: string;
    alt: string;
    caption?: string;
    badge?: string;
  };
  title?: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EditorialMedia({
  variant = "split",
  primaryImage,
  secondaryImage,
  title,
  subtitle,
  description,
  children,
  className = "",
}: EditorialMediaProps) {
  const aspectClasses = {
    video: "aspect-[16/9]",
    square: "aspect-square",
    tall: "aspect-[4/5]",
    wide: "aspect-[21/9]",
  };

  const primaryAspect = aspectClasses[primaryImage.aspectRatio || "video"];

  if (variant === "full") {
    return (
      <div className={`relative overflow-hidden rounded-sm border border-brand-edge bg-brand-void ${className}`}>
        <div className={`relative w-full ${primaryAspect}`}>
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 1280px"
            className="object-cover object-center filter brightness-95 contrast-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-void/80 via-transparent to-brand-void/20" />
          
          {(title || subtitle || primaryImage.badge) && (
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white z-10 flex flex-col justify-end">
              {primaryImage.badge && (
                <span className="inline-block text-[11px] font-mono uppercase tracking-widest text-brand-electric bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/15 w-fit mb-3">
                  {primaryImage.badge}
                </span>
              )}
              {title && (
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extralight tracking-tight text-white mb-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm sm:text-base font-light text-brand-mist/85 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
        {primaryImage.caption && (
          <div className="p-4 bg-brand-carbon/90 border-t border-brand-edge-dark text-xs text-brand-mist/60 font-light flex items-center justify-between">
            <span>{primaryImage.caption}</span>
            <span className="font-mono text-[10px] uppercase text-brand-mist/40">Editorial Reference</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === "dual" && secondaryImage) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch ${className}`}>
        <div className="lg:col-span-8 relative overflow-hidden rounded-sm border border-brand-edge bg-brand-surface group">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={primaryImage.src}
              alt={primaryImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
            />
            {primaryImage.badge && (
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/15">
                  {primaryImage.badge}
                </span>
              </div>
            )}
          </div>
          {primaryImage.caption && (
            <div className="p-3.5 bg-white border-t border-brand-edge text-xs font-light text-brand-silver">
              {primaryImage.caption}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 relative overflow-hidden rounded-sm border border-brand-edge bg-brand-surface group flex flex-col">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-grow w-full">
            <Image
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
            />
            {secondaryImage.badge && (
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/15">
                  {secondaryImage.badge}
                </span>
              </div>
            )}
          </div>
          {secondaryImage.caption && (
            <div className="p-3.5 bg-white border-t border-brand-edge text-xs font-light text-brand-silver">
              {secondaryImage.caption}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: Split (Image on one side, substantive editorial text on the other)
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${className}`}>
      <div className="lg:col-span-6 relative overflow-hidden rounded-sm border border-brand-edge bg-brand-surface group">
        <div className={`relative w-full ${primaryAspect}`}>
          <Image
            src={primaryImage.src}
            alt={primaryImage.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
          />
          {primaryImage.badge && (
            <div className="absolute top-4 left-4 z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-white/15">
                {primaryImage.badge}
              </span>
            </div>
          )}
        </div>
        {primaryImage.caption && (
          <div className="p-3 bg-white border-t border-brand-edge text-[11px] font-light text-brand-silver">
            {primaryImage.caption}
          </div>
        )}
      </div>

      <div className="lg:col-span-6 space-y-4">
        {subtitle && (
          <span className="text-xs font-mono uppercase tracking-widest text-brand-electric font-medium">
            {subtitle}
          </span>
        )}
        {title && (
          <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight text-brand-graphite leading-tight">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm sm:text-base font-light text-brand-silver leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
