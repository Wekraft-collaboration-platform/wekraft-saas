"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { Sparkles, Plug, Wrench, Plus, Save, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConnectorIcon, CONNECTOR_META } from "@/lib/mcp/connectors";

interface KayaSettingsSectionProps {
  projectId: Id<"projects">;
}

const PM_PERSONALITIES = [
  {
    id: "delivery",
    title: "Delivery & Milestone Driven",
    recommended: true,
  },
  {
    id: "agile",
    title: "Agile & Team Collaborative",
  },
  {
    id: "action",
    title: "Direct & Action-Oriented",
  },
];

const DEFAULT_PERSONA_INSTRUCTIONS =
  "Reply in tabular format , nice clean and bold headings , action and resuts first , recomended actions at last.";

export function KayaSettingsSection({ projectId }: KayaSettingsSectionProps) {
  const params = useParams();
  const slug = params?.slug as string;

  // Real Convex query for connected MCP connectors in this project
  const connections = useQuery(api.mcp.getConnectionsByProject, { projectId });
  const disconnectMutation = useMutation(api.mcp.disconnectTool);

  // Kaya Personality State (3 PM Styles)
  const [selectedPreset, setSelectedPreset] = useState("delivery");
  const [customPrompt, setCustomPrompt] = useState(
    DEFAULT_PERSONA_INSTRUCTIONS,
  );
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  // MCP Disconnecting State
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Skills Registry State
  const [isCreateSkillOpen, setIsCreateSkillOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
  };

  const handleSavePersonality = () => {
    setIsSavingPersona(true);
    setTimeout(() => {
      setIsSavingPersona(false);
      toast.success("Kaya PM persona updated successfully!");
    }, 400);
  };

  const handleDisconnectConnector = async (
    connectorId: string,
    name: string,
  ) => {
    setDisconnectingId(connectorId);
    try {
      await disconnectMutation({ projectId, connectorId });
      toast.success(`Disconnected ${name}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to disconnect MCP connector.");
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleCreateSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      toast.error("Skill name is required");
      return;
    }
    toast.success(`Skill "${newSkillName}" created!`);
    setNewSkillName("");
    setNewSkillDesc("");
    setIsCreateSkillOpen(false);
  };

  // Connected MCP tools from Convex
  const connectedItems = (connections || []).filter((c) => c.isConnected);

  return (
    <div className="space-y-6 mt-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-medium flex items-center gap-2.5 text-foreground">
            <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
              <Image
                src="/kaya.svg"
                alt="Kaya AI"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            Kaya Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Kaya AI Project Manager persona, connected MCP tools, and
            skills registry.
          </p>
        </div>
      </div>

      {/* 1. Kaya PM Personality Card */}
      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="relative w-4 h-4 flex-shrink-0">
              <Image
                src="/kaya.svg"
                alt="Kaya AI"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            Kaya Persona
          </CardTitle>
          <CardDescription>
            Configure Kaya&apos;s project management philosophy and execution
            instructions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* PM Personality Style Dropdown */}
          <div className="space-y-2">
            <Label
              htmlFor="pmPersonality"
              className="text-xs text-foreground flex items-center gap-1.5"
            >
              Management Style
            </Label>
            <Select value={selectedPreset} onValueChange={handlePresetSelect}>
              <SelectTrigger
                id="pmPersonality"
                className="w-full text-xs bg-background"
              >
                <SelectValue placeholder="Select PM management style" />
              </SelectTrigger>
              <SelectContent>
                {PM_PERSONALITIES.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    className="text-xs py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {p.title}
                      </span>
                      {p.recommended && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-primary/10 text-primary border-primary/20 font-normal"
                        >
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Persona Instructions */}
          <div className="space-y-2">
            <Label
              htmlFor="customPrompt"
              className="text-xs font-semibold text-foreground"
            >
              Custom Persona Instructions
            </Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Reply in tabular format , nice clean and bold headings , action and resuts first , recomended actions at last."
              className="text-[11px] placeholder:text-[11px]! min-h-[85px] resize-y bg-background"
            />
          </div>

          <Button
            size="sm"
            onClick={handleSavePersonality}
            disabled={isSavingPersona}
            className="text-xs cursor-pointer"
          >
            {isSavingPersona ? (
              <>Saving changes...</>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Persona
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 2. Skills Section - Linear Style */}
      <div className="space-y-2 pt-2">
        <div>
          <h3 className="text-sm font-medium text-foreground">Skills</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated routines created dynamically by Kaya and pre-installed
            skills.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/60 px-4 py-3.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            No skills created
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateSkillOpen(true)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer"
            title="Create custom skill"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Create Skill Dialog */}
        <Dialog open={isCreateSkillOpen} onOpenChange={setIsCreateSkillOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" /> Create New Kaya
                Skill
              </DialogTitle>
              <DialogDescription className="text-xs">
                Define custom instructions, context hooks, and triggers for
                Kaya.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSkillSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="skillName" className="text-xs">
                  Skill Name
                </Label>
                <Input
                  id="skillName"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Next.js Routing Audit"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skillDesc" className="text-xs">
                  Description & Prompt Instructions
                </Label>
                <Textarea
                  id="skillDesc"
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  placeholder="Describe what this skill performs and prompt rules..."
                  className="text-xs min-h-[80px]"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateSkillOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs">
                  Create Skill
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 3. MCP Connectors Section - Linear Style */}
      <div className="space-y-2 pt-2">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            MCP connectors
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add MCP connectors for use with Kaya Agent. Workspace admins can
            manage available connectors in security settings.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-neutral-800 overflow-hidden shadow-xs">
          {/* Header Row inside box */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-medium text-foreground">
              {connectedItems.length === 0
                ? "No connectors added"
                : `${connectedItems.length} connector${connectedItems.length > 1 ? "s" : ""} added`}
            </span>
            <Link
              href={`/dashboard/my-projects/${slug}/workspace/integrations`}
              className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted/50 rounded-md transition-colors inline-flex items-center"
              title="Add MCP connector"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>

          {/* Connectors List */}
          {connections === undefined ? (
            <div className="px-4 py-3 space-y-2">
              <div className="h-6 bg-muted/40 animate-pulse rounded-md" />
            </div>
          ) : connectedItems.length > 0 ? (
            <div className="divide-y divide-border/30">
              {connectedItems.map((item) => {
                const meta = CONNECTOR_META[item.connectorId] || {
                  name: item.connectorId,
                  category: "Integration",
                };
                const isDisconnecting = disconnectingId === item.connectorId;

                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/15 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900/90 border border-border/60 flex items-center justify-center shrink-0">
                        <ConnectorIcon
                          connectorId={item.connectorId}
                          size={20}
                          className="shrink-0 rounded-xs"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground">
                          {meta.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{meta.category}</span>
                          <span className="opacity-40">•</span>
                          <span className="font-mono text-[10px] text-muted-foreground/75 truncate">
                            https://mcp.{item.connectorId}.dev/mcp
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      title={`Disconnect ${meta.name}`}
                      onClick={() =>
                        handleDisconnectConnector(item.connectorId, meta.name)
                      }
                      disabled={isDisconnecting}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
