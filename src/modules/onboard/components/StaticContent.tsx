import React from "react";
import {
  Instagram,
  UserPlus,
  Youtube,
  Linkedin,
  Search,
  Rocket,
  GitMerge,
  LayoutDashboard,
  Compass,
} from "lucide-react";

// Premium custom SVG icons
export const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const RedditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.29-1.72l1.3-4.14 4.26 1c.02.97.83 1.76 1.81 1.76 1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8c-.82 0-1.5.54-1.72 1.29l-4.71-1.11c-.26-.06-.52.1-.6.36l-1.46 4.66c-2.49.07-4.76.72-6.43 1.74-.57-.75-1.47-1.23-2.42-1.23-1.65 0-3 1.35-3 3 0 1.12.63 2.1 1.56 2.62-.06.29-.1.59-.1.88 0 4.14 4.7 7.5 10.5 7.5s10.5-3.36 10.5-7.5c0-.29-.04-.58-.1-.87.9-.53 1.52-1.5 1.52-2.61zm-17 1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm11 4.5c-1.78 1.78-5.16 1.78-6.94 0-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0 1.4 1.4 4.14 1.4 5.53 0 .2-.2.51-.2.71 0 .19.2.19.51-.01.71zm-2.06-4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

export const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
  </svg>
);

export const ProductHuntIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.801 0-.993-.805-1.799-1.801-1.799zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.801V6h5.804c2.319 0 4.2 1.88 4.2 4.199 0 2.321-1.881 4.201-4.201 4.201z"/>
  </svg>
);

export const STEPS = [
  { id: 1, title: "Source" },
  { id: 2, title: "Usage" },
  { id: 3, title: "Identity" },
  { id: 4, title: "Project" },
  { id: 5, title: "Team" },
];

export const SOURCES = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "x", label: "X / Twitter", icon: XIcon },
  { id: "reddit", label: "Reddit", icon: RedditIcon },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "referral", label: "Referral", icon: UserPlus },
  { id: "discord", label: "Discord", icon: DiscordIcon },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "producthunt", label: "Product Hunt", icon: ProductHuntIcon },
  { id: "google", label: "Google Search", icon: Search },
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
    id: "discover",
    label: "Discover",
    description: "Explore projects and find your next opportunity",
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
    id: "Track",
    label: "Track Deadlines",
    description: "Track deadlines of projects",
    icon: Compass,
    color: "from-white/10 to-transparent",
    accent: "text-white",
    border: "border-white/20",
    glow: "bg-white/5",
  },
];
