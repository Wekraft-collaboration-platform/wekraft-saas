"use client";
import React from "react";
import Pricing from "@/modules/web/Pricing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useConvexAuth } from "convex/react";

const PricingPage = () => {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="relative">
      {/* ── Back Button ── */}
      <div className="absolute top-6 left-6 z-20">
        <Link href={isAuthenticated ? "/dashboard" : "/"}>
          <Button variant="outline" className="gap-2 bg-[#0a0a0a]/90 text-white border-white/10 hover:bg-white hover:text-black rounded-full">
            <ArrowLeft className="h-4 w-4" />
            {isAuthenticated ? "Back to Dashboard" : "Back to Website"}
          </Button>
        </Link>
      </div>
      
      <Pricing />
    </div>
  );
};

export default PricingPage;
