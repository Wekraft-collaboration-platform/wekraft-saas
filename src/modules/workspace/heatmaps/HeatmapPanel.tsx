"use client";

import { useSidebar } from "@/components/ui/sidebar";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Network,
  RefreshCw,
  Info,
  Package,
} from "lucide-react";
import { FileIcon as FileSymbol, FolderIcon as FolderSymbol, DefaultFolderOpenedIcon as FolderOpenSymbol } from "@react-symbols/icons/utils";
import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { ExternalLink, Github } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { getRepoStructure, type FolderNode } from "./action";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface HeatmapPanelProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  repoId?: Id<"repositories">;
  structure: FolderNode | null;
  issuePaths?: string[];
  setStructure: (structure: FolderNode | null) => void;
}

// Helper to filter the tree for issues
const pruneTreeForIssues = (node: FolderNode, issuePaths: string[]): FolderNode | null => {
  const isPathInIssues = (path: string) => issuePaths.some(ip => ip === path || ip.startsWith(path + "/"));
  
  // 1. Filter files in this node
  const filteredFiles = node.files.filter(fileName => {
    const filePath = node.path ? `${node.path}/${fileName}` : fileName;
    return issuePaths.includes(filePath);
  });

  // 2. Filter children recursively
  const filteredChildren: Record<string, FolderNode> = {};
  Object.entries(node.children).forEach(([name, child]) => {
    const prunedChild = pruneTreeForIssues(child, issuePaths);
    if (prunedChild) {
      filteredChildren[name] = prunedChild;
    }
  });

  // 3. If this folder has issue-files or issue-subfolders, keep it
  if (filteredFiles.length > 0 || Object.keys(filteredChildren).length > 0) {
    return {
      ...node,
      files: filteredFiles,
      children: filteredChildren,
      // Total count here might be misleading, but we'll show what's left
      totalFileCount: filteredFiles.length + Object.values(filteredChildren).reduce((acc, c) => acc + c.totalFileCount, 0)
    };
  }

  return null;
};

