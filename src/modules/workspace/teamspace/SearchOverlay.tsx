import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Calendar, User, Hash, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, projectId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teamspace/search?projectId=${projectId}&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const searchResults = data.results || [];
        setResults(searchResults);
        if (searchResults.length > 0) {
          setSelectedIndex(0);
        } else {
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, projectId]);

  const jumpToSelectedMessage = (msg: any) => {
    if (!msg) return;
    const el = document.getElementById(`message-${msg.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight effect
      el.classList.add('premium-message-highlight');
      setTimeout(() => el.classList.remove('premium-message-highlight'), 3500);
      onClose();
    } else {
      // Jump fallback
      window.location.hash = `message-${msg.id}`;
      onClose();
    }
  };

  const scrollActiveIntoView = (index: number) => {
    const el = document.getElementById(`search-overlay-item-${index}`);
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  };

  // Keyboard navigation & ESC handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev + 1) % results.length;
          setTimeout(() => scrollActiveIntoView(next), 0);
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = (prev - 1 + results.length) % results.length;
          setTimeout(() => scrollActiveIntoView(next), 0);
          return next;
        });
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          e.preventDefault();
          jumpToSelectedMessage(results[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [isOpen, results, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-start justify-center pt-20 px-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-popover border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[70vh] ring-1 ring-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Area */}
            <div className="p-5 border-b border-border flex items-center gap-4 bg-muted/30">
              <Search className="h-6 w-6 text-primary" />
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages, users, or keywords..."
                className="flex-1 bg-transparent border-none outline-none text-xl placeholder:text-muted-foreground/30 font-medium"
              />
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : query && (
                <button onClick={() => setQuery("")} className="hover:bg-accent p-1.5 rounded-full transition-colors">
                  <X className="h-5 w-5 text-muted-foreground/50" />
                </button>
              )}
            </div>

            {/* Results Area */}
            <ScrollArea className="flex-1">
              <div className="p-3">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center justify-between">
                      <span>Matches ({results.length})</span>
                      <span className="flex items-center gap-1.5 opacity-50">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Turso FTS5 Indexed
                      </span>
                    </div>
                    {results.map((msg, index) => (
                      <div 
                        id={`search-overlay-item-${index}`}
                        key={msg.id}
                        className={cn(
                          "group p-4 rounded-xl transition-all cursor-pointer flex gap-4 border border-transparent hover:border-border/50 hover:shadow-sm",
                          selectedIndex === index 
                            ? "bg-accent/80 border-primary/30 shadow-md scale-[1.01]" 
                            : "hover:bg-accent"
                        )}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => jumpToSelectedMessage(msg)}
                      >
                        <Avatar className="h-10 w-10 shrink-0 border border-border/20">
                          <AvatarImage src={msg.user_image} />
                          <AvatarFallback className="text-[11px] font-bold bg-blue-500/10 text-blue-500">
                            {msg.user_name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-foreground/90">{msg.user_name}</span>
                            <span className="text-[10px] text-muted-foreground/50 font-medium">{format(new Date(msg.created_at), "MMM d, h:mm a")}</span>
                          </div>
                          <p 
                            className="text-sm text-muted-foreground line-clamp-2 leading-relaxed antialiased"
                            dangerouslySetInnerHTML={{ __html: msg.match_snippet || msg.content }}
                          />
                        </div>
                        <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : query && !loading ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="bg-accent/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto ring-8 ring-accent/10">
                      <Search className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                    <div className="space-y-1.5 px-10">
                      <p className="font-bold text-foreground/80 text-lg">No matches for "{query}"</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">We couldn't find any messages matching your search query. Try different keywords or check your spelling.</p>
                    </div>
                  </div>
                ) : !query && (
                  <div className="p-8 space-y-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-border/50 pb-3">Search Insights</div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: User, label: "Member Search", desc: "Filter by user name", color: "text-blue-500" },
                        { icon: Hash, label: "Prefix Matching", desc: "Matches partial words", color: "text-green-500" },
                        { icon: Search, label: "FTS5 Engine", desc: "Ultra-fast history search", color: "text-purple-500" },
                        { icon: ArrowRight, label: "Jump to Context", desc: "Click to see message", color: "text-amber-500" },
                      ].map((tip, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-border/10 space-y-3 hover:bg-muted/40 transition-colors">
                          <div className={`p-2 w-fit rounded-lg bg-background shadow-sm ${tip.color}`}>
                            <tip.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-foreground/90">{tip.label}</div>
                            <div className="text-[11px] text-muted-foreground/60 leading-tight">{tip.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground font-bold tracking-tight px-6">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><kbd className="bg-background border border-border/60 rounded px-1.5 py-0.5 text-[9px] shadow-sm text-foreground">ESC</kbd> CLOSE</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-background border border-border/60 rounded px-1.5 py-0.5 text-[9px] shadow-sm text-foreground">↑↓</kbd> NAVIGATE</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-background border border-border/60 rounded px-1.5 py-0.5 text-[9px] shadow-sm text-foreground">ENTER</kbd> JUMP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="uppercase">Real-time Search Ready</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
