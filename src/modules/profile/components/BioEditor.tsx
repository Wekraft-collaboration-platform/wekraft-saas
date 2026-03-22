"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit2, Save, FileText, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../convex/_generated/api";

// Dynamic import to avoid SSR errors with the editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), {
  ssr: false,
});

interface BioEditorProps {
  initialBio?: string;
  isUpgraded: boolean;
}

export function BioEditor({ initialBio = "", isUpgraded }: BioEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);
  const updateBio = useMutation(api.user.updateUserBio);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBio({ bio });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save bio", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">About Me.md</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-3 w-3 mr-2" />
            Edit
          </Button>
        </div>
        <div className="prose dark:prose-invert max-w-none overflow-y-auto max-h-[500px] scrollbar-hide py-2 px-2">
          {bio ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bio}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic text-sm">No bio provided yet. Click edit to tell the world about yourself!</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      <div className="flex justify-between items-center p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Editing Profile Content</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className={`h-3 w-3 mr-2 ${isSaving ? "animate-spin" : ""}`} />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" data-color-mode="dark">
        {isUpgraded ? (
          <div className="h-full">
            <MDEditor
              value={bio}
              onChange={(val) => setBio(val || "")}
              height="100%"
              minHeight={300}
              preview="edit"
            />
          </div>
        ) : (
          <div className="p-4 flex flex-col h-full gap-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
              <p>
                As a <strong>Free</strong> user, you can use plain text here. 
                <span className="text-blue-500 cursor-pointer ml-1 hover:underline font-semibold" onClick={() => (window.location.href = '#upgrade')}>
                  Upgrade to Plus
                </span> to unlock Markdown icons, tables, and stylish formatting.
              </p>
            </div>
            <Textarea
              className="flex-1 resize-none font-sans min-h-[300px]"
              placeholder="Write your bio here..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
