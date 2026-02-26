"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, UserCircle2 } from "lucide-react";
import type { SsbSectionPayload } from "@/domain/ssb/types";
import { useAuth } from "@/providers/auth-provider";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ProfileOnboarding } from "@/components/auth/profile-onboarding";
import { UpgradePlansModal } from "@/components/billing/upgrade-plans-modal";
import { PracticeApp } from "@/components/ssb/practice-app";
import { PLAN_UNLOCK_STORAGE_KEY } from "@/lib/billing/plans";

interface AuthenticatedPracticeProps {
  data: SsbSectionPayload;
}

export function AuthenticatedPractice({ data }: AuthenticatedPracticeProps) {
  const [showPlans, setShowPlans] = useState(false);
  const [hasPremium, setHasPremium] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(PLAN_UNLOCK_STORAGE_KEY) === "true";
  });
  const {
    user,
    loading,
    profilePending,
    shouldPromptOnboarding,
    setShouldPromptOnboarding,
  } = useAuth();

  useEffect(() => {
    const syncPlanState = () => {
      setHasPremium(
        window.localStorage.getItem(PLAN_UNLOCK_STORAGE_KEY) === "true",
      );
    };

    syncPlanState();
    window.addEventListener("ssb:plan-unlocked", syncPlanState);
    window.addEventListener("storage", syncPlanState);
    return () => {
      window.removeEventListener("ssb:plan-unlocked", syncPlanState);
      window.removeEventListener("storage", syncPlanState);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm uppercase tracking-[0.2em] text-slate-300/80">
        Loading workspace
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <div className="pointer-events-none fixed right-4 top-4 z-[60] sm:right-7">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPlans(true)}
            className={`inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs uppercase tracking-[0.14em] transition-colors ${
              hasPremium
                ? "border-emerald-200/45 bg-emerald-300/16 text-emerald-100 hover:bg-emerald-300/24"
                : "border-cyan-300/35 bg-cyan-300/12 text-cyan-100 hover:bg-cyan-300/22"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {hasPremium ? "Premium" : "Plans"}
          </button>

          <Link
            href="/profile"
            aria-label="Profile"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/12 text-cyan-100 transition-colors hover:bg-cyan-300/22"
          >
            <UserCircle2 className="h-6 w-6" />
            {profilePending ? (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]" />
            ) : null}
          </Link>
        </div>
      </div>

      <PracticeApp
        data={data}
        onOpenPlans={() => setShowPlans(true)}
        hasPremium={hasPremium}
      />

      <ProfileOnboarding
        open={shouldPromptOnboarding && profilePending}
        onClose={() => setShouldPromptOnboarding(false)}
      />
      <UpgradePlansModal
        open={showPlans}
        onClose={() => setShowPlans(false)}
        onSuccess={() => setHasPremium(true)}
      />
    </>
  );
}
