
import {
  MessageSquare,
  ExternalLink,
  Youtube,
  Code2,
  Trophy,
  Terminal,
  PieChart,
  Linkedin,
  Hash,
  Rss,
  type LucideIcon,
} from "lucide-react";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface StatItem {
  label: string;
  value: string | number;
  subValue?: string;
}

export interface PlatformStats {
  platform: string;
  stats: StatItem[];
}

export interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  placeholder: string;
  color: string;
  urlMatch: string;

  fetchStats?: (username: string, rawUrl: string) => Promise<StatItem[] | null>;
}

// ─── Fetchers (kept here so adding a platform = one place only) ──────────────

const TIMEOUT_MS = 6_000;

async function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, next: { revalidate: 0 } });
  } finally {
    clearTimeout(timer);
  }
}

async function devtoFetcher(username: string): Promise<StatItem[] | null> {
  const res = await timedFetch(
    `https://dev.to/api/users/by_username?url=${encodeURIComponent(username)}`
  );
  if (!res.ok) return null;
  const d = await res.json();
  return [
    { label: "Followers", value: d.followers_count ?? 0, subValue: "Community"  },
    { label: "Articles",  value: d.article_count  ?? 0, subValue: "Total Posts" },
  ];
}

async function stackOverflowFetcher(_username: string, rawUrl: string): Promise<StatItem[] | null> {
  const match = rawUrl.match(/users\/(\d+)/);
  if (!match) return null;
  const res = await timedFetch(
    `https://api.stackexchange.com/2.3/users/${match[1]}?site=stackoverflow`
  );
  if (!res.ok) return null;
  const d = await res.json();
  const u = d.items?.[0];
  if (!u) return null;
  return [
    { label: "Reputation", value: u.reputation           ?? 0, subValue: "Points" },
    { label: "Gold",       value: u.badge_counts?.gold   ?? 0, subValue: "Badges" },
    { label: "Silver",     value: u.badge_counts?.silver ?? 0, subValue: "Badges" },
    { label: "Bronze",     value: u.badge_counts?.bronze ?? 0, subValue: "Badges" },
  ];
}

async function codeforcesFetcher(username: string): Promise<StatItem[] | null> {
  const res = await timedFetch(
    `https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`
  );
  if (!res.ok) return null;
  const d = await res.json();
  if (d.status !== "OK" || !d.result?.[0]) return null;
  const u = d.result[0];
  return [
    { label: "Rating",       value: u.rating       ?? 0, subValue: u.rank    ?? "Unrated" },
    { label: "Max Rating",   value: u.maxRating    ?? 0, subValue: u.maxRank ?? "None"    },
    { label: "Contribution", value: u.contribution ?? 0, subValue: "Community"            },
  ];
}

async function leetcodeFetcher(username: string): Promise<StatItem[] | null> {
  const query = `{
    matchedUser(username: "${username}") {
      submitStats: submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
    }
  }`;
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const d = await res.json();
  const nums: { difficulty: string; count: number }[] =
    d?.data?.matchedUser?.submitStats?.acSubmissionNum ?? [];
  if (!nums.length) return null;
  const get = (diff: string) => nums.find((n) => n.difficulty === diff)?.count ?? 0;
  return [
    { label: "Solved", value: get("All"),    subValue: "All Difficulties" },
    { label: "Easy",   value: get("Easy"),   subValue: "Problems"         },
    { label: "Medium", value: get("Medium"), subValue: "Problems"         },
    { label: "Hard",   value: get("Hard"),   subValue: "Problems"         },
  ];
}

