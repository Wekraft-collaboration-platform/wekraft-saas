import {
  Share2,
  Star,
  Upload,
  Clock,
  MapPin,
  Globe,
  Briefcase,
  CreditCard,
  Sparkles,
  Pencil,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaDiscord,
  FaInstagram,
} from "react-icons/fa";

interface PlatformInfo {
  label: string;
  icon: React.ElementType;
  colorClass: string;
}

function getPlatformInfo(url: string): PlatformInfo | null {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) {
    return {
      label: "GitHub",
      icon: FaGithub,
      colorClass: "text-[#24292e] dark:text-white hover:text-primary",
    };
  }
  if (lower.includes("linkedin.com")) {
    return {
      label: "LinkedIn",
      icon: FaLinkedin,
      colorClass: "text-[#0077b5] hover:text-[#0077b5]/80",
    };
  }
  if (lower.includes("twitter.com") || lower.includes("x.com")) {
    return {
      label: "Twitter / X",
      icon: FaTwitter,
      colorClass: "text-[#1da1f2] dark:text-white hover:text-sky-400",
    };
  }
  if (lower.includes("discord.com") || lower.includes("discord.gg") || lower.includes("discordapp.com")) {
    return {
      label: "Discord",
      icon: FaDiscord,
      colorClass: "text-[#5865f2] hover:text-[#5865f2]/80",
    };
  }
  if (lower.includes("instagram.com")) {
    return {
      label: "Instagram",
      icon: FaInstagram,
      colorClass: "text-[#e1306c] hover:text-[#e1306c]/80",
    };
  }
  return null;
}

interface ProfileHeaderProps {
  user: any;
  isUpgraded: boolean;
  showSettings?: boolean;
  onToggleSettings?: () => void;
}

interface MetaChipProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

function MetaChip({ icon: Icon, label, value }: MetaChipProps) {
  return (
    <div className="flex items-center gap-2.5 group">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 border border-border/50 group-hover:bg-muted transition-colors">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-0.5">
          {label}
        </span>
        <span className="text-xs font-semibold text-foreground/85 truncate leading-none">
          {value}
        </span>
      </div>
    </div>
  );
}

export const ProfileHeader = ({ 
  user, 
  isUpgraded,
  showSettings = false,
  onToggleSettings
}: ProfileHeaderProps) => {
  const handle =
    user.githubUsername ||
    user?.name?.toLowerCase().replace(/\s+/g, "") ||
    "user";

  const joinedDate = new Date(user._creationTime).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const isPro =
    user.accountType === "plus" || user.accountType === "pro" || isUpgraded;

  return (
    <Card className="w-full overflow-hidden shadow-sm border relative">
      {/* ── Banner ── */}
      <div className="h-32 sm:h-40 md:h-48 w-full relative group overflow-hidden bg-muted">
        {user.coverUrl ? (
          <img
            src={user.coverUrl}
            alt="Profile Cover"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <>
            {/* Ambient blur */}
            <div
              className={`absolute inset-0 z-0 blur-2xl opacity-60 ${
                isPro ? "bg-yellow-500/30" : "bg-blue-600/20"
              }`}
            />
            {/* Gradient overlay */}
            {isPro ? (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-500/40 via-orange-400/20 to-transparent" />
            ) : (
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-600/35 via-indigo-500/20 to-transparent" />
            )}
            {/* Dot mesh */}
            <div
              className="absolute inset-0 z-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
          </>
        )}

        {/* Upload cover button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white text-primary hover:bg-white/90 shadow-md border-none flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
        >
          <Pencil className="h-5 w-5 text-[#007acc] fill-none" />
        </Button>

        {/* Plus badge */}
        {isPro && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-yellow-500/90 text-black border-none text-[10px] font-bold shadow-sm backdrop-blur-sm gap-1">
              <Star className="h-3 w-3 fill-black" />
              Plus
            </Badge>
          </div>
        )}
      </div>

      {/* ── Profile body ── */}
      <div className="px-4 sm:px-6 md:px-8 pb-5 sm:pb-6">

        {/* Row 1: avatar + name + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

          {/* Avatar + identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
            {/* Avatar overlapping banner */}
            <div className="-mt-12 sm:-mt-14 shrink-0 relative z-20">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-card shadow-lg bg-card ring-2 ring-border/40">
                <AvatarImage
                  src={user.avatarUrl || ""}
                  className="object-cover"
                  alt={user.name}
                />
                <AvatarFallback className="text-3xl bg-muted font-bold font-pop">
                  {user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name / occupation / handle */}
            <div className="flex flex-col gap-0.5 pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-pop tracking-tight leading-tight">
                  {user.name}
                </h2>
                {isPro && (
                  <div className="bg-yellow-400 dark:bg-yellow-500 p-1 rounded-full shadow ring-2 ring-yellow-400/30">
                    <Star className="h-3.5 w-3.5 text-black fill-black" />
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/70 font-medium capitalize truncate">
                {user.occupation || "Developer"}
              </p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <p className="text-xs text-muted-foreground font-mono leading-none">
                  @{handle}
                </p>
                {user.socialLinks && user.socialLinks.filter(Boolean).length > 0 && (
                  <div className="flex items-center gap-2 border-l pl-3 border-border/60">
                    {user.socialLinks.filter(Boolean).map((link: string) => {
                      const info = getPlatformInfo(link);
                      if (!info) return null;
                      const Icon = info.icon;
                      return (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-md border border-border/40 bg-background/40 hover:bg-muted transition-all hover:scale-105",
                            info.colorClass
                          )}
                          title={info.label}
                        >
                          <Icon className="h-3 w-3" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center pb-0 sm:pb-1 pr-2">
            {onToggleSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSettings}
                className={cn(
                  "h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors",
                  showSettings && "bg-muted text-foreground"
                )}
                aria-label="Edit Profile"
              >
                <Pencil className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* ── Separator ── */}
        <Separator className="mt-5 mb-4 opacity-60" />

        {/* ── Row 2: Meta chips (the public info details) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4">
          <MetaChip icon={Clock} label="Joined" value={joinedDate} />

          <MetaChip icon={MapPin} label="Location" value="Global" />

          <MetaChip icon={Globe} label="Language" value="English" />

          <MetaChip
            icon={Briefcase}
            label="Role"
            value={
              <span className="capitalize">
                {user.occupation || "Developer"}
              </span>
            }
          />

          <MetaChip
            icon={CreditCard}
            label="Account"
            value={
              <span className="flex items-center gap-1.5">
                <span className="capitalize">{user.accountType || "Free"}</span>
                {isPro ? (
                  <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-[9px] h-4 px-1.5 gap-0.5 font-semibold leading-none">
                    <Sparkles className="h-2.5 w-2.5" />
                    Plus
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[9px] h-4 px-1.5 text-muted-foreground leading-none"
                  >
                    Free
                  </Badge>
                )}
              </span>
            }
          />
        </div>
      </div>
    </Card>
  );
};
