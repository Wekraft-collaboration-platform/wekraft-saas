"use client";
import React from "react";
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
  Map,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConvexAuth, useAction, useQuery } from "convex/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { useRazorpay } from "@/modules/payments/hooks/useRazorpay";
import { useStripeCheckout } from "@/modules/payments/hooks/useStripeCheckout";
import Script from "next/script";

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
  oldPrice?: string;
  priceSub?: string;
  description: string;
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  icon: React.ReactNode;
  features: FeatureItem[];
  priceUSD: number;
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
  { label: "2 Project Creation",  icon: <FolderGit2 className="h-3.5 w-3.5" /> },
  { label: "2 Project Joining",   icon: <GitBranch className="h-3.5 w-3.5" /> },
  { label: "Up to 3 team members", icon: <UserPlus className="h-3.5 w-3.5" /> },
  { label: "2 GB Cloud Storage",   icon: <Cpu className="h-3.5 w-3.5" /> },
];

const plusFeatures: FeatureItem[] = [
  { label: "10 Project Creation",          icon: <FolderGit2 className="h-3.5 w-3.5" /> },
  { label: "10 Project Joining",           icon: <GitBranch className="h-3.5 w-3.5" /> },
  { label: "Up to 6 team members",         icon: <UserPlus className="h-3.5 w-3.5" /> },
  { label: "Full Team & Community Insights",icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { label: "15 GB Cloud Storage",          icon: <Cpu className="h-3.5 w-3.5" /> },

  { label: "Project Heatmaps",             icon: <Map className="h-3.5 w-3.5" /> },
];

const proFeatures: FeatureItem[] = [
  { label: "20 Project Creation",          icon: <FolderGit2 className="h-3.5 w-3.5" /> },
  { label: "20 Project Joining",           icon: <GitBranch className="h-3.5 w-3.5" /> },
  { label: "Up to 15 team members",        icon: <UserPlus className="h-3.5 w-3.5" /> },
  { label: "Kaya AI & PM Agent",           icon: <Bot className="h-3.5 w-3.5" /> },
  { label: "Automated Reporting",          icon: <CalendarCheck className="h-3.5 w-3.5" /> },
  { label: "30 GB Cloud Storage",         icon: <Cpu className="h-3.5 w-3.5" /> },
  { label: "Priority Support",             icon: <Star className="h-3.5 w-3.5" /> },
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
    priceUSD: 0,
  },
  {
    key: "plus",
    name: "Plus",
    badge: "40% OFF",
    priceLabel: "$9",
    oldPrice: "$12",
    priceSub: "Serious team building",
    description: "Serious team building",
    cta: "Upgrade to Plus",
    ctaHref: "#",
    highlighted: true,
    icon: <Flame className="h-4 w-4" />,
    features: plusFeatures,
    priceUSD: 9,
  },
  {
    key: "pro",
    name: "Pro",
    badge: "20% OFF",
    priceLabel: "$20",
    oldPrice: "$25",
    priceSub: "Growing startup needs intelligence",
    description: "Growing startup needs intelligence.",
    cta: "Get Pro",
    ctaHref: "#",
    highlighted: false,
    icon: <Shield className="h-4 w-4" />,
    features: proFeatures,
    priceUSD: 20,
  },
];

