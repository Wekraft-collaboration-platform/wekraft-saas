import {
  DeveloperArchetype,
  GitHubStats,
  ImpactScoreResult,
  PenaltyEntry,
  BonusEntry,
  CONFIG,
} from "./StaticContent";

function getMergeRateMultiplier(mergeRate: number): number {
  for (const { threshold, multiplier } of CONFIG.mergeRateMultipliers) {
    if (mergeRate >= threshold) return multiplier;
  }
  return 0.75;
}

function deriveArchetype(
  stats: GitHubStats,
  activityTypes: number,
): { archetype: DeveloperArchetype; archetypeTagline: string } {
  const total =
    stats.totalCommits +
    stats.totalPRs +
    stats.totalIssuesClosed +
    stats.totalReviews;

  const checks: Array<[boolean, DeveloperArchetype, string]> = [
    [total < 20, "The Ghost", "Not much signal here yet."],
    [
      activityTypes >= 4,
      "The All-Rounder",
      "Strong across every dimension. Rare.",
    ],
    [
      stats.totalReviews > stats.totalPRs * 1.2 && stats.totalReviews > 50,
      "The Mentor",
      "Ships less, unblocks more. Senior energy.",
    ],
    [
      stats.totalIssuesClosed > stats.totalPRs * 1.5 &&
        stats.totalIssuesClosed > 30,
      "The Closer",
      "Finds problems. Closes them. Moves on.",
    ],
    [
      stats.totalReviews > stats.totalPRs * 0.8 && stats.totalReviews > 30,
      "The Reviewer",
      "Your code doesn't ship without their eyes.",
    ],
    [
      stats.totalPRs > 100 && stats.totalPRs > stats.totalCommits * 0.08,
      "The Merger",
      "Collaboration is the default mode.",
    ],
    [
      stats.totalCommits > 500 && stats.totalPRs < 30,
      "The Lone Wolf",
      "Ships hard. Collaborates rarely.",
    ],
  ];

  for (const [condition, archetype, tagline] of checks) {
    if (condition) return { archetype, archetypeTagline: tagline };
  }

  return { archetype: "The Merger", archetypeTagline: "Solid contributor." };
}

function getTier(score: number): string {
  if (score >= 150) return "LEGEND";
  if (score >= 100) return "MASTER";
  if (score >= 70) return "PRO";
  if (score >= 50) return "GRINDER";
  if (score >= 30) return "ROOKIE";
  return "NEWBIE";
}

