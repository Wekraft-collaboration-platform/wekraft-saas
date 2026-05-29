"use client";

import React, { useEffect, useState, useId } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Copy, Check, Code, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MermaidProps {
  code: string;
}

export function Mermaid({ code }: MermaidProps) {
  // Generate a valid HTML ID for mermaid by removing colons from useId
  const containerId = `mermaid-${useId().replace(/:/g, "")}`;
  const [svgCode, setSvgCode] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  const [viewMode, setViewMode] = useState<"diagram" | "code">("diagram");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      try {
        setHasError(false);
        setErrorMsg("");
        
        // Dynamically import mermaid to avoid SSR issues
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
          themeVariables: {
            darkMode: true,
            background: "transparent",
            primaryColor: "#1e1e2f",
            primaryTextColor: "#f3f4f6",
            primaryBorderColor: "#3f3f46",
            lineColor: "#52525b",
            secondaryColor: "#0f172a",
            tertiaryColor: "#18181b",
          },
        });
        
        // Render the SVG
        const { svg } = await mermaid.render(containerId, code);
        
        if (isMounted) {
          setSvgCode(svg);
        }
      } catch (error: any) {
        if (isMounted) {
          setHasError(true);
          setErrorMsg(error?.message || "Syntax error in Mermaid diagram");
          console.error("Mermaid parsing error:", error);
        }
      }
    };
    
    renderDiagram();
    
    return () => {
      isMounted = false;
    };
  }, [code, containerId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.4));
  const resetZoom = () => setScale(1);

  // When clicking outside or pressing escape, exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    if (isFullscreen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFullscreen]);

  const content = (
    <div className={cn(
      "flex flex-col rounded-xl overflow-hidden border border-white/10 bg-[#0c0c0c] transition-all duration-300",
      isFullscreen ? "w-full h-full shadow-2xl" : "relative shadow-sm w-full my-6"
    )}>
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-md border border-white/5">
          <button
            onClick={() => setViewMode("diagram")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors uppercase tracking-wider",
              viewMode === "diagram" ? "bg-zinc-800 text-white shadow-sm" : "text-white/40 hover:text-white/70"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Diagram
          </button>
          <button
            onClick={() => setViewMode("code")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors uppercase tracking-wider",
              viewMode === "code" ? "bg-zinc-800 text-white shadow-sm" : "text-white/40 hover:text-white/70"
            )}
          >
            <Code className="w-3.5 h-3.5" />
            Source
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {viewMode === "diagram" && !hasError && (
            <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-3">
              <button onClick={zoomOut} className="p-1.5 text-white/40 hover:text-white/80 transition-colors rounded hover:bg-white/5" title="Zoom Out">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-white/30 font-mono w-8 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={zoomIn} className="p-1.5 text-white/40 hover:text-white/80 transition-colors rounded hover:bg-white/5" title="Zoom In">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button onClick={resetZoom} className="p-1.5 text-white/40 hover:text-white/80 transition-colors rounded hover:bg-white/5" title="Reset Zoom">
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          <button onClick={handleCopy} className="p-1.5 text-white/40 hover:text-white/80 transition-colors rounded hover:bg-white/5" title="Copy Code">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          {viewMode === "diagram" && !hasError && (
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 text-white/40 hover:text-white/80 transition-colors rounded hover:bg-white/5" title="Toggle Fullscreen">
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={cn("relative flex-1 overflow-auto", isFullscreen ? "min-h-[60vh]" : "min-h-[250px]")}>
        {viewMode === "code" ? (
          <pre className="p-5 text-[13px] font-mono text-zinc-300 leading-relaxed overflow-auto h-full m-0 bg-transparent">
            <code>{code}</code>
          </pre>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-1">Invalid Diagram Syntax</h3>
              <p className="text-xs text-white/40 max-w-md">Mermaid failed to parse this diagram. Switch to the Code view to inspect the source.</p>
            </div>
            <pre className="text-left text-[11px] font-mono text-red-300/80 bg-red-950/20 border border-red-900/30 p-3 rounded-lg max-w-full overflow-x-auto m-0">
              {errorMsg}
            </pre>
          </div>
        ) : (
          <div 
            className="w-full h-full min-h-[250px] flex items-center justify-center p-6 overflow-auto"
            style={{ 
              transition: "transform 0.2s ease-out",
            }}
          >
            {svgCode ? (
              <div 
                dangerouslySetInnerHTML={{ __html: svgCode }}
                style={{ transform: `scale(${scale})`, transformOrigin: "center center", transition: "transform 0.2s ease-out" }}
                className="flex items-center justify-center w-full h-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:max-h-full"
              />
            ) : (
              <div className="flex items-center justify-center space-x-2 animate-pulse text-white/30">
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
  
  if (isFullscreen) {
    return (
      <>
        {/* Placeholder behind fullscreen to prevent layout shift */}
        <div className="relative group my-6 border border-dashed border-white/10 rounded-xl h-[250px] flex flex-col items-center justify-center text-white/30 bg-white/[0.01]">
           <Maximize2 className="w-5 h-5 mb-3 opacity-40" />
           <span className="text-sm font-medium">Viewing in fullscreen mode</span>
           <button onClick={() => setIsFullscreen(false)} className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors">Exit Fullscreen</button>
        </div>
        
        {/* Fullscreen backdrop */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setIsFullscreen(false)}
        />
        
        {/* Modal Container */}
        <div className="fixed inset-4 md:inset-10 lg:inset-20 z-50 pointer-events-none flex items-center justify-center">
           <div className="pointer-events-auto w-full h-full flex flex-col">
              {content}
           </div>
        </div>
      </>
    );
  }
  
  return content;
}
