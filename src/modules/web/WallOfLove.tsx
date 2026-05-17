"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Code2, GitPullRequestArrow, Timer } from "lucide-react";

const highlights = [
  {
    value: "15h",
    title: "saved per project",
    detail:
      "Planning, grooming, and follow-up work collapse into one calm loop.",
    logo: "Xerxes",
    icon: Timer,
    featured: true,
  },
  {
    value: "90%",
    title: "on-time completion",
    detail:
      "Teams keep delivery risk visible before it becomes a late surprise.",
    logo: "Rapture",
    icon: CheckCircle2,
    featured: true,
  },
  {
    value: "25%",
    title: "fewer reworks",
    detail:
      "Requirements, task context, and decisions stay attached to the work.",
    logo: "Gozer",
    icon: GitPullRequestArrow,
    featured: false,
  },
  {
    value: "4.8x",
    title: "faster handoff clarity",
    detail:
      "New teammates can trace why a task exists and what changed recently.",
    logo: "Kuzan",
    icon: Code2,
    featured: false,
  },
];

const WallOfLove = () => {
  return (
    <section className="relative overflow-hidden bg-black px-6 pb-32 pt-8 font-sans text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)] px-4 py-1.5 text-sm font-semibold tracking-wide text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
            Wall of love
          </div>
          <h2 className="bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl leading-tight">
            Proof that feels useful, not loud
          </h2>
          <p className="mt-5 text-lg md:text-xl leading-relaxed text-neutral-400 max-w-2xl mx-auto">
            A compact view of the outcomes teams report once execution,
            ownership, and engineering context live together.
          </p>
        </motion.div>

        <div className="mt-18 grid gap-5 md:grid-cols-2">
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.logo}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className={`group relative min-h-80 overflow-hidden rounded-2xl border p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] ${
                  item.featured
                    ? "border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-950/10"
                    : "border-white/10 bg-neutral-900/40 hover:bg-neutral-900/80"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex min-h-64 flex-col justify-between">
                  <div>
                    <p className="text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
                      {item.value}
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-100">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors">
                      {item.detail}
                    </p>
                  </div>

                  <div className="mt-12 flex items-center gap-4 text-neutral-400">
                    <span className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                      <Icon className="size-5 text-blue-400" />
                    </span>
                    <span className="text-xl font-bold tracking-tight text-white/90">
                      {item.logo}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-6 grid gap-8 rounded-2xl border border-white/10 bg-neutral-900/40 p-8 md:p-10 md:grid-cols-[1.2fr_0.8fr] items-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent pointer-events-none" />
          <p className="relative z-10 text-2xl md:text-[28px] font-medium leading-relaxed tracking-tight text-neutral-100">
            "Wekraft gives our engineering team the rare feeling that project
            management is helping the work instead of hovering above it."
          </p>
          <div className="relative z-10 flex items-end justify-between gap-6 md:justify-end">
            <div className="text-right">
              <p className="font-bold text-white text-lg">Mira Patel</p>
              <p className="mt-1 text-sm font-medium text-blue-400/80">
                VP Engineering at Omnicorp
              </p>
            </div>
            <div className="flex size-14 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-white/10 to-transparent text-lg font-bold shadow-inner">
              MP
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WallOfLove;
