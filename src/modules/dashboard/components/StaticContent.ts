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
  accountAgeInYears: number;
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
  penalties: PenaltyEntry[];
  bonuses: BonusEntry[];
  penaltyFloorApplied: boolean;
}

export const CONFIG = {
  weights: {
    commits: 1,
    prs: 3,
    issues: 2.5,
    reviews: 2,
  },
  commitCapPerDay: 10,
  scoreDivisor: 14,
  penaltyFloor: 0.5,
  mergeRateMultipliers: [
    { threshold: 0.9, multiplier: 1.3 },
    { threshold: 0.75, multiplier: 1.15 },
    { threshold: 0.5, multiplier: 1.0 },
    { threshold: 0.25, multiplier: 0.9 },
    { threshold: 0.0, multiplier: 0.75 },
  ],
};