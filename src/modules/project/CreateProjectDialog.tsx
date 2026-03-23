"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { 
  Rocket, 
  Github, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Lock,
  ChevronRight,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { useRepositories } from "../repo";
import { Repository } from "@/types/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Id } from "../../../convex/_generated/dataModel";
import { createWebhook } from "../github/actions/action";

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateProjectDialog = ({ 
  trigger, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen 
}: CreateProjectDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<Id<"projects"> | null>(null);
  
  // Form State
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ideation");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  // Pagination for repos
  const [repoPage, setRepoPage] = useState(1);
  const REPOS_PER_PAGE = 5;

  // Convex
  const usage = useQuery(api.project.getProjectUsage);
  const createProject = useMutation(api.project.projectInit);
  const connectRepo = useMutation(api.repo.connectRepository);
  
  const { data: repositories, isLoading: reposLoading } = useRepositories(repoPage, REPOS_PER_PAGE);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsLoading(true);
    const inviteLink = nanoid(32);

    try {
      const projectId = await createProject({
        projectName,
        description,
        isPublic,
        projectStatus: status,
        inviteLink,
      });

      if (projectId) {
        setCreatedProjectId(projectId as Id<"projects">);
        toast.success("Project created! Now let's connect a repository.");
        setStep(2);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectRepo = async () => {
    if (!selectedRepo || !createdProjectId) return;

    setIsLoading(true);
    toast.loading("Connecting repository...", {
      description: "Kindly wait for the proper syncing...",
      id: "toast-connect-repo",
    });

    try {
      // Step 1: Create Webhook
      await createWebhook(selectedRepo.owner.login, selectedRepo.name);

      // Step 2: Update Convex
      await connectRepo({
        projectId: createdProjectId,
        githubId: BigInt(selectedRepo.id),
        repoName: selectedRepo.name,
        repoOwner: selectedRepo.owner.login,
        repoFullName: selectedRepo.full_name,
        repoType: selectedRepo.owner.type,
        repoUrl: selectedRepo.html_url,
      });

      toast.success(`Linked: ${selectedRepo.full_name} → ${projectName}`, {
        id: "toast-connect-repo",
      });
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to connect repository", {
        id: "toast-connect-repo",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setProjectName("");
    setDescription("");
    setStatus("ideation");
    setIsPublic(true);
    setSelectedRepo(null);
    setCreatedProjectId(null);
  };

  if (usage?.canCreate === false && step === 1) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="w-full max-w-[600px] overflow-hidden">
           <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="size-8 text-amber-500" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-xl">Project Limit Reached</DialogTitle>
                <DialogDescription className="text-sm pt-2">
                  You've reached your limit of <strong>{usage.limit} projects</strong> on the <strong>{usage.accountType}</strong> plan.
                  Upgrade now to keep building more amazing things!
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 w-full pt-4">
                 <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Later</Button>
                 <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Upgrade Now</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetForm();
    }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="w-full max-w-xl p-0 overflow-hidden border-accent/20 bg-[#0A0A0B]">
        
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 text-primary font-medium mb-1">
              {step === 1 ? <Rocket className="size-4" /> : <Github className="size-4" /> }
              <span className="text-xs uppercase tracking-wider font-bold">Step {step} of 2</span>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Start New Project" : "Connect Repository"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {step === 1 
                ? "Define your vision and set the stage for collaboration." 
                : "Link your codebase to automatically sync progress and insights."
              }
            </DialogDescription>
          </DialogHeader>

          {step === 1 ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. My Awesome Startup"
                  className="bg-accent/30 border-accent/10 focus:border-primary/50 transition-all font-inter"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="text-sm font-semibold">Description (Optional)</Label>
                <Textarea
                  id="desc"
                  placeholder="Tell us what you're building..."
                  className="bg-accent/30 border-accent/10 focus:border-primary/50 transition-all min-h-[100px] resize-none font-inter"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Project Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-accent/30 border-accent/10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121214] border-accent/10">
                      <SelectItem value="ideation">Ideation</SelectItem>
                      <SelectItem value="validation">Validation</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Visibility</Label>
                  <RadioGroup 
                    value={isPublic ? "public" : "private"} 
                    onValueChange={(val) => setIsPublic(val === "public")}
                    className="flex h-10 items-center gap-4 bg-accent/30 rounded-md px-3 border border-accent/10"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" className="size-4 border-primary" />
                      <Label htmlFor="public" className="text-xs flex items-center gap-1 cursor-pointer">
                        <Globe className="size-3 text-emerald-500" /> Public
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" className="size-4 border-primary" />
                      <Label htmlFor="private" className="text-xs flex items-center gap-1 cursor-pointer">
                        <Lock className="size-3 text-amber-500" /> Private
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative">
                 <ScrollArea className="h-[280px] pr-4">
                    {reposLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-14 rounded-lg bg-accent/20 animate-pulse" />
                        ))}
                      </div>
                    ) : repositories?.length === 0 ? (
                       <div className="flex flex-col items-center justify-center p-8 text-center bg-accent/10 rounded-xl border border-dashed border-accent/20">
                          <Github className="size-8 text-muted-foreground/30 mb-2" />
                          <p className="text-xs text-muted-foreground">No repositories found.</p>
                       </div>
                    ) : (
                      <div className="space-y-2">
                        {repositories?.map((repo) => (
                           <div 
                             key={repo.id}
                             onClick={() => !isLoading && setSelectedRepo(repo)}
                             className={cn(
                               "p-2.5 rounded-lg border transition-all cursor-pointer group flex items-center justify-between",
                               selectedRepo?.id === repo.id 
                                ? "bg-primary/10 border-primary/40" 
                                : "bg-accent/20 border-accent/10 hover:border-primary/20 hover:bg-accent/30",
                                isLoading && "opacity-50 cursor-not-allowed"
                             )}
                           >
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={repo.owner.avatar_url} className="size-8 rounded border border-accent/10" alt="" />
                                <div className="min-w-0">
                                   <p className="text-sm font-semibold truncate">{repo.name}</p>
                                   <p className="text-[9px] text-muted-foreground uppercase">{repo.owner.login}</p>
                                </div>
                              </div>
                              {selectedRepo?.id === repo.id && <CheckCircle2 className="size-4 text-primary shrink-0 transition-all animate-in zoom-in" />}
                           </div>
                        ))}
                      </div>
                    )}
                 </ScrollArea>
                 
                 <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                       <Button 
                         variant="outline" 
                         size="icon" 
                         className="size-7" 
                         disabled={repoPage === 1 || isLoading}
                         onClick={() => setRepoPage(prev => Math.max(1, prev - 1))}
                       >
                          <ChevronLeft className="size-3" />
                       </Button>
                       <span className="text-[10px] font-medium px-2">Page {repoPage}</span>
                       <Button 
                         variant="outline" 
                         size="icon" 
                         className="size-7"
                         disabled={!repositories || repositories.length < REPOS_PER_PAGE || isLoading}
                         onClick={() => setRepoPage(prev => prev + 1)}
                       >
                          <ChevronRight className="size-3" />
                       </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedRepo(null)}
                      disabled={isLoading}
                      className={cn("text-[10px] h-7 px-3", !selectedRepo && "hidden")}
                    >
                       Clear selection
                    </Button>
                 </div>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
                 <div className="size-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
                   <AlertCircle className="size-4 text-primary" />
                 </div>
                 <p className="text-[10px] text-muted-foreground leading-relaxed">
                   Syncing a repository will setup a <strong>GitHub Webhook</strong> for real-time insights.
                 </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/10 border-t border-accent/10 gap-3 sm:gap-0 mt-0">
          <div className="flex w-full justify-between items-center">
            {step === 1 ? (
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="text-xs h-8"
                disabled={isLoading}
              >
                Cancel
              </Button>
            ) : (
              <div className="text-[10px] text-primary font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Project Created Successfully
              </div>
            )}

            <div className="flex items-center gap-3">
              {step === 1 ? (
                <Button 
                  size='sm'
                  onClick={handleCreateProject}
                  className="min-w-[120px] text-xs h-8 shadow-sm"
                  disabled={isLoading || !projectName.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3 animate-spin mr-2" /> Creating...
                    </>
                  ) : (
                    <>
                      Create Project <ChevronRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="text-xs h-8"
                  >
                    Skip
                  </Button>
                  <Button 
                    onClick={handleConnectRepo}
                    size='sm'
                    disabled={isLoading || !selectedRepo}
                    className="text-xs min-w-[120px] h-8 shadow-lg shadow-primary/10"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-3 animate-spin mr-2" /> Linking...
                      </>
                    ) : (
                      <>
                        Connect Repo <ArrowRight className="size-4 ml-1" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
