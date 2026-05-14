import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { allDocs } from "@/lib/docs-config";
import { ChevronRight, Clock, Calendar as CalendarIcon, User } from "lucide-react";

export async function generateStaticParams() {
  return allDocs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "src/content/docs", `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const content = fs.readFileSync(filePath, "utf8");
  const docInfo = allDocs.find((d) => d.slug === slug);

  return (
    <div className="relative">
      {/* Breadcrumbs */}
      <div className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Docs</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{docInfo?.title}</span>
      </div>

      {/* Hero Section */}
      <div className="mb-12 border-b border-border pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {docInfo?.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>5 min read</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Updated May 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Wekraft Team</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="prose dark:prose-invert max-w-none 
        prose-headings:scroll-mt-20 
        prose-a:text-primary hover:prose-a:underline
        prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>

      {/* Footer Navigation */}
      <div className="mt-20 border-t border-border pt-10">
         {/* Navigation links could go here */}
      </div>
    </div>
  );
}
