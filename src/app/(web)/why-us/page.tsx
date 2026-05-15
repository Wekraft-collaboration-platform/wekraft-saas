import React from "react";
import Navbar from "@/modules/web/Navbar";
import WhyUs from "@/modules/web/WhyUs";
import SmoothScroll from "@/providers/SmoothScroll";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Why Wekraft — The PM tool built for engineering teams",
  description: "See how Wekraft compares to Jira, Asana, Linear, ClickUp, Monday, and Atlassian.",
};

export default function WhyUsPage() {
  return (
    <SmoothScroll>
      <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-blue-500/20">
        <Navbar />

        <main className="pt-32 pb-32 px-6 md:px-12 max-w-7xl mx-auto">

          {/* ── Page header ─────────────────────────── */}
          <div className="mb-20 max-w-2xl">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-5 font-mono">Why Wekraft</p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-white mb-6">
              Built for the people
              <br />
              who actually ship.
            </h1>
            <p className="text-neutral-500 text-lg leading-relaxed mb-8">
              We're developers who got tired of PM tools built for everyone except us. 
              No admin required. No plugins. No $25/seat surprises.
              Just a workspace that understands how engineering teams work.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
              >
                Start free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/web/docs"
                className="text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Read the docs →
              </Link>
            </div>
          </div>

          {/* ── Divider ─────────────────────────────── */}
          <div className="border-t border-white/6 mb-20" />

          {/* ── Stats ───────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-20">
            {[
              { value: "< 5 min", label: "Time to first sprint" },
              { value: "0",       label: "Plugins required" },
              { value: "6+",      label: "Tools it replaces" },
              { value: "Free",    label: "To start" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-semibold text-white mb-1">{s.value}</p>
                <p className="text-sm text-white/30">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Divider ─────────────────────────────── */}
          <div className="border-t border-white/6 mb-20" />

          {/* ── Main content (problems + pillars + comparison) ─── */}
          <WhyUs />

          {/* ── Divider ─────────────────────────────── */}
          <div className="border-t border-white/6 mt-20 mb-20" />

          {/* ── Testimonials ────────────────────────── */}
          <div className="mb-20">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-10 font-mono">From teams who switched</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "We replaced Jira, ClickUp, and our time tracker with Wekraft. The team actually uses it — that alone makes it worth it.",
                  name: "Alex K.",
                  role: "CTO, Fintech startup",
                },
                {
                  quote: "Kaya flagged a sprint delay and reshuffled tasks before my team woke up. We shipped on time. I didn't have to do anything.",
                  name: "Priya M.",
                  role: "Lead Engineer",
                },
                {
                  quote: "First PM tool where I didn't spend a week configuring it. Got value on day one.",
                  name: "Jordan R.",
                  role: "Staff Engineer",
                },
              ].map((t, i) => (
                <div key={i} className="border border-white/6 rounded-xl p-6">
                  <p className="text-white/55 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{t.name}</p>
                    <p className="text-white/25 text-xs mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Divider ─────────────────────────────── */}
          <div className="border-t border-white/6 mb-20" />

          {/* ── CTA ─────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Ready to switch?</h2>
              <p className="text-neutral-500 text-sm">Free forever plan. No credit card. Import from Jira in one click.</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
              >
                Get started free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/web/docs"
                className="text-sm text-white/35 hover:text-white/60 transition-colors"
              >
                Docs →
              </Link>
            </div>
          </div>

        </main>
      </div>
    </SmoothScroll>
  );
}
