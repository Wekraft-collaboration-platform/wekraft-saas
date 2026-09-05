"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

export type PlanType = "plus" | "pro";

export interface Plan {
  name: string;
  planType: PlanType;
  priceUSD: number;
}

export const useLemonSqueezyCheckout = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const initiatePayment = async (
    plan: Plan,
    userDetails: { id: Id<"users">; name: string; email: string }
  ) => {
    if (!userDetails?.id) {
      toast.error("User data missing");
      return;
    }

    setLoadingPlan(plan.name);

    try {
      const res = await fetch("/api/payments/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: plan.name,
          planType: plan.planType,
          priceUSD: plan.priceUSD,
          userEmail: userDetails.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Redirect to Lemon Squeezy Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while initiating payment.";
      console.error("[Lemon Squeezy] Checkout initiation error:", error);
      toast.error(message);
      setLoadingPlan(null);
    }
  };

  return { initiatePayment, loadingPlan, setLoadingPlan };
};
