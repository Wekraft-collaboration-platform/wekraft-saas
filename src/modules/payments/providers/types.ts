import { CheckoutResponse } from "../../../../convex/payments";

export interface UserParams {
  name?: string;
  email?: string;
}

export interface PaymentCallbacks {
  onSuccess?: (response?: any) => void;
  onError?: (error: Error) => void;
  onDismiss?: () => void;
}

export interface FrontendPaymentProvider {
  /**
   * Initialize any scripts or SDKs if required.
   */
  initialize(): Promise<void>;
  
  /**
   * Handle the checkout flow based on the backend response.
   */
  handleCheckout(
    checkoutResponse: CheckoutResponse,
    callbacks: PaymentCallbacks,
    userParams?: UserParams
  ): Promise<void>;
}
