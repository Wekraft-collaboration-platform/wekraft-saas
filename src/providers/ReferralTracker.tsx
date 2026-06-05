"use client";

import { useEffect } from "react";

export function ReferralTracker() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get("ref");
        if (ref) {
          localStorage.setItem("wekraft_referral_code", ref.trim());
          sessionStorage.setItem("wekraft_referral_code", ref.trim());
        }
      } catch (err) {
        console.error("Failed to parse or save referral code:", err);
      }
    }
  }, []);

  return null;
}
