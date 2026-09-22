import React from "react";

interface BrandMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandMark({ className = "w-10", size }: BrandMarkProps) {
  const sizeClasses = {
    sm: "w-8",
    md: "w-10",
    lg: "w-14",
  };

  const finalClass = size ? sizeClasses[size] : className;

  return (
    <span className={`relative inline-block ${finalClass} shrink-0`} aria-hidden="true">
      <svg
        viewBox="-1.9096 -1.16 3.8192 2.32"
        className="block w-full h-auto"
        role="img"
        aria-label="Entire UK Brand Mark"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="euk-facet-0" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="euk-facet-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="euk-facet-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="euk-facet-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d4db8" />
            <stop offset="100%" stopColor="#092d6e" />
          </linearGradient>
          <linearGradient id="euk-facet-4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="euk-facet-5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c2340" />
          </linearGradient>
          <linearGradient id="euk-facet-6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0066ff" />
            <stop offset="100%" stopColor="#0047b3" />
          </linearGradient>
          <linearGradient id="euk-facet-7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0137aa" />
            <stop offset="100%" stopColor="#012066" />
          </linearGradient>
          <linearGradient id="euk-facet-8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0122ba" />
            <stop offset="100%" stopColor="#001366" />
          </linearGradient>
          <linearGradient id="euk-facet-9" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0024b8" />
            <stop offset="100%" stopColor="#00104d" />
          </linearGradient>
          <linearGradient id="euk-facet-10" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="euk-facet-11" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="euk-facet-12" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1145" />
            <stop offset="100%" stopColor="#100826" />
          </linearGradient>
          <linearGradient id="euk-facet-13" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="euk-facet-14" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="euk-facet-15" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <g>
          <polygon points="-0.2381,-0.5000 -0.9396,-1.0000 -0.5117,-0.3050" fill="url(#euk-facet-0)" />
          <polygon points="-0.9396,-1.0000 -0.9396,-0.6100 -0.5117,-0.3050" fill="url(#euk-facet-1)" />
          <polygon points="-0.9396,-1.0000 -1.6411,-0.5000 -0.9396,-0.6100" fill="url(#euk-facet-2)" />
          <polygon points="-1.6411,-0.5000 -1.3675,-0.3050 -0.9396,-0.6100" fill="url(#euk-facet-3)" />
          <polygon points="-1.6411,-0.5000 -1.6411,0.5000 -1.3675,-0.3050" fill="url(#euk-facet-4)" />
          <polygon points="-1.6411,0.5000 -1.3675,0.3050 -1.3675,-0.3050" fill="url(#euk-facet-5)" />
          <polygon points="-1.6411,0.5000 -0.9396,1.0000 -1.3675,0.3050" fill="url(#euk-facet-6)" />
          <polygon points="-0.9396,1.0000 -0.9396,0.6100 -1.3675,0.3050" fill="url(#euk-facet-7)" />
          <polygon points="-0.9396,1.0000 -0.2381,0.5000 -0.9396,0.6100" fill="url(#euk-facet-8)" />
          <polygon points="-0.2381,0.5000 -0.5117,0.3050 -0.9396,0.6100" fill="url(#euk-facet-9)" />
          <polygon points="-0.2381,0.5000 0.2381,-0.5000 -0.5117,0.3050" fill="url(#euk-facet-10)" />
          <polygon points="0.2381,-0.5000 0.5117,-0.3050 -0.5117,0.3050" fill="url(#euk-facet-11)" />
          <polygon points="0.2381,-0.5000 0.9396,-1.0000 0.5117,-0.3050" fill="url(#euk-facet-12)" />
          <polygon points="0.9396,-1.0000 0.9396,-0.6100 0.5117,-0.3050" fill="url(#euk-facet-13)" />
          <polygon points="0.9396,-1.0000 1.6411,-0.5000 0.9396,-0.6100" fill="url(#euk-facet-14)" />
          <polygon points="1.6411,-0.5000 1.3675,-0.3050 0.9396,-0.6100" fill="url(#euk-facet-15)" />
          <polygon points="1.6411,-0.5000 1.6411,0.5000 1.3675,-0.3050" fill="url(#euk-facet-1)" />
          <polygon points="1.6411,0.5000 1.3675,0.3050 1.3675,-0.3050" fill="url(#euk-facet-2)" />
          <polygon points="1.6411,0.5000 0.9396,1.0000 1.3675,0.3050" fill="url(#euk-facet-6)" />
          <polygon points="0.9396,1.0000 0.9396,0.6100 1.3675,0.3050" fill="url(#euk-facet-7)" />
          <polygon points="0.9396,1.0000 0.2381,0.5000 0.9396,0.6100" fill="url(#euk-facet-8)" />
          <polygon points="0.2381,0.5000 0.5117,0.3050 0.9396,0.6100" fill="url(#euk-facet-9)" />
          <polygon points="0.2381,0.5000 -0.2381,-0.5000 0.5117,0.3050" fill="url(#euk-facet-10)" />
          <polygon points="-0.2381,-0.5000 -0.5117,-0.3050 0.5117,0.3050" fill="url(#euk-facet-11)" />
        </g>
        {/* Subtle geometric wireframe hairlines */}
        <g stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.012" strokeLinecap="round">
          <line x1="-0.2381" y1="-0.5000" x2="-0.9396" y2="-1.0000" />
          <line x1="-1.6411" y1="-0.5000" x2="-1.6411" y2="0.5000" />
          <line x1="0.9396" y1="-1.0000" x2="1.6411" y2="-0.5000" />
          <line x1="1.6411" y1="-0.5000" x2="1.3675" y2="-0.3050" />
          <line x1="0.9396" y1="1.0000" x2="0.2381" y2="0.5000" />
        </g>
      </svg>
    </span>
  );
}

export function BrandLogo({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className="w-10 text-white" />
      <div className="flex flex-col leading-none">
        <span
          className={`text-[19px] font-extralight tracking-[0.08em] transition-colors ${
            onDark ? "text-white" : "text-brand-graphite"
          }`}
        >
          Entire<span className="font-bold text-brand-electric">UK</span>
        </span>
        <span
          className={`mt-1 text-[8.5px] font-medium tracking-[0.2em] uppercase transition-colors ${
            onDark ? "text-brand-mist/60" : "text-brand-silver/80"
          }`}
        >
          Land &amp; Development
        </span>
      </div>
    </div>
  );
}
