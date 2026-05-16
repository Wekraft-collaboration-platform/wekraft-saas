"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Minus,
  Shield,
  GitBranch,
  Users,
  Lock,
  BarChart3,
  FolderGit2,
  UserPlus,
  Cpu,
  Bot,
  Wrench,
  CalendarCheck,
  Star,
  Flame,
  Sparkles,
  HeadphonesIcon,
  Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanKey = "free" | "plus" | "pro";

interface FeatureItem {
  label: string;
  icon: React.ReactNode;
}

interface Plan {
  key: PlanKey;
  name: string;
  badge?: string;
  priceLabel: string;
  priceSub?: string;
  description: string;
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  icon: React.ReactNode;
  features: FeatureItem[];
}

interface FeatureRow {
  label: string;
  icon: React.ReactNode;
  free: string | boolean;
  plus: string | boolean;
  pro: string | boolean;
}

interface FeatureCat {
  title: string;
  icon: React.ReactNode;
  rows: FeatureRow[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const freeFeatures: FeatureItem[] = [
  { label: "2 project creation",  icon: <FolderGit2 className="h-3.5 w-3.5" /> },
  { label: "1 joining",   icon: <UserPlus className="h-3.5 w-3.5" /> },
];

const plusFeatures: FeatureItem[] = [
  { label: "5 project creation",          icon: <FolderGit2 className="h-3.5 w-3.5" /> },
  { label: "5 Project joining",           icon: <UserPlus className="h-3.5 w-3.5" /> },
  { label: "Media Uploads",  icon: <Cpu className="h-3.5 w-3.5" /> },
  { label: "Advance Graphs/ Analysis",                icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { label: "Up to 6 team members",      icon: <Users className="h-3.5 w-3.5" /> },
  { label: "Sprints Creation",                 icon: <Map className="h-3.5 w-3.5" /> },
  { label: "Basic support",             icon: <HeadphonesIcon className="h-3.5 w-3.5" /> },
];

const proFeatures: FeatureItem[] = [
  { label: "10 Project Creation",          icon: <FolderGit2 className="h-3.5 w-3.5" /> },
  { label: "Unlimited Project Joining", icon: <UserPlus className="h-3.5 w-3.5" /> },
  { label: "Kaya - PM agent",        icon: <Bot className="h-3.5 w-3.5" /> },
  { label: "Schedule project reports",       icon: <CalendarCheck className="h-3.5 w-3.5" /> },
  { label: "15 team members",              icon: <Users className="h-3.5 w-3.5" /> },
  { label: "Higher media upload limits",  icon: <Cpu className="h-3.5 w-3.5" /> },
  { label: "Priority support",  icon: <Star className="h-3.5 w-3.5" /> },
];

const plans: Plan[] = [
  {
    key: "free",
    name: "Free",
    priceLabel: "$0",
    priceSub: "For teams discovering wekraft",
    description: "For teams discovering wekraft / exploring",
    cta: "Get Started",
    ctaHref: "#",
    highlighted: false,
    icon: <GitBranch className="h-4 w-4" />,
    features: freeFeatures,
  },
  {
    key: "plus",
    name: "Plus",
    badge: "40% OFF",
    priceLabel: "$6",
    priceSub: "Serious team building",
    description: "Serious team building",
    cta: "Upgrade to Plus",
    ctaHref: "#",
    highlighted: true,
    icon: <Flame className="h-4 w-4" />,
    features: plusFeatures,
  },
  {
    key: "pro",
    name: "Pro",
    badge: "25% OFF",
    priceLabel: "$15",
    priceSub: "Growing startup needs intelligence",
    description: "Growing startup needs intelligence.",
    cta: "Get Pro",
    ctaHref: "#",
    highlighted: false,
    icon: <Shield className="h-4 w-4" />,
    features: proFeatures,
  },
];

const featureCategories: FeatureCat[] = [
  {
    title: "Usage & Limits",
    icon: <Users className="h-4 w-4" />,
    rows: [
      { label: "Project Creation", icon: <FolderGit2 className="h-3.5 w-3.5" />, free: "2", plus: "5", pro: "10" },
      { label: "Team Members per Project", icon: <UserPlus className="h-3.5 w-3.5" />, free: "1", plus: "6", pro: "15" },
    ],
  },
  {
    title: "Features",
    icon: <Sparkles className="h-4 w-4" />,
    rows: [
      { label: "File Uploads", icon: <Cpu className="h-3.5 w-3.5" />, free: "Limited", plus: "Standard", pro: "High" },
      { label: "AI Features", icon: <Bot className="h-3.5 w-3.5" />, free: "—", plus: "Basic", pro: "Advanced (Kaya)" },
      { label: "Sprints & Kanban", icon: <Wrench className="h-3.5 w-3.5" />, free: "Basic", plus: "Full", pro: "Full + Automation" },
    ],
  },
  {
    title: "Support",
    icon: <Lock className="h-4 w-4" />,
    rows: [
      { label: "Support", icon: <HeadphonesIcon className="h-3.5 w-3.5" />, free: "Community", plus: "Standard", pro: "Priority" },
    ],
  },
];

const FeatureValue = ({ value }: { value: string | boolean }) => {
  if (value === true)
    return (
      <span className="flex justify-center">
        <Check className="h-4 w-4 text-blue-400" />
      </span>
    );
  if (value === false)
    return (
      <span className="flex justify-center">
        <Minus className="h-3.5 w-3.5 text-white/15" />
      </span>
    );
  return (
    <span className="text-xs text-white/60 text-center block">{value}</span>
  );
};

const Pricing = () => {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="bg-[#050505] min-h-screen w-full selection:bg-white/20 font-sans antialiased relative overflow-hidden">
      
      {/* ── Background Grid & Glow ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)", 
            backgroundSize: "48px 48px" 
          }} 
          className="absolute inset-0"
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/[0.03] blur-[100px] rounded-full" />
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-30 pb-12 px-4 z-10 flex flex-col items-center">
        
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-7xl font-medium tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 mb-6 leading-tight max-w-4xl"
        >
          Choose your plan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base text-gray-400 text-center mb-12 max-w-lg font-normal leading-relaxed"
        >
          Simple, transparent pricing. No hidden fees, no surprises.
        </motion.p>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="max-w-7xl mx-auto px-4 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative p-6 md:p-7 rounded-[32px] backdrop-blur-xl flex flex-col group transition-all duration-500",
                  "bg-[#0a0a0a]/90 hover:bg-[#0a0a0a]/70 border border-white/10 shadow-2xl transition-all",
                  "hover:shadow-[0_0_24px_-10px_rgba(255,255,255,0.15)] hover:z-40 hover:border-white/40",
                  plan.highlighted ? "scale-100 md:scale-105 z-10" : "z-0"
                )}
              >
                {/* Inner subtle highlight/gradient */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-3xl" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[32px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header row */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn(
                      "p-1.5 rounded-lg border shadow-sm transition-colors duration-500",
                      "bg-white text-black border-white"
                    )}>
                      {plan.icon}
                    </div>
                    <span className="text-lg font-medium tracking-tight text-gray-100">{plan.name}</span>
                    {plan.badge && (
                      <span className="ml-auto bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-medium tracking-tight text-white">{plan.priceLabel}</span>
                    <span className="text-sm text-gray-500 font-normal">/month</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-5 min-h-[2.5rem] font-normal leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <div className="w-full mb-6 block">
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error("Please login to upgrade your plan");
                        } else {
                          if (plan.ctaHref !== "#") {
                            window.location.href = plan.ctaHref;
                          }
                        }
                      }}
                      className={cn(
                        "w-full py-2 px-4 rounded-full font-medium text-sm transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer",
                        "bg-[#1c1c1c] border border-white/10 text-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white hover:text-black"
                      )}
                    >
                      {plan.cta}
                    </button>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-3 text-sm text-gray-400 group-hover:text-gray-300 font-normal transition-colors duration-500">
                        <div className="mt-0.5 flex-shrink-0 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-white/5 border border-white/5 transition-colors duration-500 group-hover:bg-white/10">
                          <Check className="w-3 h-3 text-white/50 group-hover:text-white" strokeWidth={2.5} />
                        </div>
                        <span className="line-clamp-1">{f.label}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Small Footer/Note */}
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-xs text-gray-600 font-normal group-hover:text-gray-500 transition-colors">
                      {plan.priceSub}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Feature Table ── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0A5B5] mb-3">
            Compare Plans
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-20">
            Everything, side by side
          </h2>
        </motion.div>

        <div className="rounded-[32px] border border-white/20 overflow-hidden bg-[#0a0a0a]/70 backdrop-blur-3xl shadow-[0_20px_100px_-10px_rgba(255,255,255,0.18)] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
          
          <div className="relative z-10 overflow-x-auto scrollbar-hide">
            <div className="min-w-[650px] md:min-w-full">
              {/* Table header - Sticky */}
              <div className="grid grid-cols-4 border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-20">
                <div className="py-2 px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center">
                  Comparison
                </div>
                {plans.map((p) => (
                  <div
                    key={p.key}
                    className={cn(
                      "py-2 px-5 text-center text-sm font-semibold tracking-tight",
                      p.highlighted ? "text-white" : "text-gray-400",
                    )}
                  >
                    {p.name}
                  </div>
                ))}
              </div>

              {/* Table body */}
              {featureCategories.map((cat, catIdx) => (
                <div key={catIdx}>
                  {/* Category Header */}
                  <div className="grid grid-cols-4 border-b border-white/[0.06] bg-[#050505]">
                    <div className="col-span-4 px-6 py-1.5 flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white">
                        {cat.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/90">
                        {cat.title}
                      </span>
                    </div>
                  </div>

                  {cat.rows.map((row, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="grid grid-cols-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.03] transition-all duration-300 group/row"
                    >
                      <div className="flex items-center gap-4 px-6 py-1.5 text-[13px] text-gray-400 group-hover/row:text-gray-200 transition-colors">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/5 group-hover/row:bg-white group-hover/row:text-black transition-all">
                          {React.isValidElement(row.icon) &&
                            React.cloneElement(row.icon as React.ReactElement<any>, {
                              className: "h-3.5 w-3.5",
                            })}
                        </div>
                        <span className="font-normal tracking-wide">
                          {row.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-center px-6 py-1.5 border-l border-white/[0.03]">
                        <FeatureValue value={row.free} />
                      </div>
                      <div className="flex items-center justify-center px-6 py-1.5 border-l border-white/[0.03] bg-white/[0.01]">
                        <FeatureValue value={row.plus} />
                      </div>
                      <div className="flex items-center justify-center px-6 py-1.5 border-l border-white/[0.03]">
                        <FeatureValue value={row.pro} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
