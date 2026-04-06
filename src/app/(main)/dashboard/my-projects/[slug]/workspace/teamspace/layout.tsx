import React from "react";
import { TeamspaceProvider } from "@/providers/TeamspaceProvider";

export default function TeamspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap the entire Teamspace feature in the context
    <TeamspaceProvider>
      <div className="flex h-full w-full overflow-hidden bg-background">
        {/* Main Chat Area (Full width since there are no channels) */}
        <div className="flex-1 flex flex-col h-full relative">
          {children}
        </div>
        
        {/* We will add the Collapsible Thread Viewer on the right side later */}
      </div>
    </TeamspaceProvider>
  );
}
