"use client";

import { useState } from "react";
import { Link2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SocialLinksDialog } from "./SocialLinksDialog";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaDiscord,
  FaInstagram,
} from "react-icons/fa";

interface SocialLinksProps {
  socialLinks?: string[];
}

interface PlatformInfo {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  badgeClass: string;
}

function getPlatformInfo(url: string): PlatformInfo | null {
  if (!url || typeof url !== "string") return null;
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) {
    return {
      label: "GitHub",
      icon: FaGithub,
      colorClass: "text-[#24292e] dark:text-white",
      badgeClass: "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400",
    };
  }
  if (lower.includes("linkedin.com")) {
    return {
      label: "LinkedIn",
      icon: FaLinkedin,
      colorClass: "text-[#0077b5]",
      badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    };
  }
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return {
      label: "Twitter / X",
      icon: FaTwitter,
      colorClass: "text-[#1da1f2] dark:text-white",
      badgeClass: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
    };
  }
  if (lower.includes("discord.com") || lower.includes("discord.gg") || lower.includes("discordapp.com")) {
    return {
      label: "Discord",
      icon: FaDiscord,
      colorClass: "text-[#5865f2]",
      badgeClass: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    };
  }
  if (lower.includes("instagram.com")) {
    return {
      label: "Instagram",
      icon: FaInstagram,
      colorClass: "text-[#e1306c]",
      badgeClass: "bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400",
    };
  }
  return null;
}

const EMPTY_ARRAY: string[] = [];

export const SocialLinks = ({ socialLinks = EMPTY_ARRAY }: SocialLinksProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Filter links to only keep the 5 supported platforms
  const activeLinks = (Array.isArray(socialLinks) ? socialLinks.filter(Boolean) : []).filter((link) => {
    const info = getPlatformInfo(link);
    return info !== null;
  });

  const hasLinks = activeLinks.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground/50">Social Links</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-foreground/45 hover:text-foreground hover:bg-muted shrink-0 rounded-md"
          onClick={() => setIsEditing(true)}
          aria-label="Edit Social Links"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>

      {hasLinks ? (
        <div className="flex flex-wrap gap-2.5 pt-1.5 flex-1 items-start content-start">
          {activeLinks.map((link) => {
            const platform = getPlatformInfo(link);
            if (!platform) return null;
            const Icon = platform.icon;
            return (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/55 hover:border-border/80 hover:shadow-sm transition-all hover:scale-105 shrink-0",
                  platform.colorClass
                )}
                title={platform.label}
              >
                <Icon className="h-4.5 w-4.5" />
              </a>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 bg-muted/10 text-center py-4 px-4">
          <Link2 className="h-4 w-4 text-muted-foreground/25" />
          <p className="text-[11px] text-muted-foreground/60">No links connected yet</p>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="gap-1 text-[11px] h-6 border-dashed px-3 cursor-pointer mt-1"
          >
            <Link2 className="h-3 w-3" />
            Link Accounts
          </Button>
        </div>
      )}

      <SocialLinksDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        currentLinks={socialLinks}
      />
    </div>
  );
};
