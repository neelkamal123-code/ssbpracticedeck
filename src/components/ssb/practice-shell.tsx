"use client";

import { useEffect, useState } from "react";
import { AuthenticatedPractice } from "@/components/ssb/authenticated-practice";
import type { SsbSectionPayload } from "@/domain/ssb/types";
import { getLecturette, getSRT, getTAT, getWAT } from "@/services/ssb";

export function PracticeShell() {
  const [data, setData] = useState<SsbSectionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setError(null);

      try {
        const [wat, srt, tat, lecturette] = await Promise.all([
          getWAT(),
          getSRT(),
          getTAT(),
          getLecturette(),
        ]);

        if (!mounted) {
          return;
        }

        setData({ wat, srt, tat, lecturette });
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load SSB content.";
        setError(message);
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="rounded-2xl border border-rose-300/35 bg-rose-400/12 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm uppercase tracking-[0.2em] text-slate-300/80">
        Loading deck
      </div>
    );
  }

  return <AuthenticatedPractice data={data} />;
}
