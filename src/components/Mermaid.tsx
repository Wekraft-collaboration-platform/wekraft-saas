"use client";

import React, { useEffect, useRef, useState } from "react";

interface MermaidProps {
  chart: string;
}

let mermaidIndex = 0;

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const elementId = `mermaid-${++mermaidIndex}`;

    const renderChart = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "ui-monospace, monospace",
          themeVariables: {
            background: "#0c0c0c",
            primaryColor: "#1e1e1e",
            primaryTextColor: "#e5e5e5",
            lineColor: "#27272a",
          }
        });

        // Generate the SVG code from the chart description
        const { svg: renderedSvg } = await mermaid.render(elementId, chart);
        
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
          setError(err.message || "Failed to render diagram");
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="relative group my-6">
        <pre className="overflow-x-auto rounded-xl bg-red-950/20 border border-red-500/20 px-5 py-4 text-[0.8rem] font-mono text-red-400">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="relative group my-6">
        <pre className="overflow-x-auto rounded-xl bg-[#0c0c0c] border border-white/8 px-5 py-4 text-[0.8rem] font-mono text-white/30 animate-pulse">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center bg-[#070707] border border-white/6 rounded-xl p-6 overflow-x-auto [&>svg]:max-w-full [&>svg]:h-auto shadow-inner"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
