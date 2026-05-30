"use client";
import { useConvexAuth } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import Pricing from "@/modules/web/Pricing";

const PricingPage = () => {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="relative">


      <Pricing />
    </div>
  );
};

export default PricingPage;
