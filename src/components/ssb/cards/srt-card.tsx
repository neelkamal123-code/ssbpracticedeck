"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Sparkles } from "lucide-react";
import type { SRTItem } from "@/domain/ssb/types";
import { CardFrame } from "@/components/ssb/cards/card-frame";
import { resolveIcon } from "@/lib/icon-map";
import { SampleModal } from "@/components/ssb/cards/sample-modal";

interface SrtCardProps {
  item: SRTItem;
  index: number;
  total: number;
}

export function SrtCard({ item, index, total }: SrtCardProps) {
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
          Response Angle
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
        title="SRT Sample Responses"
        subtitle="Action-first, responsible, and clear."
        open={showSamples}
        onClose={() => setShowSamples(false)}
      >
        <ul className="space-y-3">
          {[
            "Bus breaks down before exam: I arrange alternate transport, inform the center, and reach quickly.",
            "Friend gets hurt during sports: I provide first aid, call medical help, and support him calmly.",
            "Team members argue before submission: I calm both, split tasks, and ensure timely completion.",
            "Power cut during online test: I switch to backup internet/device and inform the invigilator immediately.",
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