const FolderTree = ({
  node,
  level = 0,
  expandedPaths,
  togglePath,
  issuePaths = [],
  isIssueView = false,
}: {
  node: FolderNode;
  level?: number;
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  issuePaths?: string[];
  isIssueView?: boolean;
}) => {
  const isExpanded = expandedPaths.has(node.path);
  const hasChildren =
    Object.keys(node.children).length > 0 ||
    (node.files && node.files.length > 0);

  const containsIssue = (path: string) => issuePaths.some(ip => ip === path || ip.startsWith(path + "/"));
  const hasIssue = containsIssue(node.path);
  const hasIssueChild = Object.values(node.children).some(child => containsIssue(child.path));
  const isActiveFolder = isIssueView && hasIssue && (!isExpanded || !hasIssueChild);

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 mb-0.5 rounded-md hover:bg-accent/40 cursor-pointer transition-all text-[13px] group relative border border-transparent",
          level === 0 && !isIssueView && "font-bold bg-accent/20 mb-2 border border-border/10",
          level === 0 && isIssueView && "font-bold bg-accent/20 mb-2 border border-border/10",
          isActiveFolder && "border-red-500/40 bg-red-500/5",
          isExpanded && level !== 0 && "bg-accent/5",
        )}

        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => togglePath(node.path)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown size={14} className="transition-transform text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="transition-transform text-muted-foreground" />
          )
        ) : (
          <span className="w-[14px]" />
        )}

        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {level === 0 && !isIssueView ? (
            <Package size={16} className="text-primary shrink-0" />
          ) : level === 0 && isIssueView ? (
            <Network size={16} className="text-primary shrink-0" />
          ) : isExpanded ? (
            <FolderOpenSymbol width={16} height={16} />
          ) : (
            <FolderSymbol 
              folderName={node.name} 
              width={16}
              height={16}
            />
          )}
        </div>

        <span className={cn("truncate flex-1", isIssueView && "font-medium")}>{node.name}</span>

        <div
          className={cn(
            "flex items-center gap-2 transition-opacity",
            level === 0 || isIssueView ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <span className={cn(
            "text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase tracking-tighter bg-primary/10 text-primary"
          )}>
            {node.totalFileCount} {isIssueView ? "Issues" : "Files"}
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden relative"
          >
            {/* Vertical Guide Line */}
            <div
              className={cn(
                "absolute left-[15px] top-0 bottom-0 w-[1px] z-0 bg-border/20"
              )}
              style={{ left: `${level * 16 + 15}px` }}
            />

            {Object.values(node.children || {})
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) => (
                <FolderTree
                  key={child.path}
                  node={child}
                  level={level + 1}
                  expandedPaths={expandedPaths}
                  togglePath={togglePath}
                  issuePaths={issuePaths}
                  isIssueView={isIssueView}
                />
              ))}

            {/* Render Files */}
            {(node.files || [])
              .sort((a, b) => a.localeCompare(b))
              .map((fileName) => {
                const filePath = node.path ? `${node.path}/${fileName}` : fileName;
                const fileHasIssue = issuePaths.includes(filePath);
                return (
                  <div
                    key={filePath}
                    className={cn(
                      "flex items-center gap-2 py-1 px-2 mb-0.5 rounded-sm text-[13px] hover:bg-accent/30 hover:text-foreground cursor-pointer transition-colors group relative",
                      fileHasIssue ? "text-red-400" : "text-muted-foreground/80"
                    )}
                    style={{ paddingLeft: `${(level + 1) * 16 + 12}px` }}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <FileSymbol fileName={fileName} className="w-full h-full" />
                    </div>
                    <span className="truncate flex-1">{fileName}</span>
                    {fileHasIssue && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const HeatmapPanel = memo(
  ({
    isOpen,
    onToggle,
    repoId,
    structure,
    issuePaths = [],
    setStructure,
  }: HeatmapPanelProps) => {
    const { setOpen: setSidebarOpen } = useSidebar();
    const [isLoading, setIsLoading] = useState(false);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    
    // Track expanded paths for the issue tree separately
    const [issueExpandedPaths, setIssueExpandedPaths] = useState<Set<string>>(new Set());

    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const repository = useQuery(api.repo.getRepositoryById, { repoId });

    const issueTree = useMemo(() => {
      if (!structure || issuePaths.length === 0) return null;
      return pruneTreeForIssues(structure, issuePaths);
    }, [structure, issuePaths]);

    // Automatically expand issue tree when it changes
    useEffect(() => {
      if (issueTree) {
        const paths = new Set<string>();
        const collectPaths = (node: FolderNode) => {
          paths.add(node.path);
          Object.values(node.children).forEach(collectPaths);
        };
        collectPaths(issueTree);
        setIssueExpandedPaths(paths);
      }
    }, [issueTree]);

    const loadStructure = useCallback(
      async (force = false) => {
        if (!repository?.repoOwner || !repository?.repoName) return;

        setIsLoading(true);
        try {
          const result = await getRepoStructure(
            repository.repoOwner,
            repository.repoName,
            force,
            repository.ownerClerkId
          );

          if (result.rateLimited) {
            toast.error(
              "Rate limit hit! Please wait 5 minutes between refreshes.",
            );
            return;
          }

          if (result.error) {
            toast.error(result.error);
            return;
          }

          if (result.data) {
            setStructure(result.data.root);
            setLastUpdated(result.data.lastUpdated);
            if (force) toast.success("Refreshed from GitHub!");
          }
        } catch (error) {
          toast.error("Failed to load repository structure");
        } finally {
          setIsLoading(false);
        }
      },
      [repository, setStructure],
    );

    useEffect(() => {
      if (isOpen && !structure && repository) {
        loadStructure();
      }
    }, [isOpen, structure, repository, loadStructure]);

    const togglePath = (path: string) => {
      const next = new Set(expandedPaths);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      setExpandedPaths(next);
    };

    const toggleIssuePath = (path: string) => {
      const next = new Set(issueExpandedPaths);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      setIssueExpandedPaths(next);
    };

    const handleToggle = () => {
      const nextState = !isOpen;
      onToggle(nextState);
      if (nextState) {
        setSidebarOpen(false);
      }
    };

    return (
      <div className="relative shrink-0 flex flex-col h-svh border z-10 transition-all duration-300">
        <div
          className={cn(
            "h-full bg-[#030303] border-r border-white/5 transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
            isOpen
              ? "w-96 shadow-[2px_0_12px_rgba(0,0,0,0.4)]"
              : "w-0 shadow-none",
          )}
        >
          <div className="w-96 h-full flex flex-col shrink-0">
            {/* Panel Header */}
            <div className="flex flex-col px-6 py-2 border-b border-white/10 shrink-0 bg-[#080808]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-none">
                  <div className="p-2 bg-zinc-900/50 rounded-lg border border-white/5">
                    <Network className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[15px] text-white">
                      Heatmap Panel
                    </h2>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => loadStructure(true)}
                  disabled={isLoading}
                  className={cn("h-8 w-8")}
                >
                  <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
                </Button>
              </div>

              {lastUpdated && (
                <p className="text-xs font-inter text-primary/70 tracking-tight mt-2 flex items-center gap-1">
                  <Info size={12} />
                  Last updated{" "}
                  {formatDistanceToNow(new Date(lastUpdated), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-8">
                {/* 🔴 ISSUES SECTION (Only shown if issues exist) */}
                {issueTree && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Active Issues
                      </span>
                    </div>

                    <div className="border border-border/20 rounded-xl p-1 bg-accent/5">
                      <FolderTree
                        node={issueTree}
                        expandedPaths={issueExpandedPaths}
                        togglePath={toggleIssuePath}
                        issuePaths={issuePaths}
                        isIssueView={true}
                      />
                    </div>
                  </div>
                )}

                {/* 📂 FULL DIRECTORY STRUCTURE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                      Directory Structure
                    </span>
                    <span className="text-[10px] text-muted-foreground/30 italic">
                      Folders & Files
                    </span>
                  </div>

                  {isLoading && !structure ? (
                    <div className="space-y-2 pt-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-8 bg-accent/20 animate-pulse rounded-md w-full"
                        />
                      ))}
                    </div>
                  ) : structure ? (
                    <div className="border border-border/30 rounded-xl p-1 bg-accent/5">
                      <FolderTree
                        node={structure}
                        expandedPaths={expandedPaths}
                        togglePath={togglePath}
                        issuePaths={issuePaths}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm italic">
                      No structure data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* TOGGLE BUTTON */}
        <div
          className={cn(
            "absolute top-[45%] left-full -translate-x-1.5  transition-all duration-150 z-50",
            !isOpen && "opacity-100 ",
          )}
        >
          <Button
            onClick={handleToggle}
            className={cn(
              "bg-white! text-black! h-16! w-6! rounded-md cursor-pointer shadow-2xl transition-all",
              !isOpen && "opacity-100",
            )}
          >
            {isOpen ? (
              <ChevronLeft size={16} className="" />
            ) : (
              <ChevronRight size={20} />
            )}
          </Button>
        </div>
      </div>
    );
  },
);

HeatmapPanel.displayName = "HeatmapPanel";
