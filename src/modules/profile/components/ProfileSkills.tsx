import { Code2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSkillsProps {
  skills?: string[];
}

const SKILL_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
];

export const ProfileSkills = ({ skills }: ProfileSkillsProps) => {
  const hasSkills = skills && skills.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground/50">Skills</h3>
        <Code2 className="h-4 w-4 text-foreground/40" />
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
          <Button variant="outline" size="sm" className="gap-1 text-[11px] h-6 border-dashed px-3">
            <Plus className="h-3 w-3" />
            Add Skills
          </Button>
        </div>
      )}
    </div>
  );
};
