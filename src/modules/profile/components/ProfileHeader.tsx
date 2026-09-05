import { useState, useEffect } from "react";
import {
  Star,
  Clock,
  MapPin,
  Globe,
  Briefcase,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const [country, setCountry] = useState("Global");

  useEffect(() => {
    // 1. Fast local fallback using timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        if (tz.includes("Kolkata") || tz.includes("Calcutta")) {
          setCountry("India");
        } else if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Los_Angeles") || tz.includes("Denver")) {
          setCountry("United States");
        } else if (tz.includes("London")) {
          setCountry("United Kingdom");
        } else if (tz.includes("Paris") || tz.includes("Berlin") || tz.includes("Rome") || tz.includes("Madrid")) {
          setCountry("Europe");
        }
      }
    } catch (e) {}

    // 2. Fetch accurate IP-based location
    fetch("https://ipapi.co/json/")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data && data.country_name) {
          setCountry(data.country_name);
        }
      })
      .catch(() => {
        // Fallback option 2
        fetch("https://ip-api.com/json")
          .then((res) => res.json())
          .then((data) => {
            if (data && data.country) {
              setCountry(data.country);
            }
          })
          .catch(() => {});
      });
  }, []);

  return (
    <Card className="w-full overflow-hidden shadow-sm border border-zinc-800 relative bg-black text-white rounded-2xl">
      {/* ── Banner ── */}
      <div className="h-40 sm:h-52 md:h-60 w-full relative group overflow-hidden bg-zinc-900">
        <img
          src={user.coverUrl || "/banner.svg"}
          alt="Profile Cover"
          className="absolute -top-3 left-0 w-full h-[calc(100%+24px)] object-cover z-0"
        />
      </div>

      {/* ── Profile body ── */}
      <div className="px-6 pb-6 relative">
        {/* Row 1: avatar (overlapping) + edit button (on the right) */}
        <div className="flex justify-between items-start">
          {/* Avatar overlapping banner */}
          <div className="-mt-14 sm:-mt-20 shrink-0 relative z-20">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-black shadow-xl bg-zinc-900">
              <AvatarImage
                src={user.avatarUrl || ""}
                className="object-cover"
                alt={user.name}
              />
              <AvatarFallback className="text-4xl bg-zinc-800 text-white font-bold font-pop">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Action buttons (on the right) */}
          <div className="pt-3">
            {onToggleSettings && (
              <Button
                onClick={onToggleSettings}
                className="rounded-full border border-zinc-700 bg-transparent text-white hover:bg-zinc-900 px-5 py-1.5 h-auto text-xs sm:text-sm font-bold transition-all"
                aria-label="Edit Profile"
              >
                {showSettings ? "View Profile" : "Edit profile"}
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Name / Handle / Occupation */}
        <div className="mt-3 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-bold font-pop tracking-tight text-white leading-tight">
              {user.name}
            </h2>
            {isPro && (
              <div className="bg-yellow-500 p-0.5 rounded-full shadow">
                <Star className="h-3 w-3 text-black fill-black" />
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-400 font-mono">
            @{handle}
          </p>
        </div>

        {/* Row 3: Meta details & Social brand icons */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400 items-center">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>Joined {joinedDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-zinc-500" />
            <span>{country}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            <span>English</span>
          </div>

          {user.occupation && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
              <span>{user.occupation}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
            <span className="capitalize">{user.accountType || "free"} User</span>
          </div>

          {user.socialLinks && user.socialLinks.filter(Boolean).length > 0 && (
            <div className="flex items-center gap-2 border-l border-zinc-850 pl-3">
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
                    className="text-zinc-400 hover:text-white transition-colors"
                    title={info.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
