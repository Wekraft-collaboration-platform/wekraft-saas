"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderIcon, FileCode, ArrowLeft, Loader2, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getRepoTree, type TreeNode } from "./function/index";
import { Tree, Folder, File, type TreeViewElement } from "@/components/ui/file-tree";

interface GetRepoStructureProps {
  repoFullName?: string;
  onSelect: (path: string | null) => void;
  selectedPath: string | null;
}

export const GetRepoStructure = ({
  repoFullName,
  onSelect,
  selectedPath,
}: GetRepoStructureProps) => {
  const [elements, setElements] = useState<TreeViewElement[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

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
      const result = await getRepoTree(owner, repo, "");
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
    const result = await getRepoTree(owner, repo, path);
    
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
    return elements.map((element) => {
      const isLoading = loadingMap[element.id];
      if (element.type === "folder") {
        return (
          <Folder
            key={element.id}
            value={element.id}
            element={element.name}
            onClick={() => handleFolderClick(element)}
          >
            {isLoading && (
              <div className="flex items-center gap-2 pl-4 py-1 text-xs text-neutral-500">
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
          className={cn(selectedPath === element.id && "text-blue-400 font-medium")}
        >
          {element.name}
        </File>
      );
    });
  };

  return (
    <div className="flex flex-col h-[400px] ">
      <div className="p-3 border-b border-[#2b2b2b] flex items-center justify-between">
        <span className="text-xs font-semibold">Repository Structure</span>
        {loadingMap.root && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
      </div>

      <div className="flex-1 min-h-0 p-2">
        <Tree 
          elements={elements} 
          initialSelectedId={selectedPath || undefined} 
          className="h-full px-0"
        >
          {elements.length > 0 ? renderTree(elements) : !loadingMap.root && (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500">
              No files found or repository empty.
            </div>
          )}
        </Tree>
      </div>

      {selectedPath && (
        <div className="p-3 border-t border-[#2b2b2b] bg-[#1c1c1c]">
          <div className="text-[10px] text-neutral-500 mb-1">Linked File:</div>
          <div className="text-xs text-blue-400 font-medium truncate flex items-center gap-2">
            <FileCode className="h-3 w-3" />
            {selectedPath}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-auto hover:text-red-400"
              onClick={() => onSelect(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};