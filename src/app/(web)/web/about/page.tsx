import React from "react";
import Navbar from "@/modules/web/Navbar";
import Footer from "@/modules/web/Footer";
import Link from "next/link";
import { Award, ShieldCheck, Cpu, GitFork, ArrowRight, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] max-w-7xl bg-gradient-to-b from-blue-500/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <main className="flex flex-col items-center pt-36 pb-24 px-4 md:px-8 max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300 border border-white/10 bg-white/[0.03] rounded-full px-3.5 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            E-E-A-T Quality Standards
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white font-pop">
            About WeKraft
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-normal">
            WeKraft is the next-generation developer command center. We consolidate task boards, git workflows, video calls, and autonomous AI agents into a single, cohesive interface.
          </p>
          <p className="text-neutral-500 text-xs mt-4 italic">
            Note: WeKraft (<a href="https://wekraft.xyz" className="text-blue-500/80 hover:text-blue-400 underline transition-colors">wekraft.xyz</a>) is an independent software development platform (SaaS) for engineering teams.
          </p>
        </div>

        {/* E-E-A-T Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
          
          {/* Card 1: Experience */}
          <div className="group relative border border-white/[0.08] bg-neutral-950/40 hover:bg-neutral-900/40 p-8 rounded-2xl transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Experience</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">[ E-01 ]</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Our team has spent years building high-velocity developer tools, agile boards, and real-time synchronization pipelines. WeKraft is designed to eliminate context switching, providing high-fidelity issue tracking, automated branch stress mapping, and developer burn rate tracking.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-neutral-300">Agile Planner</span>
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-neutral-300">Live Sync</span>
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-neutral-300">Burn Rate Metrics</span>
            </div>
          </div>

          {/* Card 2: Expertise */}
          <div className="group relative border border-white/[0.08] bg-neutral-950/40 hover:bg-neutral-900/40 p-8 rounded-2xl transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Expertise</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">[ E-02 ]</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                We believe project management shouldn't live in a silo separate from your code and communication. WeKraft's expertise lies in linking git repository commits, local IDE workspaces via VS Code, audio/video huddle rooms, and autonomous AI agents (Kaya PM & Harry Dev) to automate ticket triage and pull request analysis.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-neutral-300">Autonomous PM Agent</span>
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-neutral-300">VS Code Integration</span>
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-neutral-300">WebRTC Huddles</span>
            </div>
          </div>

          {/* Card 3: Authoritativeness */}
          <div className="group relative border border-white/[0.08] bg-neutral-950/40 hover:bg-neutral-900/40 p-8 rounded-2xl transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Authoritativeness</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">[ A-01 ]</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                WeKraft is powered by industry-standard engineering frameworks and cloud-native databases. We rely on state-of-the-art libraries and document our architectural integrations. You can reference our specifications and standards via official project paths:
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-4 border-t border-white/5 bg-transparent">
              <a
                id="ref-nextjs"
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
              >
                Next.js 16 React framework <ExternalLink className="w-3 h-3" />
              </a>
              <a
                id="ref-convex"
                href="https://convex.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
              >
                Convex Real-time Backend <ExternalLink className="w-3 h-3" />
              </a>
              <a
                id="ref-clerk"
                href="https://clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
              >
                Clerk Authentication <ExternalLink className="w-3 h-3" />
              </a>
              <a
                id="ref-livekit"
                href="https://livekit.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
              >
                LiveKit WebRTC Infrastructure <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Card 4: Trustworthiness */}
          <div className="group relative border border-white/[0.08] bg-neutral-950/40 hover:bg-neutral-900/40 p-8 rounded-2xl transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Trustworthiness</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">[ T-01 ]</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Your data is secure with WeKraft. We isolate workspaces at the database level and never store raw GitHub authentication secrets or credentials locally. Authentication is handled fully by Clerk's secure servers, and team audio/video streams use peer-to-peer WebRTC encryption.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
              <Link
                id="ref-terms"
                href="/web/docs/terms"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
              >
                WeKraft Terms of Service <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                id="ref-privacy"
                href="/web/docs/privacy"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
              >
                WeKraft Privacy Policy <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
          <Link
            id="about-back-home"
            href="/web"
            className="w-full sm:w-auto text-center border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.05] text-neutral-300 hover:text-white font-semibold text-sm py-3 px-8 rounded-xl transition-all duration-300"
          >
            Back to Home
          </Link>
          <Link
            id="about-cta-docs"
            href="/web/docs"
            className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-3 px-8 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
          >
            Browse Documentation
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
