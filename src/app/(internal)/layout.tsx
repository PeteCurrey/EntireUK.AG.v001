import React from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/ui/BrandMark';
import { getCurrentUser } from '@/lib/auth/session';
import { LogOut } from 'lucide-react';

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-brand-obsidian text-white flex flex-col font-sans">
      {/* Top Banner */}
      <header className="border-b border-brand-edge bg-brand-charcoal/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
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
              <span>Pilot 001/002 Active</span>
            </div>
          </div>

          <nav className="flex items-center space-x-5 text-xs font-medium">
            <Link
              href="/dashboard"
              className="text-brand-silver hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/land-radar"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center space-x-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Land Radar</span>
            </Link>
            <Link
              href="/acquisitions"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center space-x-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Acquisitions</span>
            </Link>
            <Link
              href="/review"
              className="text-brand-silver hover:text-white transition-colors"
            >
              Review Queue
            </Link>
            <Link
              href="/validation"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Validation
            </Link>
            <Link
              href="/data-health"
              className="text-brand-silver hover:text-white transition-colors"
            >
              Data Health
            </Link>

            <span className="h-4 w-px bg-brand-edge hidden md:block" />

            {/* User Session & Sign Out */}
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-[11px] text-brand-steel font-mono">
                {user?.email || 'analyst@entire-uk.com'}
              </span>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="px-2.5 py-1 text-[11px] text-brand-mist hover:text-white bg-brand-carbon hover:bg-brand-edge-dark border border-brand-edge rounded transition-colors flex items-center gap-1.5"
                  title="Sign out of Land Radar session"
                >
                  <LogOut className="w-3 h-3 text-brand-steel" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] tracking-wider uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25 hidden xl:inline-block">
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
