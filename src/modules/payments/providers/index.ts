import { FrontendPaymentProvider } from "./types";
import { StripeProvider } from "./StripeProvider";
import { RazorpayProvider } from "./RazorpayProvider";
import { CheckoutResponse } from "../../../../convex/payments";

export function getFrontendPaymentProvider(checkoutResponse: CheckoutResponse): FrontendPaymentProvider {
  if (checkoutResponse.type === "redirect") {
    // We assume redirect means Stripe for now based on current implementation
    return new StripeProvider();
  } else if (checkoutResponse.type === "modal" && checkoutResponse.provider === "razorpay") {
    return new RazorpayProvider();
  }
  
  throw new Error("Unsupported payment provider or checkout response type.");
}
