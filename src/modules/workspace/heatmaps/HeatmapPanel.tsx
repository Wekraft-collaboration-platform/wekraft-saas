"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  GitBranch, 
  Network, 
  RefreshCw,
  FileCode,
  File,
  FileJson,
  FileText,
  FileBadge,
  Terminal,
  Settings,
  Info,
  Type,
  Atom,
  Brackets,
  Package
} from "lucide-react";




import { memo, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { ExternalLink, Github } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { getRepoStructure, type FolderNode } from "./action";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface HeatmapPanelProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  repoId?: Id<"repositories">;
  structure: FolderNode | null;
  setStructure: (structure: FolderNode | null) => void;
}


const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
        case 'tsx':
        case 'jsx':
            return { icon: <Atom size={14} className="text-blue-400 shrink-0" />, color: "text-blue-400" };
        case 'ts':
        case 'js':
            return { icon: <Brackets size={14} className="text-blue-500 shrink-0" />, color: "text-blue-500" };

        case 'json':
            return { icon: <FileJson size={14} className="text-yellow-500" />, color: "text-yellow-500" };
        case 'css':
            return { icon: <div className="text-[10px] font-bold text-blue-300 border border-blue-300/50 rounded-[2px] w-3.5 h-3.5 flex items-center justify-center shrink-0">#</div>, color: "text-blue-300" };
        case 'md':
            return { icon: <FileText size={14} className="text-blue-400" />, color: "text-blue-400" };
        case 'svg':
        case 'png':
        case 'jpg':
            return { icon: <FileBadge size={14} className="text-purple-400" />, color: "text-purple-400" };
        default:
            return { icon: <File size={14} className="text-muted-foreground/60" />, color: "text-muted-foreground/60" };
    }
};

const FolderTree = ({ 
    node, 
    level = 0, 
    expandedPaths, 
    togglePath 
}: { 
    node: FolderNode; 
    level?: number; 
    expandedPaths: Set<string>;
    togglePath: (path: string) => void;
}) => {

    const isExpanded = expandedPaths.has(node.path);
    const hasChildren = Object.keys(node.children).length > 0 || (node.files && node.files.length > 0);


    return (
        <div className="flex flex-col">
            <div 
                className={cn(
                    "flex items-center gap-2 py-1 px-2 mb-0.5 rounded-sm hover:bg-accent/40 cursor-pointer transition-colors text-[13px] group relative",
                    level === 0 && "font-bold bg-accent/20 mb-2 border border-border/10",
                    isExpanded && level !== 0 && "bg-accent/5"
                )}
                style={{ paddingLeft: `${(level * 16) + 8}px` }}
                onClick={() => togglePath(node.path)}
            >

                {hasChildren ? (
                    isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />
                ) : (
                    <span className="w-[14px]" />
                )}
                
                {level === 0 ? (
                    <Package size={16} className="text-primary shrink-0" />
                ) : isExpanded ? (
                    <FolderOpen size={16} className="text-blue-400/70 shrink-0" />
                ) : (
                    <Folder size={16} className="text-blue-400/60 shrink-0" />
                )}

                
                <span className="truncate flex-1">{node.name}</span>
                
                <div className={cn(
                    "flex items-center gap-2 transition-opacity",
                    level === 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-mono">
                        {node.totalFileCount} files

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
                            className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-border/20 z-0" 
                            style={{ left: `${(level * 16) + 15}px` }}
                        />


                        {Object.values(node.children || {})
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(child => (
                                <FolderTree 
                                    key={child.path} 
                                    node={child} 
                                    level={level + 1} 
                                    expandedPaths={expandedPaths}
                                    togglePath={togglePath}
                                />
                            ))
                        }
                        
                        {/* Render Files */}
                            {(node.files || [])
                                .sort((a, b) => a.localeCompare(b))
                                .map(fileName => {
                                    const { icon } = getFileIcon(fileName);
                                    return (
                                        <div 
                                            key={`${node.path}/${fileName}`}
                                            className="flex items-center gap-2 py-1 px-2 mb-0.5 rounded-sm text-[13px] text-muted-foreground/80 hover:bg-accent/30 hover:text-foreground cursor-pointer transition-colors group relative"
                                            style={{ paddingLeft: `${((level + 1) * 16) + 12}px` }}
                                        >
                                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                {icon}
                                            </div>
                                            <span className="truncate flex-1">{fileName}</span>
                                        </div>
                                    );
                                })
                            }

                    </motion.div>


                )}
            </AnimatePresence>
        </div>
    );
};