export function calculateImpactScore(stats: GitHubStats): ImpactScoreResult {
  const { weights, yearlyCommitCap, scoreDivisor, penaltyFloor } = CONFIG;

  // 1. Raw Stats (Unlimited Age Influence Removal)
  const effectiveCommits = Math.min(stats.totalCommits, yearlyCommitCap);
  const mergeRate = stats.totalPRs > 0 ? stats.totalMergedPRs / stats.totalPRs : 0;
  
  // 2. Weighted Impact Breakdown (More strict on output)
  const breakdown = {
    commits: effectiveCommits * weights.commits,
    prs: stats.totalPRs * weights.prs,
    issues: stats.totalIssuesClosed * weights.issues,
    reviews: stats.totalReviews * weights.reviews,
    mergedPrs: stats.totalMergedPRs * weights.mergedPrs,
    mergeRateBonus: 0, // Simplified out
  };

  const weightedActivity =
    breakdown.commits +
    breakdown.prs +
    breakdown.issues +
    breakdown.reviews +
    breakdown.mergedPrs;

  let baseScore = weightedActivity / scoreDivisor;
  const baseScoreClean = baseScore;

  // 3. Strict Penalties (The "Punishment" Layer)
  const penalties: PenaltyEntry[] = [];
  const commitToPRRatio = stats.totalCommits / Math.max(stats.totalPRs, 1);
  const collaborationScore = stats.totalIssuesClosed + stats.totalReviews;

  const penaltyDefs: Array<[boolean, PenaltyEntry]> = [
    [
      collaborationScore < 40, // Increased from 15 - You need real activity to dodge this
      {
        code: "LOW_COLLAB",
        label: "Isolationist",
        roastLine: "Collaborative activity is low. Impact is usually shared, not solo.",
        multiplier: 0.6,
      },
    ],
    [
      commitToPRRatio > 15 && stats.totalCommits > 100, // Lowered from 30 - strict ratio check
      {
        code: "COMMIT_FARMER",
        label: "Commit Spammer",
        roastLine: "Your commit-to-PR ratio is suspicious. Quality over quantity.",
        multiplier: 0.7,
      },
    ],
    [
      stats.totalCommits > 1500 && collaborationScore < 80, // New: Massive commits must have massive collab
      {
        code: "SILO_DIVER",
        label: "Deep Silo",
        roastLine: "High volume, low noise. Are you even talking to your team?",
        multiplier: 0.8,
      },
    ],
    [
      mergeRate < 0.7 && stats.totalPRs >= 10, // Stricter merge rate
      {
        code: "DRAFT_KING",
        label: "Unfinished Business",
        roastLine: "A low merge rate suggests poor PR quality or unfinished work.",
        multiplier: 0.75,
      },
    ],
    [
      stats.totalIssuesClosed < 10, // Stricter issues
      {
        code: "BUG_SILENCE",
        label: "Bug Avoider",
        roastLine: "Almost zero issues closed. Great devs fix problems, not just write code.",
        multiplier: 0.9,
      },
    ],
  ];

  for (const [condition, entry] of penaltyDefs) {
    if (condition) {
      penalties.push(entry);
      baseScore *= entry.multiplier;
    }
  }

  // Multiply by merge rate multiplier from CONFIG
  baseScore *= getMergeRateMultiplier(mergeRate);

  // Penalty floor
  let penaltyFloorApplied = false;
  const totalPenalty = penalties.reduce((acc, p) => acc * p.multiplier, 1);
  if (totalPenalty < penaltyFloor) {
    baseScore = baseScoreClean * penaltyFloor;
    penaltyFloorApplied = true;
  }

  // 4. Elite Bonuses (Hard to get)
  const bonuses: BonusEntry[] = [];
  const activityTypes = [
    effectiveCommits > 500,
    stats.totalPRs > 40,
    stats.totalIssuesClosed > 20,
    stats.totalReviews > 40,
  ].filter(Boolean).length;

  const bonusDefs: Array<[boolean, BonusEntry]> = [
    [
      activityTypes >= 4,
      { code: "ALL_ROUNDER", label: "Master Professional", multiplier: 1.3 },
    ],
    [
      stats.totalMergedPRs >= 100,
      { code: "LEGENDARY_SHIPPER", label: "Force of Nature", multiplier: 1.2 },
    ],
    [
      stats.totalReviews >= 100,
      { code: "GUARDIAN", label: "Code Guardian", multiplier: 1.15 },
    ],
  ];

  for (const [condition, entry] of bonusDefs) {
    if (condition) {
      bonuses.push(entry);
      baseScore *= entry.multiplier;
    }
  }

  const rawScore = Math.round(baseScore);
  const consistencyBonus = activityTypes >= 4 ? 1.3 : activityTypes >= 3 ? 1.1 : 1.0;

  // 5. Signals & Archetype
  const signals = {
    isSheriff: stats.totalReviews >= 60,
    isIssueCloser: stats.totalIssuesClosed >= 30,
    isHighMergeRate: mergeRate >= 0.8,
    isConsistentContributor: activityTypes >= 4,
    isCommitSpammer: commitToPRRatio > 40,
    isCollaborationWeak: collaborationScore < 15,
  };

  const { archetype, archetypeTagline } = deriveArchetype(stats, activityTypes);

  return {
    rawScore,
    displayScore: rawScore,
    tier: getTier(rawScore),
    eliteBadge: rawScore >= 120 ? "Legendary Contributor" : rawScore >= 95 ? "Senior Architect" : null,
    weightedActivity,
    consistencyBonus,
    archetype,
    archetypeTagline,
    breakdown,
    signals,
    penalties,
    bonuses,
    penaltyFloorApplied,
  };
}
