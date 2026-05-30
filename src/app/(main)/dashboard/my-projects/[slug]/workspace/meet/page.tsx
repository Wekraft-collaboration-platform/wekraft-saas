"use client";

import { History, Plus, Video } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { useKayaStore } from "@/store/useKayaStore";

export default function MeetPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { setIsOpen } = useKayaStore();

  return (
    <div className="w-full h-full p-6 max-w-7xl mx-auto">
      {/* ── Header ───────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            <Video className="w-6 h-6 mr-2 text-primary inline-block" />
            Team Meet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with your teammates in real-time meetings and collaborate.
          </p>
        </div>

        <div className="flex items-center gap-5">

          <Button size="sm" className="shadow-sm text-xs" disabled>
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </header>

      {/* ── Empty State Container ─────────────────────── */}
      <div className="mt-20">
        <div className="flex flex-col items-start justify-center space-y-2.5 p-4 w-[380px] mx-auto">
          <Image
            src="/pat106.svg"
            alt="Empty Workspace"
            width={160}
            height={160}
            className="mb-1"
          />

          <div className="space-y-2.5 w-full">
            <div>
              <p className="text-xl font-semibold text-primary">
                No Active Meetings
              </p>
              <p className="text-muted-foreground text-sm lg:text-[15px] leading-relaxed">
                Real-time video collaboration is coming soon! Host secure team
                meetings, share your screen, and brainstorm ideas with your
                teammates.
              </p>
            </div>

            {/* Static Pro Access Alert Banner */}
            <div className="p-3 rounded-lg border bg-blue-500/5 text-xs text-muted-foreground leading-normal w-full">
              <span className="font-semibold text-primary">
                PRO Feature:
              </span>{" "}
              Pro Access needed to use this feature.
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="default"
              size="sm"
              className="rounded-full px-5"
              disabled
            >
              <Video className="w-4 h-4 mr-2" />
              Start Meet
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-5 flex items-center gap-1.5"
              disabled
            >
              History
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
