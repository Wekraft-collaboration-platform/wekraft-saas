import React from "react";
import Navbar from "@/modules/web/Navbar";
import FAQ from "@/modules/web/FAQ";
import Footer from "@/modules/web/Footer";
import type { Metadata } from "next";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Security, Privacy & Data FAQ | WeKraft",
  description:
    "Frequently Asked Questions about WeKraft Security: Application-Level Encryption (ALE), End-to-End Encryption (E2E), and immutable Audit Logs for data privacy.",
  alternates: {
    canonical: "https://wekraft.xyz/web/faq",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://wekraft.xyz/web/faq/#faqpage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What security measures protect our data privacy in WeKraft?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WeKraft employs multi-layered enterprise defense including Application-Level Encryption (ALE), End-to-End (E2E) Encryption, and granular access controls. Your data is encrypted both in transit (TLS 1.3) and at rest (AES-256)."
      }
    },
    {
      "@type": "Question",
      "name": "How does Application-Level Encryption (ALE) protect sensitive data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Application-Level Encryption (ALE) encrypts sensitive payload fields directly within the application before writing to persistent database storage."
      }
    },
    {
      "@type": "Question",
      "name": "What is End-to-End (E2E / ETE) Encryption and how is it used?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "End-to-End Encryption ensures that sensitive developer communications, secrets, and task attachments are encrypted on your local device before transmission."
      }
    },
    {
      "@type": "Question",
      "name": "Are detailed Audit Logs available for tracking workspace actions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! WeKraft generates immutable, real-time audit logs for every key event across your workspace including authentication attempts, permission changes, document exports, and settings updates."
      }
    }
  ]
};

const FAQPage = () => {
  return (
    <div className="bg-black min-h-screen relative">
      <StructuredData data={faqSchema} />
      <Navbar />
      <div className="pt-20">
        <FAQ />
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;
