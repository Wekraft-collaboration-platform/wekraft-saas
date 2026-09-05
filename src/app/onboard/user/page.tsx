"use client";

import React from "react";
import { MultiStepOnboarding } from "@/modules/onboard/components/Steps";
import { DesktopOnlyGuard } from "@/components/DesktopOnlyGuard";

const Onboard = () => {
  return (
    <DesktopOnlyGuard>
      <main className="h-screen bg-black">
        <MultiStepOnboarding />
      </main>
    </DesktopOnlyGuard>
  );
};

export default Onboard;
