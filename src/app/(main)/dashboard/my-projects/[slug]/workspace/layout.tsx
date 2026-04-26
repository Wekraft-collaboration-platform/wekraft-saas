"use client";

import { FloatingKaya } from "@/modules/ai/FloatingKaya";
import { AiAssistantSheet } from "@/modules/ai/AiAssistantSheet";

export default function WorkspaceLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="">
      {sidebar} {/* This will now receive workspace @sidebar */}
      <main className="flex-1">{children}</main>
      <FloatingKaya />
      <AiAssistantSheet />
    </div>
  );
}
