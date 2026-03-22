export type DeveloperArchetype =
  | "The Mentor"
  | "The All-Rounder"
  | "The Merger"
  | "The Closer"
  | "The Reviewer"
  | "The Lone Wolf"
  | "The Ghost";

export interface GitHubStats {
  totalCommits: number;
  totalPRs: number;
  totalMergedPRs: number;
  totalIssuesClosed: number;
  totalReviews: number;
}

export interface PenaltyEntry {
  code: string;
  label: string;
  roastLine: string;
  multiplier: number;
}

export interface BonusEntry {
  code: string;
  label: string;
  multiplier: number;
}

export interface ImpactScoreResult {
  rawScore: number;
  archetype: DeveloperArchetype;
  archetypeTagline: string;
  breakdown: {
    commits: number;
    prs: number;
    issues: number;
    reviews: number;
    mergedPrs: number;
    mergeRateBonus: number;
  };
  signals: {
    isSheriff: boolean;
    isIssueCloser: boolean;
    isHighMergeRate: boolean;
    isConsistentContributor: boolean;
    isCommitSpammer: boolean;
    isCollaborationWeak: boolean;
  };
  displayScore: number;
  tier: string;
  eliteBadge: string | null;
  weightedActivity: number;
  consistencyBonus: number;
  penalties: PenaltyEntry[];
  bonuses: BonusEntry[];
  penaltyFloorApplied: boolean;
}

export const CONFIG = {
  weights: {
    commits: 0.8,
    prs: 3,
    mergedPrs: 3, 
    issues: 3,    
    reviews: 2,   
  },
  yearlyCommitCap: 2000,
  scoreDivisor: 18,      
  penaltyFloor: 0.4,     
  mergeRateMultipliers: [
    { threshold: 0.9, multiplier: 1.2 },
    { threshold: 0.75, multiplier: 1.05 },
    { threshold: 0.5, multiplier: 1.0 },
    { threshold: 0.25, multiplier: 0.8 },
    { threshold: 0.0, multiplier: 0.6 },
  ],
};