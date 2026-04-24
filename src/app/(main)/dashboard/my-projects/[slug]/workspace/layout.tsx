"use client";

import { FloatingKaya } from "@/modules/ai/FloatingKaya";

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
    </div>
  );
}
