"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

export type RazorpayPaymentResponse = {
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RazorpayPaymentFailedResponse = {
  error: {
    description: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string | undefined;
  amount?: number;
  currency?: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  image?: string;
  description: string;
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  on: (
    event: "payment.failed",
    callback: (response: RazorpayPaymentFailedResponse) => void,
  ) => void;
  open: () => void;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

export type PlanType = "plus" | "pro";

export interface Plan {
  name: string;
  planType: PlanType;
  priceUSD: number;
}

export const useRazorpay = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const initiatePayment = async (
    plan: Plan,
    userDetails: { id: Id<"users">; name: string; email: string }
  ) => {
    if (!userDetails?.id) {
      toast.error("User data missing");
      return;
    }

    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment system is loading, please try again.");
      return;
    }

    setLoadingPlan(plan.name);

    try {
      // Create Subscription
      const orderRes = await fetch("/api/payments/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.planType === "plus" ? 749 : 1899,
          currency: "INR",
          planName: plan.name,
          planType: plan.planType,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        let errMsg = orderData.error;
        if (typeof errMsg === 'object') {
          errMsg = errMsg?.description || JSON.stringify(errMsg);
        }
        throw new Error(errMsg || "Failed to create subscription");
      }

      const options: RazorpayCheckoutOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: orderData.subscriptionId,
        name: "WeKraft",
        description: `Upgrade to ${plan.name}`,
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.planType,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success(`Successfully upgraded to ${plan.name}!`);
            } else {
              toast.error(
                verifyData.error || "Payment verification failed. Please contact support.",
              );
            }
          } catch (err) {
            console.error("[Razorpay] Verification error:", err);
            toast.error("An error occurred during payment verification.");
          } finally {
            setLoadingPlan(null);
          }
        },
        prefill: {
          name: userDetails.name || "",
          email: userDetails.email || "",
        },
        theme: { color: "#05070B" },
        modal: {
          ondismiss: () => {
            document.body.style.overflow = "auto";
            toast.info("Payment cancelled");
            setLoadingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: RazorpayPaymentFailedResponse) => {
        document.body.style.overflow = "auto";
        toast.error(`Payment failed: ${response.error.description}`);
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred while initiating payment.";
      console.error("[Razorpay] Payment initiation error:", error);
      toast.error(message);
      setLoadingPlan(null);
    }
  };

  const cancelPayment = async (subscriptionId: string) => {
    setLoadingPlan("cancel");
    try {
      const cancelRes = await fetch("/api/payments/razorpay/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      if (!cancelRes.ok) {
        const data = await cancelRes.json();
        throw new Error(
          data.error || "Failed to cancel subscription on Razorpay",
        );
      }
      toast.success("Subscription cancelled successfully.");
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to cancel subscription. Please contact support.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return { initiatePayment, cancelPayment, loadingPlan, setLoadingPlan };
};
