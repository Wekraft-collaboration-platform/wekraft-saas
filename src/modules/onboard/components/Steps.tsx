"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  FolderGit,
  Loader2,
  Copy,
  Rocket,
  Sun,
  Moon,
  Monitor,
  Folder,
  Shield,
  Lightbulb,
  Search,
  Code2,
  Globe,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { STEPS, PURPOSES } from "./StaticContent";
import { PROJECT_STATUS, INVITE_LINK, ROLES } from "@/lib/static-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { IdentityRolePicker } from "./IdentityRolePicker";
import { useClerk, useUser } from "@clerk/nextjs";

const stepVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? 12 : -12,
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? 12 : -12,
    opacity: 0,
  }),
};

const STATUS_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  ideation: { icon: Lightbulb, label: "Ideation" },
  validation: { icon: Search, label: "Validation" },
  development: { icon: Code2, label: "Development" },
  beta: { icon: Rocket, label: "Beta" },
  production: { icon: Globe, label: "Production" },
  scaling: { icon: TrendingUp, label: "Scaling" },
};

export function MultiStepOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Authentication Context
  const { signOut } = useClerk();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();

  // Mutations
  const updatePurposes = useMutation(api.user.updateUserPrimaryUsage);
  const updateIdentity = useMutation(api.user.updateUserIdentity);
  const initProject = useMutation(api.project.projectInitOnboarding);
  const completeOnboarding = useMutation(api.user.completeOnboarding);

  // Form State
  const [purposes, setPurposes] = useState<string[]>([]);

  // Step 2
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Step 3
  const [projectName, setProjectName] = useState("");
  const isPublic = true; // default always true.
  const [projectStatus, setProjectStatus] = useState("");
  const [generatedInviteLink, setGeneratedInviteLink] = useState("");

  // step 4
  const { theme, setTheme } = useTheme();

  const handleNext = async () => {
    try {
      setIsLoading(true);

      if (currentStep === 1) {
        if (purposes.length > 0) {
          await updatePurposes({ purposes });
        }
      }

      if (currentStep === 2) {
        if (usernameError) {
          toast.error(usernameError);
          setIsLoading(false);
          return;
        }

        if (!username || !selectedRole) {
          toast.error("Please provide a username and select a role");
          setIsLoading(false);
          return;
        }

        try {
          await updateIdentity({ name: username, occupation: selectedRole });
          toast.success("Identity updated successfully");
        } catch (error: any) {
          toast.error(error.message || "Username is already taken");
          setIsLoading(false);
          return;
        }
      }

      if (currentStep === 3) {
        if (!projectName || !projectStatus) {
          toast.error("Please provide project name and status");
          setIsLoading(false);
          return;
        }
        try {
          const inviteCode = nanoid(32);
          await initProject({
            projectName,
            isPublic,
            projectStatus,
            inviteLink: inviteCode,
          });
          setGeneratedInviteLink(inviteCode);
        } catch (error: any) {
          toast.error(error.message || "Try with another name");
          setIsLoading(false);
          return;
        }
      }

      if (currentStep === 5) {
        await completeOnboarding();
        toast.success("Welcome to WeKraft!");
        router.push("/dashboard");
        return;
      }

      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } catch (error: any) {
      console.error(error);
      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("authentication")
      ) {
        toast.error("Session expired. Please sign in again.");
      } else {
        toast.error("An error occurred while saving. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    setDirection(1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const togglePurpose = (id: string) => {
    setPurposes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const isSkip = currentStep === 1;

  // Render mock preview components on the right-hand column
  const renderRightSidePreview = (step: number) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <FolderGit className="w-3.5 h-3.5 text-[#5e6ad2]" />
                <span className="text-xs font-semibold text-zinc-200">Active Workspaces</span>
              </div>
              <span className="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
                4 total
              </span>
            </div>
            <div className="space-y-2">
              {[
                { name: "WeKraft Collaboration", desc: "Main project for team workspace", status: "Active", color: "text-[#5e6ad2] bg-[#5e6ad2]/10" },
                { name: "Marketing Campaign", desc: "Launch timeline and website feedback", status: "Planning", color: "text-blue-400 bg-blue-400/10" },
                { name: "Design System 2.0", desc: "Figma token sync and component library", status: "Backlog", color: "text-zinc-500 bg-zinc-900" },
              ].map((p, i) => (
                <div key={i} className="p-3 bg-zinc-900/30 border border-zinc-900/40 rounded-lg flex items-center justify-between">
                  <div>
                    <h5 className="text-[11px] font-semibold text-zinc-300">{p.name}</h5>
                    <p className="text-[9.5px] text-zinc-500 mt-0.5">{p.desc}</p>
                  </div>
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium", p.color)}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-semibold text-zinc-200">Profile Preview</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-900/30 border border-zinc-900/40 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#5e6ad2] to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-[#5e6ad2]/15">
                {(username || clerkUser?.username || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">@{username || "username"}</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">{selectedRole || "Select Occupation"}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
                    wekraft.co/u/{username || "username"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-6 w-full bg-zinc-900/20 rounded border border-zinc-900/40 flex items-center px-3 justify-between">
                <span className="text-[9px] text-zinc-500">Security</span>
                <Shield className="w-3 h-3 text-zinc-600" />
              </div>
              <div className="h-6 w-full bg-zinc-900/20 rounded border border-zinc-900/40 flex items-center px-3 justify-between">
                <span className="text-[9px] text-zinc-500">API Access</span>
                <span className="text-[8px] bg-zinc-900 text-zinc-500 px-1.5 rounded">Disabled</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-200 truncate max-w-40">
                  {projectName || "Acme SaaS"}
                </span>
                {projectStatus && (
                  <span className="text-[8.5px] bg-[#5e6ad2]/10 text-[#5e6ad2] px-1.5 py-0.5 rounded capitalize font-medium">
                    {projectStatus}
                  </span>
                )}
              </div>
              <span className="text-[9.5px] text-zinc-500">Board View</span>
            </div>

            <div className="grid grid-cols-3 gap-2 h-44">
              {[
                {
                  title: "To Do",
                  tasks: ["Design Landing Page", "Write API Docs"],
                },
                {
                  title: "In Progress",
                  tasks: ["Auth Flow setup"],
                },
                {
                  title: "Done",
                  tasks: ["Init React App"],
                },
              ].map((col, idx) => (
                <div key={idx} className="bg-zinc-950/40 border border-zinc-900/50 rounded-lg p-2 flex flex-col justify-start">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">{col.title}</span>
                  <div className="space-y-1.5 flex-1 overflow-hidden">
                    {col.tasks.map((task, tidx) => (
                      <div key={tidx} className="p-1.5 bg-zinc-900/40 border border-zinc-900/60 rounded text-[8px] text-zinc-300 font-medium truncate">
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-semibold text-zinc-200">Theme Engine</span>
              <span className="text-[9.5px] text-[#5e6ad2] capitalize">{theme} theme active</span>
            </div>

            <div className={cn(
              "p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
              theme === "light"
                ? "bg-white border-zinc-200 text-zinc-800"
                : "bg-zinc-950 border-zinc-900 text-zinc-400"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2.5 h-2.5 rounded-full", theme === "light" ? "bg-zinc-200" : "bg-zinc-900")} />
                  <div className={cn("h-3 w-16 rounded", theme === "light" ? "bg-zinc-200" : "bg-zinc-900")} />
                </div>
                <div className={cn("h-4 w-4 rounded-full", theme === "light" ? "bg-zinc-200" : "bg-zinc-900")} />
              </div>

              <div className="space-y-2">
                <div className={cn("h-8 rounded p-2 flex items-center justify-between", theme === "light" ? "bg-zinc-50 border border-zinc-200" : "bg-zinc-900/30 border border-zinc-900")}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded", theme === "light" ? "bg-zinc-200" : "bg-zinc-850")} />
                    <div className={cn("h-2.5 w-24 rounded", theme === "light" ? "bg-zinc-300" : "bg-zinc-700")} />
                  </div>
                  <div className={cn("h-2 w-6 rounded", theme === "light" ? "bg-zinc-300" : "bg-zinc-700")} />
                </div>

                <div className={cn("h-8 rounded p-2 flex items-center justify-between", theme === "light" ? "bg-zinc-50 border border-zinc-200" : "bg-zinc-900/30 border border-zinc-900")}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded", theme === "light" ? "bg-zinc-200" : "bg-zinc-850")} />
                    <div className={cn("h-2.5 w-16 rounded", theme === "light" ? "bg-zinc-300" : "bg-zinc-700")} />
                  </div>
                  <div className={cn("h-2 w-8 rounded", theme === "light" ? "bg-zinc-300" : "bg-zinc-700")} />
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-xs font-semibold text-zinc-200">Workspace Team</span>
              <span className="text-[10px] text-zinc-500 font-mono">Invite Link Enabled</span>
            </div>

            <div className="space-y-2">
              {[
                { name: (clerkUser?.fullName || clerkUser?.username || "Mariana Wilson") + " (You)", role: "Workspace Admin", status: "Active Now", color: "bg-emerald-400" },
                { name: "Alex Rivera", role: "Software Developer", status: "Invited", color: "bg-zinc-700" },
                { name: "Sarah Chen", role: "Product Designer", status: "Invited", color: "bg-zinc-700" },
              ].map((member, i) => (
                <div key={i} className="p-3 bg-zinc-900/30 border border-zinc-900/40 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-400 border border-zinc-700">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-[10px] font-semibold text-zinc-300">{member.name}</h5>
                      <p className="text-[8.5px] text-zinc-500 mt-0.5">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", member.color)} />
                    <span className="text-[9px] text-zinc-500 font-medium">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-row overflow-hidden font-sans relative">
      <div className="noise-bg" />

      {/* Left Column (40% width on Desktop, full width on Mobile) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-between p-6 min-h-screen relative z-10 border-r border-zinc-900 bg-black">
        {/* Header */}
        <header className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 select-none">
            <Image src="/logo.svg" alt="WeKraft Logo" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-lg tracking-tight text-white font-pop">WeKraft</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-200">
            {isUserLoaded && clerkUser?.primaryEmailAddress?.emailAddress && (
              <span className="hidden sm:inline">
                Logged in as <span className="text-zinc-400 font-medium">{clerkUser.primaryEmailAddress.emailAddress}</span>
              </span>
            )}

          </div>
        </header>

        {/* Center content containing active step */}
        <main className="flex-1 flex flex-col justify-center py-10 w-full max-w-sm mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col"
            >
              {/* Step Header */}
              <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {currentStep === 1 && "What brings you to WeKraft"}
                  {currentStep === 2 && "Let’s set up your identity"}
                  {currentStep === 3 && "Create your first project"}
                  {currentStep === 4 && "Personalize your space"}
                  {currentStep === 5 && "Share invite link"}
                </h2>
                <p className="text-xs text-zinc-300 mt-1">
                  {currentStep === 1 && "Pick one or more options to help us customize your workspace."}
                  {currentStep === 2 && "Choose a unique username and select your role to build with others."}
                  {currentStep === 3 && "Create your project workspace to start syncing and collaborating."}
                  {currentStep === 4 && "Choose a theme preference that best fits your working style."}
                  {currentStep === 5 && "Invite your friends or teammates to start working together."}
                </p>
              </div>

              {/* Step Content */}
              <div className="flex-1 min-h-[250px] flex flex-col justify-center">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="space-y-2.5">
                    {PURPOSES.map((p) => {
                      const selected = purposes.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePurpose(p.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none",
                            selected
                              ? "bg-zinc-900 border-white/10"
                              : "bg-zinc-950/20 border-border hover:border-white/30 hover:bg-zinc-900/10"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                              selected ? "bg-blue-800 text-white" : "bg-zinc-900 text-zinc-400"
                            )}>
                              <p.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-zinc-100">{p.label}</h4>
                              <p className="text-[10px] text-zinc-300 mt-0.5">{p.description}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                            selected ? "border-[#5e6ad2] bg-blue-600" : "border-zinc-850 bg-transparent"
                          )}>
                            {selected && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <IdentityRolePicker
                    username={username}
                    onUsernameChange={setUsername}
                    roles={ROLES}
                    selectedRole={selectedRole}
                    onRoleSelect={setSelectedRole}
                    onValidationError={setUsernameError}
                  />
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5 font-sans">
                      <Label htmlFor="projectName" className="text-xs text-zinc-300 font-medium">
                        Project Name
                      </Label>
                      <Input
                        id="projectName"
                        placeholder="e.g. Acme SaaS"
                        className="bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-500 rounded-lg h-9 text-xs transition-all focus-visible:ring-1 focus-visible:ring-[#5e6ad2]!"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5  font-sans">
                      <Label className="text-xs text-zinc-300 font-medium block">
                        Project Status <span className="text-zinc-400 font-normal ml-1">(community indicators)</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        {PROJECT_STATUS.map((status) => {
                          const isSelected = projectStatus === status;
                          const config = STATUS_CONFIG[status] || {
                            icon: FolderGit,
                            label: status,
                          };

                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setProjectStatus(status)}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer h-16 select-none",
                                isSelected
                                  ? "bg-zinc-900/60 border-blue-500/30 text-white shadow-[0_0_12px_rgba(94,106,210,0.08)]"
                                  : "bg-zinc-9050 border-zinc-800 text-zinc-400 hover:border-zinc-800/80 hover:text-zinc-200"
                              )}
                            >
                              <config.icon
                                className={cn(
                                  "w-4 h-4 mb-2 transition-colors",
                                  isSelected ? "text-blue-500" : "text-zinc-500"
                                )}
                              />
                              <span className="text-[10px] font-semibold capitalize">{config.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "light", label: "Light", icon: Sun, desc: "Clean & Minimal" },
                      { id: "dark", label: "Dark", icon: Moon, desc: "Sleek & Focused" },
                      { id: "system", label: "System", icon: Monitor, desc: "Auto Sync" },
                    ].map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer select-none",
                            isSelected
                              ? "bg-zinc-900/60 border-[#5e6ad2]/70 text-white shadow-[0_0_12px_rgba(94,106,210,0.08)]"
                              : "bg-zinc-950/20 border-zinc-900 text-zinc-400 hover:border-zinc-800/80 hover:text-zinc-200"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center mb-2.5 transition-colors",
                            isSelected ? "bg-[#5e6ad2]/15 text-[#5e6ad2]" : "bg-zinc-900 text-zinc-500"
                          )}>
                            <t.icon className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold">{t.label}</span>
                          <span className="text-[9px] text-zinc-500 mt-1 leading-tight">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* STEP 5 */}
                {currentStep === 5 && (
                  <div className="space-y-4 font-sans">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-zinc-400 font-medium">Project Invite Link</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`${INVITE_LINK}${generatedInviteLink}`}
                          className="flex-1 bg-zinc-900/50 border border-zinc-800 text-white rounded-lg h-9 text-xs px-3 focus-visible:ring-1 focus-visible:ring-[#5e6ad2]!"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg h-9 text-xs px-3 flex items-center gap-1.5 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(`${INVITE_LINK}${generatedInviteLink}`);
                            toast.success("Link copied to clipboard!");
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 my-6">
                      <div className="h-[1px] flex-1 bg-zinc-900" />
                      <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Share via</span>
                      <div className="h-[1px] flex-1 bg-zinc-900" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className="h-14 flex flex-col items-center justify-center gap-1.5 bg-zinc-950/20 border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/10 transition-all rounded-xl group cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(`${INVITE_LINK}/invite/${generatedInviteLink}`);
                          toast.success("Link copied for WhatsApp!");
                        }}
                      >
                        <Image
                          src="/whatsapp.png"
                          alt="WhatsApp"
                          width={18}
                          height={18}
                          className="opacity-50 group-hover:opacity-100 transition-opacity"
                        />
                        <span className="text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                          WhatsApp
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-14 flex flex-col items-center justify-center gap-1.5 bg-zinc-950/20 border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/10 transition-all rounded-xl group cursor-pointer"
                        onClick={() => window.open("https://discord.com", "_blank")}
                      >
                        <Image
                          src="/discord.png"
                          alt="Discord"
                          width={18}
                          height={18}
                          className="opacity-50 group-hover:opacity-100 transition-opacity"
                        />
                        <span className="text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                          Discord
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-14 flex flex-col items-center justify-center gap-1.5 bg-zinc-950/20 border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/10 transition-all rounded-xl group cursor-pointer"
                        onClick={() => window.open("https://slack.com", "_blank")}
                      >
                        <Image
                          src="/slack.png"
                          alt="Slack"
                          width={18}
                          height={18}
                          className="opacity-50 group-hover:opacity-100 transition-opacity"
                        />
                        <span className="text-[9px] font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                          Slack
                        </span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Action Buttons */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-zinc-900">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  {isSkip && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={isLoading}
                      className="text-xs font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer"
                    >
                      Skip
                    </button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-5 h-8 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 border-none"
                  >
                    {isLoading ? (
                      <>   Saving  <Loader2 className="w-3 h-3 animate-spin" /> </>
                    ) : currentStep === 5 ? (
                      <>
                        Get Started
                        <Rocket className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Progress Stepper at Bottom */}
        <footer className="w-full flex justify-center py-2 select-none">
          <div className="flex items-center gap-1.5">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    isActive ? "w-5 bg-zinc-200" : "w-1 bg-zinc-800"
                  )}
                />
              );
            })}
          </div>
        </footer>
      </div>

      {/* Right Column (60% width on Desktop, hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[60%] bg-[#080710] relative items-center justify-center p-12 overflow-hidden select-none">
        {/* Ambient gradient backglows */}
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#5e6ad2]/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Browser Mockup Box */}
        <div className="w-[90%] max-w-[620px] aspect-[16/10] bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
          {/* Minimalist Tab Bar */}
          <div className="h-9 border-b border-zinc-900/60 bg-zinc-950 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
            </div>
            <div className="text-[10px] text-zinc-600 font-mono tracking-tight bg-zinc-950 border border-zinc-900/80 rounded-md px-3 py-0.5 w-48 text-center truncate">
              wekraft.co/workspace
            </div>
            <div className="w-10" />
          </div>

          {/* Browser Workspace Content */}
          <div className="relative p-6 flex-1 overflow-hidden bg-zinc-950 font-sans text-left text-zinc-400">
            {/* Glow accent */}
            <div className="absolute -top-1/4 -right-1/4 w-60 h-60 bg-[#5e6ad2]/5 blur-[60px] rounded-full pointer-events-none" />

            {/* Hover-Blur preview frame */}
            <div className=" h-full w-full  flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full"
                >
                  {renderRightSidePreview(currentStep)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
