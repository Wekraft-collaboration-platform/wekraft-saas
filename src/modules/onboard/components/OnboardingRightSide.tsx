"use client";

import React from "react";
import {
  FolderGit,
  Mail,
  Bell,
  Plus,
  LayoutDashboard,
  Folder,
  ListTodo,
  Layers,
  Settings,
  ChevronDown,
  LayersPlusIcon,
  User2,
  GlobeOff,
  Globe,
  Sparkles,
  HelpCircle,
  Zap,
  Home,
  DollarSign,
  Compass,
  FileText,
  BarChart2,
  Users,
  Database,
  Filter,
  MoreHorizontal,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingRightSideProps {
  currentStep: number;
  purposes: string[];
  username: string;
  selectedRole: string;
  projectName: string;
  projectStatus: string;
  theme?: string;
  clerkUser?: any;
}

export function OnboardingRightSide({
  currentStep,
  purposes,
  username,
  selectedRole,
  projectName,
  projectStatus,
  theme = "dark",
  clerkUser,
}: OnboardingRightSideProps) {
  // Render step-wise elements on the right column
  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-[90%] max-w-[620px] aspect-[16/10] bg-zinc-900 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col font-sans">
            {/* macOS Style Browser Tab Bar */}
            <div className="h-10 border-b border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dfa123]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
              </div>

              <div className="flex items-center gap-2.5 text-zinc-600 text-[10px]">
                <span className="cursor-pointer hover:text-zinc-400">◀</span>
                <span className="cursor-pointer hover:text-zinc-400">▶</span>
                <span className="cursor-pointer hover:text-zinc-400">↻</span>
              </div>

              <div className="text-[10px] text-zinc-400 font-mono tracking-tight bg-zinc-900 border border-zinc-850 rounded-md px-4 py-0.5 w-64 text-center truncate flex items-center justify-center gap-1">
                <span className="text-emerald-500">🔒</span>
                <span>https://wekraft.co/workspace</span>
              </div>

              <div className="w-16" />
            </div>

            {/* Browser Workspace Content */}
            <div className="relative p-6 flex-1 overflow-hidden bg-zinc-950 text-left text-zinc-450">
              {/* Glow accent */}
              <div className="absolute -top-1/4 -right-1/4 w-60 h-60 bg-[#5e6ad2]/5 blur-[60px] rounded-full pointer-events-none" />

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
                    {
                      name: "WeKraft Collaboration",
                      desc: "Main project for team workspace",
                      status: "Active",
                      color: "text-[#5e6ad2] bg-[#5e6ad2]/10",
                    },
                    {
                      name: "Marketing Campaign",
                      desc: "Launch timeline and website feedback",
                      status: "Planning",
                      color: "text-blue-400 bg-blue-400/10",
                    },
                    {
                      name: "Design System 2.0",
                      desc: "Figma token sync and component library",
                      status: "Backlog",
                      color: "text-zinc-500 bg-zinc-900",
                    },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="p-3 bg-zinc-900/30 border border-zinc-900/40 rounded-lg flex items-center justify-between"
                    >
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
            </div>
          </div>
        );

      case 2:
        return (
          <div className="w-full flex items-center justify-center p-4 font-sans">
            {/* Colorful Gradient Card Outer */}
            <div className="w-[380px] aspect-[1.3] rounded-[40px] bg-gradient-to-tr from-[#abc4ff] via-[#ffd6ff] to-[#ffebd6] relative p-6 shadow-2xl flex flex-col justify-end overflow-visible">

              {/* Circular avatar overlapping the card */}
              <div className="absolute top-[12%] left-8 w-[92px] h-[92px] rounded-full border-[5px] border-white overflow-hidden shadow-lg z-20">
                {clerkUser?.imageUrl ? (
                  <img src={clerkUser.imageUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                    alt=""
                  />
                )}
              </div>

              {/* White card body */}
              <div className="bg-white rounded-t-[32px] rounded-b-[40px] p-6 pt-12 flex flex-col justify-between h-[68%] text-zinc-800 relative z-10">
                <div>
                  {/* Name & Occupation badges */}
                  <div className="flex items-center justify-between">
                    <div className="pl-[100px] -mt-11">
                      <h4 className="text-base font-bold text-zinc-900 tracking-tight leading-none mb-1.5 truncate max-w-44 capitalize font-sans">
                        {username || clerkUser?.fullName || "Verona Nov"}
                      </h4>
                      <div className="flex gap-1">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[8.5px] font-semibold capitalize">
                          {selectedRole || "Writer"}
                        </span>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[8.5px] font-semibold">
                          Golden User
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio description */}
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed mt-4 font-normal">
                    {selectedRole
                      ? `Passionate ${selectedRole.toLowerCase()} collaborating on WeKraft workspaces to design, build, and deploy projects.`
                      : "I write short stories and fanfiction for the most popular fandoms"}
                  </p>
                </div>

                {/* Row of buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 bg-black text-white hover:bg-zinc-800 transition-colors font-semibold text-[10px] uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-white" />
                    Follow
                  </button>
                  <button className="w-11 h-11 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="w-11 h-11 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div
            style={{
              transform: "perspective(1500px) rotateY(-16deg) rotateX(14deg) rotateZ(-2deg)",
              transformStyle: "preserve-3d"
            }}
            className="absolute bottom-[-50px] right-[-60px] w-[860px] h-[550px] bg-gradient-to-br from-[#0e0e11] to-[#050506] border border-white/[0.08] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.95)] flex overflow-hidden font-sans"
          >
            {/* Fine border highlight reflection at top edge and glowing radial backdrop */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/[0.08] blur-[80px] rounded-full pointer-events-none" />

            {/* Sidebar */}
            <aside className="w-48 border-r border-white/[0.06] bg-[#09090b]/80 p-5 flex flex-col gap-6 shrink-0 text-zinc-400 backdrop-blur-md">
              {/* Workspace Logo & Header */}
              <div className="flex items-center gap-2.5 pb-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]">
                  W
                </div>
                <span className="font-bold text-sm text-zinc-100 tracking-tight font-sans">WeKraft</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-auto" />
              </div>

              {/* Sidebar Menu items */}
              <div className="space-y-1.5">
                <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider px-2 block">Menu</span>
                {[
                  { label: "Dashboard", icon: LayoutDashboard, active: true },
                  { label: "Projects", icon: Folder },
                  { label: "Tasks", icon: ListTodo },
                  { label: "Integrations", icon: Layers },
                  { label: "Workflows", icon: LayersPlusIcon },
                  { label: "Community", icon: Globe },
                  { label: "Profile", icon: User2 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer",
                      item.active
                        ? "text-white border border-white/[0.08] bg-white/[0.02]"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", item.active ? "text-zinc-300" : "text-zinc-500")} />
                    <span className="font-sans">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Settings link at bottom */}
              <div className="mt-auto">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01] cursor-pointer transition-colors">
                  <Settings className="w-4 h-4 text-zinc-500" />
                  <span className="font-sans">Settings</span>
                </div>
              </div>
            </aside>

            {/* Dashboard content area */}
            <main className="flex-1 p-8 flex flex-col gap-6 text-zinc-350">

              {/* Header (Project Name & Status chosen by user) */}
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">WORKSPACE</span>
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="text-xl font-bold text-white tracking-tight leading-none font-sans">
                      {projectName || "Acme SaaS"}
                    </h1>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] tracking-wider uppercase font-bold border border-white/[0.08] bg-white/[0.03] text-zinc-300 px-2 py-0.5 rounded-full font-mono">
                      {projectStatus || "Validation"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "SPRINT COMPLETION", value: "76%", sub: "6 / 11 Tasks" },
                  { label: "ACTIVE TEAM", value: "3 Online", sub: "Out of 4" },
                  { label: "SYSTEM LATENCY", value: "12ms", sub: "Convex Node" }
                ].map((card) => (
                  <div
                    key={card.label}
                    className="border border-white/[0.06] bg-white/[0.02] p-4 rounded-xl flex flex-col text-left shadow-xs transition-colors hover:border-white/[0.1]"
                  >
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-sans">{card.label}</span>
                    <span className="text-lg font-bold text-zinc-200 mt-2 font-mono tracking-tight">{card.value}</span>
                    <span className="text-[9px] text-zinc-500 mt-1 font-medium font-sans">{card.sub}</span>
                  </div>
                ))}
              </div>

              {/* Task Backlog Table */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-wider px-1 font-sans">
                  <span>Task Backlog</span>
                  <span>Status</span>
                </div>

                <div className="space-y-2">
                  {[
                    { task: "Design Landing Page UI", status: "Done", color: "text-emerald-400 border-emerald-500/15 bg-emerald-500/5" },
                    { task: "Setup authentication channels", status: "In Progress", color: "text-blue-400 border-blue-500/15 bg-blue-500/5" },
                    { task: "Run Convex mutations sync", status: "To Do", color: "text-zinc-400 border-zinc-500/15 bg-zinc-500/5" }
                  ].map((row) => (
                    <div
                      key={row.task}
                      className="flex items-center justify-between p-3.5 border border-white/[0.05] bg-white/[0.01] rounded-xl hover:border-white/[0.08] transition-colors"
                    >
                      <span className="text-xs text-zinc-350 font-medium font-sans">{row.task}</span>
                      <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-semibold tracking-wide border font-sans", row.color)}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </main>
          </div>
        );

      case 4: {
        const isLight = theme === "light";
        return (
          <div
            style={{
              transform: "perspective(2000px) rotateX(50deg) rotateY(-16deg) rotateZ(26deg)",
              transformStyle: "preserve-3d"
            }}
            className={cn(
              "absolute bottom-[-100px] right-[-120px] w-[920px] h-[600px] rounded-2xl flex overflow-hidden font-sans transition-all duration-500 border",
              isLight
                ? "bg-white border-zinc-200/80 shadow-[0_40px_80px_rgba(0,0,0,0.1)] text-zinc-800"
                : "bg-[#0b0b0c] border-white/[0.08] shadow-[0_40px_80px_rgba(0,0,0,0.95)] text-zinc-200"
            )}
          >
            {/* Fine border highlight reflection at top edge and glowing radial backdrop */}
            <div className={cn(
              "absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none transition-all duration-500",
              isLight
                ? "bg-gradient-to-r from-transparent via-zinc-200 to-transparent"
                : "bg-gradient-to-r from-transparent via-white/15 to-transparent"
            )} />
            <div className={cn(
              "absolute -top-32 -left-32 w-80 h-80 blur-[80px] rounded-full pointer-events-none transition-all duration-500",
              isLight
                ? "bg-blue-600/[0.03]"
                : "bg-blue-600/[0.08]"
            )} />

            {/* Sidebar */}
            <aside className={cn(
              "w-14 flex flex-col items-center py-6 gap-5 shrink-0 border-r transition-all duration-500",
              isLight
                ? "bg-zinc-50 border-zinc-200/60 text-zinc-400"
                : "bg-[#08080a]/80 border-white/[0.06] text-zinc-500 backdrop-blur-md"
            )}>
              {/* Top Sparkles Icon */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                isLight ? "text-zinc-700" : "text-zinc-200"
              )}>
                <Sparkles className="w-4 h-4" />
              </div>

              {/* Separator line */}
              <div className={cn("w-6 h-[1px]", isLight ? "bg-zinc-200" : "bg-white/[0.05]")} />

              {/* Action Icons */}
              <div className="flex flex-col gap-4">
                {[
                  { icon: Settings, id: "settings" },
                  { icon: HelpCircle, id: "help" },
                  { icon: Zap, id: "workflows" },
                  { icon: Home, id: "home" },
                  { icon: DollarSign, id: "billing", active: true },
                  { icon: Compass, id: "navigation" },
                  { icon: FileText, id: "docs" },
                  { icon: BarChart2, id: "analytics" },
                  { icon: Mail, id: "messages" },
                  { icon: Users, id: "team" },
                  { icon: Database, id: "data" }
                ].map((item) => {
                  const isActive = item.active;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all",
                        isActive
                          ? isLight
                            ? "bg-blue-50 text-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.15)]"
                            : "bg-blue-600/10 text-blue-400 shadow-[0_2px_12px_rgba(59,130,246,0.2)] border border-blue-500/20"
                          : isLight
                            ? "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main Table Area */}
            <main className={cn(
              "flex-1 p-6 flex flex-col gap-4 overflow-hidden transition-all duration-500",
              isLight ? "text-zinc-600" : "text-zinc-400"
            )}>
              {/* Opportunities Title Bar */}
              <div className={cn("flex items-center justify-between pb-3 border-b transition-colors", isLight ? "border-zinc-200/50" : "border-white/[0.04]")}>
                <div className="flex items-center gap-2">
                  <h2 className={cn("text-sm font-bold tracking-tight font-sans transition-colors", isLight ? "text-zinc-800" : "text-white")}>
                    Opportunities
                  </h2>
                  <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400 cursor-pointer hover:text-zinc-300" />
                </div>

                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium border cursor-pointer select-none transition-all",
                    isLight
                      ? "bg-zinc-50 border-zinc-200/60 hover:bg-zinc-100 text-zinc-600"
                      : "bg-[#0e0e11] border-white/[0.05] hover:bg-white/[0.01] text-zinc-400"
                  )}>
                    <span className="w-3 h-3 text-[8px] font-bold">📋</span>
                    <span className="font-sans">Paid Customers</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </div>

                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border cursor-pointer select-none transition-all",
                    isLight
                      ? "bg-zinc-50 border-zinc-200/60 hover:bg-zinc-100 text-zinc-600"
                      : "bg-[#0e0e11] border-white/[0.05] hover:bg-white/[0.01] text-zinc-400"
                  )}>
                    <Filter className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="font-sans">Filter</span>
                  </div>
                </div>
              </div>

              {/* Table View */}
              <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 text-left min-h-0 select-none">
                {/* Table Header Row */}
                <div className={cn(
                  "flex items-center border-b py-2 text-[9px] font-semibold uppercase tracking-wider transition-colors",
                  isLight
                    ? "border-zinc-200/50 text-zinc-500 bg-zinc-50/50"
                    : "border-white/[0.04] text-zinc-500 bg-[#0c0c0e]/30"
                )}>
                  <div className="w-[8%] pl-3 flex items-center justify-center">
                    <div className={cn("w-3 h-3 rounded border transition-all", isLight ? "border-zinc-300" : "border-white/[0.08]")} />
                  </div>
                  <div className="w-[8%] font-mono text-center">#</div>
                  <div className="w-[44%] font-sans pl-2">Name</div>
                  <div className="w-[40%] font-sans pl-2">Status</div>
                </div>

                {/* Rows */}
                {[
                  { name: "Resend Deal", status: "on", color: "text-emerald-500 border-emerald-500/15 bg-emerald-500/5" },
                  { name: "OpenAI Deal", status: "on", color: "text-emerald-500 border-emerald-500/15 bg-emerald-500/5" },
                  { name: "CitiBank Deal", status: "ng", color: "text-amber-500 border-amber-500/15 bg-amber-500/5", activePanel: true },
                  { name: "Linear Deal", status: "ion", color: "text-blue-500 border-blue-500/15 bg-blue-500/5" },
                  { name: "Stripe Deal", status: "ng", color: "text-amber-500 border-amber-500/15 bg-amber-500/5" },
                  { name: "X Deal", status: "on", color: "text-emerald-500 border-emerald-500/15 bg-emerald-500/5" },
                  { name: "WorkOS Deal", status: "ion", color: "text-blue-500 border-blue-500/15 bg-blue-500/5" },
                  { name: "Oracle Deal", status: "ng", color: "text-amber-500 border-amber-500/15 bg-amber-500/5" },
                  { name: "Fidelity Deal", status: "on", color: "text-emerald-500 border-emerald-500/15 bg-emerald-500/5" },
                  { name: "Momentic Deal", status: "ion", color: "text-blue-500 border-blue-500/15 bg-blue-500/5" },
                ].map((row, idx) => {
                  const isHoveredRow = row.activePanel;
                  return (
                    <div
                      key={row.name}
                      className={cn(
                        "flex items-center py-2.5 text-xs font-medium border-b relative group transition-colors",
                        isLight
                          ? "border-zinc-200/40 hover:bg-zinc-50"
                          : "border-white/[0.03] hover:bg-white/[0.01]",
                        isLight
                          ? isHoveredRow ? "bg-zinc-50" : "bg-transparent"
                          : isHoveredRow ? "bg-white/[0.01]" : "bg-transparent"
                      )}
                    >
                      <div className="w-[8%] flex items-center justify-center">
                        <div className={cn("w-3 h-3 rounded border transition-all", isLight ? "border-zinc-300" : "border-white/[0.08]")} />
                      </div>
                      <div className={cn("w-[8%] text-center font-mono text-[10px]", isLight ? "text-zinc-400" : "text-zinc-500")}>
                        {idx + 1}
                      </div>

                      <div className={cn("w-[44%] font-sans pl-2 truncate transition-colors", isLight ? "text-zinc-800" : "text-zinc-200")}>
                        {row.name}
                      </div>

                      <div className="w-[40%] font-sans pl-2 flex items-center">
                        <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold tracking-wide border uppercase font-mono", row.color)}>
                          {row.status}
                        </span>
                      </div>

                      {/* Tooltip & Floating action buttons exactly as shown in screenshot */}
                      {isHoveredRow && (
                        <>
                          <div className="absolute right-[22%] top-[-8px] z-20 flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] px-2 py-1.5 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] select-none">
                            <button type="button" className="p-1 rounded-md bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" className="p-1 rounded-md text-amber-500 hover:bg-zinc-100 dark:hover:bg-white/[0.02]">
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" className="p-1 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.02]">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="absolute right-[16%] top-[34px] z-20 bg-zinc-950 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 select-none pointer-events-none">
                            <span className="font-sans">Open in Side Panel</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        );
      }

      default:
        return (
          <div className="flex items-center justify-center h-full font-sans">
            <span className="text-zinc-650 text-xs font-mono">
              Step {currentStep} Preview coming soon
            </span>
          </div>
        );
    }
  };

  const isLight = theme === "light";
  const isAbsoluteAligned = currentStep === 3 || currentStep === 4;

  return (
    <div className={cn(
      "hidden lg:flex lg:w-[60%] relative overflow-hidden select-none min-h-screen transition-all duration-500",
      isLight
        ? "bg-gradient-to-bl from-zinc-200 via-zinc-100 to-indigo-50/40"
        : "bg-linear-to-bl from-neutral-950 via-neutral-950 to-blue-900/40",
      isAbsoluteAligned ? "items-end justify-end p-0" : "items-center justify-center p-12"
    )}>
      {isAbsoluteAligned ? (
        renderContent()
      ) : (
        <div className="w-full flex items-center justify-center">
          {renderContent()}
        </div>
      )}
    </div>
  );
}