async function youtubeFetcher(username: string, rawUrl: string): Promise<StatItem[] | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("[youtubeFetcher] YOUTUBE_API_KEY is not set");
    return null;
  }

  // Resolve handle (@username) or channel ID from the URL
  // e.g. https://youtube.com/@ritesh or https://youtube.com/channel/UCxxxxxx
  let params: string;
  const channelMatch = rawUrl.match(/\/channel\/([A-Za-z0-9_-]+)/);
  const handleMatch  = rawUrl.match(/\/@([A-Za-z0-9_.-]+)/);

  if (channelMatch) {
    params = `id=${encodeURIComponent(channelMatch[1])}`;
  } else if (handleMatch) {
    params = `forHandle=${encodeURIComponent(handleMatch[1])}`;
  } else {
    // Fall back to the last URL segment as a handle
    params = `forHandle=${encodeURIComponent(username)}`;
  }

  const res = await timedFetch(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics&${params}&key=${apiKey}`
  );
  if (!res.ok) return null;

  const d = await res.json();
  const stats = d.items?.[0]?.statistics;
  if (!stats) return null;

  const fmt = (n: string | undefined) =>
    n ? parseInt(n, 10).toLocaleString("en") : "0";

  return [
    { label: "Subscribers", value: fmt(stats.subscriberCount), subValue: "Followers"   },
    { label: "Total Views", value: fmt(stats.viewCount),       subValue: "All Time"    },
    { label: "Videos",      value: stats.videoCount ?? 0,     subValue: "Uploaded"    },
  ];
}

// ─── Registry ─────────────────────────────────────────────────────────────────
// ↓ To add a new platform, add one entry here. That's it. ↓

export const PLATFORM_REGISTRY: PlatformConfig[] = [
  {
    id: "devto",
    name: "DEV.to",
    description: "Articles & followers",
    icon: MessageSquare,
    placeholder: "https://dev.to/username",
    color: "bg-black text-white",
    urlMatch: "dev.to",
    fetchStats: devtoFetcher,
  },
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    description: "Reputation & badges",
    icon: ExternalLink,
    placeholder: "https://stackoverflow.com/users/ID/username",
    color: "bg-orange-500 text-white",
    urlMatch: "stackoverflow.com",
    fetchStats: stackOverflowFetcher,
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Subscribers & views",
    icon: Youtube,
    placeholder: "https://youtube.com/@username",
    color: "bg-red-600 text-white",
    urlMatch: "youtube.com",
    fetchStats: youtubeFetcher,
  },
  {
    id: "codeforces",
    name: "CodeForces",
    description: "Rating & CP stats",
    icon: Code2,
    placeholder: "https://codeforces.com/profile/username",
    color: "bg-blue-500 text-white",
    urlMatch: "codeforces.com",
    fetchStats: codeforcesFetcher,
  },
  {
    id: "leetcode",
    name: "LeetCode",
    description: "Problems solved",
    icon: PieChart,
    placeholder: "https://leetcode.com/username",
    color: "bg-yellow-500 text-black",
    urlMatch: "leetcode.com",
    fetchStats: leetcodeFetcher,
  },
  // {
  //   id: "linkedin",
  //   name: "LinkedIn",
  //   description: "Professional network",
  //   icon: Linkedin,
  //   placeholder: "https://linkedin.com/in/username",
  //   color: "bg-[#0077b5] text-white",
  //   urlMatch: "linkedin.com",
  // },
  {
    id: "hackerrank",
    name: "HackerRank",
    description: "Coding stats",
    icon: Terminal,
    placeholder: "https://hackerrank.com/profile/username",
    color: "bg-green-600 text-white",
    urlMatch: "hackerrank.com",
  },
  {
    id: "kaggle",
    name: "Kaggle",
    description: "ML competitions",
    icon: Trophy,
    placeholder: "https://kaggle.com/username",
    color: "bg-blue-400 text-white",
    urlMatch: "kaggle.com",
  },
  // ── Add new platforms below ──────────────────────────────────────────────
  // {
  //   id: "hashnode",
  //   name: "Hashnode",
  //   description: "Blog articles",
  //   icon: Hash,
  //   placeholder: "https://hashnode.com/@username",
  //   color: "bg-[#2962FF] text-white",
  //   urlMatch: "hashnode.com",
  //   fetchStats: hashnodeFetcher,  // define fetcher above if needed
  // },
];
