import type {
    LanguageModelV3Middleware,
    LanguageModelV3StreamPart,
} from "@ai-sdk/provider";

// -----------------------------------
// Constants
// -----------------------------------

const WEKRAFT_TOPICS = [
    "wekraft", "project", "task", "issue", "sprint", "backlog",
    "kaya", "heatmap", "calendar", "time log", "standup", "burndown",
    "github", "vscode", "vs code", "extension", "repository", "repo", "webhook",
    "plan", "billing", "free", "plus", "pro", "invite", "member", "role",
    "owner", "admin", "viewer", "team",
    "bug", "error", "broken", "help", "support", "query", "ticket",
    "deadline", "milestone", "priority", "assignee", "status", "workflow",
];

const OFF_TOPIC_PATTERNS = [
    /\b(bitcoin|crypto|nft|trading|stock|forex)\b/i,
    /\b(recipe|cook|food|restaurant)\b/i,
    /\b(joke|poem|story|creative writing)\b/i,
    /\b(politics|election|government)\b/i,
    /\b(celebrity|movie|music|sports)\b/i,
];

const PII_PATTERNS: { pattern: RegExp; label: string }[] = [
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: "[EMAIL REDACTED]" },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, label: "[CARD REDACTED]" },
];

const OFF_TOPIC_REPLY =
    "I'm Wekraft's support assistant and can only help with questions about the Wekraft platform — " +
    "projects, tasks, issues, sprints, Kaya AI, billing, and integrations. " +
    "Please ask me something related to Wekraft!";

// -----------------------------------
// Helpers
// -----------------------------------

function isOnTopic(text: string): boolean {
    const lower = text.toLowerCase();
    for (const re of OFF_TOPIC_PATTERNS) {
        if (re.test(lower)) return false;
    }
    return WEKRAFT_TOPICS.some((kw) => lower.includes(kw));
}

function redactPII(text: string): string {
    let clean = text;
    for (const { pattern, label } of PII_PATTERNS) {
        clean = clean.replace(pattern, label);
    }
    return clean;
}

function getLastUserText(prompt: unknown): string | null {
    if (!Array.isArray(prompt)) return null;
    for (let i = prompt.length - 1; i >= 0; i--) {
        const msg = prompt[i];
        if (msg?.role !== "user") continue;
        const parts = Array.isArray(msg.content) ? msg.content : [];
        const textPart = parts.find((p: any) => p.type === "text");
        if (textPart?.text) return textPart.text as string;
    }
    return null;
}

// -----------------------------------
// Middleware — matches exact Vercel AI SDK docs shape
// -----------------------------------

export const wekraftGuardrailMiddleware: LanguageModelV3Middleware = {
    specificationVersion: "v3",
    // Runs before the model — blocks off-topic input
    transformParams: async ({ params }) => {
        const lastUserText = getLastUserText(params.prompt);

        if (lastUserText && !isOnTopic(lastUserText)) {
            const modifiedPrompt = (params.prompt as any[]).map((msg: any, idx: number, arr: any[]) => {
                if (idx === arr.length - 1 && msg.role === "user") {
                    return {
                        ...msg,
                        content: [
                            {
                                type: "text",
                                text: `The user asked something unrelated to Wekraft. Respond ONLY with this exact sentence: "${OFF_TOPIC_REPLY}"`,
                            },
                        ],
                    };
                }
                return msg;
            });

            return { ...params, prompt: modifiedPrompt };
        }

        return params;
    },

    // Runs after model response — scrubs PII (non-streaming)
    wrapGenerate: async ({ doGenerate }) => {
        const result = await doGenerate();

        // result.content holds the parts array per the SDK spec
        const cleanContent = result.content.map((part) => {
            if (part.type === "text") {
                return { ...part, text: redactPII(part.text) };
            }
            return part;
        });

        return { ...result, content: cleanContent };
    },

    // Runs after model response — scrubs PII (streaming)
    wrapStream: async ({ doStream }) => {
        const { stream, ...rest } = await doStream();

        const transformStream = new TransformStream<
            LanguageModelV3StreamPart,
            LanguageModelV3StreamPart
        >({
            transform(chunk, controller) {
                if (chunk.type === "text-delta") {
                    controller.enqueue({ ...chunk, delta: redactPII(chunk.delta) });
                } else {
                    controller.enqueue(chunk);
                }
            },
        });

        return {
            stream: stream.pipeThrough(transformStream),
            ...rest,
        };
    },
};