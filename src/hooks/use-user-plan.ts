import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import {
  getActiveUserPlan,
  getPlanLimits,
  PLAN_CONFIGS,
  PlanType,
  PlanLimits,
} from "../../convex/pricing";

export function useUserPlan(user?: Doc<"users"> | null) {
  const currentUser = useQuery(api.user.getCurrentUser);
  const resolvedUser = user !== undefined ? user : currentUser;

  if (!resolvedUser) {
    return {
      plan: "free" as PlanType,
      limits: PLAN_CONFIGS.free as PlanLimits,
      isFree: true,
      isPlus: false,
      isPro: false,
      isScale: false,
      isUpgraded: false,
      isLoaded: currentUser === null ? true : false,
    };
  }

  const plan = getActiveUserPlan(resolvedUser);
  const limits = getPlanLimits(resolvedUser);

  return {
    plan,
    limits,
    isFree: plan === "free",
    isPlus: plan === "plus",
    isPro: plan === "pro",
    isUpgraded: plan !== "free",
    isLoaded: true,
  };
}
