"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { useMemo, useRef, type WheelEvent } from "react";
import type { SectionDefinition, SectionKey } from "@/domain/ssb/sections";

interface SectionTabsProps {
  sections: SectionDefinition[];
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
}

const swipeDistance = 34;
const swipeVelocity = 420;
const wheelThreshold = 28;
const wheelCooldownMs = 280;

function SectionTile({
  section,
  highlighted,
}: {
  section: SectionDefinition;
  highlighted: boolean;
}) {
  return (
    <div
      className={`relative h-full overflow-hidden rounded-[20px] border px-2.5 py-2 transition-colors sm:px-3 sm:py-2.5 ${
        highlighted
          ? "border-cyan-200/55 bg-[linear-gradient(162deg,rgba(43,103,164,0.52)_0%,rgba(10,28,58,0.9)_55%,rgba(4,14,34,0.98)_100%)] shadow-[0_14px_30px_rgba(1,10,30,0.5),0_0_18px_rgba(56,189,248,0.2)]"
          : "border-slate-200/16 bg-[linear-gradient(165deg,rgba(8,22,46,0.88)_0%,rgba(4,14,33,0.96)_100%)] shadow-[0_12px_22px_rgba(1,8,24,0.44)]"
      }`}
    >
      {highlighted ? (
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_-10%,rgba(56,189,248,0.22),transparent_46%)]" />
      ) : null}

      <p
        className={`relative text-[0.53rem] uppercase tracking-[0.18em] ${
          highlighted ? "text-cyan-100/78" : "text-slate-300/70"
        }`}
      >
        {section.category}
      </p>
      <p
        className={`relative mt-1.5 font-display font-semibold leading-none tracking-tight ${
          highlighted
            ? "text-[1.06rem] text-slate-50 sm:text-[1.24rem]"
            : "text-[0.9rem] text-slate-100/90 sm:text-[1.05rem]"
        }`}
      >
        {section.label}
      </p>
      <p
        className={`relative mt-1 text-[0.63rem] sm:text-[0.72rem] ${
          highlighted
            ? "line-clamp-2 text-slate-100/88"
            : "line-clamp-1 text-slate-300/78"
        }`}
      >
        {section.subtitle}
      </p>
    </div>
  );
}

export function SectionTabs({
  sections,
  activeSection,
  onSectionChange,
}: SectionTabsProps) {
  const wheelAtRef = useRef(0);
  const dragX = useMotionValue(0);
  const nextOpacity = useTransform(dragX, [-120, -30, 0], [1, 0.45, 0]);
  const prevOpacity = useTransform(dragX, [0, 30, 120], [0, 0.45, 1]);

  const activeIndex = useMemo(
    () =>
      Math.max(
        0,
        sections.findIndex((section) => section.key === activeSection),
      ),
    [activeSection, sections],
  );

  const count = sections.length;
  const active = sections[activeIndex];
  const left = activeIndex > 0 ? sections[activeIndex - 1] : undefined;
  const right = activeIndex < count - 1 ? sections[activeIndex + 1] : undefined;
  const canMovePrev = Boolean(left);
  const canMoveNext = Boolean(right);

  if (!active) {
    return null;
  }

  const move = (step: 1 | -1) => {
    if (count < 2) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(count - 1, activeIndex + step));
    if (nextIndex === activeIndex) {
      return;
    }

    onSectionChange(sections[nextIndex].key);
  };

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      info.offset.x <= -swipeDistance ||
      (info.velocity.x <= -swipeVelocity && info.offset.x < 0)
    ) {
      move(1);
      dragX.set(0);
      return;
    }

    if (
      info.offset.x >= swipeDistance ||
      (info.velocity.x >= swipeVelocity && info.offset.x > 0)
    ) {
      move(-1);
      dragX.set(0);
      return;
    }

    dragX.set(0);
  };

  const onWheel = (event: WheelEvent<HTMLButtonElement>) => {
    const now = Date.now();
    if (now - wheelAtRef.current < wheelCooldownMs) {
      return;
    }

    if (event.deltaX >= wheelThreshold) {
      wheelAtRef.current = now;
      move(1);
      return;
    }

    if (event.deltaX <= -wheelThreshold) {
      wheelAtRef.current = now;
      move(-1);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/14 px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_14px_rgba(56,189,248,0.2)]">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Swipe Sections
        </span>
      </div>

      <div className="relative mx-auto h-[106px] w-full max-w-[588px] sm:h-[122px]">
        <div className="pointer-events-none absolute inset-x-[24%] top-2.5 h-[90%] rounded-[22px] border border-cyan-100/12 bg-slate-900/10" />

        {left ? (
          <button
            type="button"
            onClick={() => move(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-[74%] w-[31%] -translate-x-[32%] -translate-y-1/2 origin-right -rotate-[4deg] scale-[0.92] cursor-pointer overflow-hidden rounded-[20px] text-left opacity-78 transition-[opacity,transform] duration-200 hover:scale-[0.95] hover:opacity-95 sm:block"
          >
            <SectionTile section={left} highlighted={false} />
          </button>
        ) : null}

        {right ? (
          <button
            type="button"
            onClick={() => move(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-[74%] w-[31%] translate-x-[32%] -translate-y-1/2 origin-left rotate-[4deg] scale-[0.92] cursor-pointer overflow-hidden rounded-[20px] text-left opacity-78 transition-[opacity,transform] duration-200 hover:scale-[0.95] hover:opacity-95 sm:block"
          >
            <SectionTile section={right} highlighted={false} />
          </button>
        ) : null}

        <motion.button
          type="button"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragMomentum={false}
          dragElastic={0.35}
          onDrag={(_event, info) => dragX.set(info.offset.x)}
          onDragEnd={onDragEnd}
          onWheel={onWheel}
          whileTap={{ scale: 0.985 }}
          style={{ touchAction: "none" }}
          className="relative z-20 mx-auto h-full w-full cursor-grab rounded-[22px] sm:w-[56%] lg:w-[52%]"
        >
          <SectionTile section={active} highlighted />

          <motion.span
            style={{ opacity: canMoveNext ? nextOpacity : 0 }}
            className="pointer-events-none absolute left-3 top-3 rounded-full border border-emerald-200/45 bg-emerald-300/16 px-2 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-emerald-100"
          >
            Next
          </motion.span>
          <motion.span
            style={{ opacity: canMovePrev ? prevOpacity : 0 }}
            className="pointer-events-none absolute right-3 top-3 rounded-full border border-cyan-200/45 bg-cyan-300/16 px-2 py-0.5 text-[0.48rem] font-semibold uppercase tracking-[0.16em] text-cyan-100"
          >
            Back
          </motion.span>
        </motion.button>
      </div>
    </section>
  );
}
