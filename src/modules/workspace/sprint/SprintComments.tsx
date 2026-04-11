"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  MoreHorizontal, 
  Activity 
} from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SprintCommentsProps {
  itemId: Id<"tasks"> | Id<"issues">;
  isIssue: boolean;
}

export const SprintComments = ({ itemId, isIssue }: SprintCommentsProps) => {
  const [commentText, setCommentText] = useState("");

  const comments = useQuery(
    isIssue ? api.issue.getIssueComments : api.workspace.getComments,
    isIssue ? { issueId: itemId as Id<"issues"> } : { taskId: itemId as Id<"tasks"> }
  );

  const addTaskComment = useMutation(api.workspace.createComment);
  const addIssueComment = useMutation(api.issue.createIssueComment);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      if (isIssue) {
        await addIssueComment({
          issueId: itemId as Id<"issues">,
          comment: commentText.trim(),
        });
      } else {
        await addTaskComment({
          taskId: itemId as Id<"tasks">,
          comment: commentText.trim(),
        });
      }
      setCommentText("");
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground/70">
          <Activity size={14} />
          <h3 className="text-[10px] font-bold uppercase tracking-wider">Activity</h3>
        </div>
        <div className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">
          {comments?.length || 0} Comments
        </div>
      </div>

      {/* Comment Input */}
      <div className="flex gap-3 group">
        <Avatar className="h-8 w-8 shrink-0 shadow-sm">
          <AvatarFallback className="bg-primary/5 text-primary/40 text-[10px] font-bold">W</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <div className="relative group/input">
            <textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[60px] p-3 text-[13px] bg-muted/5 border border-border/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-border/80 placeholder:text-muted-foreground/30 transition-all resize-none overflow-hidden"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <div className={cn(
              "absolute bottom-2 right-2 flex items-center gap-2 transition-all duration-200",
              commentText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
            )}>
              <Button
                size="sm"
                className="h-7 px-3 rounded-lg bg-primary hover:bg-primary/90 text-[10px] font-bold"
                onClick={handleSendComment}
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {comments?.map((comment, idx) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex gap-3 group/comment"
            >
              <Avatar className="h-7 w-7 shrink-0 shadow-sm border border-border/20">
                <AvatarImage src={comment.userImage} />
                <AvatarFallback className="bg-muted text-muted-foreground/50 text-[9px] font-bold">
                  {comment.userName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-foreground/80">{comment.userName}</span>
                    <span className="text-[9px] font-medium text-muted-foreground/40 italic">
                      {format(comment.createdAt, "MMM d, h:mm a")}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-md opacity-0 group-hover/comment:opacity-100 transition-opacity hover:bg-muted/50">
                    <MoreHorizontal size={12} className="text-muted-foreground/30" />
                  </Button>
                </div>
                <div className="text-[13px] text-foreground/70 leading-relaxed bg-muted/5 p-3 rounded-lg border border-border/10 group-hover/comment:border-border/30 transition-colors">
                  {comment.comment}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments && comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-30">
            <MessageCircle size={24} className="text-muted-foreground/20" />
            <div className="text-[11px] font-medium text-muted-foreground">Start the conversation...</div>
          </div>
        )}
      </div>
    </div>
  );
};
