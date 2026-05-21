import { FrontendPaymentProvider, PaymentCallbacks, UserParams } from "./types";
import { CheckoutResponse } from "../../../../convex/payments";

export class RazorpayProvider implements FrontendPaymentProvider {
  private isLoaded = false;

  async initialize(): Promise<void> {
    if (typeof window === "undefined") return;

    if ((window as any).Razorpay) {
      this.isLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay script"));
      };
      document.body.appendChild(script);
    });
  }

  async handleCheckout(
    checkoutResponse: CheckoutResponse,
    callbacks: PaymentCallbacks,
    userParams?: UserParams
  ): Promise<void> {
    if (checkoutResponse.type !== "modal" || checkoutResponse.provider !== "razorpay") {
      throw new Error("RazorpayProvider expects a modal checkout response from razorpay.");
    }

    if (!this.isLoaded) {
      // Ensure it's initialized
      await this.initialize();
    }
    
    if (!(window as any).Razorpay) {
      throw new Error("Razorpay SDK is not loaded. Please try again.");
    }

    const razorpayOptions = {
      key: checkoutResponse.key,
      subscription_id: checkoutResponse.subscriptionId,
      name: "Wekraft",
      description: "Subscription Plan Upgrade",
      prefill: {
        name: userParams?.name || "",
        email: userParams?.email || "",
      },
      theme: {
        color: "#000000",
      },
      handler: (response: any) => {
        callbacks.onSuccess?.(response);
      },
      modal: {
        ondismiss: () => {
          callbacks.onDismiss?.();
        },
      },
    };

    const rzp = new (window as any).Razorpay(razorpayOptions);
    rzp.on("payment.failed", function (response: any) {
      callbacks.onError?.(new Error(response.error.description || "Payment failed"));
    });

    rzp.open();
  }
}
