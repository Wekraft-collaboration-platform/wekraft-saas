"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  Loader2, 
  Github, 
  User, 
  Mail, 
  Briefcase, 
  Sparkles, 
  Globe, 
  Lock,
  X,
  Plus,
  Compass,
  FileText,
  CheckCircle2
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SocialLinksDialog } from "./SocialLinksDialog";

interface ProfileSettingsProps {
  user: any;
  isUpgraded: boolean;
  onBack: () => void;
}

export function ProfileSettings({ user, isUpgraded, onBack }: ProfileSettingsProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const { openUserProfile } = useClerk();

  // Active row editor state: 'name' | 'occupation' | 'bio' | 'skills' | 'socials' | 'github' | null
  const [activeEditRow, setActiveEditRow] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Field edit states
  const [editName, setEditName] = useState(user?.name || "");
  const [debouncedName, setDebouncedName] = useState("");
  const [isTypingName, setIsTypingName] = useState(false);

  // Clean debounce logic for name/username
  useEffect(() => {
    const trimmed = editName.trim();
    if (activeEditRow !== "name" || trimmed.length < 3) {
      setDebouncedName("");
      setIsTypingName(false);
      return;
    }

    setIsTypingName(true);
    const timer = setTimeout(() => {
      setDebouncedName(trimmed);
      setIsTypingName(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [editName, activeEditRow]);

  const isNameAvailable = useQuery(
    api.user.checkUsernameAvailability,
    debouncedName.length >= 3 ? { name: debouncedName } : "skip"
  );

  const isNameLengthValid = editName.trim().length >= 3 && editName.trim().length <= 20;
  const isNameTaken = debouncedName.length >= 3 && isNameAvailable === false && !isTypingName;
  const isNameSaveDisabled = !isNameLengthValid || isNameTaken || isTypingName || isSaving;
  const [editOccupation, setEditOccupation] = useState(user?.occupation || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editSkills, setEditSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [showSocialLinksDialog, setShowSocialLinksDialog] = useState(false);

  // Convex mutations
  const updateIdentity = useMutation(api.user.updateUserIdentity);
  const updateBio = useMutation(api.user.updateUserBio);
  const updateSkills = useMutation(api.user.updateUserSkills);
  const updateSocialLinks = useMutation(api.user.updateSocialLinks);

  // Reset values when user updates or edit row cancels
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditOccupation(user.occupation || "");
      setEditBio(user.bio || "");
      setEditSkills(user.skills || []);
    }
  }, [user, activeEditRow]);

  const handleSaveIdentity = async () => {
    if (!editName.trim() || !editOccupation.trim()) {
      toast.error("Name and occupation cannot be empty");
      return;
    }
    try {
      setIsSaving(true);
      await updateIdentity({
        name: editName.trim(),
        occupation: editOccupation.trim(),
      });
      toast.success("Identity updated successfully!");
      setActiveEditRow(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      setIsSaving(true);
      await updateBio({ bio: editBio });
      toast.success("Bio updated successfully!");
      setActiveEditRow(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update bio");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSkills = async () => {
    try {
      setIsSaving(true);
      await updateSkills({ skills: editSkills });
      toast.success("Skills updated successfully!");
      setActiveEditRow(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update skills");
    } finally {
      setIsSaving(false);
    }
  };


  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    
    const normalizedNew = trimmed.toLowerCase().replace(/[\.\s-]/g, "");
    const alreadyExists = editSkills.some((s) => 
      s.toLowerCase().replace(/[\.\s-]/g, "") === normalizedNew
    );
    
    if (alreadyExists) {
      toast.error("Skill already exists in the list");
      return;
    }
    setEditSkills([...editSkills, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter(s => s !== skillToRemove));
  };

  const handleConnectGithub = async () => {
    try {
      const res = await clerkUser?.createExternalAccount({
        strategy: "oauth_github",
        redirectUrl: window.location.href,
      });
      if (res?.verification?.externalVerificationRedirectURL) {
        window.location.href = res.verification.externalVerificationRedirectURL.toString();
      }
    } catch (error: any) {
      toast.error(error?.errors?.[0]?.message || "Failed to initiate GitHub OAuth");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Header Row */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 rounded-md shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold font-pop tracking-tight">Edit Profile</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your public information, security options and subscriptions</p>
        </div>
      </div>

      {/* Settings Rows Container */}
      <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border/60">
        
        {/* ROW 1: Username / Name */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Name
            </span>
          </div>

          {activeEditRow === "name" ? (
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="relative max-w-md">
                <Input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="Username"
                  className="bg-background pr-10"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {editName.trim().length >= 3 && (
                    isTypingName || isNameAvailable === undefined ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isNameAvailable === false ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )
                  )}
                </div>
              </div>

              {/* Status helper text */}
              <div className="min-h-5 px-1">
                {editName.trim().length > 0 && editName.trim().length < 3 && (
                  <p className="text-[11px] text-zinc-500">
                    Username needs to be at least 3 characters
                  </p>
                )}
                {editName.trim().length > 20 && (
                  <p className="text-[11px] text-destructive">Too long (max 20)</p>
                )}
                {editName.trim().length >= 3 && isNameAvailable === false && !isTypingName && (
                  <p className="text-[11px] text-destructive animate-in fade-in slide-in-from-top-1">
                    Username is already taken
                  </p>
                )}
                {editName.trim().length >= 3 && isNameAvailable === true && !isTypingName && (
                  <p className="text-[11px] text-emerald-500">Username is available</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveIdentity} 
                  disabled={isNameSaveDisabled} 
                  className="h-8 text-xs"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveEditRow(null)} disabled={isSaving} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">{user?.name || "No name set"}</span>
              </div>
              <div className="shrink-0">
                <Button variant="link" onClick={() => setActiveEditRow("name")} className="text-xs text-primary font-semibold h-auto p-0">
                  Edit
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ROW 2: Email (Read Only) */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground/80 font-mono">{user?.email}</span>
          </div>
          <div className="shrink-0">
            <span className="text-xs text-muted-foreground italic select-none">Linked to Auth</span>
          </div>
        </div>

        {/* ROW 3: Role / Occupation */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Role / Occupation
            </span>
          </div>

          {activeEditRow === "occupation" ? (
            <div className="flex-1 flex flex-col gap-3">
              <Input 
                value={editOccupation}
                onChange={(e) => setEditOccupation(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="max-w-md bg-background"
                required
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveIdentity} disabled={isSaving} className="h-8 text-xs">
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveEditRow(null)} disabled={isSaving} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">{user?.occupation || "No occupation set"}</span>
              </div>
              <div className="shrink-0">
                <Button variant="link" onClick={() => setActiveEditRow("occupation")} className="text-xs text-primary font-semibold h-auto p-0">
                  Edit
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ROW 4: GitHub Username (Read Only) */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" /> GitHub Username
            </span>
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-2">
            {user?.githubUsername ? (
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                @{user.githubUsername}
              </span>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground/60 italic flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
                Not connected
              </span>
            )}
          </div>
          <div className="shrink-0">
            <span className="text-xs text-muted-foreground italic select-none">
              {user?.githubUsername ? "Linked via Auth" : "Not connected"}
            </span>
          </div>
        </div>

        {/* ROW 5: Bio */}
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0 md:pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Bio
            </span>
          </div>

          {activeEditRow === "bio" ? (
            <div className="flex-1 flex flex-col gap-3">
              <Textarea 
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell the world about yourself..."
                className="max-w-xl min-h-[100px] bg-background resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveBio} disabled={isSaving} className="h-8 text-xs">
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveEditRow(null)} disabled={isSaving} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/80 leading-relaxed whitespace-pre-wrap max-w-xl">
                  {user?.bio || <span className="text-muted-foreground/60 italic text-xs">No bio added yet.</span>}
                </p>
              </div>
              <div className="shrink-0">
                <Button variant="link" onClick={() => setActiveEditRow("bio")} className="text-xs text-primary font-semibold h-auto p-0">
                  Edit
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ROW 6: Subscription Type */}
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Subscription Type
            </span>
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className="text-sm font-bold text-foreground capitalize">{user?.accountType || "Free"} User</span>
            {isUpgraded ? (
              <Badge className="bg-yellow-500/90 text-black border-none text-[10px] font-bold shadow-sm">
                Plus Plan
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px]">
                Free Plan
              </Badge>
            )}
          </div>
          <div className="shrink-0">
            <Button variant="link" onClick={() => router.push("/web/pricing")} className="text-xs text-primary font-semibold h-auto p-0">
              Upgrade
            </Button>
          </div>
        </div>

        {/* ROW 7: Skills */}
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0 md:pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" /> Skills
            </span>
          </div>

          {activeEditRow === "skills" ? (
            <div className="flex-1 flex flex-col gap-3">
              {/* Tag interface inline */}
              <div className="flex flex-wrap gap-1.5 min-h-[50px] max-w-xl p-2.5 border rounded-lg bg-background">
                {editSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border-none text-xs font-bold text-black shadow-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {editSkills.length === 0 && (
                  <span className="text-xs text-muted-foreground/60 italic p-1">No skills added.</span>
                )}
              </div>
              <div className="flex gap-2 max-w-md">
                <Input 
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter"
                  className="bg-background"
                />
                <Button type="button" onClick={handleAddSkill} variant="secondary" className="h-9">
                  Add
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSkills} disabled={isSaving} className="h-8 text-xs">
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />} Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveEditRow(null)} disabled={isSaving} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1">
                  {user?.skills && user.skills.length > 0 ? (
                    user.skills.map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 rounded bg-white text-xs font-bold text-black border-none shadow-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground/60 italic text-xs">No skills set</span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <Button variant="link" onClick={() => setActiveEditRow("skills")} className="text-xs text-primary font-semibold h-auto p-0">
                  Edit
                </Button>
              </div>
            </>
          )}
        </div>

        {/* ROW 8: Social Links */}
        <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors hover:bg-muted/5">
          <div className="w-full md:w-1/4 shrink-0 md:pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Social Links
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-1.5">
              {user?.socialLinks && user.socialLinks.filter(Boolean).length > 0 ? (
                user.socialLinks.filter(Boolean).map((link: string, idx: number) => (
                  <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-mono truncate hover:underline block max-w-md">
                    {link}
                  </a>
                ))
              ) : (
                <span className="text-muted-foreground/60 italic text-xs">No social links set</span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <Button variant="link" onClick={() => setShowSocialLinksDialog(true)} className="text-xs text-primary font-semibold h-auto p-0">
              Edit
            </Button>
          </div>
        </div>



      </div>
      <SocialLinksDialog
        open={showSocialLinksDialog}
        onOpenChange={setShowSocialLinksDialog}
        currentLinks={user?.socialLinks}
      />
    </div>
  );
}
