import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { allDocs, docsConfig } from "@/lib/docs-config";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Components } from "react-markdown";

export async function generateStaticParams() {
  return allDocs.map((doc) => ({ slug: doc.slug }));
}

// Extract plain-text headings from markdown for the TOC
function extractHeadings(content: string) {
  const lines = content.split("\n");
  const headings: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)/);
    if (m) {
      const text = m[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ level: m[1].length, text, id });
    }
  }
  return headings;
}

// Custom markdown components
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-white tracking-tight mt-0 mb-6 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => {
    const id = String(children)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return (
      <h2 id={id} className="text-xl font-semibold text-white mt-10 mb-4 scroll-mt-20 pt-2 border-t border-white/6">
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = String(children)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return (
      <h3 id={id} className="text-base font-semibold text-white/90 mt-7 mb-3 scroll-mt-20">
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="text-[15px] text-white/60 leading-7 mb-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-4 ml-1 space-y-1.5 list-none">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-1 space-y-1.5 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-[15px] text-white/60 leading-6 flex items-start gap-2">
      <span className="mt-2 h-1 w-1 rounded-full bg-white/20 shrink-0" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-5 border-l-2 border-blue-500/50 pl-4 py-1 bg-blue-500/5 rounded-r-lg">
      <div className="text-[14px] text-blue-300/80 leading-6">{children}</div>
    </blockquote>
  ),
  code: ({ className, children, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="text-[13px] font-mono text-emerald-300 bg-white/5 border border-white/8 rounded px-1.5 py-0.5">
          {children}
        </code>
      );
    }
    return (
      <code className="text-[13px] font-mono text-white/80" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-5 overflow-x-auto rounded-xl bg-[#0d0d0d] border border-white/8 p-4 text-[13px] font-mono leading-6">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-[14px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-white/4 border-b border-white/8">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-white/60 border-b border-white/5 text-[13px]">
      {children}
    </td>
  ),
  hr: () => <hr className="my-8 border-white/8" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-white/90">{children}</strong>
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
    <div className="flex gap-10 xl:gap-14 w-full">
      {/* Main article */}
      <div className="min-w-0 flex-1">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-white/25">
          <span>Docs</span>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{category}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-white/50">{docInfo?.title}</span>
        </div>

        {/* Badge */}
        {docInfo?.badge && (
          <span className="inline-block mb-4 text-[10px] font-semibold rounded-full px-2.5 py-1 border
            bg-blue-500/10 text-blue-400 border-blue-500/20">
            {docInfo.badge}
          </span>
        )}

        {/* Markdown content */}
        <article>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </article>

        {/* Prev / Next Nav */}
        <div className="mt-14 pt-6 border-t border-white/6 flex items-center justify-between gap-4">
          {prevDoc ? (
            <Link
              href={`/web/docs/${prevDoc.slug}`}
              className="group flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <div>
                <div className="text-xs text-white/20 mb-0.5">Previous</div>
                <div className="font-medium">{prevDoc.title}</div>
              </div>
            </Link>
          ) : <div />}

          {nextDoc ? (
            <Link
              href={`/web/docs/${nextDoc.slug}`}
              className="group flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors text-right"
            >
              <div>
                <div className="text-xs text-white/20 mb-0.5">Next</div>
                <div className="font-medium">{nextDoc.title}</div>
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : <div />}
        </div>
      </div>

      {/* Right TOC — hidden on small screens */}
      {headings.length > 0 && (
        <aside className="hidden xl:block w-48 shrink-0">
          <div className="sticky top-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">
              On this page
            </p>
            <nav className="space-y-1">
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className={`block text-[12px] text-white/35 hover:text-white/70 transition-colors leading-5 truncate
                    ${h.level === 3 ? "pl-3 border-l border-white/8 hover:border-white/20" : ""}`}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
