"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, ExternalLink, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GithubIssuesChartCardProps {
  projectId: Id<"projects">;
  data?: any[];
}

export const GithubIssuesChartCard = ({
  projectId,
  data: providedData,
}: GithubIssuesChartCardProps) => {
  const queryData = useQuery(api.workspace.getImportedGithubIssues, { projectId });
  const issues = providedData || queryData;

  if (issues === undefined) {
    return (
      <Card className="border shadow-sm bg-accent/20 border-accent h-[340px]">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardHeader>
        <CardContent className="h-[220px] flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <Github className="w-4 h-4 text-muted-foreground" /> Imported GitHub Issues
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Linked issues and their synchronization status
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[220px] text-center p-6">
          <Github className="w-8 h-8 mb-2 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">No GitHub issues imported</p>
          <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
            Connect a GitHub repository and import issues to track their sync status here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Github className="w-4 h-4 text-muted-foreground" /> Imported GitHub Issues
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            Synchronized issues and assigned owners
          </CardDescription>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Total: {issues.length}
        </div>
      </CardHeader>
      <CardContent className="pt-0 h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-accent custom-scrollbar flex flex-col gap-2">
        {issues.map((issue) => {
          const hasAssignees = issue.assignees && issue.assignees.length > 0;

          return (
            <div
              key={issue._id}
              className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/50 hover:bg-accent/10 transition-colors gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-bold text-primary">
                    {issue.title}
                  </span>
                  {issue.githubIssueUrl && (
                    <a
                      href={issue.githubIssueUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors flex-none"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-none">
                <Badge variant="outline" className={`text-xs px-2 py-0.5 capitalize bg-muted`}>
                  {issue.status}
                </Badge>

                {hasAssignees ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center -space-x-2 ml-1 cursor-pointer">
                          {issue.assignees.slice(0, 3).map((assignee: any) => (
                            <Avatar
                              key={assignee.userId}
                              className="w-6 h-6 border border-background shadow-xs hover:z-10 transition-transform duration-200 shrink-0"
                            >
                              <AvatarImage
                                src={assignee.avatar}
                                alt={assignee.name}
                              />
                              <AvatarFallback className="text-[10px] font-bold">
                                {assignee.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {issue.assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full border border-background bg-muted text-[9px] font-bold flex items-center justify-center shadow-xs shrink-0 text-muted-foreground z-10">
                              +{issue.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md">
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-xs border-b border-border pb-1">
                            Assignees
                          </p>
                          {issue.assignees.map((assignee: any) => (
                            <p key={assignee.userId} className="text-[10px] font-medium">
                              {assignee.name}
                            </p>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-neutral-500/5 border border-neutral-500/10 rounded-full px-2 py-0.5">
                    <UserMinus className="h-3 w-3" />
                    <span>No Assignee</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
