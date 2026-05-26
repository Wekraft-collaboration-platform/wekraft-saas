"use client";

import { useState } from "react";
import { ExternalLink, Link2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function getPlatformKey(url: string): string | undefined {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) return "github";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("discord.com") || lower.includes("discord.gg") || lower.includes("discordapp.com")) return "discord";
  if (lower.includes("instagram.com")) return "instagram";
  return undefined;
}

function cleanUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export const SocialLinks = ({ socialLinks = [] }: SocialLinksProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [focusPlatform, setFocusPlatform] = useState<string | undefined>(undefined);

  // Filter links to only keep the 5 supported platforms
  const activeLinks = (socialLinks?.filter(Boolean) || []).filter((link) => {
    const info = getPlatformInfo(link);
    return info !== null;
  });

  const hasLinks = activeLinks.length > 0;

  const handleOpenDialog = (platformKey?: string) => {
    setFocusPlatform(platformKey);
    setIsEditing(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground/50">Social Links</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-foreground/45 hover:text-foreground hover:bg-muted shrink-0 rounded-md gap-1.5 px-2 text-xs"
          onClick={() => handleOpenDialog()}
        >
          <Pencil className="h-3 w-3" />

        </Button>
      </div>

      {hasLinks ? (
        <div className="flex flex-col gap-2 flex-1">
          {activeLinks.map((link) => {
            const platform = getPlatformInfo(link);
            if (!platform) return null;
            const Icon = platform.icon;
            const key = getPlatformKey(link);
            return (
              <div
                key={link}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 transition-all hover:bg-muted/50 hover:border-border hover:shadow-sm"
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-3 min-w-0"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background border border-border/60 group-hover:scale-105 transition-transform">
                    <Icon className={cn("h-3.5 w-3.5", platform.colorClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] h-4 px-1.5 font-semibold border", platform.badgeClass)}
                    >
                      {platform.label}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5 leading-tight">
                      {cleanUrl(link)}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-1 shrink-0 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6.5 w-6.5 text-muted-foreground/50 hover:text-primary hover:bg-muted rounded-md"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenDialog(key);
                    }}
                    aria-label={`Edit ${platform.label} link`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-6.5 w-6.5 items-center justify-center text-muted-foreground/40 hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    aria-label={`Visit ${platform.label}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 bg-muted/10 text-center py-4 px-4">
          <Link2 className="h-4 w-4 text-muted-foreground/25" />
          <p className="text-[11px] text-muted-foreground/60">No links connected yet</p>
          <Button
            onClick={() => handleOpenDialog()}
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
        defaultFocus={focusPlatform}
      />
    </div>
  );
};
