import { Doc } from "./_generated/dataModel";

export type PlanType = "free" | "plus" | "pro" | "scale";

export interface PlanLimits {
  project_creation_limit: number;
  project_joining_limit: number;
  team_insights: "limited" | "full";
  pm_agent: "none" | "limited" | "full";
  ai_code_review: "none" | "limited" | "higher";
  members_per_project_limit: number;
  user_profile_limit: "limited" | "full";
  community_insights: "limited" | "full";
  message_before_join: boolean;
  ai_tools_access: "none" | "limited" | "full";
  ai_tools_limit?: number;
  project_heatmap: "limited" | "full";
  dedicated_support: "basic" | "priority";
  vs_code_extension: "limited" | "full";
}

export const PLAN_CONFIGS: Record<PlanType, PlanLimits> = {
  free: {
    project_creation_limit: 2,
    project_joining_limit: 2,
    team_insights: "limited",
    pm_agent: "none",
    ai_code_review: "none",
    members_per_project_limit: 3,
    user_profile_limit: "limited",
    community_insights: "limited",
    message_before_join: false,
    ai_tools_access: "none",
    project_heatmap: "limited",
    dedicated_support: "basic",
    vs_code_extension: "limited",
  },
  plus: {
    project_creation_limit: 3,
    project_joining_limit: 5,
    team_insights: "full", 
    pm_agent: "none",
    ai_code_review: "none",
    members_per_project_limit: 5,
    user_profile_limit: "full",
    community_insights: "full",
    message_before_join: true,
    ai_tools_access: "none",
    project_heatmap: "limited",
    dedicated_support: "basic",
    vs_code_extension: "limited",
  },
  pro: {
    project_creation_limit: 10,
    project_joining_limit: 100, 
    team_insights: "full",
    pm_agent: "limited",
    ai_code_review: "limited",
    members_per_project_limit: 15,
    user_profile_limit: "full",
    community_insights: "full",
    message_before_join: true,
    ai_tools_access: "limited",
    ai_tools_limit: 50,
    project_heatmap: "full",
    dedicated_support: "priority",
    vs_code_extension: "full",
  },
  scale: {
    project_creation_limit: 20,
    project_joining_limit: 100,
    team_insights: "full",
    pm_agent: "full",
    ai_code_review: "higher",
    members_per_project_limit: 25,
    user_profile_limit: "full",
    community_insights: "full",
    message_before_join: true,
    ai_tools_access: "full",
    ai_tools_limit: 100,
    project_heatmap: "full",
    dedicated_support: "priority",
    vs_code_extension: "full",
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
