import {
  Github,
  Layers,
  Users,
  ScanSearch,
  Linkedin,
  Instagram,
  Twitter,
  UserPlus,
  Youtube,
  BookOpen,
  MessageSquare,
  Rocket,
  GitMerge,
  LayoutDashboard,
  Compass,
} from "lucide-react";

export const STEPS = [
  { id: 1, title: "Where did you Hear about us", icon: ScanSearch },
  { id: 2, title: "Your main purpose for using WeKraft" },
  { id: 3, title: "Repository", icon: Github },
  { id: 4, title: "Project Details", icon: Layers },
  { id: 5, title: "Team", icon: Users },
];

export const SOURCES = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "twitter", label: "X / Twitter", icon: Twitter },
  { id: "friends", label: "Friends", icon: Users },
  { id: "referral", label: "Referral", icon: UserPlus },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "blogs", label: "Blogs", icon: BookOpen },
  { id: "others", label: "Others", icon: MessageSquare },
];

export const PURPOSES = [
  {
    id: "collab",
    label: "Team Collaboration",
    description: "Find and join teams to build things together",
    icon: Rocket,
    color: "from-white/10 to-transparent",
    accent: "text-white",
    border: "border-white/20",
    glow: "bg-white/5",
  },
  {
    id: "opensource",
    label: "Open Source",
    description: "Contribute to projects & help the community",
    icon: GitMerge,
    color: "from-white/10 to-transparent",
    accent: "text-white",
    border: "border-white/20",
    glow: "bg-white/5",
  },
  {
    id: "management",
    label: "Project Management",
    description: "Organize your team and track progress",
    icon: LayoutDashboard,
    color: "from-white/10 to-transparent",
    accent: "text-white",
    border: "border-white/20",
    glow: "bg-white/5",
  },
  {
    id: "explore",
    label: "Just Exploring",
    description: "Discover what WeKraft has to offer",
    icon: Compass,
    color: "from-white/10 to-transparent",
    accent: "text-white",
    border: "border-white/20",
    glow: "bg-white/5",
  },
];
