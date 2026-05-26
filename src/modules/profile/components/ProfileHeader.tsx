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
      <div className="h-32 sm:h-40 md:h-48 w-full relative group overflow-hidden">
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

        {/* Upload cover (hover reveal) */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/60 backdrop-blur-md border-none text-xs gap-1.5 shadow-md"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload Cover</span>
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
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                @{handle}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap pb-0 sm:pb-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-background/60 backdrop-blur-sm shadow-none h-9 text-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>

            {onToggleSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSettings}
                className={cn(
                  "gap-1.5 bg-background/60 backdrop-blur-sm shadow-none h-9 text-xs transition-colors",
                  showSettings && "bg-foreground text-background hover:bg-foreground hover:text-background/90"
                )}
              >
                <Pencil className="h-3.5 w-3.5" />
                {showSettings ? "View Profile" : "Edit"}
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
