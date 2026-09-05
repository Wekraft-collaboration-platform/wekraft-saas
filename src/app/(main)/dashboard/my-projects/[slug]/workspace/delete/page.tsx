"use client";

import { AlertTriangle } from "lucide-react";

export default function DeleteProjectPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center max-w-lg gap-4">
        {/* Monochrome Alert Icon */}
        <AlertTriangle className="h-10 w-10 text-zinc-400" />
        
        {/* Corrected Text with proper grammar and spelling */}
        <p className="text-base text-zinc-300 leading-relaxed font-medium select-all">
          You cannot delete this project manually. You need to raise a query related to this in Help and Support.
        </p>
      </div>
    </div>
  );
}
