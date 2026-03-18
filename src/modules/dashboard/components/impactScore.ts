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

export function calculateImpactScore(stats: GitHubStats): ImpactScoreResult {
  const { weights, commitCapPerDay, scoreDivisor, penaltyFloor } = CONFIG;

  // Effective commits (capped)
  const effectiveCommits = Math.min(
    stats.totalCommits,
    stats.accountAgeInYears * 365 * commitCapPerDay,
  );

  // Merge rate
  const mergeRate =
    stats.totalPRs > 0 ? stats.totalMergedPRs / stats.totalPRs : 0;
  const mergeMultiplier = getMergeRateMultiplier(mergeRate);

  // Weighted breakdown
  const breakdown = {
    commits: effectiveCommits * weights.commits,
    prs: stats.totalPRs * weights.prs * mergeMultiplier,
    issues: stats.totalIssuesClosed * weights.issues,
    reviews: stats.totalReviews * weights.reviews,
    mergeRateBonus: stats.totalPRs * weights.prs * (mergeMultiplier - 1),
  };

  const weightedActivity =
    breakdown.commits + breakdown.prs + breakdown.issues + breakdown.reviews;

  // Age normalization
  const ageFactor = Math.max(Math.sqrt(stats.accountAgeInYears), 0.5);
  let baseScore = weightedActivity / ageFactor / scoreDivisor;
  const baseScoreClean = baseScore; // preserved for penalty floor recalc

  // ── Penalties ──
  const penalties: PenaltyEntry[] = [];
  const commitToPRRatio = stats.totalCommits / Math.max(stats.totalPRs, 1);

  const penaltyDefs: Array<[boolean, PenaltyEntry]> = [
    [
      commitToPRRatio > 50,
      {
        code: "COMMIT_SPAM",
        label: "Commit Farmer",
        roastLine: `${stats.totalCommits} commits, ${stats.totalPRs} PRs. We see you. 🌾`,
        multiplier: 0.7,
      },
    ],
    [
      commitToPRRatio > 30 && commitToPRRatio <= 50,
      {
        code: "COMMIT_HEAVY",
        label: "Flying Solo",
        roastLine: "Mostly solo commits. PRs show the real work.",
        multiplier: 0.85,
      },
    ],
    [
      stats.totalPRs < 50 && stats.accountAgeInYears >= 2,
      {
        code: "LOW_PR_COUNT",
        label: "Low Collaboration",
        roastLine: `${stats.accountAgeInYears.toFixed(1)} years in, under 50 PRs.`,
        multiplier: 0.9,
      },
    ],
    [
      stats.totalReviews < 20 && stats.accountAgeInYears >= 2,
      {
        code: "LOW_REVIEWS",
        label: "Silent Reviewer",
        roastLine: "Reviews help your team. Start leaving them.",
        multiplier: 0.9,
      },
    ],
    [
      mergeRate < 0.25 && stats.totalPRs >= 20,
      {
        code: "LOW_MERGE_RATE",
        label: "Drafts in the Dark",
        roastLine: `${Math.round(mergeRate * 100)}% merge rate. Quality over quantity.`,
        multiplier: 0.85,
      },
    ],
  ];

  for (const [condition, entry] of penaltyDefs) {
    if (condition) {
      penalties.push(entry);
      baseScore *= entry.multiplier;
    }
  }

  // Penalty floor — max 50% total damage
  let penaltyFloorApplied = false;
  const totalPenalty = penalties.reduce((acc, p) => acc * p.multiplier, 1);
  if (totalPenalty < penaltyFloor) {
    baseScore = baseScoreClean * penaltyFloor;
    penaltyFloorApplied = true;
  }

  // ── Bonuses ──
  const bonuses: BonusEntry[] = [];

  const bonusDefs: Array<[boolean, BonusEntry]> = [
    [
      stats.totalReviews >= 100,
      { code: "SHERIFF", label: "Code Sheriff", multiplier: 1.2 },
    ],
    [
      stats.totalReviews >= 30 &&
        stats.totalReviews > stats.totalPRs / 2 &&
        stats.totalReviews < 100,
      { code: "REVIEW_CULTURE", label: "Strong Reviewer", multiplier: 1.12 },
    ],
    [
      stats.totalIssuesClosed >= 50,
      { code: "ISSUE_CLOSER", label: "Issue Closer", multiplier: 1.1 },
    ],
    [
      mergeRate >= 0.75 && stats.totalPRs >= 30,
      { code: "HIGH_MERGE_RATE", label: "High Signal PRs", multiplier: 1.1 },
    ],
  ];

  for (const [condition, entry] of bonusDefs) {
    if (condition) {
      bonuses.push(entry);
      baseScore *= entry.multiplier;
    }
  }

  // ── Consistency bonus ──
  const activityTypes = [
    effectiveCommits > 50,
    stats.totalPRs > 10,
    stats.totalIssuesClosed > 5,
    stats.totalReviews > 10,
  ].filter(Boolean).length;

  const consistencyBonus =
    activityTypes >= 4 ? 1.15 : activityTypes >= 3 ? 1.05 : 1.0;

  if (activityTypes >= 4) {
    bonuses.push({
      code: "ALL_ROUNDER",
      label: "All-Rounder",
      multiplier: 1.15,
    });
  }

  const rawScore = Math.round(baseScore * consistencyBonus);

  // ── Signals ──
  const signals = {
    isSheriff: stats.totalReviews >= 100,
    isIssueCloser: stats.totalIssuesClosed >= 50,
    isHighMergeRate: mergeRate >= 0.75 && stats.totalPRs >= 30,
    isConsistentContributor: activityTypes >= 4,
    isCommitSpammer: commitToPRRatio > 50,
    isCollaborationWeak:
      stats.totalPRs < 50 &&
      stats.totalReviews < 20 &&
      stats.accountAgeInYears >= 2,
  };

  const { archetype, archetypeTagline } = deriveArchetype(stats, activityTypes);

  return {
    rawScore,
    archetype,
    archetypeTagline,
    breakdown,
    signals,
    penalties,
    bonuses,
    penaltyFloorApplied,
  };
}
