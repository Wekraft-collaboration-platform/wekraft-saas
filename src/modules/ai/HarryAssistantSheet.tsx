"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MessagesSquare,
  Send,
  Settings2,
  Square,
  MessageSquare,
  Clover,
  LayersPlus,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { AnimatePresence, motion } from "framer-motion";
import { useHarryStore } from "@/store/useHarryStore";
import { useKayaStore } from "@/store/useKayaStore";
import { useUpgradeModalStore } from "@/store/useUpgradeModalStore";


export function HarryAssistantSheet() {
  const { isOpen, setIsOpen, threadId, createNewSession } = useHarryStore();
  const currentUser = useQuery(api.user.getCurrentUser);
  const router = useRouter();

  const params = useParams();
  const slug = params?.slug as string;
  const project = useQuery(
    api.project.getProjectBySlug,
    slug ? { slug } : "skip",
  );


  const searchParams = useSearchParams();
  const isHarryActive = searchParams?.get("harry") === "true";

  // Mutually exclusive sheets
  useEffect(() => {
    if (isOpen) {
      useKayaStore.getState().setIsOpen(false);
    }
  }, [isOpen]);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        if (!isHarryActive) return; // Let Kaya's sheet handle it
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setIsOpen, isHarryActive]);


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-[500px] flex flex-col p-0 gap-0 h-full focus-visible:ring-0 focus:ring-0 outline-none overflow-hidden"
      >
        {/* HEADER */}
        <SheetHeader className="px-4 py-3 border-b bg-card">
          <div className="flex items-center justify-between pr-10 gap-5">
            <div className="flex flex-col items-start">
              <SheetTitle className="flex items-center gap-2 text-lg font-pop font-semibold mb-1">
                <img src="/harry.svg" alt="Harry AI" width={28} height={28} />
                <span className="text-xl font-semibold tracking-tight ">
                  Harry
                </span>
              </SheetTitle>
              {threadId && (
                <p className="text-[10px] text-muted-foreground font-mono tracking-tight truncate max-w-[160px]">
                  <span className="text-primary">Session:</span> {threadId}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] shrink-0 cursor-pointer flex items-center gap-1.5"
                onClick={() => {
                  setIsOpen(false);
                  useKayaStore.getState().setIsOpen(true);
                }}
              >
                <img src="/kaya.svg" alt="kaya" width={18} height={18} />
                Open Kaya
              </Button>
            </div>
          </div>
        </SheetHeader>


        {/* MESSAGES */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col items-center justify-center">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 text-center"
              >
                <img
                  src="/harry.svg"
                  alt="Harry AI"
                  width={60}
                  height={60}
                  className=" mb-2"
                />
                <h3 className="text-xl font-pop font-semibold text-primary mb-2 tracking-tight">
                  Hey, I&apos;m Harry
                </h3>
                <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                  {project && (project as any).ownerAccountType !== "pro"
                    ? "Harry is under heavy development and will come soon for Pro projects."
                    : "Harry is under heavy development and will come soon."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-6 bg-linear-to-b from-transparent via-amber-200/10 to-orange-500/20">
          <div className="relative">
            {!!(project && (project as any).ownerAccountType !== "pro") && (
              <div
                className="absolute inset-0 z-30 cursor-pointer"
                onClick={() => useUpgradeModalStore.getState().openModal()}
              />
            )}
            <Input
              placeholder="Harry is under development..."
              value=""
              disabled={true}
              className="h-12 rounded-xl bg-sidebar pr-36"
            />
            <div className="flex items-center gap-2 absolute right-2 top-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 cursor-not-allowed"
                disabled={true}
              >
                <Send className="h-3 w-3!" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 cursor-not-allowed"
                disabled={true}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Harry is your senior developer agent.{" "}
            <span className="text-orange-500 cursor-pointer font-medium">
              Click to configure
            </span>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
