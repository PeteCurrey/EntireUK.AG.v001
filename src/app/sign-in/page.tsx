"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo, BrandMark } from "@/components/ui/BrandMark";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, redirect: redirectPath }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid credentials. Please check and try again.");
        setLoading(false);
        return;
      }

      // Successful login
      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMessage("Network connection error. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordSubmitted(true);
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 py-10 sm:py-16">
      {/* Brand Header */}
      <div className="mb-10">
        <Link href="/" className="inline-block mb-8 group" aria-label="Return to Entire UK Homepage">
          <BrandLogo onDark={false} />
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-electric" />
          <span className="text-[11px] uppercase tracking-widest font-mono text-brand-silver font-medium">
            Internal Platform
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-brand-graphite">
          Sign in to Land Radar
        </h1>
        <p className="mt-2 text-sm font-light text-brand-silver leading-relaxed">
          Access the internal acquisition intelligence workstation, review queues, and candidate truth ledgers.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-sm bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium block">Authentication Failed</span>
            <span className="text-rose-700 mt-0.5 block">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-xs uppercase tracking-wider font-medium text-brand-graphite mb-1.5"
          >
            Work Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="analyst@entire-uk.com"
            disabled={loading}
            className="w-full h-11 px-3.5 text-sm bg-white border border-brand-edge rounded-sm text-brand-graphite placeholder:text-slate-400 focus:border-brand-electric focus:ring-1 focus:ring-brand-electric outline-none transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-wider font-medium text-brand-graphite"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs text-brand-electric hover:text-brand-indigo font-light transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            disabled={loading}
            className="w-full h-11 px-3.5 text-sm bg-white border border-brand-edge rounded-sm text-brand-graphite placeholder:text-slate-400 focus:border-brand-electric focus:ring-1 focus:ring-brand-electric outline-none transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-sm bg-brand-graphite hover:bg-brand-carbon text-white text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-brand-mist/70" />
                <span>Sign In to Land Radar</span>
                <ArrowRight className="w-4 h-4 text-brand-mist/70" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-sm border border-brand-edge max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-edge pb-3">
              <h3 className="text-sm font-medium text-brand-graphite">Password Recovery</h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotPasswordSubmitted(false);
                }}
                className="text-xs text-brand-silver hover:text-brand-graphite"
              >
                Close ✕
              </button>
            </div>

            {forgotPasswordSubmitted ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recovery link dispatched</span>
                </div>
                <p className="text-xs text-brand-silver font-light leading-relaxed">
                  If an authorized account exists for the provided address, a password reset email has been sent. Check your inbox and follow the security link.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotPasswordSubmitted(false);
                  }}
                  className="w-full h-9 rounded-sm bg-brand-surface border border-brand-edge text-xs font-medium text-brand-graphite hover:bg-white transition-colors mt-2"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-brand-silver font-light leading-relaxed">
                  Enter your verified work email address. We will send a secure password reset link.
                </p>
                <input
                  type="email"
                  required
                  placeholder="analyst@entire-uk.com"
                  className="w-full h-10 px-3 text-xs bg-white border border-brand-edge rounded-sm outline-none focus:border-brand-electric"
                />
                <button
                  type="submit"
                  className="w-full h-10 rounded-sm bg-brand-graphite text-white text-xs font-medium hover:bg-brand-carbon transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Security & Confidentiality Notice */}
      <div className="mt-12 pt-8 border-t border-brand-edge space-y-3">
        <div className="flex items-start gap-2.5 text-[11px] text-brand-silver font-light leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-brand-electric shrink-0 mt-0.5" />
          <p>
            Authorised Entire UK personnel and registered partners only. All access, site queries, and ownership searches are strictly logged and audited.
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-brand-silver/70 font-light pt-2">
          <span>Entire UK Development Limited</span>
          <Link href="/" className="hover:text-brand-graphite underline underline-offset-2 transition-colors">
            Return to public site
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-brand-void text-white">
      {/* LEFT SIDE: Cinematic Editorial Architectural & Land Imagery (Desktop 50%) */}
      <div className="relative lg:w-1/2 min-h-[260px] lg:min-h-screen bg-brand-void overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        {/* Subtle architectural background pattern & lighting */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80')`,
          }}
          aria-hidden="true"
        />

        {/* Restrained dark architectural overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-void via-brand-void/80 to-brand-void/60"
          aria-hidden="true"
        />

        {/* Subtle grid linework */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />

        {/* Content: Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandMark size="sm" />
            <span className="text-sm font-semibold tracking-wide text-white group-hover:text-brand-electric transition-colors">
              ENTIRE UK
            </span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand-mist/60 px-2.5 py-1 rounded bg-white/[0.04] border border-white/10">
            CONFIDENTIAL
          </span>
        </div>

        {/* Content: Footer Message */}
        <div className="relative z-10 space-y-4 max-w-lg mt-auto pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-white/[0.04] border border-white/10 text-brand-mist/80 text-xs font-light tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-electric animate-pulse" />
            <span>Land Radar Infrastructure</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white leading-snug">
            Disciplined Land &amp; Property Acquisition Across the United Kingdom.
          </h2>

          <p className="text-xs sm:text-sm font-light text-brand-mist/75 leading-relaxed">
            Proprietary spatial constraint screening, cadastral title disaggregation, and multi-layer evidence ledgers powering human acquisition decisions.
          </p>

          <div className="pt-4 border-t border-white/[0.08] flex items-center gap-6 text-[11px] font-mono text-brand-mist/50">
            <span>Pilot 001 · Warwick</span>
            <span>·</span>
            <span>Pilot 002 · Rugby</span>
            <span>·</span>
            <span>Strategy V3 Frozen</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Light / Off-White Authentication Surface (Desktop 50%) */}
      <div className="lg:w-1/2 bg-brand-surface flex items-center justify-center">
        <Suspense
          fallback={
            <div className="p-12 text-center text-xs text-brand-silver font-mono">
              Loading authentication gateway...
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
