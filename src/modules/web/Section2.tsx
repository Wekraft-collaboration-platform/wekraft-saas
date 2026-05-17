"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARD_H = 500;
const CARD_CLOSED = 72;
const GAP = 20;

const steps = [
  {
    num: "01",
    bg: "#1a1a1a",
    title: "Import projects or docs.",
    text: "WeKraft reads your briefs, chats, or Notion pages. Drop in a file, paste a link, or connect your workspace.",
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=80&auto=format&fit=crop",
  },
  {
    num: "02",
    bg: "#141414",
    title: "AI suggests your workflow.",
    text: "Let AI structure your tasks, estimate timelines, and assign owners. Get a full project plan in seconds.",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&q=80&auto=format&fit=crop",
  },
  {
    num: "03",
    bg: "#0d0d0d",
    title: "Execute and optimize.",
    text: "Track progress, automate check-ins, and ship faster. Dashboards and smart nudges keep every project on track.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80&auto=format&fit=crop",
  },
];

export default function Section2() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".s2-accordions",
          pin: true,
          pinSpacing: false,
          start: "top top",
          // Fixed px — just enough to collapse all 3 cards, no dead space after
          end: "+=900",
          scrub: 1,
        },
      });

      tl.to(".s2-acc", {
        height: CARD_CLOSED,
        stagger: 0.8,
        ease: "none",
      });
      tl.to(
        ".s2-body",
        {
          opacity: 0,
          y: -10,
          filter: "blur(6px)",
          stagger: 0.8,
          ease: "power2.out",
        },
        "<",
      );
      tl.to(
        ".s2-acc-wrap",
        {
          marginBottom: -14,
          stagger: 0.5,
          ease: "none",
        },
        "<",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        .s2-section {
          background: #000;
        }

        .s2-heading {
          text-align: center;
          padding: 80px 24px 60px;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1.1;
          color: white;
          margin: 0;
        }
        .s2-heading span {
          background: linear-gradient(90deg, #a3a3a3 0%, #525252 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .s2-accordions {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #000;
          padding: 20px 0 40px;
        }

        .s2-acc-wrap {
          position: relative;
          width: min(760px, 94vw);
          margin-bottom: ${GAP}px;
          /* padding-top makes room for the number floating above */
          padding-top: 44px;
        }

        /* Number — visible, above the card, left-aligned */
        .s2-num {
          position: absolute;
          top: 0;
          left: 2px;
          font-size: 36px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -1px;
          color: rgba(255,255,255,0.15);
          user-select: none;
          z-index: 2;
        }

        .s2-acc {
          position: relative;
          z-index: 1;
          width: 100%;
          height: ${CARD_H}px;
          border-radius: 24px;
          overflow: hidden;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 60px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          background-image: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
        }

        .s2-title-bar {
          flex-shrink: 0;
          padding: 22px 28px 16px;
        }

        .s2-title {
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .s2-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 28px 24px;
          min-height: 0;
        }

        .s2-text {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.5);
          margin: 0 0 24px;
          flex-shrink: 0;
          max-width: 90%;
        }

        .s2-img-wrap {
          flex: 1;
          border-radius: 16px;
          overflow: hidden;
          min-height: 0;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .s2-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(80%) contrast(1.1);
          opacity: 0.8;
          display: block;
          transition: all 0.5s ease;
        }
        
        .s2-acc:hover .s2-img-wrap img {
          filter: grayscale(0%) contrast(1.0);
          opacity: 1;
          transform: scale(1.02);
        }
      `}</style>

      <div className="s2-section" ref={sectionRef}>
        <h2 className="s2-heading">
          Powerful enough to scale.
          <br />
          <span>Simple enough to love.</span>
        </h2>

        <div className="s2-accordions">
          {steps.map((step, i) => (
            <div className="s2-acc-wrap" key={i}>
              <div className="s2-num">{step.num}</div>
              <div className="s2-acc" style={{ background: step.bg }}>
                <div className="s2-title-bar">
                  <h3 className="s2-title">{step.title}</h3>
                </div>
                <div className="s2-body">
                  <p className="s2-text">{step.text}</p>
                  <div className="s2-img-wrap">
                    <img src={step.img} alt={step.title} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
