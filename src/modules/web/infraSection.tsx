"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { LucideGithub } from "lucide-react";

/* ─── Individual 3D Glass Platform ─── */
const GlassPlatform = ({
  children,
  index,
  delay,
}: {
  children: React.ReactNode;
  index: number;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative"
      style={{ zIndex: 10 - index }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 7 + index * 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.8,
        }}
        className="relative flex items-center justify-center"
      >
        {/* The glass rhombus platform */}
        <div
          className="relative w-[180px] h-[150px] md:w-[220px] md:h-[190px]"
          style={{
            perspective: "1200px",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: "rotateX(58deg) rotateZ(-45deg)",
            }}
          >

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "16px",
                boxShadow:
                  "0 40px 80px -15px rgba(0,0,0,0.8), 0 12px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(255,255,255,0.05)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Top edge highlight */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  right: "10%",
                  height: "1px",
                  background:
                    "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)",
                }}
              />
            </div>

            {/* Icon floating above the platform */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              transform: "translateY(-0px)",
                zIndex: 1,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Stacked floating platforms ─── */
const FloatingCards = () => {
  return (
    <div className="relative flex flex-col items-center" style={{ gap: "0px" }}>
      {/* Top platform — Wekraft icon */}
      <GlassPlatform index={0} delay={0}>
      <Image
      src="/logo.svg"
      alt="Wekraft Logo"
      width={72}
      height={72}
      className="w-14 h-14 md:w-[80px] md:h-[80px] drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-90"
      />
      </GlassPlatform>

      {/* Middle platform — GitHub / sync icon */}
      <GlassPlatform index={1} delay={0.15}>
      <Image
      src="/github.png"
      alt="GitHub Integration"
      width={72}
      height={72}
      className="w-14 h-14 md:w-[80px] md:h-[80px] drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-90"
      />
      </GlassPlatform>

      {/* Bottom platform — Git icon */}
      <GlassPlatform index={2} delay={0.3}>
          <Image
      src="/social.png"
      alt="Developer Social Network"
      width={72}
      height={72}
      className="w-14 h-14 rotate-45 md:w-[80px] md:h-[80px] drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-90"
      />
      </GlassPlatform>
    </div>
  );
};


/* ─── Feature text items (right side) ─── */
const features = [
  {
    title: "Where change happens",
    description:
      "Teams that adopt Wekraft ship more code with smaller PRs and faster review cycles.",
  },
  {
    title: "Synced with GitHub",
    description:
      "GitHub sync and deep integration means your team is always on the same page.",
  },
  {
    title: "Built on top of Git",
    description:
      "Wekraft is integrated with all your git scripts, aliases, and workflows.",
  },
];

/* ─── Main Section ─── */
const InfraSection = () => {
  return (
    <section className="relative w-full bg-black overflow-hidden pb-20">
      {/* ── Header ── */}
      <div className="relative z-10 text-center mb-24 px-6">
         <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)] px-4 py-1.5 text-sm font-semibold tracking-wide text-blue-300"
          >
            <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
            Seamless integrations
          </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl leading-tight max-w-3xl mx-auto"
        >
          Developer infrastructure
          <br />
          built for your team
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-lg md:text-xl leading-relaxed text-neutral-400 max-w-2xl mx-auto"
        >
          Wekraft works seamlessly with the technologies you already use, keeping your workflows intact and your tools synced.
        </motion.p>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 md:gap-20">
        {/* Left — floating stacked 3D platforms */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="shrink-0 w-[280px] md:w-[320px] flex items-center justify-center -mb-10 md:mb-0"
        >
          <FloatingCards />
        </motion.div>

        {/* Right — text features, vertically aligned with cards */}
        <div className="flex flex-col justify-between text-center md:text-left gap-12 md:gap-16 md:py-0 relative">
          <div className="hidden md:block absolute left-[-40px] top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + 0.15 * i }}
              className="group relative"
            >
              <div className="hidden md:block absolute left-[-45px] top-[8px] w-[11px] h-[11px] rounded-full border-[2px] border-black bg-white/20 group-hover:bg-blue-400 group-hover:shadow-[0_0_10px_rgba(96,165,250,0.8)] transition-all duration-300" />
              <h3 className="text-white font-bold text-xl md:text-2xl tracking-tight mb-3 group-hover:text-blue-300 transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-neutral-400 text-base md:text-[17px] leading-relaxed max-w-md font-sans group-hover:text-neutral-300 transition-colors">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfraSection;