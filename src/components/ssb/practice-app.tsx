"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { SectionKey } from "@/domain/ssb/sections";
import { sectionDefinitions } from "@/domain/ssb/sections";
import type { SsbItem, SsbSectionPayload } from "@/domain/ssb/types";
import { SectionTabs } from "@/components/ssb/section-tabs";
import { SwipeCardDeck } from "@/components/ssb/swipe-card-deck";
import { LecturetteCard } from "@/components/ssb/cards/lecturette-card";
import { SrtCard } from "@/components/ssb/cards/srt-card";
import { TatCard } from "@/components/ssb/cards/tat-card";
import { WatCard } from "@/components/ssb/cards/wat-card";
import { renderIcon } from "@/lib/icon-map";

interface PracticeAppProps {
  data: SsbSectionPayload;
}

const sectionAccent: Record<SectionKey, { rgb: string; text: string }> = {
  wat: { rgb: "56,189,248", text: "#d7f2ff" },
  srt: { rgb: "52,211,153", text: "#ddffef" },
  tat: { rgb: "251,191,36", text: "#fff4d6" },
  lecturette: { rgb: "167,139,250", text: "#efe8ff" },
};
const rotatingPerspectiveWords = ["perspectives", "insights", "viewpoints"];

function getCategoryDisplayName(category: SsbItem["category"]) {
  switch (category) {
    case "WAT":
      return "Word Association Test";
    case "SRT":
      return "Situation Reaction Test";
    case "TAT":
      return "Thematic Apperception Test";
    case "LECTURETTE":
      return "Lecturette";
    default:
      return "SSB";
  }
}

