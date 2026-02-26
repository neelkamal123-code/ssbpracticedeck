"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { useAuth, type ProfileFieldValues } from "@/providers/auth-provider";

interface ProfileOnboardingProps {
  open: boolean;
  onClose: () => void;
}

const questionFlow: Array<{ key: keyof ProfileFieldValues; label: string; hint: string }> =
  [
    {
      key: "age",
      label: "What is your age?",
      hint: "Enter your current age.",
    },
    {
      key: "stateOfResidence",
      label: "State of residence?",
      hint: "Example: Maharashtra",
    },
    {
      key: "highestEducation",
      label: "Highest level of education?",
      hint: "Example: Undergraduate",
    },
    {
      key: "schoolName",
      label: "School name?",
      hint: "Your most recent school.",
    },
    {
      key: "collegeName",
      label: "College name?",
      hint: "Enter college or institute name.",
    },
  ];

function getInitialValues(profile: ReturnType<typeof useAuth>["profile"]): ProfileFieldValues {
  return {
    age: profile?.age ?? "",
    stateOfResidence: profile?.stateOfResidence ?? "",
    highestEducation: profile?.highestEducation ?? "",
    schoolName: profile?.schoolName ?? "",
    collegeName: profile?.collegeName ?? "",
  };
}

export function ProfileOnboarding({ open, onClose }: ProfileOnboardingProps) {
  const { profile, saveProfileFields, skipProfileQuestions } = useAuth();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ProfileFieldValues>(getInitialValues(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(0);
    setError(null);
    setValues(getInitialValues(profile));
  }, [open, profile]);

  const currentQuestion = questionFlow[step];
  const isLast = step === questionFlow.length - 1;
  const progress = ((step + 1) / questionFlow.length) * 100;

  const currentValue = values[currentQuestion.key];
  const canProceed = useMemo(() => currentValue.trim().length > 0, [currentValue]);

  const next = () => {
    if (!canProceed || isLast) {
      return;
    }
    setStep((currentStep) => currentStep + 1);
    setError(null);
  };

  const back = () => {
    if (step === 0) {
      return;
    }
    setStep((currentStep) => currentStep - 1);
    setError(null);
  };

  const finish = async () => {
    const hasEmpty = questionFlow.some(
      (question) => values[question.key].trim().length === 0,
    );
    if (hasEmpty) {
      setError("Please complete all fields or use Skip for now.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveProfileFields(values);
      onClose();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Unable to save profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    setSaving(true);
    setError(null);
    try {
      await skipProfileQuestions();
      onClose();
    } catch (skipError) {
      const message =
        skipError instanceof Error ? skipError.message : "Unable to skip right now.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-md"
        >
          <div className="relative w-full max-w-[34rem]">
            <div className="pointer-events-none absolute inset-x-6 top-6 h-full rounded-[28px] border border-white/8 bg-slate-900/20" />
            <div className="pointer-events-none absolute inset-x-10 top-10 h-full rounded-[28px] border border-white/5 bg-slate-900/16" />

            <motion.section
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 250, damping: 26 }}
              className="glass-card relative rounded-[30px] border border-cyan-200/30 p-5 shadow-[0_32px_90px_rgba(1,8,24,0.6)] sm:p-6"
            >
              <header className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/14 px-3 py-1 text-[0.66rem] uppercase tracking-[0.16em] text-cyan-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Question {step + 1} of {questionFlow.length}
                  </div>
                  <button
                    type="button"
                    onClick={skip}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded-full border border-white/18 bg-white/[0.04] px-3 py-1 text-[0.63rem] uppercase tracking-[0.16em] text-slate-200 transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <X className="h-3.5 w-3.5" />
                    Skip for now
                  </button>
                </div>

                <div className="h-1.5 rounded-full bg-white/10">
                  <motion.div
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 240, damping: 28 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300/90 via-sky-300/90 to-emerald-300/90"
                  />
                </div>
              </header>

              <div className="mt-5 rounded-[24px] border border-white/14 bg-slate-950/30 p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300/72">
                  Profile Setup
                </p>
                <h3 className="mt-3 font-display text-[1.6rem] leading-tight text-slate-100 sm:text-[2rem]">
                  {currentQuestion.label}
                </h3>
                <p className="mt-2 text-sm text-slate-300/78">{currentQuestion.hint}</p>

                <input
                  type={currentQuestion.key === "age" ? "number" : "text"}
                  inputMode={currentQuestion.key === "age" ? "numeric" : "text"}
                  value={values[currentQuestion.key]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [currentQuestion.key]: event.target.value,
                    }))
                  }
                  placeholder={currentQuestion.hint}
                  className="mt-5 w-full rounded-2xl border border-white/16 bg-slate-900/50 px-4 py-3 text-base text-slate-100 placeholder:text-slate-400/70 focus:border-cyan-300/55 focus:outline-none"
                />
              </div>

              {error ? (
                <p className="mt-4 rounded-2xl border border-amber-200/35 bg-amber-200/10 px-3 py-2 text-sm text-amber-100">
                  {error}
                </p>
              ) : null}

              <footer className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  disabled={saving || step === 0}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.15em] text-slate-200 transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>

                {isLast ? (
                  <button
                    type="button"
                    onClick={finish}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/50 bg-emerald-300/18 px-4 py-2 text-xs uppercase tracking-[0.15em] text-emerald-100 transition-colors hover:bg-emerald-300/26 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Finish Setup"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={next}
                    disabled={saving || !canProceed}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/45 bg-cyan-300/18 px-4 py-2 text-xs uppercase tracking-[0.15em] text-cyan-100 transition-colors hover:bg-cyan-300/26 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </footer>
            </motion.section>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