const featureCategories: FeatureCat[] = [
  {
    title: "Usage & Limits",
    icon: <FolderGit2 className="h-4 w-4" />,
    rows: [
      { label: "Project Creation", icon: <FolderGit2 className="h-3.5 w-3.5" />, free: "2", plus: "10", pro: "20" },
      { label: "Project Joining", icon: <GitBranch className="h-3.5 w-3.5" />, free: "2", plus: "10", pro: "20" },
      { label: "Team Members per Project", icon: <UserPlus className="h-3.5 w-3.5" />, free: "3", plus: "6", pro: "15" },
      { label: "Cloud Storage", icon: <Cpu className="h-3.5 w-3.5" />, free: "2 GB", plus: "15 GB", pro: "30 GB" },
    ],
  },
  {
    title: "Workspace Features & Insights",
    icon: <BarChart3 className="h-4 w-4" />,
    rows: [
      { label: "User Profiles", icon: <Users className="h-3.5 w-3.5" />, free: "Limited", plus: "Full", pro: "Full" },

      { label: "Team Insights", icon: <BarChart3 className="h-3.5 w-3.5" />, free: "Limited", plus: "Full", pro: "Full" },
      { label: "Community Insights", icon: <Star className="h-3.5 w-3.5" />, free: "Limited", plus: "Full", pro: "Full" },
      { label: "Project Heatmap", icon: <Map className="h-3.5 w-3.5" />, free: "Limited", plus: "Full", pro: "Full" },
    ],
  },
  {
    title: "AI & Automation",
    icon: <Sparkles className="h-4 w-4" />,
    rows: [
      { label: "PM Agent", icon: <Bot className="h-3.5 w-3.5" />, free: "None", plus: "None", pro: "Full" },
      { label: "Kaya AI", icon: <Sparkles className="h-3.5 w-3.5" />, free: "None", plus: "None", pro: "Full" },
      { label: "Automated Reporting", icon: <CalendarCheck className="h-3.5 w-3.5" />, free: false, plus: false, pro: true },
      { label: "Experimental Features", icon: <Wrench className="h-3.5 w-3.5" />, free: false, plus: false, pro: true },
    ],
  },
  {
    title: "Support",
    icon: <Lock className="h-4 w-4" />,
    rows: [
      { label: "Dedicated Support", icon: <HeadphonesIcon className="h-3.5 w-3.5" />, free: "Basic", plus: "Basic", pro: "Priority" },
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
  const user = useQuery(api.user.getCurrentUser);
  const [countryCode, setCountryCode] = React.useState<string | null>(null);
  
  const { initiatePayment: initiateRazorpay, loadingPlan: loadingRazorpay, cancelPayment: cancelRazorpay } = useRazorpay();
  const { initiatePayment: initiateStripe, loadingPlan: loadingStripe } = useStripeCheckout();

  React.useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code) {
          setCountryCode(data.country_code);
        }
      })
      .catch((err) => console.error("Failed to fetch country code", err));
  }, []);

  const isIndia = countryCode === "IN";

  return (
    <div className="bg-[#050505] min-h-screen w-full selection:bg-white/20 font-sans antialiased relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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
      <section className="relative pt-30 pb-12 px-4 z-10 flex flex-col items-center w-full">
        
        <div className="w-full max-w-6xl relative flex flex-col md:flex-row items-center justify-center mb-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:absolute md:left-0 lg:-left-12 xl:-left-24 mb-6 md:mb-0"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/"}>
              <Button
                variant="outline"
                className="gap-2 bg-[#0a0a0a]/90 text-white border-white/10 hover:bg-white hover:text-black rounded-full shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)] transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                {isAuthenticated ? "Back to Dashboard" : "Back to Website"}
              </Button>
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-medium tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 leading-tight max-w-4xl"
          >
            Choose your plan
          </motion.h1>
        </div>

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
            const displayPriceLabel = isIndia 
              ? (plan.key === "free" ? "₹0" : plan.key === "plus" ? "₹899" : "₹1899") 
              : plan.priceLabel;

            const displayOldPrice = isIndia 
              ? (plan.key === "free" ? undefined : plan.key === "plus" ? "₹1199" : "₹2499") 
              : plan.oldPrice;

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
                    {displayOldPrice && (
                      <span className="text-xl font-medium tracking-tight text-gray-500 line-through mr-2">{displayOldPrice}</span>
                    )}
                    <span className="text-4xl font-medium tracking-tight text-white">{displayPriceLabel}</span>
                    <span className="text-sm text-gray-500 font-normal">/month</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-5 min-h-[2.5rem] font-normal leading-relaxed group-hover:text-gray-300 transition-colors duration-500">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <div className="w-full mb-6 flex flex-col items-center">
                    <button
                      onClick={async () => {
                        if (plan.key === (user?.accountType || "free")) return;
                        
                        const isLoadingPlan = loadingRazorpay === plan.name || loadingStripe === plan.name;
                        if (isLoadingPlan) return;
                        
                        if (!isAuthenticated) {
                          toast.error("Please login to upgrade your plan");
                          return;
                        }
                        
                        if (plan.key === "free") {
                          toast.info("You are already on the free plan");
                          return;
                        }

                        if (!user) {
                          toast.error("User data not loaded yet");
                          return;
                        }

                        try {
                          if (isIndia) {
                            await initiateRazorpay(
                              { name: plan.name, planType: plan.key as "plus" | "pro", priceUSD: plan.priceUSD },
                              { id: user._id, name: user.name || "", email: user.email || "" }
                            );
                          } else {
                            await initiateStripe(
                              { name: plan.name, planType: plan.key as "plus" | "pro", priceUSD: plan.priceUSD },
                              { id: user._id, name: user.name || "", email: user.email || "" }
                            );
                          }
                        } catch (e: any) {
                          console.error("Payment failed", e);
                        }
                      }}
                      disabled={loadingRazorpay !== null || loadingStripe !== null || plan.key === (user?.accountType || "free")}
                      className={cn(
                        "w-full py-2 px-4 rounded-full font-medium text-sm transition-all duration-300 shadow-sm flex items-center justify-center gap-2",
                        plan.key === (user?.accountType || "free")
                          ? "bg-blue-500/10 border border-blue-500/35 text-blue-400 cursor-default font-semibold"
                          : "bg-[#1c1c1c] border border-white/10 text-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white hover:text-black cursor-pointer",
                        (loadingRazorpay !== null || loadingStripe !== null) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {plan.key === (user?.accountType || "free") ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 text-blue-400" strokeWidth={3} />
                          <span>Current Plan</span>
                        </div>
                      ) : (loadingRazorpay === plan.name || loadingStripe === plan.name) ? (
                        "Processing..."
                      ) : (
                        plan.cta
                      )}
                    </button>
                    {plan.key === (user?.accountType || "free") && plan.key !== "free" && (
                      user?.cancelAtPeriodEnd ? (
                        <span className="mt-3 inline-flex text-xs text-orange-400/90 bg-orange-400/10 px-3 py-1.5 rounded-full font-medium border border-orange-400/20">
                          Ends on {user.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'period end'}
                        </span>
                      ) : (
                        <button 
                          onClick={async () => {
                            try {
                              if (user?.subscriptionProvider === "razorpay") {
                                if (!user?.subscriptionId) {
                                  toast.error("No active subscription found. Please contact support.");
                                  return;
                                }
                                await cancelRazorpay(user.subscriptionId);
                                return;
                              }

                              // Stripe Cancellation
                              if (!user?.customerId) {
                                toast.error("No active billing profile found. Please contact support.");
                                return;
                              }
                              
                              toast.loading("Redirecting to billing portal...", { id: "portal-loading" });
                              
                              const res = await fetch("/api/payments/stripe/portal", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ customerId: user.customerId })
                              });
                              
                              if (!res.ok) throw new Error("Failed to securely connect to billing portal");
                              
                              const { url } = await res.json();
                              toast.dismiss("portal-loading");
                              window.location.href = url;
                            } catch (e: any) {
                              console.error(e);
                              toast.dismiss("portal-loading");
                              toast.error(e.message || "Something went wrong.");
                            }
                          }}
                          className="mt-3 py-1.5 px-4 rounded-full text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                        >
                          Cancel Subscription
                        </button>
                      )
                    )}
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
