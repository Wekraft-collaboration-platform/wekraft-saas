import { Doc } from "./_generated/dataModel";

export type PlanType = "free" | "plus" | "pro";

export interface PlanLimits {
  project_creation_limit: number;
  project_joining_limit: number;
  members_per_project_limit: number;
  team_insights: "limited" | "full";
  pm_agent: "none" | "limited" | "full";
  user_profile_limit: "limited" | "full";
  community_insights: "limited" | "full";
  message_before_join: boolean;
  project_heatmap: "limited" | "full";
  dedicated_support: "basic" | "priority";
  sprint_creation: boolean;
  cloud_storage: "none" | "basic" | "higher";
  kaya_ai: "none" | "full";
  automated_reporting: boolean;
  experimental_features: boolean;
}

export const PLAN_CONFIGS: Record<PlanType, PlanLimits> = {
  free: {
    project_creation_limit: 2,
    project_joining_limit: 2,
    members_per_project_limit: 3,
    team_insights: "limited",
    pm_agent: "none",
    user_profile_limit: "limited",
    community_insights: "limited",
    message_before_join: false,
    project_heatmap: "limited",
    dedicated_support: "basic",
    sprint_creation: false,
    cloud_storage: "none",
    kaya_ai: "none",
    automated_reporting: false,
    experimental_features: false,
  },
  plus: {
    project_creation_limit: 5,
    project_joining_limit: 5,
    members_per_project_limit: 6,
    team_insights: "full",
    pm_agent: "none",
    user_profile_limit: "full",
    community_insights: "full",
    message_before_join: true,
    project_heatmap: "full",
    dedicated_support: "basic",
    sprint_creation: true,
    cloud_storage: "basic",
    kaya_ai: "none",
    automated_reporting: false,
    experimental_features: false,
  },
  pro: {
    project_creation_limit: 15,
    project_joining_limit: 15,
    members_per_project_limit: 15,
    team_insights: "full",
    pm_agent: "full",
    user_profile_limit: "full",
    community_insights: "full",
    message_before_join: true,
    project_heatmap: "full",
    dedicated_support: "priority",
    sprint_creation: true,
    cloud_storage: "higher",
    kaya_ai: "full",
    automated_reporting: true,
    experimental_features: true,
  },
};

/**
 * Returns the active plan for a user, taking plan expiration into account.
 * This is the core logic that should be used everywhere before checking features.
 */
export function getActiveUserPlan(user: Doc<"users">): PlanType {
  const now = Date.now();

  // If user has an expiration date and it's in the past, fall back to free
  // Note: You could also have a 'basePlan' field if users can be 'plus' permanently
  // but have 'pro' temporary. For now, we'll assume free is the fallback.
  if (user.planExpiry && now > user.planExpiry) {
    return "free";
  }

  return (user.accountType as PlanType) || "free";
}

/**
 * Helper to get all detailed limits for a user
 */
export function getPlanLimits(user: Doc<"users">): PlanLimits {
  const activePlan = getActiveUserPlan(user);
  return PLAN_CONFIGS[activePlan];
}

/**
 * A handy boolean check for specific features.
 * Use this in your Convex functions to enforce server-side safety.
 */
export function hasFeatureAccess(
  user: Doc<"users">,
  feature: keyof PlanLimits,
): boolean {
  const limits = getPlanLimits(user);
  const value = limits[feature];

  if (typeof value === "boolean") {
    return value;
  }

  // For limits, if it's > 0, we'll consider it "accessible"
  // though you'll usually want to check the specific number.
  if (typeof value === "number") {
    return value > 0;
  }

  return value === "full";
}
