"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Sparkles } from "lucide-react";
import type { WATItem } from "@/domain/ssb/types";
import { resolveIcon } from "@/lib/icon-map";
import { CardFrame } from "@/components/ssb/cards/card-frame";
import { SampleModal } from "@/components/ssb/cards/sample-modal";

interface WatCardProps {
  item: WATItem;
  index: number;
  total: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function WatCard({
  item,
  index,
  total,
  onSwipeLeft,
  onSwipeRight,
}: WatCardProps) {
  const [open, setOpen] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const Icon = resolveIcon(item.icon);

  return (
    <CardFrame
      title={item.title}
      Icon={Icon}
      index={index}
      total={total}
      expanded={open}
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      primaryAction={
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
            open
              ? "border-cyan-200/45 bg-cyan-300/20 text-cyan-100"
              : "border-white/18 bg-white/[0.04] text-slate-200/90 hover:bg-white/[0.1]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Officer Lens
        </button>
      }
      extraActions={
        <button
          type="button"
          onClick={() => setShowSamples(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.04] px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-200/90 transition-colors hover:bg-white/[0.1]"
        >
          <Eye className="h-3.5 w-3.5" />
          Sample
        </button>
      }
    >
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {item.suggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-3 text-sm text-slate-200/95"
              >
                {suggestion}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>

      <SampleModal
        title="WAT Sample Sentences"
        subtitle="Simple, positive, and practical responses."
        open={showSamples}
        onClose={() => setShowSamples(false)}
      >
        <ul className="space-y-3">
          {[
            "Discipline helps me complete my duties on time.",
            "Teamwork makes difficult tasks easier to finish.",
            "Failure teaches me to prepare better next time.",
            "Courage means staying calm and doing what is right.",
          ].map((sentence, sampleIndex) => (
            <li
              key={sentence}
              className="rounded-2xl border border-white/12 bg-slate-950/25 px-4 py-3 text-sm text-slate-200/95"
            >
              <span className="mr-2 text-cyan-200">{sampleIndex + 1}.</span>
              {sentence}
            </li>
          ))}
        </ul>
      </SampleModal>
    </CardFrame>
  );
}
