"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, CheckCheck, Sparkles, Upload } from "lucide-react";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CARD_HEIGHT = 560;
const IMAGE_HEIGHT = 360;

const steps = [
  {
    number: "01",
    title: "Import your projects",
    description:
      "Bring in GitHub repos, Notion docs, and team data. Wekraft unifies everything into one clean workspace.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
    numColor: "#38bdf8",
    cardColor: "#dff2ff",
    borderColor: "#add7ef",
    accentText: "text-sky-500",
    cta: "Connect your tools",
    Icon: Upload,
  },
  {
    number: "02",
    title: "AI suggests workflow",
    description:
      "Kaya analyzes your team capacity, structures sprints, assigns deadlines, and flags bottlenecks.",
    image:
      "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2070&auto=format&fit=crop",
    numColor: "#f6b80f",
    cardColor: "#fff7bf",
    borderColor: "#eadb83",
    accentText: "text-amber-500",
    cta: "See AI planning",
    Icon: Sparkles,
  },
  {
    number: "03",
    title: "Execute and optimize",
    description:
      "Track progress in real time, automate check-ins, and receive smart alerts. Ship faster while staying aligned.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    numColor: "#35c979",
    cardColor: "#d8f8df",
    borderColor: "#a7dfb8",
    accentText: "text-emerald-500",
    cta: "Start shipping",
    Icon: CheckCheck,
  },
];

const StepCard = ({ step }: { step: (typeof steps)[0] }) => (
  <div
    className="relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border px-5 py-5 text-slate-950 md:px-7 md:py-6"
    style={{
      backgroundColor: step.cardColor,
      borderColor: step.borderColor,
      boxShadow:
        "0 28px 70px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
    }}
  >
    <div className="flex flex-none flex-col items-center justify-start gap-3 text-center">
      <h3 className="flex flex-wrap items-center justify-center gap-2 text-xl font-semibold leading-tight tracking-normal">
        <span>{step.title.split(" ")[0]}</span>
        <span className="grid size-10 place-items-center rounded-full bg-white shadow-sm">
          <step.Icon className="size-5" style={{ color: step.numColor }} />
        </span>
        <span>{step.title.split(" ").slice(1).join(" ")}</span>
      </h3>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
        {step.description}
      </p>
      <div
        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${step.accentText}`}
      >
        <span>{step.cta}</span>
        <ArrowRight className="size-4" />
      </div>
    </div>

    <div
      className="mt-5 min-h-0 overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm"
      style={{ height: IMAGE_HEIGHT }}
    >
      <img
        src={step.image}
        alt={step.title}
        className="h-full w-full object-cover"
      />
    </div>
  </div>
);

const StackLayer = ({
  step,
  index,
  setRef,
}: {
  step: (typeof steps)[0];
  index: number;
  setRef: (el: HTMLDivElement | null) => void;
}) => (
  <div
    ref={setRef}
    className="absolute left-0 right-0 top-0 will-change-transform"
    style={{ zIndex: 10 + index * 10 }}
  >
    <div
      className="pointer-events-none relative z-0 -mb-8 select-none pl-3 font-black leading-none"
      style={{
        color: step.numColor,
        fontSize: "clamp(4rem, 7vw, 6.75rem)",
        textShadow: `4px 6px 0 ${step.numColor}22`,
      }}
    >
      {step.number}
    </div>
    <div className="relative z-10" style={{ height: CARD_HEIGHT }}>
      <StepCard step={step} />
    </div>
  </div>
);

const Section2 = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];
      const stage = stageRef.current;
      if (layers.length < steps.length || !stage) return;

      const getBaseY = () => {
        const stageHeight = stage.offsetHeight;
        return Math.max(82, (stageHeight - CARD_HEIGHT) / 2);
      };

      const getStartY = (index: number) =>
        stage.offsetHeight + CARD_HEIGHT * 0.35 + index * 120;

      gsap.set(layers, {
        x: 0,
        y: (index) => (index === 0 ? getBaseY() : getStartY(index)),
        transformOrigin: "50% 0%",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.35}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      layers.slice(1).forEach((layer, index) => {
        const incomingIndex = index + 1;
        const at = index * 0.9;

        tl.to(
          layers.slice(0, incomingIndex),
          {
            x: (olderIndex) => -(incomingIndex - olderIndex) * 44,
            y: (olderIndex) => getBaseY() - (incomingIndex - olderIndex) * 18,
            duration: 0.9,
            ease: "none",
          },
          at,
        );

        tl.to(
          layer,
          {
            x: 0,
            y: () => getBaseY() + incomingIndex * 34,
            duration: 0.95,
            ease: "none",
          },
          at,
        );
      });
    },
    { scope: wrapperRef },
  );

  return (
    <section
      ref={wrapperRef}
      id="section2"
      className="relative mb-40 min-h-[1080px] overflow-visible bg-black font-sans"
    >
      <div className="mx-auto flex min-h-[1080px] max-w-6xl flex-col px-5 py-10 md:px-8">
        <div className="shrink-0 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <div className="size-1.5 animate-pulse rounded-full bg-white/60" />
            <span className="text-xs font-medium uppercase tracking-widest text-neutral-400">
              How it works
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-[1.08] tracking-normal text-white md:text-5xl">
            Chaos to clarity
            <br />
            <span className="text-neutral-500">in 3 simple steps.</span>
          </h2>
        </div>

        <div
          ref={stageRef}
          className="relative mx-auto mt-8 min-h-[760px] w-full flex-1"
        >
          {steps.map((step, index) => (
            <StackLayer
              key={step.number}
              step={step}
              index={index}
              setRef={(el) => {
                layerRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section2;
