import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CardChip {
  label: string;
  href?: string;
}

interface CardFrameProps {
  title?: string;
  Icon: LucideIcon;
  index: number;
  total: number;
  expanded?: boolean;
  hideTitle?: boolean;
  primaryAction?: ReactNode;
  extraActions?: ReactNode;
  chips?: CardChip[];
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function CardFrame({
  title,
  Icon,
  index,
  total,
  expanded = false,
  hideTitle = false,
  primaryAction,
  extraActions,
  chips = [],
  children,
  onSwipeLeft,
  onSwipeRight,
}: CardFrameProps) {
  const canSwipeForward = index < total;
  const canSwipeBackward = index > 1;
  const allChips: CardChip[] = chips.slice(0, 3);
  const showTitle = Boolean(title) && !hideTitle;

  return (
    <article
      className={`glass-card relative mx-auto w-full overflow-hidden rounded-[32px] shadow-[0_28px_72px_rgba(1,6,20,0.56)] transition-[padding] duration-300 ${
        expanded ? "px-5 py-5 sm:px-7 sm:py-6" : "px-5 py-4 sm:px-6 sm:py-5"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_-8%,rgba(80,180,255,0.16),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(70,130,255,0.12),transparent_42%)]" />

      <header className="relative z-10">
        {canSwipeForward ? (
          <button
            type="button"
            onClick={onSwipeLeft}
            className="swipe-pill swipe-pill-left inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-200/5 px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-200/90"
          >
            Swipe
            <ArrowLeft className="swipe-arrow-left h-3.5 w-3.5" />
          </button>
        ) : null}

        <div
          className={`mt-4 flex items-start ${
            showTitle ? "justify-between gap-4" : "justify-end"
          }`}
        >
          {showTitle ? (
            <h2
              className={`font-display font-semibold leading-[0.98] tracking-tight text-[#dfe9f8] transition-[font-size] duration-300 ${
                expanded
                  ? "text-[2rem] sm:text-[3rem]"
                  : "text-[1.72rem] sm:text-[2.5rem]"
              }`}
            >
              {title}
              <span className="ml-1.5 inline-block h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,255,190,0.8)]" />
            </h2>
          ) : null}
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/25 bg-sky-300/10 text-cyan-100">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>

        <div
          className={`h-px bg-gradient-to-r from-transparent via-slate-200/15 to-transparent transition-[margin] duration-300 ${
            expanded ? "mt-5" : "mt-4"
          }`}
        />
      </header>

      <div
        className={`relative z-10 transition-[margin] duration-300 ${
          expanded ? "mt-5" : "mt-3"
        }`}
      >
        {children}
      </div>

      <footer
        className={`relative z-10 flex flex-wrap items-center gap-2.5 transition-[margin] duration-300 ${
          expanded ? "mt-5" : "mt-4"
        }`}
      >
        {primaryAction}
        {extraActions}
        {allChips.map((chip) =>
          chip.href ? (
            <Link
              key={chip.label}
              href={chip.href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-full border border-white/18 bg-white/[0.04] px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-200/90 transition-colors hover:bg-white/[0.1]"
            >
              {chip.label}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span
              key={chip.label}
              className="inline-flex items-center rounded-full border border-white/18 bg-white/[0.04] px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-200/90"
            >
              {chip.label}
            </span>
          ),
        )}

        {canSwipeBackward ? (
          <button
            type="button"
            onClick={onSwipeRight}
            className="swipe-pill swipe-pill-right ml-auto inline-flex items-center gap-1.5 rounded-full border border-sky-300/30 bg-sky-200/5 px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-200/90"
          >
            Swipe
            <ArrowRight className="swipe-arrow-right h-3.5 w-3.5" />
          </button>
        ) : null}
      </footer>
    </article>
  );
}
