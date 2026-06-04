"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bug,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Clock,
  Edit2,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../convex/_generated/dataModel";

export default function CustomerDeskPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // 1. Fetch Project & Core Data
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const deskData = useQuery(
    api.customerDesk.getCustomerDeskData,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );
  const members = useQuery(
    api.project.getProjectMembers,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  // 2. Mutations
  const createCustomer = useMutation(api.customerDesk.createCustomer);
  const editCustomer = useMutation(api.customerDesk.editCustomer);
  const deleteCustomer = useMutation(api.customerDesk.deleteCustomer);
  const createRequest = useMutation(api.customerDesk.createRequest);
  const approveRequest = useMutation(api.customerDesk.approveRequest);
  const rejectRequest = useMutation(api.customerDesk.rejectRequest);

  // 3. Page Navigation & Search States
  const [activeMainTab, setActiveMainTab] = useState<"requests" | "customers">(
    "requests",
  );
  const [requestFilter, setRequestFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 4. Modal Open States & Data
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<{
    id: Id<"serviceCustomers">;
    name: string;
    email: string;
    contact: string;
  } | null>(null);

  const [isDeleteCustomerOpen, setIsDeleteCustomerOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<{
    id: Id<"serviceCustomers">;
    name: string;
  } | null>(null);

  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approvingRequest, setApprovingRequest] = useState<{
    id: Id<"serviceRequests">;
    title: string;
    type: "feature_request" | "bug_report";
  } | null>(null);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] =
    useState<Id<"serviceRequests"> | null>(null);

  // 5. Form States
  // Customer Form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  // Request Form
  const [reqCustomerId, setReqCustomerId] = useState("");
  const [reqTitle, setReqTitle] = useState("");
  const [reqDescription, setReqDescription] = useState("");
  const [reqType, setReqType] = useState<"feature_request" | "bug_report">(
    "feature_request",
  );

  // Approval Form
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]); // User IDs
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });

  // Action Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Loading indicator for skeleton
  if (
    project === undefined ||
    deskData === undefined ||
    members === undefined
  ) {
    return (
      <div className="w-full h-full p-6 2xl:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project || !deskData) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Project not found</p>
      </div>
    );
  }

  const { stats, customers, requests, isPower, isOwner, userRole } = deskData;
  const isViewer = userRole === "viewer";

  // Filter lists based on states
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description &&
        r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = requestFilter === "all" || r.status === requestFilter;

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      toast.error("Name and Email are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await createCustomer({
        projectId: project._id as Id<"projects">,
        name: customerName,
        email: customerEmail,
        contact: customerContact || undefined,
      });
      toast.success("Customer profile created successfully");
      setIsCreateCustomerOpen(false);
      // Reset
      setCustomerName("");
      setCustomerEmail("");
      setCustomerContact("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditCustomer = (c: (typeof customers)[0]) => {
    setEditingCustomer({
      id: c._id,
      name: c.name,
      email: c.email,
      contact: c.contact || "",
    });
    setCustomerName(c.name);
    setCustomerEmail(c.email);
    setCustomerContact(c.contact || "");
    setIsEditCustomerOpen(true);
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!customerName || !customerEmail) {
      toast.error("Name and Email are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await editCustomer({
        customerId: editingCustomer.id,
        name: customerName,
        email: customerEmail,
        contact: customerContact || undefined,
      });
      toast.success("Customer profile updated successfully");
      setIsEditCustomerOpen(false);
      setEditingCustomer(null);
      // Reset
      setCustomerName("");
      setCustomerEmail("");
      setCustomerContact("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteCustomer = (c: (typeof customers)[0]) => {
    setDeletingCustomer({ id: c._id, name: c.name });
    setIsDeleteCustomerOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsSubmitting(true);
    try {
      await deleteCustomer({ customerId: deletingCustomer.id });
      toast.success(`Deleted ${deletingCustomer.name} and all linked requests`);
      setIsDeleteCustomerOpen(false);
      setDeletingCustomer(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!reqTitle) {
      toast.error("Request title is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await createRequest({
        projectId: project._id as Id<"projects">,
        customerId: reqCustomerId as Id<"serviceCustomers">,
        title: reqTitle,
        description: reqDescription || undefined,
        type: reqType,
      });
      toast.success("Request logged successfully");
      setIsCreateRequestOpen(false);
      // Reset
      setReqCustomerId("");
      setReqTitle("");
      setReqDescription("");
      setReqType("feature_request");
    } catch (err: any) {
      toast.error(err.message || "Failed to log request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenApprove = (r: (typeof requests)[0]) => {
    setApprovingRequest({ id: r._id, title: r.title, type: r.type });
    setSelectedAssignees([]);
    setStartDate(new Date().toISOString().split("T")[0]);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setEndDate(d.toISOString().split("T")[0]);
    setIsApproveOpen(true);
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleApproveRequest = async () => {
    if (!approvingRequest) return;
    setIsSubmitting(true);

    try {
      const selectedMembers = members
        .filter((m) => selectedAssignees.includes(m.userId))
        .map((m) => ({
          userId: m.userId,
          name: m.userName,
          avatar: m.userImage || undefined,
        }));

      await approveRequest({
        requestId: approvingRequest.id,
        assignees: selectedMembers.length > 0 ? selectedMembers : undefined,
        startDate:
          approvingRequest.type === "feature_request"
            ? new Date(startDate).getTime()
            : undefined,
        endDate:
          approvingRequest.type === "feature_request"
            ? new Date(endDate).getTime()
            : undefined,
      });

      toast.success(
        `Approved request! Auto-created a ${approvingRequest.type === "feature_request" ? "Task" : "Issue"}`,
      );
      setIsApproveOpen(false);
      setApprovingRequest(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReject = (requestId: Id<"serviceRequests">) => {
    setRejectingRequestId(requestId);
    setIsRejectOpen(true);
  };

  const handleRejectRequest = async () => {
    if (!rejectingRequestId) return;
    setIsSubmitting(true);
    try {
      await rejectRequest({ requestId: rejectingRequestId });
      toast.success("Request marked as rejected");
      setIsRejectOpen(false);
      setRejectingRequestId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic pending sparkline calculations based on the totalPending review count
  const pendingSparkline = (() => {
    const count = stats.totalPending;
    const width = 48;
    const height = 40;
    const baseline = 40;

    if (count === 0) {
      return {
        path: `M 0 ${baseline} L ${width} ${baseline}`,
        area: `M 0 ${baseline} L ${width} ${baseline} L ${width} ${height} L 0 ${height} Z`,
        endX: width,
        endY: baseline,
      };
    }

    // Dynamic amplitude & fluctuation pattern based on pending count
    const amp = Math.min(10, 4 + count * 1.5); // Safe amplitude (no clipping)
    const freq = 1 + (count % 2); // 1 or 2 full wave cycles
    const points = [];
    const segments = 24; // High segment count for super smooth curvature

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width;
      // Single smooth sine wave with dynamic amplitude and frequency
      const y = 22 - Math.sin((x / width) * Math.PI * 2 * freq) * amp;
      points.push({ x, y });
    }

    // Build smooth Bezier path
    let path = `M ${points[0].x} ${points[0].y.toFixed(1)}`;
    let area = `M ${points[0].x} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;

      const segment = ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      path += segment;
      area += segment;
    }

    area += ` L ${width} ${height} L 0 ${height} Z`;
    const lastPoint = points[points.length - 1];

    return {
      path,
      area,
      endX: lastPoint.x,
      endY: lastPoint.y,
    };
  })();

  return (
    <div className="w-full min-h-screen bg-background text-foreground p-6 2xl:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-accent/20 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
            <Inbox className="w-6 h-6 text-primary" />
            Customer Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and escalate customer feedback, bug reports, and feature
            requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateCustomerOpen(true)}
            variant="outline"
            disabled={!isOwner}
            title={
              !isOwner ? "Only the project owner can add customers" : undefined
            }
            className="flex items-center gap-2 border-accent text-xs  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
          <Button
            onClick={() => {
              if (customers.length === 0) {
                toast.error(
                  "You must add at least one customer profile before logging requests.",
                );
                return;
              }
              setIsCreateRequestOpen(true);
            }}
            disabled={isViewer}
            title={isViewer ? "Viewers cannot log requests" : undefined}
            className="flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Log Request
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Customers */}
        <div className="dark:bg-sidebar bg-card border border-accent/90! rounded-lg p-4 shadow-sm flex items-center justify-between group h-[126px] gap-4">
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-foreground flex items-center gap-1.5 font-medium">
                Total Customers
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            </div>
            <div className="text-3xl tracking-tight text-foreground font-mono my-1">
              {stats.totalCustomers}
            </div>
            <span className="text-[11px] text-muted-foreground">
              Active profiles
            </span>
          </div>
          {/* Blue SVG Bar Chart - Dynamic Shape */}
          <div className="relative flex items-center justify-center h-full shrink-0 pr-1">
            <svg viewBox="0 0 48 48" className="w-20 h-20 text-blue-500 shrink-0 transition-all duration-300">
              {Array.from({ length: 8 }).map((_, i) => {
                const baseHeights = [14, 24, 18, 30, 20, 26, 34, 24];
                const val = stats.totalCustomers;
                // Shift heights dynamically based on customer count
                const shiftedIndex = (i + val) % 8;
                const height = baseHeights[shiftedIndex];
                const y = 48 - height;

                // Highlight count: more bars light up as customer count increases
                const isActive = val > 0 && i < Math.min(8, Math.max(1, Math.ceil(val / 2)));
                const opacity = isActive ? 1.0 : 0.25;
                const fill = "#60a5fa"; // lighter light-blue theme

                return (
                  <rect
                    key={i}
                    x={i * 6}
                    y={y}
                    width="4.5"
                    height={height}
                    rx="2.25"
                    fill={fill}
                    opacity={opacity}
                    className="transition-all duration-500 ease-in-out"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Requests Stats - Split Feature/Bug */}
        <div className="dark:bg-sidebar bg-card border  border-accent/90! rounded-lg p-4 shadow-sm flex items-center justify-between group h-[126px]">
          <div className="grid grid-cols-2 w-full h-full divide-x divide-white/20!">
            {/* Left Column: Feature Requests */}
            <div className="flex flex-col justify-between h-full pr-4">
              <span className="text-sm text-foreground flex items-center gap-1.5 font-medium">
                Feature Requests
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <div className="text-3xl tracking-tight text-foreground font-mono my-1">
                {stats.totalRequestedFeatures}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Features
              </span>
            </div>

            {/* Right Column: Reported Bugs */}
            <div className="flex flex-col justify-between h-full pl-6">
              <span className="text-sm text-foreground flex items-center gap-1.5 font-medium">
                Reported Bugs
                <Bug className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <div className="text-3xl tracking-tight text-foreground font-mono my-1">
                {stats.totalReportedBugs}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Bugs
              </span>
            </div>
          </div>
        </div>

        {/* Pending Action */}
        <div className="dark:bg-sidebar bg-card border  border-accent/90! rounded-lg p-4 shadow-sm flex items-center justify-between group h-[126px] gap-4">
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-foreground flex items-center gap-1.5 font-medium">
                Pending Review
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            </div>
            <div className="text-3xl tracking-tight text-foreground font-mono my-1">
              {stats.totalPending}
            </div>
            <span className="text-[11px] text-muted-foreground">
              Awaiting review
            </span>
          </div>
          {/* Orange SVG Area Chart - Dynamic Wave */}
          <div className="relative flex items-center justify-center h-full shrink-0 pr-1">
            <svg viewBox="0 0 48 48" className="w-20 h-20 text-amber-500 shrink-0 transition-all duration-300">
              <defs>
                <linearGradient id="orange-gradient-stats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Subtle Dashboard Grid Lines */}
              <line x1="0" y1="12" x2="48" y2="12" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="1 2" />
              <line x1="0" y1="24" x2="48" y2="24" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="1 2" />
              <line x1="0" y1="36" x2="48" y2="36" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="1 2" />

              <path
                d={pendingSparkline.area}
                fill="url(#orange-gradient-stats)"
                className="transition-all duration-500 ease-in-out"
              />
              <path
                d={pendingSparkline.path}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-in-out"
              />
              <circle
                cx={pendingSparkline.endX}
                cy={pendingSparkline.endY}
                r="3"
                fill="#fbbf24"
                className="transition-all duration-500 ease-in-out"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Tabs Selection */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-accent pb-2 mt-5">
          <div className="flex items-center gap-1.5 p-0.5 bg-sidebar rounded-lg border border-accent/30">
            <button
              onClick={() => {
                setActiveMainTab("requests");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMainTab === "requests"
                ? "bg-accent text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Inbox className="w-4.5 h-4.5" />
              Requests
            </button>
            <button
              onClick={() => {
                setActiveMainTab("customers");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeMainTab === "customers"
                ? "bg-accent text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Users className="w-4.5 h-4.5" />
              Customers
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-[340px] max-w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
            <input
              type="text"
              placeholder={
                activeMainTab === "requests"
                  ? "Search requests..."
                  : "Search customers..."
              }
              className="w-full bg-muted/80 border border-border rounded-md pl-9 pr-4 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Requests View */}
        {activeMainTab === "requests" && (
          <div className="space-y-4">
            {/* Requests Table */}
            <div className=" rounded-md overflow-hidden bg-sidebar/10 shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-neutral-800/70 text-sm  text-white">
                    <th className="px-6 py-4 border-r  border-neutral-700">Title & Description</th>
                    <th className="px-6 py-4 border-r border-neutral-700">Customer</th>
                    <th className="px-6 py-4 w-32 border-r border-neutral-700 text-center">Type</th>
                    <th className="px-6 py-4 w-40 border-r border-neutral-700">
                      <div className="flex items-center justify-between gap-1.5 pl-2 pr-1">
                        <span>Status</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-neutral-700/50 hover:text-white text-muted-foreground transition-colors shrink-0 rounded"
                            >
                              <ChevronsUpDown className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-36 bg-sidebar border border-neutral-800 text-foreground rounded-lg p-1"
                          >
                            {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
                              <DropdownMenuItem
                                key={filter}
                                onClick={() => setRequestFilter(filter)}
                                className={`text-xs capitalize focus:bg-neutral-800 focus:text-foreground cursor-pointer flex items-center justify-between px-2.5 py-1.5 rounded-md ${requestFilter === filter ? "bg-neutral-800/80 text-white font-medium" : "text-muted-foreground"
                                  }`}
                              >
                                {filter}
                                {requestFilter === filter && <Check className="w-3 h-3 text-white" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </th>
                    <th className="px-6 py-4 w-32 border-r border-neutral-700">Logged At</th>
                    <th className="px-6 py-4 w-48 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-sm">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-muted-foreground text-xs"
                      >
                        No requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => (
                      <tr
                        key={r._id}
                        className="hover:bg-neutral-800/10 border-b border-neutral-700 transition-all"
                      >
                        <td className="px-6 py-4 border-r border-neutral-700">
                          <div className="font-medium text-foreground">
                            {r.title}
                          </div>
                          {r.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-md font-medium">
                              {r.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 border-r border-neutral-700">
                          <div className="font-medium text-foreground">
                            {r.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {r.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center border-r border-neutral-700">
                          {r.type === "feature_request" ? (
                            <Badge className="bg-muted/70 text-white border border-border hover:bg-muted/70 font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                              <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              Feature
                            </Badge>
                          ) : (
                            <Badge className="bg-muted/70 text-white border border-border hover:bg-muted/70 font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                              <Bug className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              Bug
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center border-r border-neutral-700">
                          {r.status === "pending" && (
                            <Badge className="bg-muted/70 text-white border border-border hover:bg-muted/70 font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3.5 h-3.5 text-white shrink-0" />
                              Pending
                            </Badge>
                          )}
                          {r.status === "approved" && (
                            <Badge className="bg-muted/70 text-white border border-border hover:bg-muted/70 font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                              Approved
                            </Badge>
                          )}
                          {r.status === "rejected" && (
                            <Badge className="bg-muted/70 text-white border border-border hover:bg-muted/70 font-medium inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-white shrink-0" />
                              Rejected
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground border-r border-neutral-700 font-medium">
                          {new Date(r.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {r.status === "pending" ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenApprove(r)}
                                disabled={!isPower}
                                title={
                                  !isPower
                                    ? "Only owners and admins can approve requests"
                                    : undefined
                                }
                                className="h-7 px-2.5 bg-emerald-950/30 text-white hover:bg-emerald-500/20 border  text-xs font-medium gap-1.5 rounded-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenReject(r._id)}
                                disabled={!isPower}
                                title={
                                  !isPower
                                    ? "Only owners and admins can reject requests"
                                    : undefined
                                }
                                className="h-7 px-2.5 bg-rose-950/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium gap-1.5 rounded-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </Button>
                            </div>
                          ) : r.status === "approved" ? (
                            <div className="flex items-center justify-center gap-1.5 text-neutral-300 text-xs font-medium">
                              <Check className="w-3.5 h-3.5" />
                              <span>Approved</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 text-neutral-300 text-xs font-medium">
                              <X className="w-3.5 h-3.5" />
                              <span>Rejected</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers View */}
        {activeMainTab === "customers" && (
          <div className=" rounded-lg overflow-hidden bg-sidebar/10 shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-700 bg-neutral-800/70 text-sm font-medium text-white">
                  <th className="px-6 py-4 border-r border-neutral-700">Customer Name</th>
                  <th className="px-6 py-4 border-r border-neutral-700">Email</th>
                  <th className="px-6 py-4 border-r border-neutral-700">Contact</th>
                  <th className="px-6 py-4 w-40 border-r border-neutral-700">Created At</th>
                  <th className="px-6 py-4 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700 text-sm">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground text-xs"
                    >
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-neutral-800/10 border-b border-neutral-700 transition-all"
                    >
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2 border-r border-neutral-700">
                        <div className="w-7 h-7 rounded-full bg-accent/40 flex items-center justify-center text-primary text-xs font-bold uppercase">
                          {c.name.charAt(0)}
                        </div>
                        {c.name}
                      </td>
                      <td className="px-6 py-4 border-r border-neutral-700">
                        <span className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all font-medium">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                          {c.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground border-r border-neutral-700 font-medium">
                        {c.contact ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground/60" />
                            {c.contact}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 italic text-xs">
                            Not specified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground border-r border-neutral-700 font-medium">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEditCustomer(c)}
                            disabled={!isOwner}
                            title={
                              !isOwner
                                ? "Only the project owner can edit customers"
                                : undefined
                            }
                            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/40 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDeleteCustomer(c)}
                            disabled={!isOwner}
                            title={
                              !isOwner
                                ? "Only the project owner can delete customers"
                                : undefined
                            }
                            className="w-8 h-8 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          MODALS / DIALOGS
      ========================================== */}

      {/* Create Customer Dialog */}
      <Dialog
        open={isCreateCustomerOpen}
        onOpenChange={setIsCreateCustomerOpen}
      >
        <DialogContent className="sm:max-w-md bg-sidebar border border-accent text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">
              New Customer Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 font-normal">
              Create a profile for customer-centric feedback and bug logs.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Customer Name *
              </label>
              <input
                type="text"
                required
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                placeholder="e.g. john@company.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Contact Info (Optional)
              </label>
              <input
                type="text"
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                placeholder="e.g. +1 555-0199"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateCustomerOpen(false)}
                className="border-border hover:bg-neutral-800 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 text-xs font-medium"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Create Profile
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="sm:max-w-md bg-sidebar border border-accent text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">
              Edit Customer Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 font-normal">
              Update the customer details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Customer Name *
              </label>
              <input
                type="text"
                required
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Contact Info (Optional)
              </label>
              <input
                type="text"
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditCustomerOpen(false);
                  setEditingCustomer(null);
                }}
                className="border-border hover:bg-neutral-800 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 text-xs font-medium"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Edit2 className="w-3.5 h-3.5" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Confirm Dialog */}
      <Dialog
        open={isDeleteCustomerOpen}
        onOpenChange={setIsDeleteCustomerOpen}
      >
        <DialogContent className="sm:max-w-md bg-sidebar border border-accent text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500 text-lg font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Delete Customer Profile?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 font-normal">
              This action is permanent. Deleting{" "}
              <span className="font-medium text-foreground">
                {deletingCustomer?.name}
              </span>{" "}
              will cascade delete all customer requests associated with them.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteCustomerOpen(false);
                setDeletingCustomer(null);
              }}
              className="border-border hover:bg-neutral-800 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleDeleteCustomer}
              className="bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 text-xs font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Request Dialog */}
      <Dialog open={isCreateRequestOpen} onOpenChange={setIsCreateRequestOpen}>
        <DialogContent className="sm:max-w-lg bg-sidebar border border-accent text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">
              Log Customer Request
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 font-normal">
              Log a feature request or reported bug on behalf of a customer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Select Customer *
              </label>
              <select
                required
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                value={reqCustomerId}
                onChange={(e) => setReqCustomerId(e.target.value)}
              >
                <option value="">-- Choose a Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Request Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="radio"
                    name="reqType"
                    checked={reqType === "feature_request"}
                    onChange={() => setReqType("feature_request")}
                    className="accent-primary"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                    Feature Request
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="radio"
                    name="reqType"
                    checked={reqType === "bug_report"}
                    onChange={() => setReqType("bug_report")}
                    className="accent-primary"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    <Bug className="w-3.5 h-3.5 text-rose-400" />
                    Reported Bug
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Title *
              </label>
              <input
                type="text"
                required
                className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                placeholder={
                  reqType === "feature_request"
                    ? "e.g. Integrate Apple Pay"
                    : "e.g. Broken checkout form validation"
                }
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Description (Optional)
              </label>
              <textarea
                className="w-full min-h-24 bg-neutral-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                placeholder="Details, user-story, steps to reproduce..."
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateRequestOpen(false)}
                className="border-border hover:bg-neutral-800 text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 text-xs font-medium"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Inbox className="w-3.5 h-3.5" />
                )}
                Log Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve Request & Escalate Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-lg bg-sidebar border border-accent text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-medium">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              Approve & Escalate Request
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 font-normal">
              Escalate{" "}
              <span className="font-medium text-foreground">
                "{approvingRequest?.title}"
              </span>
              . This will automatically generate a board item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {/* Request Details */}
            <div className="p-3 bg-neutral-900 rounded-lg border border-border flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Escalation Target:
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {approvingRequest?.type === "feature_request"
                    ? "Task Board (New Task)"
                    : "Issue Board (New Manual Issue)"}
                </p>
              </div>
              <Badge
                className={
                  approvingRequest?.type === "feature_request"
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium"
                }
              >
                {approvingRequest?.type === "feature_request"
                  ? "Feature"
                  : "Bug"}
              </Badge>
            </div>

            {/* Select Assignees (both, but highly encouraged for Feature) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Assign Project Members
              </label>
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 bg-neutral-900 space-y-1">
                {members.length === 0 ? (
                  <p className="text-xs font-medium text-muted-foreground p-2">
                    No members in project.
                  </p>
                ) : (
                  members.map((m) => {
                    const isSelected = selectedAssignees.includes(m.userId);
                    return (
                      <div
                        key={m.userId}
                        onClick={() => toggleAssignee(m.userId)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border text-xs font-medium ${isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "hover:bg-neutral-800 border-transparent text-foreground"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={m.userImage} />
                            <AvatarFallback className="text-[9px] uppercase font-bold bg-accent text-accent-foreground">
                              {m.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{m.userName}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider scale-90 opacity-75">
                          {m.AccessRole || "member"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Estimation / Duration Fields (Only for Feature Request -> Task creation) */}
            {approvingRequest?.type === "feature_request" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-neutral-900 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 font-medium transition-all"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveOpen(false);
                setApprovingRequest(null);
              }}
              className="border-border hover:bg-neutral-800 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleApproveRequest}
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 text-xs font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Approve & Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md bg-sidebar border border-accent text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500 text-lg font-medium">
              <XCircle className="w-5 h-5 text-rose-500" />
              Reject Customer Request?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/80 font-normal">
              Are you sure you want to reject this request? This will mark the
              request status as rejected and will not create a task or issue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectOpen(false);
                setRejectingRequestId(null);
              }}
              className="border-border hover:bg-neutral-800 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={handleRejectRequest}
              className="bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 text-xs font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              Reject Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
