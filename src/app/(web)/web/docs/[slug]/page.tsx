import React from "react";
import fs from "fs";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Lightbulb,
  OctagonX,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import path from "path";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyButton } from "../../../../../components/CopyButton";
import { FeedbackWidget } from "../../../../../components/FeedbackWidget";
import { TableOfContents } from "../../../../../components/TableOfContents";
import { allDocs, docsConfig } from "@/lib/docs-config";

export async function generateStaticParams() {
  return allDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = allDocs.find((d) => d.slug === slug);

  if (!doc) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: `${doc.title} | Wekraft Documentation`,
      description: doc.description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${doc.title} | Wekraft Documentation`,
      description: doc.description,
    },
  };
}

// Helper to generate IDs from text or React nodes
const slugify = (text: any): string => {
  if (typeof text !== "string") {
    if (Array.isArray(text)) {
      text = text.map((t) => (typeof t === "string" ? t : "")).join("");
    } else {
      text = String(text);
    }
  }
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

// Calculate reading time from word count
function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Extract plain-text headings from markdown for the TOC
function extractHeadings(content: string) {
  const lines = content.split("\n");
  const headings: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)/);
    if (m) {
      const text = m[2].trim();
      const id = slugify(text);
      headings.push({ level: m[1].length, text, id });
    }
  }
  return headings;
}

// Parse callout type from blockquote content
function parseCallout(children: React.ReactNode): {
  type: string;
  content: React.ReactNode;
} | null {
  if (!children) return null;

  // Extract text content to check for callout pattern
  const childArray = Array.isArray(children) ? children : [children];

  for (const child of childArray) {
    if (
      child &&
      typeof child === "object" &&
      "props" in child &&
      child.props?.children
    ) {
      const innerChildren = Array.isArray(child.props.children)
        ? child.props.children
        : [child.props.children];

      for (const inner of innerChildren) {
        if (typeof inner === "string") {
          const match = inner.match(
            /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/,
          );
          if (match) {
            const type = match[1];
            const remaining = inner.replace(match[0], "").trimStart();
            // Reconstruct children without the callout marker
            const newChildren = innerChildren.map((c: any) =>
              c === inner ? remaining : c,
            );
            return {
              type,
              content: newChildren.length === 1 ? newChildren[0] : newChildren,
            };
          }
        }
      }
    }
  }
  return null;
}

const calloutStyles: Record<
  string,
  { bg: string; border: string; icon: any; text: string; label: string }
> = {
  NOTE: {
    bg: "bg-zinc-900/40",
    border: "border-zinc-700/50",
    icon: Info,
    text: "text-zinc-300",
    label: "Note",
  },
  TIP: {
    bg: "bg-zinc-900/40",
    border: "border-zinc-700/50",
    icon: Lightbulb,
    text: "text-zinc-300",
    label: "Tip",
  },
  IMPORTANT: {
    bg: "bg-zinc-900/40",
    border: "border-zinc-700/50",
    icon: Info,
    text: "text-zinc-300",
    label: "Important",
  },
  WARNING: {
    bg: "bg-amber-950/30",
    border: "border-amber-500/30",
    icon: AlertTriangle,
    text: "text-amber-300/80",
    label: "Warning",
  },
  CAUTION: {
    bg: "bg-red-950/30",
    border: "border-red-500/30",
    icon: OctagonX,
    text: "text-red-300/80",
    label: "Caution",
  },
};

function parseLineBreaks(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") {
    const parts = node.split(/<br\s*\/?>/i);
    if (parts.length === 1) return node;

    return parts.reduce((acc: React.ReactNode[], part, index) => {
      if (index > 0) {
        acc.push(<br key={`br-${index}`} />);
      }
      if (part) {
        acc.push(part);
      }
      return acc;
    }, []);
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => (
      <React.Fragment key={idx}>{parseLineBreaks(child)}</React.Fragment>
    ));
  }

  if (node && typeof node === "object" && "props" in node) {
    const element = node as React.ReactElement;
    const props = element.props as any;
    if (props && props.children) {
      return React.cloneElement(element, {
        ...props,
        children: parseLineBreaks(props.children),
      });
    }
  }

  return node;
}

// Custom markdown components
const markdownComponents: Components = {
  h1: ({ children }) => (
    <>
      <h1 className="text-[2.2rem] font-bold text-white tracking-tight mt-0 mb-4 leading-snug">
        {children}
      </h1>
      <div className="flex items-center gap-6 text-[0.9rem] text-[#a3a3a3] mb-8 border-b border-white/8 pb-8">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span data-reading-time>5 min read</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Updated May 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Wekraft Team</span>
        </div>
      </div>
    </>
  ),
  h2: ({ children }) => {
    const id = slugify(children);
    return (
      <h2
        id={id}
        className="text-[1.2rem] font-semibold text-[#e5e5e5] mt-12 mb-4 pb-3 scroll-mt-24 border-b border-white/8"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(children);
    return (
      <h3
        id={id}
        className="text-[0.95rem] font-semibold text-[#e5e5e5] mt-8 mb-3 scroll-mt-24"
      >
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-[0.925rem] text-[#a3a3a3] leading-[1.8] mb-5">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/40 hover:decoration-blue-400/70 transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-5 space-y-2.5">{children}</ul>,
  ol: ({ children }) => (
    <ol className="my-5 space-y-2.5 list-none counter-reset-item">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-3 text-[0.925rem] text-[#a3a3a3] leading-[1.7]">
      <span className="mt-[0.55rem] h-[5px] w-[5px] rounded-full bg-white/20 shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => {
    // Check for GitHub-style callouts
    const callout = parseCallout(children);

    if (callout && calloutStyles[callout.type]) {
      const style = calloutStyles[callout.type];
      const IconComp = style.icon;

      return (
        <div
          className={`my-6 rounded-lg border-l-[3px] ${style.border} ${style.bg} py-3 px-4`}
        >
          <div className={`flex items-center gap-2 mb-2 ${style.text}`}>
            <IconComp className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {style.label}
            </span>
          </div>
          <div
            className={`text-[0.875rem] ${style.text} leading-[1.7] [&>p]:mb-0 [&>p]:${style.text}`}
          >
            {callout.content}
          </div>
        </div>
      );
    }

    // Default blockquote
    return (
      <blockquote className="my-6 pl-4 border-l-2 border-zinc-700/50 bg-zinc-900/30 rounded-r-lg py-3 pr-4">
        <div className="text-[0.875rem] text-zinc-400 leading-[1.7] [&>p]:mb-0 [&>p]:text-zinc-400">
          {children}
        </div>
      </blockquote>
    );
  },
  code: ({ className, children, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="text-[0.8rem] font-mono text-zinc-200 bg-zinc-900/50 border border-zinc-700/40 rounded-md px-1.5 py-0.5 whitespace-nowrap">
          {children}
        </code>
      );
    }
    return (
      <code
        className="text-[0.8rem] font-mono text-white/75 leading-6"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    // Extract text content for copy button
    const extractText = (node: any): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (node?.props?.children) return extractText(node.props.children);
      return "";
    };

    const codeText = extractText(children);

    return (
      <div className="relative group my-6">
        <pre className="overflow-x-auto rounded-xl bg-[#0c0c0c] border border-white/8 px-5 py-4 text-[0.8rem] font-mono leading-6 shadow-inner">
          {children}
        </pre>
        <CopyButton text={codeText} />
      </div>
    );
  },
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/8 shadow-sm">
      <table className="w-full text-[0.875rem] border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/[0.04]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-5 py-3 text-left text-[0.7rem] font-semibold text-white/35 uppercase tracking-widest border-b border-white/8 border-r border-white/8 last:border-r-0 first:whitespace-nowrap">
      {parseLineBreaks(children)}
    </th>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.015] transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }) => (
    <td className="px-5 py-3 text-[#a3a3a3] text-[0.875rem] leading-relaxed align-top border-r border-white/5 last:border-r-0 first:whitespace-nowrap first:font-medium">
      {parseLineBreaks(children)}
    </td>
  ),
  hr: () => <hr className="my-10 border-white/8" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-[#e5e5e5]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-[#a3a3a3]">{children}</em>,
};

export default async function DocPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "src/content/docs", `${slug}.md`);

  if (!fs.existsSync(filePath)) notFound();

  const content = fs.readFileSync(filePath, "utf8");
  const docInfo = allDocs.find((d) => d.slug === slug);
  const headings = extractHeadings(content);
  const readingTime = calculateReadingTime(content);

  // Prev / Next
  const flat = allDocs;
  const currentIdx = flat.findIndex((d) => d.slug === slug);
  const prevDoc = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const nextDoc = currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;

  // Find category
  const category = Object.entries(docsConfig).find(([, items]) =>
    items.some((i) => i.slug === slug),
  )?.[0];

  // Inject reading time into content rendering by replacing the placeholder
  const contentWithMeta = content.replace(
    /^# .+$/m,
    (match) => match,
  );

  return (
    <div className="flex gap-12 xl:gap-16 w-full">
      {/* Main article */}
      <div className="min-w-0 flex-1 pb-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-[11px] font-medium text-white/20 tracking-wide">
          <span>Docs</span>
          {category && (
            <>
              <ChevronRight className="h-3 w-3 text-white/12" />
              <span>{category}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-white/12" />
          <span className="text-white/45">{docInfo?.title}</span>
        </div>

        {/* Badge above title */}
        {docInfo?.badge && (
          <span className="inline-block mb-3 text-[10px] font-semibold tracking-wide rounded-full px-2.5 py-1 border bg-blue-500/10 text-blue-400 border-blue-500/20">
            {docInfo.badge}
          </span>
        )}

        {/* Reading time override */}
        <div className="hidden" data-reading-time-value={readingTime} />

        {/* Markdown content */}
        <article className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ...markdownComponents,
              h1: ({ children }) => (
                <>
                  <h1 className="text-[2.2rem] font-bold text-white tracking-tight mt-0 mb-4 leading-snug">
                    {children}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[0.8rem] sm:text-[0.9rem] text-[#a3a3a3] mb-8 border-b border-white/8 pb-8">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{readingTime} min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Updated May 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Wekraft Team</span>
                    </div>
                  </div>
                </>
              ),
            }}
          >
            {contentWithMeta}
          </ReactMarkdown>
        </article>

        {/* Feedback widget */}
        <FeedbackWidget />

        {/* Prev / Next Nav */}
        <div className="mt-12 pt-6 border-t border-white/8 flex items-center justify-between">
          {prevDoc ? (
            <Button variant="ghost" asChild className="h-auto py-3 px-4 flex-col items-start text-left gap-1">
              <Link href={`/web/docs/${prevDoc.slug}`}>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                  Previous
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-white/70">
                  <ChevronLeft className="h-4 w-4 text-white/40 shrink-0" />
                  {prevDoc.title}
                </span>
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {nextDoc ? (
            <Button variant="ghost" asChild className="h-auto py-3 px-4 flex-col items-end text-right gap-1">
              <Link href={`/web/docs/${nextDoc.slug}`}>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                  Next
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-white/70">
                  {nextDoc.title}
                  <ChevronRight className="h-4 w-4 text-white/40 shrink-0" />
                </span>
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Right TOC — hidden on small screens */}
      {headings.length > 0 && <TableOfContents headings={headings} />}
    </div>
  );
}