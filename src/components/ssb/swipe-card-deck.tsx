"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { useRef, type ReactNode, type WheelEvent } from "react";

interface SwipeCardDeckProps {
  direction: 1 | -1;
  cardKey: string;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: ReactNode;
}

const swipeDistance = 46;
const swipeVelocity = 460;
const wheelThreshold = 40;
const wheelCooldownMs = 340;

const cardVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    scale: 0.95,
    x: direction === 1 ? 140 : -140,
    rotate: direction === 1 ? 4 : -4,
  }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    rotate: 0,
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    scale: 0.95,
    x: direction === 1 ? -150 : 150,
    rotate: direction === 1 ? -7 : 7,
  }),
};

export function SwipeCardDeck({
  direction,
  cardKey,
  canSwipeLeft,
  canSwipeRight,
  onSwipeLeft,
  onSwipeRight,
  children,
}: SwipeCardDeckProps) {
  const lastWheelSwipeAt = useRef<number>(0);
  const dragOffsetX = useMotionValue(0);
  const nextTagOpacity = useTransform(dragOffsetX, [-150, -40, 0], [1, 0.4, 0]);
  const backTagOpacity = useTransform(dragOffsetX, [0, 40, 150], [0, 0.4, 1]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      canSwipeLeft &&
      (info.offset.x <= -swipeDistance || info.velocity.x <= -swipeVelocity)
    ) {
      onSwipeLeft();
      dragOffsetX.set(0);
      return;
    }

    if (
      canSwipeRight &&
      (info.offset.x >= swipeDistance || info.velocity.x >= swipeVelocity)
    ) {
      onSwipeRight();
      dragOffsetX.set(0);
      return;
    }

    dragOffsetX.set(0);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastWheelSwipeAt.current < wheelCooldownMs) {
      return;
    }

    if (canSwipeLeft && event.deltaX >= wheelThreshold) {
      lastWheelSwipeAt.current = now;
      onSwipeLeft();
      return;
    }

    if (canSwipeRight && event.deltaX <= -wheelThreshold) {
      lastWheelSwipeAt.current = now;
      onSwipeRight();
    }
  };

  return (
    <AnimatePresence initial={false} mode="wait" custom={direction}>
      <motion.div
        key={cardKey}
        custom={direction}
        variants={cardVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 20,
          mass: 0.72,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragMomentum={false}
        dragElastic={0.62}
        dragTransition={{
          bounceStiffness: 520,
          bounceDamping: 10,
          power: 0.25,
          timeConstant: 135,
        }}
        onDrag={(_event, info) => dragOffsetX.set(info.offset.x)}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
        whileDrag={{
          cursor: "grabbing",
          scale: 1.02,
          rotate: 5,
        }}
        style={{ touchAction: "none" }}
        className="relative cursor-grab touch-pan-y select-none will-change-transform"
      >
        <motion.span
          aria-hidden
          style={{ opacity: nextTagOpacity }}
          className="pointer-events-none absolute left-5 top-5 z-30 rounded-2xl border border-emerald-200/55 bg-emerald-300/16 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-emerald-100"
        >
          Next
        </motion.span>
        <motion.span
          aria-hidden
          style={{ opacity: backTagOpacity }}
          className="pointer-events-none absolute right-5 top-5 z-30 rounded-2xl border border-cyan-200/55 bg-cyan-300/16 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cyan-100"
        >
          Back
        </motion.span>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
