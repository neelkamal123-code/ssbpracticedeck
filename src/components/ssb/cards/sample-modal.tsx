"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface SampleModalProps {
  title: string;
  subtitle?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function SampleModal({
  title,
  subtitle,
  open,
  onClose,
  children,
}: SampleModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
        >
          <button
            type="button"
            aria-label="Close samples"
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="glass-card relative z-10 w-full max-w-2xl rounded-3xl border border-cyan-200/30 p-5 shadow-[0_30px_80px_rgba(1,10,30,0.6)] sm:p-6"
          >
            <header className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-slate-100">
                  {title}
                </h3>
                {subtitle ? (
                  <p className="mt-1 text-sm text-slate-300/80">{subtitle}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.12]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[65vh] overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
