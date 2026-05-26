import { ExternalLink, Link2, Monitor, MessageSquare, Trophy, Code2, Youtube, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  socialLinks?: string[];
}

interface PlatformInfo {
  label: string;
  icon: React.ElementType;
  colorClass: string;
  badgeClass: string;
}

function getPlatformInfo(url: string): PlatformInfo {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com"))
    return { label: "YouTube", icon: Youtube, colorClass: "text-red-500", badgeClass: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" };
  if (lower.includes("producthunt.com"))
    return { label: "Product Hunt", icon: Monitor, colorClass: "text-orange-500", badgeClass: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400" };
  if (lower.includes("dev.to"))
    return { label: "Dev.to", icon: MessageSquare, colorClass: "text-violet-500", badgeClass: "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400" };
  if (lower.includes("kaggle.com"))
    return { label: "Kaggle", icon: Trophy, colorClass: "text-sky-500", badgeClass: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400" };
  if (lower.includes("codeforces.com"))
    return { label: "Codeforces", icon: Code2, colorClass: "text-blue-500", badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400" };
  if (lower.includes("stackoverflow.com"))
    return { label: "StackOverflow", icon: ExternalLink, colorClass: "text-amber-500", badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" };
  return { label: "Website", icon: Globe, colorClass: "text-emerald-500", badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" };
}

function cleanUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export const SocialLinks = ({ socialLinks }: SocialLinksProps) => {
  const hasLinks = socialLinks && socialLinks.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground/50">Social Links</h3>
        <Link2 className="h-4 w-4 text-foreground/40" />
      </div>

      {hasLinks ? (
        <div className="flex flex-col gap-2 flex-1">
          {socialLinks!.map((link) => {
            const platform = getPlatformInfo(link);
            const Icon = platform.icon;
            return (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 transition-all hover:bg-muted/50 hover:border-border hover:shadow-sm"
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
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </a>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/60 bg-muted/10 text-center py-4 px-4">
          <Link2 className="h-4 w-4 text-muted-foreground/25" />
          <p className="text-[11px] text-muted-foreground/60">No links connected yet</p>
        </div>
      )}
    </div>
  );
};
