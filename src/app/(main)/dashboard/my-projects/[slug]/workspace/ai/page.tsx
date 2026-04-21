"use client";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  Brain,
  Globe,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import React, { useState } from "react";

const quickActions = [
  {
    icon: <Sparkles size={18} />,
    title: "Create Task",
    sub: "Create a new task",
  },
  {
    icon: <Bell size={18} />,
    title: "Set Reminder",
    sub: "Remind me to update",
  },
  {
    icon: <Sparkles size={18} />,
    title: "Brainstorm Ideas",
    sub: "Generate ideas for task",
  },
  {
    icon: <Search size={18} />,
    title: "Find Tasks",
    sub: "Find tasks by status",
  },
];

const AIWorkspace = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden flex flex-col">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -top-32 -left-40 w-200 h-100 rounded-full opacity-15"
          style={{
            background: "radial-gradient(ellipse, #f9a8d4, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
         <div
          className="absolute -top-32 -right-40 w-125 h-100 rounded-full opacity-15"
          style={{
            background: "radial-gradient(ellipse, #93c5fd, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
       
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-20 px-6 gap-8 flex-1">
        <div className="flex items-center gap-3">
          <Image src="/kaya.svg" alt="Kaya AI" width={50} height={50} />
          <span className="text-3xl font-semibold tracking-tight text-primary font-pop">
            Kaya
          </span>
        </div>
        <div className="w-full max-w-2xl flex flex-col ">
          {/* Ask Kaya pill */}
          <div className="flex ml-3">
            <div
              className="flex items-center gap-2 px-4 pt-2 pb-1 rounded-t-full text-sm font-medium text-primary-foreground "
              style={{
                background:
                  "linear-gradient(135deg, #f9a8d4 0%, #93c5fd 40%, #c4b5fd 70%, #fda4af 100%)",
              }}
            >
              <Image src="/kaya.svg" alt="" width={18} height={18} />
              Ask Kaya
            </div>
          </div>

          {/* Gradient-bordered textarea card */}
          <div
            className="rounded-2xl p-0.5"
            style={{
              background:
                "linear-gradient(135deg, #f9a8d4 0%, #93c5fd 40%, #c4b5fd 70%, #fda4af 100%)",
            }}
          >
            <div className="rounded-2xl bg-background flex flex-col">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Get instant answers, insights, and ideas."
                className="resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-30 text-primary placeholder:text-muted-foreground text-[15px] px-4 pt-4 pb-2 bg-card rounded-2xl"
              />

              <div className="flex items-center justify-between px-3 py-3">
                {/* Left: + and model */}
                <div className="flex items-center gap-2">
                  
                  <Select defaultValue="auto">
                    <SelectTrigger className="h-7 px-3 rounded-full border border-border bg-accent text-xs text-primary font-medium shadow-none focus:ring-0 gap-1.5 min-w-[110px]">
                      <Brain size={15} />
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="kaya-fast">Kaya Fast</SelectItem>
                      <SelectItem value="kaya-pro">Kaya Pro</SelectItem>
                      <SelectItem value="kaya-deep">Kaya Deep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-muted"
                    style={
                      message.trim()
                        ? {
                            background:
                              "linear-gradient(135deg, #f472b6, #818cf8)",
                          }
                        : {}
                    }
                  >
                    <ArrowRight
                      size={15}
                      className={
                        message.trim() ? "text-white" : "text-muted-foreground"
                      }
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-4 gap-3 mt-10">
            {quickActions.map((item, i) => (
              <button
                key={i}
                className="flex flex-col gap-1 p-3 rounded-xl border border-border bg-sidebar hover:bg-muted text-left transition-all"
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="text-[13px] font-semibold text-primary leading-tight">
                  {item.title}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {item.sub}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWorkspace;
