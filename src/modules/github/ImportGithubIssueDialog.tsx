"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Github,
  Loader2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  User,
} from "lucide-react";
import { getIssues } from "@/modules/github/actions/action";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ImportGithubIssueDialogProps {
  repoFullName?: string;
  trigger: React.ReactNode;
}

export const ImportGithubIssueDialog = ({
  repoFullName,
  trigger,
}: ImportGithubIssueDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGithubIssues = async () => {
    if (!repoFullName) return;

    const [owner, repo] = repoFullName.split("/");
    if (!owner || !repo) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getIssues(owner, repo);
      setIssues(data);
    } catch (err) {
      console.error("Error fetching GitHub issues:", err);
      setError(
        "Failed to fetch issues from GitHub. Please make sure your GitHub account is connected.",
      );
      toast.error("Error fetching GitHub issues");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && repoFullName) {
      fetchGithubIssues();
    }
  }, [isOpen, repoFullName]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden dark:bg-[#121212] border-border/40">
        <DialogHeader className="p-6 border-b border-border/40 bg-card/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">GitHub Issues</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Showing open issues for{" "}
                  <span className="text-foreground font-medium">
                    {repoFullName}
                  </span>
                </p>
              </div>
            </div>
            {issues.length > 0 && (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              >
                {issues.length} Open
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Fetching issues from GitHub...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
              <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={fetchGithubIssues}
              >
                Try Again
              </Button>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Github className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="text-base font-medium">No Open Issues</p>
              <p className="text-sm text-muted-foreground">
                This repository doesn't have any open issues at the moment.
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/40">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-5 hover:bg-muted/30 transition-colors group relative"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">
                            #{issue.number}
                          </span>
                          {issue.labels?.map((label: any) => (
                            <Badge
                              key={label.id}
                              style={{
                                backgroundColor: `#${label.color}20`,
                                color: `#${label.color}`,
                                borderColor: `#${label.color}40`,
                              }}
                              className="text-[10px] px-1.5 py-0 font-medium border"
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </div>
                        <h4 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {issue.title}
                        </h4>

                        <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>{issue.user?.login}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Opened{" "}
                              {formatDistanceToNow(new Date(issue.created_at))}{" "}
                              ago
                            </span>
                          </div>
                          {issue.comments > 0 && (
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{issue.comments} comments</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex gap-2">
                        <a
                          href={issue.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        {/* Placeholder for actual import action */}
                        <Button
                          size="sm"
                          className="text-[11px] h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90"
                          onClick={() =>
                            toast.info("Import feature coming soon!")
                          }
                        >
                          Import
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="p-4 border-t border-border/40 bg-card/30 flex justify-end shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
