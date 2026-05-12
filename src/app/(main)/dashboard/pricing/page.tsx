"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  forWhom: string;
  badge?: string;
  description: string;
  originalPrice?: number;
  price: number;
  features: PlanFeature[];
  buttonText: string;
  highlight?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    forWhom: "explore wekraft",
    description: "For teams discovering wekraft / exploring",
    price: 0,
    buttonText: "Get Started",
    features: [
      { text: "2 project creation", included: true },
      { text: "1 joining", included: true },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    forWhom: "for serious teams",
    badge: "40% OFF",
    description: "Serious team building",
    originalPrice: 10,
    price: 6,
    buttonText: "Upgrade to Plus",
    highlight: true,
    features: [
      { text: "5 project creation", included: true },
      { text: "5 Project joining", included: true },
      { text: "Media Uploads", included: true },
      { text: "Advance Graphs/ Analaysis for Team", included: true },
      { text: "Up to 6 team members / project", included: true },
      { text: "Sprints Creation", included: true },
      { text: "Basic support", included: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    forWhom: "for growing startups",
    badge: "25% OFF",
    description: "Growing startup needs intelligence.",
    originalPrice: 20,
    price: 15,
    buttonText: "Get Pro",
    features: [
      { text: "10 Project Creation", included: true },
      { text: "Unlimited Project Joining", included: true },
      { text: "Kaya - PM agent", included: true },
      { text: "Schedule project reports", included: true },
      { text: "15 team members in a project", included: true },
      { text: "Higher media upload limits", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const comparisonFeatures = [
  { name: "Project Creation", free: "2", plus: "5", pro: "10" },
  { name: "Team Members per Project", free: "1", plus: "6", pro: "15" },
  { name: "File Uploads", free: "Limited", plus: "Standard", pro: "High" },
  { name: "AI Features", free: "—", plus: "Basic", pro: "Advanced (Kaya)" },
  {
    name: "Sprints & Kanban",
    free: "Basic",
    plus: "Full",
    pro: "Full + Automation",
  },
  { name: "Support", free: "Community", plus: "Standard", pro: "Priority" },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen py-12 px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground mb-3"
          >
            Choose your plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            Simple, transparent pricing. No hidden fees, no surprises.
          </motion.p>
        </div>

        {/* Pricing Cards Grid — 5% narrower, cards scaled down */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start max-w-[95%] mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative group flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 scale-[0.95]",
                plan.highlight ? "" : "",
              )}
            >
              <div className="flex-1 flex flex-col">
                {/* For Whom Label */}
                <div className="mb-6 py-5 px-4 border-b border-accent bg-accent/40">
                  <span className="text-xs capitalize font-semibold tracking-tight">
                    {plan.forWhom}
                  </span>
                </div>

                <div className="flex flex-col p-4">
                  {/* Plan Badge/Name */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary text-[10px] border-none rounded-full px-2 py-0 h-5 font-bold"
                      >
                        {plan.badge}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs font-light text-muted-foreground leading-relaxed mb-6 h-8">
                    {plan.description}
                  </p>

                  {/* Price Display */}
                  <div className="bg-muted/20 rounded-2xl p-4 mb-6 border border-border/40">
                    <div className="flex items-baseline gap-2">
                      {plan.originalPrice && (
                        <span className="text-xl text-primary/90 line-through font-light ">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-semibold text-muted-foreground tracking-tight uppercase">
                          USD /
                        </span>
                        <span className="text-[8px] font-semibold text-muted-foreground tracking-tight uppercase">
                          month
                        </span>
                      </div>
                    </div>

                    <Button
                      className={cn(
                        "w-full mt-4 rounded-lg py-4 text-xs font-semibold transition-all active:scale-95",
                        plan.highlight
                          ? "bg-foreground text-background hover:bg-foreground/90 shadow-md"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      )}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 group/item">
                        <div className="mt-0.5 flex-shrink-0 w-3.5 h-3.5 rounded-full bg-primary/10 flex items-center justify-center transition-colors">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span className="text-xs font-light text-muted-foreground group-hover/item:text-foreground transition-colors leading-tight">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 mb-12"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">
              Compare features
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Everything you need to manage your projects effectively.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                    <span className="inline-flex flex-col items-center gap-0.5">
                      <span>Free</span>
                      <span className="text-[10px] font-bold text-muted-foreground/50 normal-case tracking-normal">
                        $0 / mo
                      </span>
                    </span>
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-blue-400 uppercase tracking-wider text-center bg-blue-500/[0.06] border-x border-blue-500/15">
                    <span className="inline-flex flex-col items-center gap-0.5">
                      <span>Plus ✦</span>
                      <span className="text-[10px] font-bold text-blue-400/70 normal-case tracking-normal">
                        $6 / mo
                      </span>
                    </span>
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-violet-400 uppercase tracking-wider text-center">
                    <span className="inline-flex flex-col items-center gap-0.5">
                      <span>Pro</span>
                      <span className="text-[10px] font-bold text-violet-400/60 normal-case tracking-normal">
                        $15 / mo
                      </span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      "border-b border-border/25 transition-colors hover:bg-muted/5",
                      idx % 2 !== 0 ? "bg-muted/[0.025]" : "bg-transparent",
                    )}
                  >
                    <td className="py-3.5 px-6 text-sm text-foreground/80 font-medium">
                      {feature.name}
                    </td>
                    <td className="py-3.5 px-6 text-sm text-muted-foreground text-center">
                      {feature.free}
                    </td>
                    <td className="py-3.5 px-6 text-sm text-blue-300 font-semibold text-center bg-blue-500/[0.04] border-x border-blue-500/10">
                      {feature.plus}
                    </td>
                    <td className="py-3.5 px-6 text-sm text-violet-300/80 text-center">
                      {feature.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-[10px] text-muted-foreground mt-8">
          Prices are in USD. VAT may apply depending on your location.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
