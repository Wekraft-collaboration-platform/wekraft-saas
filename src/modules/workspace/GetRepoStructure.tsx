"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderIcon, FileCode, ArrowLeft, Loader2, ChevronRight, X, Search, FolderOpenIcon, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getRepoTree, type TreeNode } from "./function/index";
import { Tree, Folder, File, type TreeViewElement } from "@/components/ui/file-tree";


interface GetRepoStructureProps {
  repoFullName?: string;
  onSelect: (path: string | null) => void;
  selectedPath: string | null;
  ownerClerkId?: string;
}

export const GetRepoStructure = ({
  repoFullName,
  onSelect,
  selectedPath,
  ownerClerkId,
}: GetRepoStructureProps) => {
  const [elements, setElements] = useState<TreeViewElement[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to map TreeNode to TreeViewElement
  const mapToTreeElement = useCallback((node: TreeNode): TreeViewElement => ({
    id: node.path,
    name: node.path.split("/").pop() || "",
    type: node.type === "tree" ? "folder" : "file",
    children: node.type === "tree" ? [] : undefined,
  }), []);
 
  // Root loading on mount
  useEffect(() => {
    const loadRoot = async () => {
      if (!repoFullName || elements.length > 0) return;
      
      const [owner, repo] = repoFullName.split("/");
      if (!owner || !repo) return;

      setLoadingMap({ root: true });
      const result = await getRepoTree(owner, repo, "", ownerClerkId);
      if (result.success) {
        setElements(result.data.map(mapToTreeElement));
      }
      setLoadingMap({});
    };

    loadRoot();
  }, [repoFullName, mapToTreeElement, elements.length]);

  const fetchChildren = async (path: string) => {
    const [owner, repo] = repoFullName!.split("/");
    
    setLoadingMap(prev => ({ ...prev, [path]: true }));
    const result = await getRepoTree(owner, repo, path, ownerClerkId);
    
    if (result.success) {
      const children = result.data.map(mapToTreeElement);
      
      // Update the elements tree
      const updateTree = (items: TreeViewElement[]): TreeViewElement[] => {
        return items.map(item => {
          if (item.id === path) {
            return { ...item, children };
          }
          if (item.children) {
            return { ...item, children: updateTree(item.children) };
          }
          return item;
        });
      };
      
      setElements(prev => updateTree(prev));
    } else {
      toast.error(result.error);
    }
    setLoadingMap(prev => ({ ...prev, [path]: false }));
  };

  const handleFolderClick = (element: TreeViewElement) => {
    // Only fetch if children list is empty
    if (element.children && element.children.length === 0) {
      fetchChildren(element.id);
    }
  };

  // Dedicated recursive rendering function for lazy loading
  const renderTree = (elements: TreeViewElement[]) => {
    // Basic filter logic to keep folders visible if children are matches
    const filteredElements = searchQuery 
      ? elements.filter(el => el.name.toLowerCase().includes(searchQuery.toLowerCase()) || el.type === "folder")
      : elements;

    return filteredElements.map((element) => {
      const isLoading = loadingMap[element.id];
      if (element.type === "folder") {
        return (
          <Folder
            key={element.id}
            value={element.id}
            element={
              <div className="flex items-center w-full group/folder">
                <span className={cn("text-xs flex-1", selectedPath === element.id && "text-amber-500 font-semibold")}>{element.name}</span>
                <div 
                  role="button"
                  className="h-4 w-4 flex items-center justify-center opacity-0 group-hover/folder:opacity-100 hover:text-amber-500 transition-opacity ml-4 mr-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Don't expand when clicking select
                    onSelect(element.id);
                    toast.success(`Linked folder: ${element.name}`);
                  }}
                >
                  <Link2 className="h-2.5 w-2.5" />
                </div>
              </div>
            }
            openIcon={<FolderOpenIcon className="size-4 text-amber-500" />}
            closeIcon={<FolderIcon className="size-4 text-amber-500" />}
            onClick={() => handleFolderClick(element)}
          >
            {isLoading && (
              <div className="flex items-center gap-2 pl-4 py-1 text-[10px] text-neutral-500 italic">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            )}
            {element.children && element.children.length > 0 && renderTree(element.children)}
          </Folder>
        );
      }
      return (
        <File 
          key={element.id} 
          value={element.id} 
          onClick={() => onSelect(element.id)}
          fileIcon={<FileCode className="h-4 w-4 text-blue-500" />}
          className={cn(
            selectedPath === element.id && "bg-blue-500/10 text-blue-400 font-semibold",
            "text-xs tracking-tight px-1 py-0.5 rounded-sm hover:bg-[#252525] w-full text-left transition-colors"
          )}
        >
          {element.name}
        </File>
      );
    });
  };

  return (
    <div className="flex flex-col h-[340px] overflow-hidden bg-[#1c1c1c]">
      <div className="p-3 border-b border-[#2b2b2b] flex items-center justify-between bg-[#222]">
        <span className="text-xs font-semibold text-neutral-300">Repository Structure</span>
        {loadingMap.root && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
      </div>

      <div className="p-2 border-b border-[#2b2b2b]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <Input 
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-[#252525] border-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Tree 
          elements={elements} 
          initialSelectedId={selectedPath || undefined} 
          className="p-2 h-full"
        >
          {elements.length > 0 ? renderTree(elements) : !loadingMap.root && (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500 py-20">
              No items found.
            </div>
          )}
        </Tree>
      </div>

      {selectedPath && (
        <div className="p-3 border-t border-[#2b2b2b] bg-[#1c1c1c]">
          <div className="text-[10px] text-neutral-500 mb-1 leading-none uppercase tracking-tighter opacity-50 font-bold">Linked Resource:</div>
          <div className="text-xs text-blue-400 font-medium truncate flex items-center gap-2">
            {!selectedPath.includes(".") ? (
              <FolderIcon className="h-3 w-3 text-amber-500" />
            ) : (
              <FileCode className="h-3 w-3 text-blue-500" />
            )}
            <span className={cn(!selectedPath.includes(".") && "text-amber-500")}>
              {selectedPath}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-auto hover:text-red-400 font-bold"
              onClick={() => onSelect(null)}
            >
              <X className="h-3 w-3 text-neutral-500 hover:text-red-400" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};