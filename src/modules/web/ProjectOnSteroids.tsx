"use client";

import { Play } from "lucide-react";
import Image from "next/image";

const ProjectOnSteroids = () => {
  return (
    <section className="relative overflow-hidden w-full pt-20 md:pt-32 pb-0 bg-gradient-to-b from-[#2A3DF4] via-[#60A5FA] to-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16 mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-[64px] font-bold leading-[1.1] max-w-[700px] tracking-tight text-white">
            Go-to platform for effortlessly managing engineering projects
          </h2>
          
          <div className="flex flex-col gap-6 lg:max-w-[450px] pt-2">
            <p className="text-lg md:text-xl text-blue-50/90 leading-relaxed font-medium">
              Wekraft makes it easy to build workflows, track issues, and ship software. Unify your entire development lifecycle in minutes, not months.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button 
                type="button" 
                className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-full hover:bg-neutral-50 transition-colors shadow-lg"
              >
                Try Wekraft for free
              </button>
              <button 
                type="button" 
                className="border border-white/40 text-white font-bold px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Book a demo
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Image with 3D Tilt */}
        {/* The perspective wrapper creates the 3D depth effect */}
        <div 
          className="relative w-full h-[400px] md:h-[550px] flex justify-center items-start mt-8 pointer-events-none"
          style={{ perspective: "2000px" }}
        >
          {/* The tilted container — realistic 3D device frame */}
          <div 
            className="absolute top-0 w-[95%] md:w-[85%] max-w-[1100px]"
            style={{
              transform: "rotateX(15deg) rotateY(12deg) rotateZ(-4deg) translateX(5%) translateY(5%)",
              transformOrigin: "center top",
            }}
          >
            {/* === DEVICE BEZEL FRAME === */}
            <div
              className="relative rounded-[18px] md:rounded-[28px]"
              style={{
                /* Thick bezel via padding — thicker at bottom like real devices */
                padding: "10px 10px 14px 10px",
                /* Silver/aluminum bezel gradient for realistic metal look */
                background:
                  "linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 25%, #b0bcc9 55%, #94a3b8 85%, #8493a6 100%)",
                /* Multi-layer shadows create physical depth & floating effect */
                boxShadow: `
                  0 1px 0 0 rgba(255,255,255,0.4),
                  inset 0 1px 3px rgba(255,255,255,0.5),
                  inset 0 -1px 3px rgba(0,0,0,0.15),
                  0 4px 8px rgba(0,0,0,0.15),
                  0 12px 30px rgba(0,0,0,0.25),
                  0 30px 60px -10px rgba(0,0,0,0.4),
                  0 50px 100px -20px rgba(0,0,0,0.3)
                `,
              }}
            >
              {/* Bezel top-edge highlight — simulates overhead light reflection */}
              <div
                className="absolute inset-x-0 top-0 h-[1.5px] rounded-t-[18px] md:rounded-t-[28px] pointer-events-none z-20"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.8) 70%, transparent 95%)",
                }}
              />

              {/* Bezel left-edge highlight */}
              <div
                className="absolute inset-y-0 left-0 w-[1px] rounded-l-[18px] md:rounded-l-[28px] pointer-events-none z-20"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.3) 70%, transparent 95%)",
                }}
              />

              {/* Inner edge shadow — creates the recessed "screen sits inside bezel" look */}
              <div
                className="absolute pointer-events-none z-10 rounded-[10px] md:rounded-[20px]"
                style={{
                  inset: "8px 8px 12px 8px",
                  boxShadow: `
                    inset 0 2px 8px rgba(0,0,0,0.5),
                    inset 0 0 3px rgba(0,0,0,0.25),
                    inset 2px 0 4px rgba(0,0,0,0.15),
                    inset -2px 0 4px rgba(0,0,0,0.15)
                  `,
                }}
              />

              {/* === SCREEN AREA === */}
              <div className="relative rounded-[10px] md:rounded-[20px] overflow-hidden">
                <Image 
                  src="/dash.png" 
                  alt="Wekraft Dashboard" 
                  width={1920} 
                  height={1080}
                  className="w-full h-auto object-cover object-top block"
                  priority
                />

                {/* Glass reflection — subtle diagonal highlight across screen */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(155deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 20%, transparent 45%, transparent 65%, rgba(255,255,255,0.02) 100%)",
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-auto z-20">
                  <button 
                    type="button" 
                    className="w-20 h-20 md:w-28 md:h-28 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group"
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 md:w-12 md:h-12 ml-2 text-white/90 group-hover:text-white transition-colors" fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProjectOnSteroids;
