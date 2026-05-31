import React from "react";
import Navbar from "@/modules/web/Navbar";
import WhyUsHero from "@/modules/web/WhyUsHero";
import WhyUsRatings from "@/modules/web/WhyUsRatings";
import WhyUsComparisonMatrix from "@/modules/web/WhyUsComparisonMatrix";
import TrustedBy from "@/modules/web/TrustedBy";

export default function WhyUsPage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <WhyUsHero />
        <WhyUsRatings />
        <TrustedBy />
        <WhyUsComparisonMatrix />
        
      </main>
    </div>
  );
}
