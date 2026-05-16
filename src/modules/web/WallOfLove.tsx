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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-400" />
            Wall of love
          </div>
          <h2 className="bg-linear-to-b from-white via-white to-neutral-500 bg-clip-text text-4xl font-semibold tracking-normal text-transparent md:text-6xl">
            Proof that feels useful, not loud
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-500">
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
                className={`group relative min-h-80 overflow-hidden rounded-lg border p-7 transition-colors duration-300 ${
                  item.featured
                    ? "border-blue-500/20 bg-blue-500/[0.07]"
                    : "border-white/10 bg-neutral-950/80"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_38%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex min-h-64 flex-col justify-between">
                  <div>
                    <p className="text-5xl font-semibold tracking-normal text-white md:text-6xl">
                      {item.value}
                    </p>
                    <h3 className="mt-4 text-2xl font-medium tracking-normal text-neutral-100">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-500">
                      {item.detail}
                    </p>
                  </div>

                  <div className="mt-12 flex items-center gap-3 text-neutral-400">
                    <span className="flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                      <Icon className="size-5 text-blue-400" />
                    </span>
                    <span className="text-2xl font-semibold tracking-normal">
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
          className="mt-5 grid gap-5 rounded-lg border border-white/10 bg-neutral-950/70 p-6 md:grid-cols-[1.2fr_0.8fr]"
        >
          <p className="text-2xl font-medium leading-snug tracking-normal text-neutral-100 md:text-3xl">
            "Wekraft gives our engineering team the rare feeling that project
            management is helping the work instead of hovering above it."
          </p>
          <div className="flex items-end justify-between gap-6 md:justify-end">
            <div>
              <p className="font-semibold text-white">Mira Patel</p>
              <p className="mt-1 text-sm text-neutral-500">
                VP Engineering at Omnicorp
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-sm font-semibold">
              MP
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WallOfLove;
