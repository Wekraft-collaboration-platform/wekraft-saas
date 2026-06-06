import React from "react";
import Pricing from "@/modules/web/Pricing";
import Footer from "@/modules/web/Footer";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Simple, transparent pricing for WeKraft. Choose the plan that fits your team: Free, Plus ($9/mo), or Pro ($20/mo) with full AI PM agents and developer features.",
  alternates: {
    canonical: "https://wekraft.xyz/web/pricing",
  },
};

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://wekraft.xyz/web/pricing/#softwareapp",
  "name": "WeKraft",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "20",
    "offerCount": "3",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "name": "Plus Plan",
        "price": "9.00",
        "priceCurrency": "USD"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "20.00",
        "priceCurrency": "USD"
      }
    ]
  }
};

const PricingPage = () => {
  return (
    <div className="relative">
      <StructuredData data={pricingSchema} />
      <Pricing />
      <Footer />
    </div>
  );
};

export default PricingPage;
