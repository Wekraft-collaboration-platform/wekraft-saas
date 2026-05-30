import {
  Clock,
  CreditCard,
  Globe,
  MapPin,
  Star,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PublicInfoListProps {
  user: any;
}

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}

function InfoRow({ icon: Icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-center gap-4 py-3.5 group">
      {/* Icon + label */}
      <div className="flex items-center gap-3 w-28 sm:w-36 shrink-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 group-hover:bg-muted transition-colors">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-none">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="flex-1 min-w-0 text-sm font-medium text-foreground/90 truncate">
        {children}
      </div>
    </div>
  );
}

export const PublicInfoList = ({ user }: PublicInfoListProps) => {
  const joinedDate = new Date(user._creationTime).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isPro = user.accountType === "plus" || user.accountType === "pro";

  return (
    <Card className="w-full p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Public Information
      </h3>
      <p className="text-xs text-muted-foreground/60 mb-5">
        Visible to anyone who views your profile
      </p>

      <div className="flex flex-col divide-y divide-border/60">
        <InfoRow icon={Clock} label="Joined">
          {joinedDate}
        </InfoRow>

        <InfoRow icon={MapPin} label="Location">
          Global
        </InfoRow>

        <InfoRow icon={Globe} label="Language">
          English
        </InfoRow>

        <InfoRow icon={Star} label="Role">
          <span className="capitalize">{user.occupation || "Developer"}</span>
        </InfoRow>

        <InfoRow icon={CreditCard} label="Account">
          <div className="flex items-center gap-2">
            <span className="capitalize">{user.accountType || "free"}</span>
            {isPro ? (
              <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-[10px] h-4 px-1.5 gap-0.5 font-semibold">
                <Sparkles className="h-2.5 w-2.5" />
                Plus
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] h-4 px-1.5 text-muted-foreground"
              >
                Free
              </Badge>
            )}
          </div>
        </InfoRow>
      </div>
    </Card>
  );
};
