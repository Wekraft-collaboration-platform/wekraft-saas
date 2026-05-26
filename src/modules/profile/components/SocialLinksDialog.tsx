"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaDiscord,
  FaInstagram,
} from "react-icons/fa";

interface SocialLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLinks?: string[];
  defaultFocus?: string;
}

interface Platform {
  key: string;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  colorClass: string;
  domains: string[];
}

const PLATFORMS: Platform[] = [
  {
    key: "github",
    label: "GitHub",
    placeholder: "github.com/yourusername",
    icon: FaGithub,
    colorClass: "text-[#24292e] dark:text-white",
    domains: ["github.com"],
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/in/yourusername",
    icon: FaLinkedin,
    colorClass: "text-[#0077b5]",
    domains: ["linkedin.com"],
  },
  {
    key: "twitter",
    label: "X / Twitter",
    placeholder: "x.com/yourusername",
    icon: FaTwitter,
    colorClass: "text-[#1da1f2] dark:text-white",
    domains: ["twitter.com", "x.com"],
  },
  {
    key: "discord",
    label: "Discord",
    placeholder: "discord.gg/invite-code or profile URL",
    icon: FaDiscord,
    colorClass: "text-[#5865f2]",
    domains: ["discord.com", "discord.gg", "discordapp.com"],
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "instagram.com/yourusername",
    icon: FaInstagram,
    colorClass: "text-[#e1306c]",
    domains: ["instagram.com"],
  },
];

export const SocialLinksDialog = ({
  open,
  onOpenChange,
  currentLinks = [],
  defaultFocus,
}: SocialLinksDialogProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const updateSocials = useMutation(api.user.updateSocialLinks);

  // Parse currentLinks and load into formData
  useEffect(() => {
    if (open) {
      const initialData: Record<string, string> = {};
      const remainingLinks = [...currentLinks];

      PLATFORMS.forEach((platform) => {
        const matchingIndex = remainingLinks.findIndex((link) =>
          platform.domains.some((domain) => link.toLowerCase().includes(domain))
        );

        if (matchingIndex !== -1) {
          initialData[platform.key] = remainingLinks[matchingIndex];
          remainingLinks.splice(matchingIndex, 1);
        } else {
          initialData[platform.key] = "";
        }
      });

      setFormData(initialData);
    }
  }, [open, currentLinks]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const linksToSave: string[] = [];

      PLATFORMS.forEach((platform) => {
        const val = formData[platform.key];
        if (val && val.trim()) {
          let url = val.trim();
          // Ensure it has a protocol
          if (!/^https?:\/\//i.test(url)) {
            url = `https://${url}`;
          }
          linksToSave.push(url);
        }
      });

      await updateSocials({ links: linksToSave });
      toast.success("Social links updated successfully!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update social links");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col bg-card border border-border/40 text-foreground shadow-2xl p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-border/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Link Social Accounts</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              Add your social media and developer profile links. Empty fields will not be shown on your profile.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Fields */}
        <div className="flex-1 overflow-y-auto p-6 py-4 space-y-4 max-h-[55vh]">
          {PLATFORMS.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <div key={platform.key} className="space-y-1.5">
                <Label
                  htmlFor={`social-${platform.key}`}
                  className="text-xs font-semibold text-muted-foreground flex items-center gap-2"
                >
                  <IconComponent className={`h-4 w-4 shrink-0 ${platform.colorClass}`} />
                  {platform.label}
                </Label>
                <Input
                  id={`social-${platform.key}`}
                  value={formData[platform.key] || ""}
                  onChange={(e) => handleChange(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  autoFocus={platform.key === defaultFocus}
                  className="bg-background border-border/45 text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 h-9"
                />
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 py-4 border-t border-border/30 bg-muted/20 flex justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="h-9 text-xs px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs px-4 flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save links
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
