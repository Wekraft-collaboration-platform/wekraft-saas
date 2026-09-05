import { Code2, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
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
import { 
  SiPython, SiNextdotjs, SiReact, SiTypescript, SiJavascript, SiNodedotjs, 
  SiTailwindcss, SiCss, SiHtml5, SiGit, SiGithub, SiDocker, SiFigma, 
  SiSass, SiGo, SiRust, SiCplusplus, SiPhp, SiRuby, 
  SiPostgresql, SiMongodb, SiMysql, SiFirebase, SiFlutter, 
  SiAngular, SiVuedotjs, SiRedux, SiGraphql, SiPrisma, SiSupabase, 
  SiKotlin, SiSwift, SiDjango, SiFlask, SiGooglecloud, SiKubernetes, 
  SiLinux, SiLaravel, SiNestjs, SiVite, SiWebpack, SiBabel, SiEslint, 
  SiPrettier, SiFramer, SiPnpm, SiNpm, SiYarn, SiPostman
} from "react-icons/si";
import { FaJava, FaAws, FaCode } from "react-icons/fa";

interface ProfileSkillsProps {
  skills?: string[];
}

interface SkillInfo {
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

function getSkillInfo(skillName: string): SkillInfo | null {
  const name = skillName.toLowerCase().trim().replace(/[\.\s-]/g, "");
  
  const iconMap: Record<string, { Icon: React.ComponentType<{ className?: string }>, color: string }> = {
    python: { Icon: SiPython, color: "#3776AB" },
    nextjs: { Icon: SiNextdotjs, color: "#000000" },
    next: { Icon: SiNextdotjs, color: "#000000" },
    react: { Icon: SiReact, color: "#61DAFB" },
    reactjs: { Icon: SiReact, color: "#61DAFB" },
    typescript: { Icon: SiTypescript, color: "#3178C6" },
    ts: { Icon: SiTypescript, color: "#3178C6" },
    javascript: { Icon: SiJavascript, color: "#F7DF1E" },
    js: { Icon: SiJavascript, color: "#F7DF1E" },
    nodejs: { Icon: SiNodedotjs, color: "#339933" },
    node: { Icon: SiNodedotjs, color: "#339933" },
    tailwind: { Icon: SiTailwindcss, color: "#06B6D4" },
    tailwindcss: { Icon: SiTailwindcss, color: "#06B6D4" },
    css: { Icon: SiCss, color: "#1572B6" },
    css3: { Icon: SiCss, color: "#1572B6" },
    html: { Icon: SiHtml5, color: "#E34F26" },
    html5: { Icon: SiHtml5, color: "#E34F26" },
    git: { Icon: SiGit, color: "#F05032" },
    github: { Icon: SiGithub, color: "#181717" }, // dark gray for github
    docker: { Icon: SiDocker, color: "#2496ED" },
    figma: { Icon: SiFigma, color: "#F24E1E" },
    sass: { Icon: SiSass, color: "#CC6699" },
    scss: { Icon: SiSass, color: "#CC6699" },
    go: { Icon: SiGo, color: "#00ADD8" },
    golang: { Icon: SiGo, color: "#00ADD8" },
    rust: { Icon: SiRust, color: "#A72126" },
    java: { Icon: FaJava, color: "#007396" },
    cpp: { Icon: SiCplusplus, color: "#00599C" },
    cplusplus: { Icon: SiCplusplus, color: "#00599C" },
    csharp: { Icon: FaCode, color: "#239120" },
    c: { Icon: FaCode, color: "#239120" },
    php: { Icon: SiPhp, color: "#777BB4" },
    ruby: { Icon: SiRuby, color: "#CC342D" },
    postgresql: { Icon: SiPostgresql, color: "#4169E1" },
    postgres: { Icon: SiPostgresql, color: "#4169E1" },
    mongodb: { Icon: SiMongodb, color: "#47A248" },
    mongo: { Icon: SiMongodb, color: "#47A248" },
    mysql: { Icon: SiMysql, color: "#4479A1" },
    firebase: { Icon: SiFirebase, color: "#FFCA28" },
    aws: { Icon: FaAws, color: "#FF9900" },
    amazonaws: { Icon: FaAws, color: "#FF9900" },
    flutter: { Icon: SiFlutter, color: "#02569B" },
    angular: { Icon: SiAngular, color: "#DD0031" },
    vue: { Icon: SiVuedotjs, color: "#4FC08D" },
    vuejs: { Icon: SiVuedotjs, color: "#4FC08D" },
    redux: { Icon: SiRedux, color: "#764ABC" },
    graphql: { Icon: SiGraphql, color: "#E10098" },
    prisma: { Icon: SiPrisma, color: "#2D3748" },
    supabase: { Icon: SiSupabase, color: "#3ECF8E" },
    kotlin: { Icon: SiKotlin, color: "#7F52FF" },
    swift: { Icon: SiSwift, color: "#F05138" },
    django: { Icon: SiDjango, color: "#092E20" },
    flask: { Icon: SiFlask, color: "#000000" },
    gcp: { Icon: SiGooglecloud, color: "#4285F4" },
    googlecloud: { Icon: SiGooglecloud, color: "#4285F4" },
    kubernetes: { Icon: SiKubernetes, color: "#326CE5" },
    k8s: { Icon: SiKubernetes, color: "#326CE5" },
    linux: { Icon: SiLinux, color: "#FCC624" },
    laravel: { Icon: SiLaravel, color: "#FF2D20" },
    nestjs: { Icon: SiNestjs, color: "#E0234E" },
    vite: { Icon: SiVite, color: "#646CFF" },
    webpack: { Icon: SiWebpack, color: "#8DD6F9" },
    babel: { Icon: SiBabel, color: "#F9DC3E" },
    eslint: { Icon: SiEslint, color: "#4B32C3" },
    prettier: { Icon: SiPrettier, color: "#F7B93E" },
    framer: { Icon: SiFramer, color: "#0055FF" },
    framermotion: { Icon: SiFramer, color: "#0055FF" },
    pnpm: { Icon: SiPnpm, color: "#F69220" },
    npm: { Icon: SiNpm, color: "#CB3837" },
    yarn: { Icon: SiYarn, color: "#2C8EBB" },
    postman: { Icon: SiPostman, color: "#FF6C37" },
  };

  return iconMap[name] || null;
}

const PREDEFINED_SKILLS = [
  "Python", "Next.js", "React", "TypeScript", "JavaScript", "Node.js", 
  "Tailwind CSS", "HTML5", "CSS3", "Git", "GitHub", "Docker", "Figma", 
  "Sass", "Go", "Rust", "Java", "C++", "C#", "PHP", "Ruby", 
  "PostgreSQL", "MongoDB", "MySQL", "Firebase", "AWS", "Flutter", 
  "Angular", "Vue.js", "Redux", "GraphQL", "Prisma", "Supabase", 
  "Kotlin", "Swift", "Django", "Flask", "Google Cloud", "Kubernetes", 
  "Linux", "Laravel", "NestJS", "Vite", "Webpack", "Babel", "ESLint", 
  "Prettier", "Framer Motion", "pnpm", "npm", "Yarn", "Postman"
];

export const ProfileSkills = ({ skills }: ProfileSkillsProps) => {
  const hasSkills = skills && skills.length > 0;
  const [isAdding, setIsAdding] = useState(false);
  const [tempSkills, setTempSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSkills = PREDEFINED_SKILLS.filter((skill) => {
    const normalizedSkill = skill.toLowerCase().replace(/[\.\s-]/g, "");
    return (
      skill.toLowerCase().includes(newSkill.toLowerCase()) &&
      !tempSkills.some((s) => s.toLowerCase().replace(/[\.\s-]/g, "") === normalizedSkill)
    );
  });

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
    
    const normalizedNew = trimmed.toLowerCase().replace(/[\.\s-]/g, "");
    const alreadyExists = tempSkills.some((s) => 
      s.toLowerCase().replace(/[\.\s-]/g, "") === normalizedNew
    );
    
    if (alreadyExists) {
      toast.error("Skill already added in the list");
      return;
    }
    setTempSkills([...tempSkills, trimmed]);
    setNewSkill("");
    inputRef.current?.blur();
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
        <h3 className="text-sm font-medium text-foreground/55">Skills</h3>
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
                  {tempSkills.map((skill) => {
                    const info = getSkillInfo(skill);
                    return (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-xs font-bold text-black shadow-sm"
                      >
                        {info && <info.Icon className="h-3.5 w-3.5 shrink-0" style={{ color: info.color }} />}
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-zinc-500 hover:text-destructive transition-colors cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
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
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      id="new-skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Type or select a skill"
                      className="w-full bg-background border-border/45 text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      autoComplete="off"
                    />
                    
                    {/* Custom Dropdown */}
                    {isFocused && filteredSkills.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 max-h-[160px] overflow-y-auto rounded-md border border-border/40 bg-zinc-950 p-1 shadow-2xl z-50 divide-y divide-zinc-900/50">
                        {filteredSkills.map((skill) => {
                          const info = getSkillInfo(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault(); // prevents blur before click
                                if (!tempSkills.includes(skill)) {
                                  setTempSkills([...tempSkills, skill]);
                                }
                                setNewSkill("");
                                setIsFocused(false);
                                inputRef.current?.blur();
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-zinc-900 rounded-sm flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              {info && <info.Icon className="h-3.5 w-3.5" style={{ color: info.color }} />}
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
        <div className="flex flex-wrap gap-2">
          {skills!.map((skill) => {
            const info = getSkillInfo(skill);
            return (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-xs font-bold text-black border-none shadow-sm"
              >
                {info && <info.Icon className="h-3.5 w-3.5 shrink-0" style={{ color: info.color }} />}
                {skill}
              </span>
            );
          })}
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
