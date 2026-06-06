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
import Mermaid from "@/components/Mermaid";
import StructuredData from "@/components/StructuredData";

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
    alternates: {
      canonical: `https://wekraft.xyz/web/docs/${slug}`,
    },
    openGraph: {
      title: `${doc.title} | WeKraft Documentation`,
      description: doc.description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${doc.title} | WeKraft Documentation`,
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
    bg: "bg-zinc-900/30",
    border: "border-zinc-700/50",
    icon: Info,
    text: "text-zinc-300",
    label: "Note",
  },
  TIP: {
    bg: "bg-zinc-900/30",
    border: "border-zinc-700/50",
    icon: Lightbulb,
    text: "text-zinc-300",
    label: "Tip",
  },
  IMPORTANT: {
    bg: "bg-zinc-900/30",
    border: "border-zinc-700/50",
    icon: Info,
    text: "text-zinc-300",
    label: "Important",
  },
  WARNING: {
    bg: "bg-amber-950/20",
    border: "border-amber-500/30",
    icon: AlertTriangle,
    text: "text-amber-200/80",
    label: "Warning",
  },
  CAUTION: {
    bg: "bg-red-950/20",
    border: "border-red-500/30",
    icon: OctagonX,
    text: "text-red-200/80",
    label: "Caution",
  },
};

function parseHtmlTags(node: React.ReactNode): React.ReactNode {
  if (!node) return node;
  if (typeof node === "string") {
    const regex = /(<br\s*\/?>|<kbd>.*?<\/kbd>)/gi;
    const parts = node.split(regex);
    if (parts.length === 1) return node;

    return parts.map((part, index) => {
      if (part.toLowerCase().startsWith("<br")) {
        return <br key={`br-${index}`} />;
      }
      if (part.toLowerCase().startsWith("<kbd>")) {
        const innerText = part.substring(5, part.length - 6);
        return (
          <kbd
            key={`kbd-${index}`}
            className="inline-block px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none text-[#e5e5e5] bg-[#1c1c1e] border border-white/10 rounded shadow-[0_1.5px_0_0.5px_rgba(255,255,255,0.08)] mx-0.5 select-none align-middle"
          >
            {innerText}
          </kbd>
        );
      }
      return part;
    });
  }

  if (Array.isArray(node)) {
    return node.map((child, idx) => (
      <React.Fragment key={idx}>{parseHtmlTags(child)}</React.Fragment>
    ));
  }

  if (node && typeof node === "object" && "props" in node) {
    const element = node as React.ReactElement;
    const props = element.props as any;
    if (props && props.children) {
      return React.cloneElement(element, {
        ...props,
        children: parseHtmlTags(props.children),
      });
    }
  }

  return node;
}

// Custom markdown components
const markdownComponents: Components = {
  h1: ({ children }) => (
    <>
      <h1 className="text-[2rem] font-bold text-white tracking-tight mt-0 mb-4 leading-tight">
        {parseHtmlTags(children)}
      </h1>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[0.8rem] sm:text-[0.9rem] text-[#8a8b92] mb-8 border-b border-white/8 pb-8">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/30" />
          <span data-reading-time>5 min read</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/30" />
          <span>Updated May 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-white/30" />
          <span>WeKraft Team</span>
        </div>
      </div>
    </>
  ),
  h2: ({ children }) => {
    const id = slugify(children);
    return (
      <h2
        id={id}
        className="text-[1.25rem] font-semibold text-[#f5f5f7] mt-12 mb-4 scroll-mt-24 tracking-tight"
      >
        {parseHtmlTags(children)}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugify(children);
    return (
      <h3
        id={id}
        className="text-[1.05rem] font-semibold text-[#f5f5f7] mt-8 mb-3 scroll-mt-24 tracking-tight"
      >
        {parseHtmlTags(children)}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-[15px] text-[#8a8b92] leading-7 mb-5 tracking-[-0.01em] font-normal">
      {parseHtmlTags(children)}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/30 hover:decoration-blue-400/50 transition-colors font-medium"
    >
      {parseHtmlTags(children)}
    </a>
  ),
  ul: ({ children }) => <ul className="my-5 pl-5 list-disc space-y-2 mb-5 text-[15px] text-[#8a8b92] leading-7">{children}</ul>,
  ol: ({ children }) => (
    <ol className="my-5 pl-5 list-decimal space-y-2 mb-5 text-[15px] text-[#8a8b92] leading-7">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1">
      {parseHtmlTags(children)}
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
          className={`my-6 rounded-lg border-l-[3px] ${style.border} ${style.bg} py-3.5 px-4`}
        >
          <div className={`flex items-center gap-2 mb-2 ${style.text}`}>
            <IconComp className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {style.label}
            </span>
          </div>
          <div
            className={`text-[14px] ${style.text} leading-6 [&>p]:mb-0 [&>p]:${style.text}`}
          >
            {callout.content}
          </div>
        </div>
      );
    }

    // Default blockquote
    return (
      <blockquote className="my-6 pl-4 border-l-2 border-zinc-700 bg-zinc-900/10 rounded-r-lg py-3.5 pr-4">
        <div className="text-[14px] text-zinc-400 leading-6 [&>p]:mb-0 [&>p]:text-zinc-400">
          {children}
        </div>
      </blockquote>
    );
  },
  code: ({ className, children, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="text-[13.5px] font-mono text-[#e5e5e5] bg-white/[0.06] border border-white/8 rounded-md px-1.5 py-0.5 whitespace-nowrap font-medium">
          {parseHtmlTags(children)}
        </code>
      );
    }
    return (
      <code
        className="text-[13px] font-mono text-white/75 leading-6"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    // Check if first child is a code block containing language-mermaid
    const codeElement = React.Children.toArray(children)[0] as React.ReactElement<any>;
    const isMermaid = codeElement?.props?.className === "language-mermaid" || 
                      (codeElement?.props?.className && codeElement.props.className.includes("language-mermaid"));

    // Extract text content for copy button or chart input
    const extractText = (node: any): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(extractText).join("");
      if (node?.props?.children) return extractText(node.props.children);
      return "";
    };

    const codeText = extractText(children);

    if (isMermaid) {
      return <Mermaid chart={codeText.trim()} />;
    }

    return (
      <div className="relative group my-6">
        <pre className="overflow-x-auto rounded-xl bg-[#0c0c0c] border border-white/8 px-5 py-4 text-[13px] font-mono leading-6 shadow-inner">
          {children}
        </pre>
        <CopyButton text={codeText} />
      </div>
    );
  },
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/8 shadow-sm">
      <table className="w-full text-[14px] border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/[0.02] border-b border-white/8">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-white/40 uppercase tracking-wider border-r border-white/8 last:border-r-0 first:whitespace-nowrap">
      {parseHtmlTags(children)}
    </th>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.015] transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-[#8a8b92] text-[14px] leading-relaxed align-top border-r border-white/5 last:border-r-0 first:whitespace-nowrap first:font-medium">
      {parseHtmlTags(children)}
    </td>
  ),
  hr: () => <hr className="my-10 border-white/8" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-white/90">{parseHtmlTags(children)}</strong>
  ),
  em: ({ children }) => <em className="italic text-[#8a8b92]">{parseHtmlTags(children)}</em>,
};

export default async function DocPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const docInfo = allDocs.find((d) => d.slug === slug);
  if (!docInfo) notFound();

  const filePath = path.join(process.cwd(), "src/content/docs", `${slug}.md`);

  if (!fs.existsSync(filePath)) notFound();

  const content = fs.readFileSync(filePath, "utf8");
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

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://wekraft.xyz/web"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Docs",
      "item": "https://wekraft.xyz/web/docs"
    }
  ];

  if (category) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": category,
      "item": `https://wekraft.xyz/web/docs#${category.toLowerCase().replace(/\s+/g, "-")}`
    });
  }

  breadcrumbItems.push({
    "@type": "ListItem",
    "position": category ? 4 : 3,
    "name": docInfo?.title || "Article",
    "item": `https://wekraft.xyz/web/docs/${slug}`
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  return (
    <div className="flex gap-12 xl:gap-16 w-full">
      <StructuredData data={breadcrumbSchema} />
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
                  <h1 className="text-[2rem] font-bold text-white tracking-tight mt-0 mb-4 leading-tight">
                    {parseHtmlTags(children)}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[0.8rem] sm:text-[0.9rem] text-[#8a8b92] mb-8 border-b border-white/8 pb-8">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/30" />
                      <span>{readingTime} min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-white/30" />
                      <span>Updated May 2026</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-white/30" />
                      <span>WeKraft Team</span>
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