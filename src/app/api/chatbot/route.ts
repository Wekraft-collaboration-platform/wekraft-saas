import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import { allDocs } from "@/lib/docs-config";

// Force load env variables from .env.local to override any system/shell variables
dotenv.config({
    path: path.resolve(process.cwd(), ".env.local"),
    override: true,
});

import { createOpenAI } from "@ai-sdk/openai";
import {
    convertToModelMessages,
    type InferUITools,
    stepCountIs,
    streamText,
    type ToolSet,
    tool,
    type UIDataTypes,
    type UIMessage,
    wrapLanguageModel,
} from "ai";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { wekraftGuardrailMiddleware } from "@/lib/middleware/wekraft-guardrail";
import { ratelimit } from "@/lib/rate-limit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// -----------------------------------
// Tools
// -----------------------------------
const allTools = {
    getSupportQueries: tool({
        description:
            "Fetch all previously submitted support queries for the current user. Use this when the user asks to see their tickets, past issues, or query history.",
        // @ts-expect-error
        inputSchema: z.object({
            userId: z.string(),
        }),
        // @ts-expect-error
        execute: async ({ userId }: { userId: Id<"users"> }) => {
            console.log("-------- getSupportQueries called --------", userId);
            const queries = await convex.query(api.support.getSupportQueriesForUser, {
                userId,
            });
            if (!queries || queries.length === 0) {
                return {
                    queries: [],
                    message: "No support queries found for this user.",
                };
            }
            return { queries };
        },
    }),

    createSupportQuery: tool({
        description:
            "Create a new support query / ticket on behalf of the user. Call this when the user reports a bug, asks for help, or wants to raise an issue with Wekraft",
        // @ts-ignore
        inputSchema: z.object({
            userId: z.string().describe("The Convex user ID raising the query"),
            title: z
                .string()
                .describe("Short, clear title summarising the issue (max ~80 chars)"),
            category: z
                .string()
                .describe(
                    "Category of the issue. One of: bug, billing, feature-request, account, integration, other",
                ),
            description: z
                .string()
                .describe(
                    "Detailed description of the issue — what happened, steps to reproduce, expected vs actual behaviour",
                ),
        }),
        // @ts-expect-error
        execute: async ({
            userId,
            title,
            category,
            description,
        }: {
            userId: Id<"users">;
            title: string;
            category: string;
            description: string;
        }) => {
            console.log("-------- createSupportQuery called --------", {
                userId,
                title,
                category,
            });
            const result = await convex.mutation(api.support.createQueryByAi, {
                userId,
                title,
                category,
                description,
            });

            if (!result.success) {
                return {
                    success: false,
                    message: `Failed to create query: ${result.error}`,
                };
            }

            return {
                success: true,
                message:
                    "Your support query has been logged successfully. The Wekraft team will review it and get back to you.",
            };
        },
    }),

    searchDocumentation: tool({
        description:
            "Search the Wekraft documentation to find relevant pages and their slugs based on keywords or user query. Returns page titles, descriptions, and slugs.",

        inputSchema: z.object({
            query: z.string().describe("Keywords to search for in page titles and descriptions"),
        }),

        execute: async ({ query }: { query: string }) => {
            console.log("-------- searchDocumentation called with query --------", query);

            // Clean query, tokenize, filter out common short words and stop words
            const words = query
                .toLowerCase()
                .replace(/[^\w\s-]/g, "") // keep hyphens
                .split(/\s+/)
                .filter((w) => w.length > 1 && !["how", "to", "the", "and", "for", "with", "this", "that", "you", "your", "can", "get", "what", "is", "an", "of", "in", "on", "at", "by", "install", "installation"].includes(w));

            // Also keep 'install' if it was the only keyword or add it to check
            const hasInstall = query.toLowerCase().includes("install");
            if (hasInstall && !words.includes("install")) {
                words.push("install");
            }

            console.log("Filtered keywords for doc search:", words);
            if (words.length === 0) {
                console.log("No valid search terms extracted, fallback to query contains matching");
                words.push(query.toLowerCase());
            }

            const results = [];
            for (const doc of allDocs) {
                let score = 0;
                const titleLower = doc.title.toLowerCase();
                const descLower = doc.description.toLowerCase();
                const slugLower = doc.slug.toLowerCase();

                // 1. Match title, description, slug
                for (const word of words) {
                    if (titleLower.includes(word)) {
                        score += 10;
                    }
                    if (descLower.includes(word)) {
                        score += 3;
                    }
                    if (slugLower.includes(word)) {
                        score += 5;
                    }
                }

                // 2. Scan actual file contents on disk
                try {
                    const filePath = path.join(process.cwd(), "src/content/docs", `${doc.slug}.md`);
                    if (fs.existsSync(filePath)) {
                        const contentLower = fs.readFileSync(filePath, "utf8").toLowerCase();
                        for (const word of words) {
                            const occurrences = contentLower.split(word).length - 1;
                            if (occurrences > 0) {
                                score += Math.min(occurrences, 5) * 1.5; // up to 7.5 pts for content match
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error reading ${doc.slug}.md during search:`, err);
                }

                if (score > 0) {
                    results.push({
                        title: doc.title,
                        slug: doc.slug,
                        description: doc.description,
                        score,
                    });
                }
            }

            // Sort by score descending
            results.sort((a, b) => b.score - a.score);
            const topResults = results.slice(0, 5);

            console.log("Search matched pages:", topResults.map(r => ({ slug: r.slug, score: r.score })));

            return {
                query,
                results: topResults,
            };
        },
    }),

    getDocumentationPage: tool({
        description:
            "Retrieve the raw markdown content of a specific Wekraft documentation page by its slug to get context about features, setups, flows, etc.",

        inputSchema: z.object({
            slug: z.string().describe("The slug of the documentation page (e.g., 'getting-started', 'repositories', 'extension', 'sprints', 'kaya-pm')"),
        }),

        execute: async ({ slug }: { slug: string }) => {
            console.log("-------- getDocumentationPage called for slug --------", slug);
            try {
                const filePath = path.join(process.cwd(), "src/content/docs", `${slug}.md`);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, "utf8");
                    console.log(`Successfully read ${slug}.md, content length: ${content.length} characters`);
                    return { slug, content };
                }
                console.error(`Documentation file not found at path: ${filePath}`);
                return { error: `Documentation page with slug '${slug}' not found.` };
            } catch (err: any) {
                console.error(`Error reading documentation file ${slug}.md:`, err);
                return { error: `Failed to read documentation page: ${err.message}` };
            }
        },
    }),
} satisfies ToolSet;

// -----------------------------------
// Types
// -----------------------------------
export type ChatbotTools = InferUITools<typeof allTools>;
export type ChatbotMessage = UIMessage<never, UIDataTypes, ChatbotTools>;

// -----------------------------------
// System Prompt — Wekraft knowledge
// -----------------------------------
const SYSTEM_PROMPT = (userId: string) =>
    `
You are the official AI support assistant for Wekraft (wekraft.xyz).
You help user understand this platform or solve their any related query and can createQuiery if user wants to contact with wekraft support team.

## About Wekraft
Wekraft is an AI-powered project management platform for modern software teams.
It unifies task tracking, sprint planning, team collaboration, and developer tooling
(VS Code extension + Kaya AI) in a single workspace. Currently in private beta.

## Core Concepts

### Projects
Top-level containers for all work. Public or private. Unique URL slug per project.
Work statuses: ideation → validation → development → beta → production → scaling.

### Tasks
Planned units of work. Statuses: not started → inprogress → reviewing → testing → completed.
Priority: high / medium / low. Can be assigned to members, linked to code paths, and grouped in sprints.

### Issues
Unplanned/reactive work — bugs, incidents, requests. 
Severity: critical / medium / low.
Environment: local / dev / staging / production.
Sources: manual, task escalation, GitHub import.
Lifecycle: not opened → opened → reopened → closed.
Closing an issue auto-unblocks any linked task.

### Sprints
Time-boxed work periods. States: planned → active → completed.
One active sprint per project at a time. Incomplete items return to backlog on completion.

### AI Agents (Kaya PM & Harry Dev)
- Kaya PM Agent: Built-in AI PM agent (Pro plan, 50 calls/month). Can plan sprints, analyse workloads, generate standups, and predict sprint risks.
- Harry Dev Agent: Built-in AI senior developer agent (Pro plan). Can monitor the codebase, detect bugs, review pull requests, and perform autonomous web research.

### VS Code Extension
Lets developers view/start/complete tasks and auto-log time without leaving their editor.
Free/Plus: view only. Pro: full two-way sync.

### GitHub Integration
Link a repo to sync GitHub Issues as Wekraft Issues. Commits/PRs visible in task timeline.


## Useful Links
- Docs: https://www.wekraft.xyz/web/docs
- Support email: support@wekraft.xyz
- Discord: https://discord.gg/zUXum4Z8
- Beta access: https://www.wekraft.xyz/we

## Your Behaviour
- Be concise, professional, and helpful.
- When the user reports a bug or issue, gather: category, and a clear description and form title by own.
- When the user asks about their past raised quiries or support tickets, call getSupportQueries.
- If a user asks questions about Wekraft's features, agents (like Kaya PM or Harry Dev), setup guides, navigation, options, billing, or pricing, use the searchDocumentation tool to find the relevant page slug, or call getDocumentationPage directly if you know the exact slug (e.g. 'getting-started', 'sprints', 'extension', 'kaya-pm', 'harry-dev'). Always read the documentation page to get accurate context before answering.
- The current user's ID is: ${userId}
- If you are unsure about something, direct the user to the docs or support@wekraft.xyz.
`.trim();

// -----------------------------------
// Route Handler
// -----------------------------------
export async function POST(req: Request) {
    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return new Response("Invalid JSON payload", { status: 400 });
        }

        const { messages, userId }: { messages: ChatbotMessage[]; userId: string } = body;

        console.log("Chatbot route hit — userId:", userId);

        // Strict rate limiting
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        const limitKey = userId ? `chatbot_rl_${userId}` : `chatbot_rl_ip_${ip}`;

        const { success, limit, reset, remaining } = await ratelimit.limit(limitKey);
        if (!success) {
            return new Response("Too many requests. Please try again later.", {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": reset.toString(),
                },
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        const customOpenai = createOpenAI({
            apiKey: apiKey,
        });

        if (!Array.isArray(messages)) {
            return new Response("messages must be an array", { status: 400 });
        }

        // const guardedModel = wrapLanguageModel({
        //     model: customOpenai("gpt-4.1-nano"),
        //     middleware: wekraftGuardrailMiddleware,
        // });

        const result = streamText({
            model: customOpenai("gpt-4.1-nano"),
            system: SYSTEM_PROMPT(userId),
            messages: await convertToModelMessages(messages),
            tools: allTools,
            toolChoice: "auto",
            stopWhen: stepCountIs(3),
            onFinish: async ({ text }) => {
                console.log("Chatbot response streamed:", text.slice(0, 20));
            },
        });

        return result.toUIMessageStreamResponse({
            sendReasoning: false,
            sendSources: false,
        });
    } catch (error) {
        console.error("Error in chatbot route:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
