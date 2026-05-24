"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { X, Loader2, SpeakerIcon, MegaphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnnouncementBanner() {
  const activeAnnouncement = useQuery(api.announcement.getActiveAnnouncement);
  const dismissAnnouncement = useMutation(api.announcement.dismissAnnouncement);
  const [isDismissing, setIsDismissing] = useState(false);

  if (!activeAnnouncement) return null;

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await dismissAnnouncement({ announcementId: activeAnnouncement._id });
    } catch (error) {
      console.error("Failed to dismiss announcement:", error);
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-2 bg-blue-500/10 dark:bg-blue-700/15 border-b border-blue-500/20 transition-all duration-300 shrink-0">
      <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
        <span className="font-semibold mr-1"><MegaphoneIcon className="inline mr-1 w-4 h-4" />{activeAnnouncement.title}:</span>
        <span className="text-primary/90">{activeAnnouncement.description}</span>
      </div>

      <Button
        variant="outline"
        size="icon-xs"
        onClick={handleDismiss}
        disabled={isDismissing}
        className=" rounded-full shrink-0 transition-transform"
      >
        {isDismissing ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
