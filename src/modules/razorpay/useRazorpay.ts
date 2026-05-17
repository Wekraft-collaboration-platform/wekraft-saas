import { useState, useCallback, useEffect } from "react";
import { RazorpayOrderOptions, RazorpayResponse, UseRazorpayProps } from "./types";

export function useRazorpay(props?: UseRazorpayProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      props?.onError?.(new Error("Failed to load Razorpay script"));
    };
    document.body.appendChild(script);

    return () => {
      // We keep the script attached for subsequent usages
    };
  }, [props]);

  const initiatePayment = useCallback(
    async (options: Omit<RazorpayOrderOptions, "handler" | "modal">) => {
      if (!isScriptLoaded) {
        const error = new Error("Razorpay SDK is not loaded. Please try again.");
        props?.onError?.(error);
        throw error;
      }

      setIsLoading(true);

      try {
        const razorpayOptions: RazorpayOrderOptions = {
          ...options,
          handler: (response: RazorpayResponse) => {
            setIsLoading(false);
            props?.onSuccess?.(response);
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
              props?.onDismiss?.();
            },
          },
        };

        const rzp = new (window as any).Razorpay(razorpayOptions);
        rzp.on("payment.failed", function (response: any) {
          setIsLoading(false);
          props?.onError?.(new Error(response.error.description || "Payment failed"));
        });
        
        rzp.open();
      } catch (error: any) {
        setIsLoading(false);
        props?.onError?.(error);
        throw error;
      }
    },
    [isScriptLoaded, props]
  );

  return {
    initiatePayment,
    isScriptLoaded,
    isLoading,
  };
}
