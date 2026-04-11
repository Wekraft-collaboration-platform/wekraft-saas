import React from "react";
import {
  Bug,
  BugPlay,
  CircleCheckBig,
  Ellipsis,
  Hourglass,
  Kanban,
  List,
  Loader,
  Minus,
  MoreHorizontal,
  ScanSearch,
  Table,
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export const AVAILABLE_TAGS = [
  "Productivity",
  "AI",
  "Healthcare",
  "Edutech",
  "Fintech",
  "Web3",
  "Agents",
  "SaaS",
  "E-commerce",
  "Social Media",
  "Developer Tools",
  "Open Source",
  "Machine Learning",
  "Data Science",
  "Blockchain",
  "Crypto",
  "DeFi",
  "NFT",
  "Metaverse",
  "Gaming",
  "AR/VR",
  "Mobile App",
  "Web App",
  "Desktop App",
  "CLI",
  "API",
  "Library",
  "Framework",
  "CMS",
  "CRM",
  "Automation",
  "Cybersecurity",
  "Database",
  "Cloud",
  "DevOps",
  "Testing",
  "Monitoring",
  "Analytics",
  "Marketing",
  "SEO",
  "Content",
  "Design",
  "UX/UI",
  "Education",
  "Research",
  "Environment",
  "Sustainability",
  "Non-profit",
  "Community",
];

export const ROLES = [
  "frontend developer",
  "backend developer",
  "fullstack developer",
  "devops engineer",
  "site reliability engineer",
  "cloud engineer",
  "cloud architect",
  "data scientist",
  "machine learning engineer",
  "AI engineer",
  "mobile developer (iOS)",
  "mobile developer (Android)",
  "cross-platform mobile developer",
  "flutter developer",
  "react native developer",
  "game developer",
  "unity developer",
  "unreal engine developer",
  "embedded systems engineer",
  "hardware engineer",
  "robotics engineer",
  "AR/VR developer",
  "computer vision engineer",
  "blockchain developer",
  "solidity developer",
  "web3 developer",
  "cybersecurity engineer",
  "network engineer",
  "systems administrator",
  "database administrator",
  "QA engineer",
  "test automation engineer",
  "site reliability engineer",
  "API developer",
  "kubernetes administrator",
  "salesforce developer",
  "IoT engineer",
  "MLOps engineer",
  "CRM developer",
  "generative AI engineer",
  "UX/UI designer",
  "enterprise architect",
  "software architect",
];

export const PROJECT_STATUS = [
  "ideation",
  "validation",
  "development",
  "beta",
  "production",
  "scaling",
];

export const TABS = [
  { id: "List", label: "List", icon: List },
  { id: "Table", label: "Table", icon: Table },
  { id: "Kanban", label: "Kanban", icon: Kanban },
];

export const statusIcons: Record<string, React.ReactNode> = {
  "not started": <Ellipsis className="w-3.5 h-3.5" />,
  inprogress: <Loader className="w-3.5 h-3.5 text-yellow-500" />,
  reviewing: <ScanSearch className="w-3.5 h-3.5 text-blue-500" />,
  testing: <BugPlay className="w-3.5 h-3.5 text-indigo-500" />,
  completed: <CircleCheckBig className="w-3.5 h-3.5 text-green-500" />,
};

export const KANBAN_COLUMN_ICONS: Record<string, React.ReactNode> = {
  "not started": <Ellipsis className="w-4 h-4 text-white" />,
  inprogress: <Loader className="w-4 h-4 text-white" />,
  reviewing: <ScanSearch className="w-4 h-4 text-white" />,
  testing: <BugPlay className="w-4 h-4 text-white" />,
  completed: <CircleCheckBig className="w-4 h-4 text-white" />,
};

export const statusColors: Record<string, string> = {
  "not started": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  inprogress: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  testing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export const priorityIcons: Record<string, React.ReactNode> = {
  none: <MoreHorizontal className="w-3.5 h-3.5" />,
  low: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[1.5px] h-3 bg-yellow-500 rounded-[1px]" />
      <div className="w-[1.5px] h-2 dark:bg-neutral-400 bg-accent rounded-[1px]" />
      <div className="w-[1.5px] h-1.5 dark:bg-neutral-400 bg-accent rounded-[1px]" />
      <div className="w-[1.5px] h-[4px] dark:bg-neutral-400 bg-accent rounded-[1px]" />
    </div>
  ),
  medium: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[1.5px] h-3 bg-green-500 rounded-[1px]" />
      <div className="w-[1.5px] h-2 bg-green-500 rounded-[1px]" />
      <div className="w-[1.5px] h-1.5  dark:bg-neutral-400 bg-accent  rounded-[1px]" />
      <div className="w-[1.5px] h-[4px] dark:bg-neutral-400 bg-accent rounded-[1px]" />
    </div>
  ),
  high: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[1.5px] h-3 bg-red-500 rounded-[1px]" />
      <div className="w-[1.5px] h-2.5 bg-red-500 rounded-[1px]" />
      <div className="w-[1.5px] h-2 bg-red-500 rounded-[1px]" />
      <div className="w-[1.5px] h-[4px] dark:bg-neutral-400 bg-accent rounded-[1px]" />
    </div>
  ),
};

export const priorityIcons2: Record<string, React.ReactNode> = {
  none: <Minus className="w-3.5 h-3.5" />,
  low: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-yellow-500 rounded-px" />
      <div className="w-[4px] h-4 dark:bg-neutral-400 bg-accent rounded-px" />
      <div className="w-[4px] h-3 dark:bg-neutral-400 bg-accent rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent rounded-px" />
    </div>
  ),
  medium: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-green-500 rounded-px" />
      <div className="w-[4px] h-4 bg-green-500 rounded-px" />
      <div className="w-[4px] h-3  dark:bg-neutral-400 bg-accent  rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent rounded-px" />
    </div>
  ),
  high: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-red-500 rounded-px" />
      <div className="w-[4px] h-4 bg-red-500 rounded-px" />
      <div className="w-[4px] h-3 bg-red-500 rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent rounded-px" />
    </div>
  ),
};


export const SortPopover = ({ 
  title, 
  icon: TitleIcon, 
  children,
  trigger
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  trigger: React.ReactNode;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <div className="flex items-center cursor-pointer ml-auto shrink-0 transition-opacity hover:opacity-100 opacity-100">
        {trigger}
      </div>
    </PopoverTrigger>
    <PopoverContent className="w-56 p-2 rounded-lg shadow-md border-zinc-200 dark:border-zinc-800 bg-sidebar" align="end" sideOffset={8}>
      <div className="flex items-center gap-2 px-3 py-2 mb-1">
        <TitleIcon className="w-4 h-4 text-primary" />
        <span className="text-[13px] tracking-tight font-medium text-primary/70">{title}</span>
      </div>
      <Separator className="mb-2 bg-zinc-100 dark:bg-zinc-800" />
      <div className="space-y-0.5">
        {children}
      </div>
    </PopoverContent>
  </Popover>
);


export const INVITE_LINK = "http://localhost:3000/";
