"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  if (feedback) {
    return (
      <div className="mt-12 pt-6 border-t border-white/8">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span className="text-emerald-400">✓</span>
          <span>Thanks for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-6 border-t border-white/8">
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/30">Was this page helpful?</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setFeedback("up")}
            className="text-white/30 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-950/20"
            title="Yes, helpful"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setFeedback("down")}
            className="text-white/30 hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/20"
            title="Not helpful"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
