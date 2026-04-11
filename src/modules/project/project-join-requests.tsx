"use client";

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, X, User, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { toast } from "sonner";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";

// Assuming these are available in the project
import { 
  Avatar as ShoAvatar, 
  AvatarFallback as ShoAvatarFallback, 
  AvatarImage as ShoAvatarImage 
} from "@/components/ui/avatar";

interface ProjectJoinRequestsProps {
  projectId: Id<"projects">;
}

export const ProjectJoinRequests = ({ projectId }: ProjectJoinRequestsProps) => {
  const requests = useQuery(api.project.getProjectJoinRequests, { projectId });
  const handleRequest = useMutation(api.project.handleJoinRequest);
  const { isPower, isLoading: isPermsLoading } = useProjectPermissions(projectId);

  const onAction = async (requestId: Id<"projectJoinRequests">, action: "accepted" | "rejected") => {
    try {
      await handleRequest({ requestId, action });
      toast.success(`Request ${action === "accepted" ? "accepted" : "rejected"} successfully`);
    } catch (error) {
      toast.error("Failed to process request");
      console.error(error);
    }
  };

  if (requests === undefined || isPermsLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
        <User className="w-10 h-10 opacity-20" />
        <p className="text-sm">No pending join requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {requests.map((request) => (
        <Card key={request._id} className="group border-none bg-accent/5 hover:bg-accent/10 transition-all duration-200">
          <CardContent className="p-4 flex items-start justify-between">
            <div className="flex gap-4 w-full">
              <ShoAvatar className="h-10 w-10 border border-border">
                <ShoAvatarImage src={request.userImage} />
                <ShoAvatarFallback>{request.userName.slice(0, 2).toUpperCase()}</ShoAvatarFallback>
              </ShoAvatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{request.userName}</span>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 cursor-pointer hover:bg-accent transition-colors">
                    Visit Profile
                  </Badge>
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

            {isPower && (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-600 transition-all active:scale-95"
                  onClick={() => onAction(request._id, "accepted")}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all active:scale-95"
                  onClick={() => onAction(request._id, "rejected")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
