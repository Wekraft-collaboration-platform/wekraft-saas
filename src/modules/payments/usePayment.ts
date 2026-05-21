import { useState, useCallback } from "react";
import { CheckoutResponse } from "../../../convex/payments";
import { getFrontendPaymentProvider } from "./providers";

export function usePayment(props?: {
  onSuccess?: (response?: any) => void;
  onError?: (error: Error) => void;
  onDismiss?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = useCallback(
    async (
      checkoutResponse: CheckoutResponse,
      userParams?: { name?: string; email?: string }
    ) => {
      setIsLoading(true);

      try {
        const provider = getFrontendPaymentProvider(checkoutResponse);
        
        // Wait for script to initialize if needed (lazy load)
        await provider.initialize();
        
        await provider.handleCheckout(
          checkoutResponse, 
          {
            onSuccess: (res) => {
              setIsLoading(false);
              props?.onSuccess?.(res);
            },
            onError: (err) => {
              setIsLoading(false);
              props?.onError?.(err);
            },
            onDismiss: () => {
              setIsLoading(false);
              props?.onDismiss?.();
            }
          },
          userParams
        );
      } catch (error: any) {
        setIsLoading(false);
        props?.onError?.(error);
        throw error;
      }
    },
    [props]
  );

  return {
    handleCheckout,
    isLoading,
    isReady: true, // No need to check script loaded status globally anymore
  };
}
