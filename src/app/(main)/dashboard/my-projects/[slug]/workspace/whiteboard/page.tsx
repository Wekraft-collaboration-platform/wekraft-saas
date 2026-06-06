"use client";

import { History, Plus, Palette } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";

export default function WhiteboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  return (
    <div className="w-full h-full p-6 max-w-7xl mx-auto">
      {/* ── Header ───────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold flex items-center">
            <Palette className="w-6 h-6 mr-2 text-primary" />
            Project Whiteboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Brainstorm, sketch designs, and map flows interactively with your team.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <Button size="sm" className="shadow-sm text-xs" disabled>
            <Plus className="w-4 h-4 mr-2" />
            New Whiteboard
          </Button>
        </div>
      </header>

      {/* ── Empty State Container ─────────────────────── */}
      <div className="mt-20">
        <div className="flex flex-col items-start justify-center space-y-2.5 p-4 w-[380px] mx-auto">
          <Image
            src="/pat106.svg"
            alt="Empty Whiteboard"
            width={160}
            height={160}
            className="mb-1"
          />

          <div className="space-y-2.5 w-full">
            <div>
              <p className="text-xl font-semibold text-primary">
                No Whiteboards Yet
              </p>
              <p className="text-muted-foreground text-sm lg:text-[15px] leading-relaxed">
                Real-time canvas brainstorming is coming soon! Sketch user flows,
                wireframes, and mind maps directly within your WeKraft project.
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
              Coming Soon
            </Button>
            <Link href="/web/docs" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-5 cursor-pointer"
              >
                Read Docs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
