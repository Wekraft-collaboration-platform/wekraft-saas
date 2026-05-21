import { FrontendPaymentProvider, PaymentCallbacks, UserParams } from "./types";
import { CheckoutResponse } from "../../../../convex/payments";

export class StripeProvider implements FrontendPaymentProvider {
  async initialize(): Promise<void> {
    // Stripe redirect doesn't require any script to be loaded on our side,
    // as it just redirects the user to the Stripe hosted checkout URL.
    return Promise.resolve();
  }

  async handleCheckout(
    checkoutResponse: CheckoutResponse,
    _callbacks: PaymentCallbacks,
    _userParams?: UserParams
  ): Promise<void> {
    if (checkoutResponse.type !== "redirect") {
      throw new Error("StripeProvider expects a redirect checkout response.");
    }
    
    // Redirect to Stripe Checkout
    window.location.href = checkoutResponse.url;
  }
}
