"use client";

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, X, User, MessageSquare, Loader2, User2, AlertCircle, LucideHistory, LucideTimer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { MemberLimitDialog } from "@/components/member-limit-dialog";

// Assuming these are available in the project
import {
  Avatar as ShoAvatar,
  AvatarFallback as ShoAvatarFallback,
  AvatarImage as ShoAvatarImage,
} from "@/components/ui/avatar";

interface ProjectJoinRequestsProps {
  projectId: Id<"projects">;
  projectName?: string;
  currentMemberCount?: number;
  memberLimit?: number;
}

export const ProjectJoinRequests = ({
  projectId,
  projectName,
  currentMemberCount,
  memberLimit,
}: ProjectJoinRequestsProps) => {
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const requests = useQuery(api.project.getProjectJoinRequests, { projectId });
  const handleRequest = useMutation(api.project.handleJoinRequest);
  const { isPower, isLoading: isPermsLoading } =
    useProjectPermissions(projectId);

  const onAction = async (
    request: any,
    action: "accepted" | "rejected",
  ) => {
    try {
      await handleRequest({ requestId: request._id, action });
      toast.success(
        `Request ${action === "accepted" ? "accepted" : "rejected"} successfully`,
      );
    } catch (error: any) {
      toast.error(error.data || error.message || "Failed to process request");
      console.error(error);
    }
  };

  if (
    requests === undefined ||
    isPermsLoading ||
    currentMemberCount === undefined ||
    memberLimit === undefined
  ) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isLimitReached = currentMemberCount >= memberLimit;

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border-dashed border mt-8 rounded-md border-accent py-20 text-muted-foreground space-y-2">
        <User className="w-10 h-10 opacity-80" />
        <p className="text-sm">No join requests yet</p>
        <p className="text-xs">Try to invite more members to see upcoming Requests</p>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const historyRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Global member-limit dialog */}
      <MemberLimitDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        currentMemberCount={currentMemberCount}
        memberLimit={memberLimit}
      />

      {isLimitReached && pendingRequests.length > 0 && (
        <button
          type="button"
          onClick={() => setLimitDialogOpen(true)}
          className="w-full text-left bg-blue-600/60 rounded-md p-3 mb-4 flex items-center gap-3  transition-colors cursor-pointer"
        >
          <AlertCircle className="w-5 h-5 text-white shrink-0" />
          <p className="text-sm font-medium">
            Member limit reached ({currentMemberCount}/{memberLimit}). You cannot accept new members until you upgrade.
            <span className="ml-1 underline text-white">Upgrade →</span>
          </p>
        </button>
      )}
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base   px-1 flex items-center gap-2">
            <LucideTimer className="h-4 w-4" />  Pending Requests ({pendingRequests.length})
          </h3>
          {pendingRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              isPower={isPower}
              onAction={onAction}
              isLimitReached={isLimitReached}
              onLimitReached={() => setLimitDialogOpen(true)}
            />
          ))}
        </div>
      )}

      {historyRequests.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base text-muted-foreground px-1 flex items-center gap-2">
            <LucideHistory className="h-4 w-4" /> History
          </h3>
          {historyRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              isPower={isPower}
              onAction={onAction}
              isLimitReached={isLimitReached}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface RequestCardProps {
  request: any;
  isPower: boolean;
  onAction: (request: any, action: "accepted" | "rejected") => void;
  isLimitReached: boolean;
  onLimitReached?: () => void;
}

const RequestCard = ({ request, isPower, onAction, isLimitReached, onLimitReached }: RequestCardProps) => {
  const isPending = request.status === "pending";

  return (
    <Card
      className={`group p-0 border border-accent! rounded-md bg-sidebar transition-all duration-200 ${!isPending ? "opacity-90" : "hover:bg-accent/60 cursor-pointer"}`}
      onClick={() => {
        if (isPending && isLimitReached && onLimitReached) {
          onLimitReached();
        }
      }}
    >
      <CardContent className="p-4 flex items-start justify-between ">
        <div className="flex gap-4 w-full">
          <ShoAvatar className="h-10 w-10 border border-border">
            <ShoAvatarImage src={request.userImage} />
            <ShoAvatarFallback>
              {request.userName.slice(0, 2).toUpperCase()}
            </ShoAvatarFallback>
          </ShoAvatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm capitalize">{request.userName}</span>
              <Badge
                variant="secondary"
                className="text-[11px] px-3 py-1 h-6! cursor-pointer hover:bg-accent transition-colors"
              >
                <User2 className="w-3 h-3 mr-1" /> Visit Profile
              </Badge>
              {request.role && (
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2.5 py-1 h-6! font-bold transition-all ${
                    request.role === "admin"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                  }`}
                >
                  {request.role === "admin" ? "Admin" : "Member"}
                </Badge>
              )}
              {!isPending && (
                <Badge
                  variant={request.status === "accepted" ? "default" : "destructive"}
                  className={`text-[10px] px-2 py-0.5 h-4 ml-auto ${request.status === "accepted" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              )}
            </div>

            {request.message && (
              <div className="flex items-start gap-2 pt-1">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{request.message}"
                </p>
              </div>
            )}
          </div>
        </div>

        {isPower && isPending && (
          <div className="flex items-center gap-2 ml-4">
            <Button
              size="icon"
              variant="outline"
              disabled={isLimitReached}
              className={`h-8 w-8 rounded-md px-6! border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-600 transition-all active:scale-95 ${isLimitReached ? "opacity-50 cursor-not-allowed border-muted" : ""}`}
              onClick={() => onAction(request, "accepted")}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-md px-6! border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all active:scale-95"
              onClick={() => onAction(request, "rejected")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!isPower && isPending && (
          <p className="text-[11px] text-muted-foreground font-medium ml-4">
            Actions restricted
          </p>
        )}
      </CardContent>
    </Card>
  );
};
