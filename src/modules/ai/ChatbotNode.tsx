"use client";
import { useState } from "react";
import { AgentState } from "@/modules/ai/AgentTypes";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, User, Sparkles, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";

interface ChatbotNodeProps {
  nodeState: Partial<AgentState>;
}

export function ChatbotNode({ nodeState }: ChatbotNodeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

              {isAI && msg.content && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-violet-400"
                  onClick={() => copyToClipboard(msg.content, msgId)}
                >
                  {copiedId === msgId ? (
                    <Check size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                </Button>
              )}
            </div>

            <div
              className={cn(
                "text-sm leading-relaxed max-w-none",
                isAI ? "text-neutral-200" : "text-neutral-400 italic",
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-primary mb-3 mt-4 leading-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-primary mb-2 mt-4 leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-primary mb-2 mt-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 text-primary leading-relaxed">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-neutral-300">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 ml-4 space-y-1 list-disc marker:text-blue-400">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-3 ml-4 space-y-1 list-decimal marker:text-blue-400">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-neutral-200 leading-relaxed pl-1">
                      {children}
                    </li>
                  ),
                  code: ({ inline, children }: any) =>
                    inline ? (
                      <code className="bg-neutral-800 text-violet-300 px-1.5 py-0.5 rounded text-[13px] font-mono">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-muted/40 border border-border rounded-md p-2 mb-3 overflow-x-auto">
                        <code className="text-primary text-[13px] font-mono leading-relaxed">
                          {children}
                        </code>
                      </pre>
                    ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-violet-500 pl-4 mb-3 text-neutral-400 italic">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-neutral-700 my-4" />,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 underline underline-offset-2 hover:text-violet-300"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {typeof msg.content === "string" ? msg.content : ""}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}
