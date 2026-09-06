"use client";
import { useState } from "react";
import { AgentState } from "@/modules/ai/AgentTypes";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  User,
  Sparkles,
  Sparkle,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";

interface ChatbotNodeProps {
  nodeState: Partial<AgentState>;
  executionTime?: string;
}

export function ChatbotNode({ nodeState, executionTime }: ChatbotNodeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedId, setLikedId] = useState<string | null>(null);
  const [dislikedId, setDislikedId] = useState<string | null>(null);
  const user = useQuery(api.user.getCurrentUser);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-2 my-1">
      {nodeState?.messages?.map((msg, index) => {
        const isAI = msg.type === "ai";
        const msgId = msg.id ?? `msg-${index}`;

        return (
          <div
            key={msgId}
            className={cn(
              "group relative flex flex-col gap-3 py-1 px-5 transition-all duration-300",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "rounded flex items-center justify-center overflow-hidden",
                    isAI
                      ? "bg-violet-500/10 text-violet-400 p-1"
                      : "bg-neutral-800 text-neutral-400",
                  )}
                >
                  {isAI ? (
                    // <Sparkle size={12} />
                    <Image src="/kaya.svg" alt="Kaya" width={22} height={22} />
                  ) : (
                    <Avatar className="h-6 w-6 rounded-md overflow-hidden">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-neutral-800 rounded-full">
                        <User size={12} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <span className="text-xs capitalize font-semibold text-primary/70">
                  {isAI ? "KAYA" : user?.name || "YOU"}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "text-[13px] font-sans leading-relaxed max-w-none",
                isAI
                  ? "text-neutral-200"
                  : "bg-neutral-900 border border-border/40 rounded-lg px-3.5 py-2 text-neutral-200 shadow-xs max-w-[65%] w-fit",
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-base font-semibold text-neutral-100 mb-2 mt-3 leading-snug">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-[15px] font-semibold text-neutral-100 mb-2 mt-3 leading-snug">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-[14px] font-semibold text-neutral-200 mb-1.5 mt-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2.5 last:mb-0 text-neutral-200 leading-relaxed">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-neutral-100">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-neutral-300">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-2.5 ml-4 space-y-1 list-disc marker:text-neutral-400">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2.5 ml-4 space-y-1 list-decimal marker:text-neutral-400">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-neutral-200 leading-relaxed pl-0.5 text-[13px]">
                      {children}
                    </li>
                  ),
                  code: ({ inline, children }: any) =>
                    inline ? (
                      <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[12px] font-mono">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-muted/40 border border-border rounded-md p-2 mb-3 overflow-x-auto">
                        <code className="text-neutral-200 text-[12px] font-mono leading-relaxed">
                          {children}
                        </code>
                      </pre>
                    ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-neutral-600 pl-4 mb-3 text-neutral-400 italic">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-neutral-800 my-3" />,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-300 underline underline-offset-2 hover:text-white"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {typeof msg.content === "string" ? msg.content : ""}
              </ReactMarkdown>
            </div>

            {/* Action Bar: Execution Time, Like, Dislike, Copy */}
            {isAI && msg.content && (
              <div className="flex items-center justify-between pt-1  text-muted-foreground">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span>{executionTime ? `${executionTime}s` : "NA"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-4 w-4 text-muted-foreground hover:text-white transition-colors cursor-pointer",
                      likedId === msgId && "text-white",
                    )}
                    onClick={() => {
                      setLikedId(likedId === msgId ? null : msgId);
                      if (dislikedId === msgId) setDislikedId(null);
                    }}
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-4 w-4 text-muted-foreground hover:text-white transition-colors cursor-pointer",
                      dislikedId === msgId && "text-white",
                    )}
                    onClick={() => {
                      setDislikedId(dislikedId === msgId ? null : msgId);
                      if (likedId === msgId) setLikedId(null);
                    }}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                    onClick={() => copyToClipboard(msg.content, msgId)}
                    title="Copy response"
                  >
                    {copiedId === msgId ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
