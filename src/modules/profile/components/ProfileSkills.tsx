import { Code2, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSkillsProps {
  skills?: string[];
}

const SKILL_COLORS = [
  "bg-blue-500/10 text-foreground border-blue-500/20",
  "bg-violet-500/10 text-foreground border-violet-500/20",
  "bg-emerald-500/10 text-foreground border-emerald-500/20",
  "bg-orange-500/10 text-foreground border-orange-500/20",
  "bg-pink-500/10 text-foreground border-pink-500/20",
  "bg-sky-500/10 text-foreground border-sky-500/20",
  "bg-amber-500/10 text-foreground border-amber-500/20",
  "bg-teal-500/10 text-foreground border-teal-500/20",
];

export const ProfileSkills = ({ skills }: ProfileSkillsProps) => {
  const hasSkills = skills && skills.length > 0;
  const [isAdding, setIsAdding] = useState(false);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateSkills = useMutation(api.user.updateUserSkills);

  useEffect(() => {
    if (isAdding) {
      setTempSkills(skills || []);
      setNewSkill("");
    }
  }, [isAdding, skills]);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (tempSkills.includes(trimmed)) {
      toast.error("Skill already added in the list");
      return;
    }
    setTempSkills([...tempSkills, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setTempSkills(tempSkills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSkills({ skills: tempSkills });
      toast.success("Skills updated successfully!");
      setIsAdding(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update skills");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground/50">Skills</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-foreground/45 hover:text-foreground hover:bg-muted shrink-0 rounded-md"
              aria-label="Manage Skills"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] bg-card border border-border/40 text-foreground shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold tracking-tight">Manage Skills</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Add or remove skills from your public profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Skills
                </Label>
                <div className="flex flex-wrap gap-1.5 min-h-[60px] max-h-[140px] overflow-y-auto p-2.5 border border-border/40 rounded-lg bg-background/50">
                  {tempSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted border border-border/40 text-xs font-semibold text-foreground/90"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {tempSkills.length === 0 && (
                    <span className="text-xs text-muted-foreground/60 italic p-1">
                      No skills added yet. Type below to add one!
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-skill" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Add New Skill
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="new-skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="e.g. Next.js, Python, Figma"
                    className="flex-1 bg-background border-border/45 text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    variant="secondary"
                    className="h-9 text-xs px-4"
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border/30 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  disabled={isSaving}
                  className="h-9 text-xs px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs px-4 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {hasSkills ? (
        <div className="flex flex-wrap gap-1.5">
          {skills!.map((skill, i) => (
            <span
              key={skill}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide ${
                SKILL_COLORS[i % SKILL_COLORS.length]
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-3 rounded-lg border border-dashed border-border/60 bg-muted/10 text-center">
          <p className="text-[11px] text-muted-foreground/60">No skills added yet</p>
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="gap-1 text-[11px] h-6 border-dashed px-3 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add Skills
          </Button>
        </div>
      )}
    </div>
  );
};
