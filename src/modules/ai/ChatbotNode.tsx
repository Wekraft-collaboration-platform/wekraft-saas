import { useState } from "react";
import { AgentState } from "@/modules/ai/AgentTypes";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { api } from "../../../convex/_generated/api";

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
    <div className="space-y-4 my-1">
      {nodeState?.messages?.map((msg, index) => {
        const isAI = msg.type === "ai";
        const msgId = msg.id ?? `msg-${index}`;

        return (
          <div
            key={msgId}
            className={cn(
              "group relative flex flex-col gap-3 py-4 px-6 transition-all duration-300",
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
                    <Sparkles size={12} />
                  ) : (
                    <Avatar className="h-6 w-6 rounded-md overflow-hidden">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-neutral-800 rounded-full">
                        <User size={12} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <span className="text-xs capitalize font-bold  tracking-[0.2em] text-neutral-500">
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
                "text-sm leading-relaxed max-w-none prose prose-invert prose-violet",
                isAI ? "text-neutral-200" : "text-neutral-400 italic",
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
}
