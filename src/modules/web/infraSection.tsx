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
                  "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                boxShadow:
                  "0 40px 80px -15px rgba(0,0,0,0.7), 0 12px 30px rgba(0,0,0,0.4), inset 0 1.5px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
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
            className="inline-flex items-center gap-2 px-7 py-1 rounded-full border border-white/10 bg-blue-500/10 text-[13px] text-neutral-400 font-medium mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Infra you need
          </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-pop font-semibold leading-[1.15] bg-linear-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent max-w-2xl mx-auto"
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
          className="text-gray-500 text-lg mt-5 font-sans max-w-lg mx-auto tracking-tight"
        >
          Wekraft works seamlessly with the technologies you already use
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
        <div className="flex flex-col justify-between text-center md:text-left gap-12 md:gap-16 md:py-0">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + 0.15 * i }}
            >
              <h3 className="text-white font-semibold text-xl md:text-[1.35rem] font-pop tracking-tight mb-2.5">
                {f.title}
              </h3>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm font-sans">
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