export const HeatmapPanel = memo(
  ({ isOpen, onToggle, repoId, structure, setStructure }: HeatmapPanelProps) => {
    const { setOpen: setSidebarOpen } = useSidebar();
    const [isLoading, setIsLoading] = useState(false);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const repository = useQuery(api.repo.getRepositoryById, { repoId });

    const loadStructure = useCallback(async (force = false) => {
        if (!repository?.repoOwner || !repository?.repoName) return;
        
        setIsLoading(true);
        try {
            const result = await getRepoStructure(repository.repoOwner, repository.repoName, force);
            
            if (result.rateLimited) {
                toast.error("Rate limit hit! Please wait 5 minutes between refreshes.");
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
    }, [repository, setStructure]);


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

    const handleToggle = () => {
      const nextState = !isOpen;
      onToggle(nextState);
      if (nextState) {
        setSidebarOpen(false);
      }
    };

    return (
      <div className="relative shrink-0 flex flex-col h-full z-10 transition-all duration-300">
        <div
          className={cn(
            "h-full bg-sidebar border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
            isOpen
              ? "w-96 border-r shadow-[2px_0_12px_rgba(0,0,0,0.01)]"
              : "w-0 border-r-0 shadow-none",
          )}
        >
            
          <div className="w-96 h-full flex flex-col shrink-0">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b shrink-0 bg-sidebar">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm ">Heatmap Panel</h2>
                  <p className="text-xs text-muted-foreground">Directory Insights</p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => loadStructure(true)}
                disabled={isLoading}
                className={cn("h-8 w-8", isLoading && "animate-spin")}
              >
                <RefreshCw size={14} />
              </Button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-6">
                    {/* Repo Info Card */}
                    <div className="bg-accent/30 rounded-xl p-4 border border-border/50">
                        <div className="flex items-start justify-between mb-3">
                            <div className="space-y-1">
                                <h2 className="font-bold text-base flex items-center gap-2">
                                    <GitBranch className="w-4 h-4 text-primary"/>   
                                    <span className="truncate max-w-[200px]">{repository?.repoName}</span>
                                </h2>
                                {repository && (
                                    <a
                                        href={repository.repoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[220px]"
                                    >
                                        <span className="truncate">{repository.repoUrl}</span>
                                        <ExternalLink size={12} className="shrink-0" />
                                    </a>
                                )}
                            </div>
                            <Github size={16} className="text-muted-foreground/50" />
                        </div>

                        {/* Root Aggregate Stats */}
                        {structure && (
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Folder size={12} />
                                        <span className="text-[10px] uppercase tracking-wider font-semibold">Folders</span>
                                    </div>
                                    <div className="text-xl font-bold font-mono text-primary">
                                        {structure.folderCount}
                                    </div>
                                </div>
                                <div className="bg-background/50 rounded-lg p-2.5 border border-border/30">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <FileCode size={12} />
                                        <span className="text-[10px] uppercase tracking-wider font-semibold">Files</span>
                                    </div>
                                    <div className="text-xl font-bold font-mono text-primary">
                                        {structure.totalFileCount}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {lastUpdated && (
                            <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                                <Info size={10} />
                               Last Updated at {new Date(lastUpdated).toLocaleTimeString()}
                            </p>
                        )}
                    </div>

                    {/* Folder Tree */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                Directory Structure
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 italic">
                                Folders & Files
                            </span>
                        </div>
                        
                        {isLoading && !structure ? (
                            <div className="space-y-2 pt-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-8 bg-accent/20 animate-pulse rounded-md w-full" />
                                ))}
                            </div>
                        ) : structure ? (
                            <div className="border border-border/30 rounded-xl p-1 bg-accent/5">
                                <FolderTree 
                                    node={structure} 
                                    expandedPaths={expandedPaths}
                                    togglePath={togglePath}
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
        <div
          className={cn(
            "absolute top-[45%] left-full -translate-x-1.5  -translate-y-1/2 transition-all duration-150 z-50",
            !isOpen && "opacity-100 ",
          )}
        >
          <Button
            onClick={handleToggle}
            className={cn(
              "bg-primary text-muted h-16! w-6! rounded-md  cursor-pointer shadow-lg hover:shadow-primary/20 transition-all",
              !isOpen && "text-muted",
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
