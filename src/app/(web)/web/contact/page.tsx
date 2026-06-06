import React from "react";
import type { Metadata } from "next";
import ContactContent from "./ContactContent";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Have questions about WeKraft, custom plans, enterprise deployment, or billing support? Fill out the contact form and our team will get back to you within 24 hours.",
  alternates: {
    canonical: "https://wekraft.xyz/web/contact",
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://wekraft.xyz/web/contact/#contactpage",
  "url": "https://wekraft.xyz/web/contact",
  "name": "Contact WeKraft Support & Sales",
  "description": "Get in touch with WeKraft's technical support, customer success, or enterprise sales team. We respond within 24 hours.",
  "mainEntity": {
    "@type": "Organization",
    "name": "WeKraft",
    "email": "support@wekraft.xyz"
  }
};

export default function ContactPage() {
  return (
    <>
      <StructuredData data={contactSchema} />
      <ContactContent />
    </>
  );
}
