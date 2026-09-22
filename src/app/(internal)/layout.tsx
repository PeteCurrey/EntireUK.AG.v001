import React from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/ui/BrandMark';

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-obsidian text-white flex flex-col font-sans">
      {/* Top Banner */}
      <header className="border-b border-brand-edge bg-brand-charcoal/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/review" className="flex items-center space-x-3 group">
              <BrandMark size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wide text-white group-hover:text-brand-electric transition-colors">
                  ENTIRE UK
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-steel">
                  Land Radar · Internal Intelligence
                </span>
              </div>
            </Link>

            <span className="h-4 w-px bg-brand-edge hidden sm:block" />

            <div className="hidden sm:flex items-center space-x-2 text-xs text-brand-silver">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pilot: Warwick District (EUK-PILOT-001)</span>
            </div>
          </div>

          <nav className="flex items-center space-x-6 text-xs font-medium">
            <Link
              href="/land-radar"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Land Radar Explorer</span>
            </Link>
            <Link
              href="/review"
              className="text-brand-silver hover:text-white transition-colors"
            >
              Review Queue
            </Link>
            <Link
              href="/data-health"
              className="text-brand-silver hover:text-white transition-colors"
            >
              Data Health & Sources
            </Link>
            <Link
              href="/validation"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Validation &amp; Truth
            </Link>

            <span className="px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25">
              CONFIDENTIAL · INTERNAL ONLY
            </span>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-edge py-6 text-center text-xs text-brand-steel">
        Entire UK Land Radar — Internal Technology. Deterministic evidence screening. Facts, derivations, and human judgements are strictly recorded.
      </footer>
    </div>
  );
}
