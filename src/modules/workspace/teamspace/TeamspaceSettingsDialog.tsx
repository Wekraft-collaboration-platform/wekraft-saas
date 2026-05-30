"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTeamspaceSettings, TeamspaceSettings } from "./hooks/useTeamspaceSettings";
import { Loader2 } from "lucide-react";

interface Props {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPower: boolean; // true if user is Owner or Admin
}

export function TeamspaceSettingsDialog({ projectId, open, onOpenChange, isPower }: Props) {
  const { settings, loading, updateSettings } = useTeamspaceSettings(projectId);

  const handleToggle = (key: keyof TeamspaceSettings, checked: boolean) => {
    if (!isPower || !settings) return;
    
    updateSettings({ [key]: checked ? 1 : 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Teamspace Settings</DialogTitle>
          <DialogDescription>
            Configure permissions for regular members in this teamspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="create-channels">Create Channels</Label>
                  <span className="text-sm text-muted-foreground">
                    Allow members to create new channels.
                  </span>
                </div>
                <Switch
                  id="create-channels"
                  checked={settings?.members_can_create_channels === 1}
                  disabled={!isPower}
                  onCheckedChange={(checked) => handleToggle("members_can_create_channels", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="edit-channels">Edit Channels</Label>
                  <span className="text-sm text-muted-foreground">
                    Allow members to rename and change descriptions of channels.
                  </span>
                </div>
                <Switch
                  id="edit-channels"
                  checked={settings?.members_can_edit_channels === 1}
                  disabled={!isPower}
                  onCheckedChange={(checked) => handleToggle("members_can_edit_channels", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="delete-channels">Delete Channels</Label>
                  <span className="text-sm text-muted-foreground">
                    Allow members to delete channels (except default channels).
                  </span>
                </div>
                <Switch
                  id="delete-channels"
                  checked={settings?.members_can_delete_channels === 1}
                  disabled={!isPower}
                  onCheckedChange={(checked) => handleToggle("members_can_delete_channels", checked)}
                />
              </div>

              {!isPower && (
                <p className="text-xs text-amber-500 mt-2">
                  Only project owners and admins can change these settings.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