function SidePeekCard({ item, side }: { item: SsbItem; side: "left" | "right" }) {
  const previewLine =
    item.category === "TAT"
      ? item.anchors.action
      : item.category === "LECTURETTE"
        ? item.facts[0]
        : item.suggestions[0];

  const sidePositionClass =
    side === "left"
      ? "left-0 -translate-x-[58%] -rotate-[8deg]"
      : "right-0 translate-x-[58%] rotate-[8deg]";

  return (
    <motion.aside
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none absolute top-8 hidden h-[84%] w-[68%] overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/18 backdrop-blur-md lg:block ${sidePositionClass}`}
      aria-hidden
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(69,158,255,0.12),transparent_45%)]" />
      <div className="relative p-5 opacity-75">
        <p className="text-[0.58rem] uppercase tracking-[0.2em] text-slate-300/70">
          {getCategoryDisplayName(item.category)}
        </p>
        <div className="mt-3 flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
            {renderIcon(item.icon, { className: "h-4 w-4" })}
          </span>
          <p className="max-h-14 overflow-hidden font-display text-[1.7rem] leading-[1.05] tracking-tight text-slate-100/85">
            {item.title}
          </p>
        </div>
        <p className="mt-4 max-w-[88%] text-sm text-slate-200/70">{previewLine}</p>
      </div>
    </motion.aside>
  );
}

function renderSsbCard(item: SsbItem, index: number, total: number) {
  switch (item.category) {
    case "WAT":
      return <WatCard item={item} index={index} total={total} />;
    case "SRT":
      return <SrtCard item={item} index={index} total={total} />;
    case "TAT":
      return <TatCard item={item} index={index} total={total} />;
    case "LECTURETTE":
      return <LecturetteCard item={item} index={index} total={total} />;
    default:
      return null;
  }
}

export function PracticeApp({ data }: PracticeAppProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>("wat");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [rotatingWordIndex, setRotatingWordIndex] = useState(0);
  const [indices, setIndices] = useState<Record<SectionKey, number>>({
    wat: 0,
    srt: 0,
    tat: 0,
    lecturette: 0,
  });

  const cardsBySection = useMemo(
    () => ({
      wat: data.wat,
      srt: data.srt,
      tat: data.tat,
      lecturette: data.lecturette,
    }),
    [data.lecturette, data.srt, data.tat, data.wat],
  );

  const activeCards = cardsBySection[activeSection];
  const activeIndex = indices[activeSection];
  const canSwipeLeft = activeIndex < activeCards.length - 1;
  const canSwipeRight = activeIndex > 0;
  const activeCard = activeCards[activeIndex];
  const accent = sectionAccent[activeSection];
  const totalCards = activeCards.length;
  const currentCardNumber = totalCards > 0 ? activeIndex + 1 : 0;
  const progress = totalCards > 0 ? currentCardNumber / totalCards : 0;
  const progressRadius = 22;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset = progressCircumference * (1 - progress);
  const formattedCurrent = String(currentCardNumber).padStart(2, "0");
  const formattedTotal = String(totalCards).padStart(2, "0");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRotatingWordIndex(
        (current) => (current + 1) % rotatingPerspectiveWords.length,
      );
    }, 1700);

    return () => window.clearInterval(timer);
  }, []);

  const navigate = (step: 1 | -1) => {
    if (activeCards.length === 0) {
      return;
    }

    const maxIndex = activeCards.length - 1;
    const nextIndex = Math.max(0, Math.min(maxIndex, activeIndex + step));

    if (nextIndex === activeIndex) {
      return;
    }

    setDirection(step);
    setIndices((current) => ({
      ...current,
      [activeSection]: nextIndex,
    }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-7">
      <div className="pointer-events-none absolute inset-0">
        <div className="stars absolute inset-0 opacity-70" />
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-cyan-300/10 blur-[140px]" />
        <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-blue-500/15 blur-[140px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[66rem] space-y-7">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-4"
        >
          <h1 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            SSB Practice Deck
          </h1>
          <p className="max-w-2xl text-base text-slate-300/80 sm:text-lg">
            Swipe cards for guided{" "}
            <span className="relative inline-flex min-w-[9ch] align-baseline">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={rotatingPerspectiveWords[rotatingWordIndex]}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="inline-block bg-gradient-to-r from-cyan-200 via-emerald-200 to-sky-200 bg-clip-text font-semibold text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                >
                  {rotatingPerspectiveWords[rotatingWordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </p>
        </motion.header>

        <SectionTabs
          sections={sectionDefinitions}
          activeSection={activeSection}
          onSectionChange={(nextSection) => setActiveSection(nextSection)}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-end gap-4">
            <div className="flex flex-col items-end gap-2">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] backdrop-blur-sm"
                style={{
                  borderColor: `rgba(${accent.rgb},0.42)`,
                  background: `rgba(${accent.rgb},0.16)`,
                  color: accent.text,
                  boxShadow: `0 0 16px rgba(${accent.rgb},0.2)`,
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Swipe to browse
              </div>
              <div
                className="relative inline-flex h-[4.45rem] w-[4.45rem] items-center justify-center rounded-full border backdrop-blur-sm"
                style={{
                  borderColor: `rgba(${accent.rgb},0.4)`,
                  background: `radial-gradient(circle at 36% 22%, rgba(${accent.rgb},0.34), rgba(12,28,49,0.86) 68%)`,
                  boxShadow: `0 0 26px rgba(${accent.rgb},0.34), inset 0 0 24px rgba(6,18,34,0.74)`,
                }}
              >
                <svg
                  viewBox="0 0 60 60"
                  className="pointer-events-none absolute inset-[8px] h-[calc(100%-16px)] w-[calc(100%-16px)] -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="30"
                    cy="30"
                    r={progressRadius}
                    fill="none"
                    stroke="rgba(173, 211, 243, 0.22)"
                    strokeWidth="2.3"
                  />
                  <motion.circle
                    cx="30"
                    cy="30"
                    r={progressRadius}
                    fill="none"
                    stroke={`rgba(${accent.rgb},0.98)`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={progressCircumference}
                    initial={false}
                    animate={{ strokeDashoffset: progressOffset }}
                    transition={{ type: "spring", stiffness: 250, damping: 28 }}
                    style={{ filter: `drop-shadow(0 0 6px rgba(${accent.rgb},0.62))` }}
                  />
                </svg>

                <div className="relative flex flex-col items-center leading-none">
                  <span
                    className="text-[1.02rem] font-semibold tracking-[0.02em]"
                    style={{ color: accent.text }}
                  >
                    {formattedCurrent}
                  </span>
                  <span
                    className="mt-1 text-[0.54rem] font-medium uppercase tracking-[0.12em]"
                    style={{ color: `rgba(${accent.rgb},0.85)` }}
                  >
                    {formattedTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activeCard ? (
            <div className="relative mx-auto w-full max-w-[700px] pt-3">
              {canSwipeRight ? (
                <SidePeekCard item={activeCards[activeIndex - 1]} side="left" />
              ) : null}
              {canSwipeLeft ? (
                <SidePeekCard item={activeCards[activeIndex + 1]} side="right" />
              ) : null}

              <div className="pointer-events-none absolute inset-x-[6%] top-6 hidden h-[96%] rounded-[32px] border border-white/8 bg-slate-900/20 lg:block" />
              <div className="pointer-events-none absolute inset-x-[9%] top-10 hidden h-[93%] rounded-[32px] border border-white/5 bg-slate-900/12 lg:block" />

              <SwipeCardDeck
                cardKey={`${activeSection}-${activeCard.id}`}
                direction={direction}
                canSwipeLeft={canSwipeLeft}
                canSwipeRight={canSwipeRight}
                onSwipeLeft={() => navigate(1)}
                onSwipeRight={() => navigate(-1)}
              >
                {renderSsbCard(activeCard, activeIndex + 1, activeCards.length)}
              </SwipeCardDeck>
            </div>
          ) : (
            <div className="glass-card rounded-[30px] p-10 text-center text-slate-300">
              Data unavailable for this section.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
