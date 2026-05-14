import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { allDocs, docsConfig } from "@/lib/docs-config";
import { ChevronRight, ChevronLeft, Clock, Calendar, User } from "lucide-react";
import Link from "next/link";
import type { Components } from "react-markdown";
import { TableOfContents } from "@/components/TableOfContents";

export async function generateStaticParams() {
  return allDocs.map((doc) => ({ slug: doc.slug }));
}

// Helper to generate IDs from text or React nodes
const slugify = (text: any): string => {
  if (typeof text !== 'string') {
    if (Array.isArray(text)) {
      text = text.map(t => typeof t === 'string' ? t : '').join('');
    } else {
      text = String(text);
    }
  }
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

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

// Custom markdown components
const markdownComponents: Components = {
  h1: ({ children }) => (
    <>
      <h1 className="text-[2.2rem] font-bold text-white tracking-tight mt-0 mb-4 leading-snug">
        {children}
      </h1>
      <div className="flex items-center gap-6 text-[0.9rem] text-white/50 mb-8 border-b border-white/8 pb-8">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>5 min read</span>
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
        className="text-[1.2rem] font-semibold text-white mt-12 mb-4 pb-3 scroll-mt-24 border-b border-white/8"
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
        className="text-[0.95rem] font-semibold text-white/85 mt-8 mb-3 scroll-mt-24"
      >
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-[0.925rem] text-white/55 leading-[1.8] mb-5">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/40 hover:decoration-blue-400/70 transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-5 space-y-2.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 space-y-2.5 list-none counter-reset-item">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-3 text-[0.925rem] text-white/55 leading-[1.7]">
      <span className="mt-[0.55rem] h-[5px] w-[5px] rounded-full bg-white/20 shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 pl-4 border-l-2 border-blue-500/40 bg-blue-950/20 rounded-r-lg py-3 pr-4">
      <div className="text-[0.875rem] text-blue-200/60 leading-[1.7] [&>p]:mb-0 [&>p]:text-blue-200/60">
        {children}
      </div>
    </blockquote>
  ),
  code: ({ className, children, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="text-[0.8rem] font-mono text-emerald-300/90 bg-emerald-950/30 border border-emerald-500/15 rounded-md px-1.5 py-0.5 whitespace-nowrap">
          {children}
        </code>
      );
    }
    return (
      <code className="text-[0.8rem] font-mono text-white/75 leading-6" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-[#0c0c0c] border border-white/8 px-5 py-4 text-[0.8rem] font-mono leading-6 shadow-inner">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/8 shadow-sm">
      <table className="w-full text-[0.875rem] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/[0.04]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-5 py-3 text-left text-[0.7rem] font-semibold text-white/35 uppercase tracking-widest border-b border-white/8">
      {children}
    </th>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.015] transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }) => (
    <td className="px-5 py-3 text-white/55 text-[0.875rem] leading-relaxed align-top">
      {children}
    </td>
  ),
  hr: () => <hr className="my-10 border-white/8" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-white/85">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-white/50">{children}</em>
  ),
};

export default async function DocPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "src/content/docs", `${slug}.md`);

  if (!fs.existsSync(filePath)) notFound();

  const content = fs.readFileSync(filePath, "utf8");
  const docInfo = allDocs.find((d) => d.slug === slug);
  const headings = extractHeadings(content);

  // Prev / Next
  const flat = allDocs;
  const currentIdx = flat.findIndex((d) => d.slug === slug);
  const prevDoc = currentIdx > 0 ? flat[currentIdx - 1] : null;
  const nextDoc = currentIdx < flat.length - 1 ? flat[currentIdx + 1] : null;

  // Find category
  const category = Object.entries(docsConfig).find(([, items]) =>
    items.some((i) => i.slug === slug)
  )?.[0];

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

        {/* Markdown content */}
        <article className="max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </article>

        {/* Prev / Next Nav */}
        <div className="mt-16 pt-6 border-t border-white/8 flex items-center justify-between gap-4">
          {prevDoc ? (
            <Link
              href={`/web/docs/${prevDoc.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/14 px-4 py-3 transition-all"
            >
              <ChevronLeft className="h-4 w-4 text-white/30 group-hover:text-white/60 group-hover:-translate-x-0.5 transition-all shrink-0" />
              <div>
                <div className="text-[10px] text-white/60 mb-0.5 uppercase tracking-widest font-medium">Previous</div>
                <div className="text-sm font-medium text-white group-hover:text-white transition-colors">{prevDoc.title}</div>
              </div>
            </Link>
          ) : <div />}

          {nextDoc ? (
            <Link
              href={`/web/docs/${nextDoc.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/14 px-4 py-3 transition-all text-right ml-auto"
            >
              <div>
                <div className="text-[10px] text-white/60 mb-0.5 uppercase tracking-widest font-medium">Next</div>
                <div className="text-sm font-medium text-white group-hover:text-white transition-colors">{nextDoc.title}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ) : <div />}
        </div>
      </div>

      {/* Right TOC — hidden on small screens */}
      {headings.length > 0 && (
        <TableOfContents headings={headings} />
      )}
    </div>
  );
}
