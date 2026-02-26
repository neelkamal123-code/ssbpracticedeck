"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  LogOut,
  Save,
  Sparkles,
} from "lucide-react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { UpgradePlansModal } from "@/components/billing/upgrade-plans-modal";
import { PLAN_UNLOCK_STORAGE_KEY } from "@/lib/billing/plans";
import { useAuth, type ProfileFieldValues } from "@/providers/auth-provider";

function fromProfile(
  profile: ReturnType<typeof useAuth>["profile"],
): ProfileFieldValues {
  return {
    age: profile?.age ?? "",
    stateOfResidence: profile?.stateOfResidence ?? "",
    highestEducation: profile?.highestEducation ?? "",
    schoolName: profile?.schoolName ?? "",
    collegeName: profile?.collegeName ?? "",
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    profile,
    loading,
    profilePending,
    updateProfileFields,
    uploadAvatar,
    signOut,
    setShouldPromptOnboarding,
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<ProfileFieldValues>(fromProfile(profile));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [hasPremium, setHasPremium] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(PLAN_UNLOCK_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    setValues(fromProfile(profile));
  }, [profile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm uppercase tracking-[0.2em] text-slate-300/80">
        Loading profile
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateProfileFields(values);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      const saveMessage =
        saveError instanceof Error ? saveError.message : "Unable to update profile.";
      setError(saveMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      await uploadAvatar(selectedFile);
      setMessage("Profile photo updated.");
    } catch (uploadError) {
      const uploadMessage =
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to update photo.";
      setError(uploadMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const goToGuidedSetup = () => {
    setShouldPromptOnboarding(true);
    router.push("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-7">
      <div className="pointer-events-none absolute inset-0">
        <div className="stars absolute inset-0 opacity-70" />
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-cyan-300/10 blur-[140px]" />
        <div className="absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-blue-500/15 blur-[140px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[56rem] space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">
              Account
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
              Profile
            </h1>
            <p className="text-sm text-slate-300/80 sm:text-base">
              Keep your details updated for better personalized guidance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-cyan-100 transition-colors hover:bg-cyan-300/22"
            >
              Back to practice
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/[0.05] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-slate-100 transition-colors hover:bg-white/[0.14]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </header>

        {profilePending ? (
          <section className="glass-card rounded-3xl border border-amber-200/45 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                Profile completion pending. Fill all fields to complete setup.
              </p>
              <button
                type="button"
                onClick={goToGuidedSetup}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/45 bg-amber-300/14 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-amber-100 transition-colors hover:bg-amber-300/22"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Complete with guided flow
              </button>
            </div>
          </section>
        ) : (
          <section className="glass-card rounded-3xl border border-emerald-200/35 p-4 sm:p-5">
            <p className="inline-flex items-center gap-2 text-sm text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Profile complete.
            </p>
          </section>
        )}

        <section
          className={`glass-card rounded-3xl p-4 sm:p-5 ${
            hasPremium
              ? "border border-emerald-200/35"
              : "border border-cyan-200/35"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">
                Plan
              </p>
              <p
                className={`mt-1 text-sm ${
                  hasPremium ? "text-emerald-100" : "text-cyan-100"
                }`}
              >
                {hasPremium
                  ? "Premium plan active"
                  : "You are on Free tier"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPlans(true)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                hasPremium
                  ? "border-emerald-200/45 bg-emerald-300/16 text-emerald-100 hover:bg-emerald-300/24"
                  : "border-cyan-300/40 bg-cyan-300/16 text-cyan-100 hover:bg-cyan-300/24"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {hasPremium ? "Manage Plan" : "Upgrade"}
            </button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[18rem_1fr]">
          <article className="glass-card rounded-[30px] border border-white/14 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">
              Profile Photo
            </p>
            <div className="mt-4 flex flex-col items-center gap-4">
              <Image
                src={profile?.avatarUrl || "/avatars/default-user.svg"}
                alt="User avatar"
                width={144}
                height={144}
                className="h-36 w-36 rounded-[24px] border border-white/20 object-cover shadow-[0_18px_40px_rgba(1,8,24,0.48)]"
                unoptimized
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.05] px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] text-slate-100 transition-colors hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" />
                )}
                {uploading ? "Updating..." : "Upload / Update"}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-300/75">
              Logged in as {user.email} via {user.provider}.
            </p>
          </article>

          <article className="glass-card rounded-[30px] border border-white/14 p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">
              Personal Details
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-300/85">
                <span className="text-xs uppercase tracking-[0.16em] text-slate-300/70">
                  Age
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={values.age}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, age: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/16 bg-slate-950/30 px-3 py-2.5 text-slate-100 focus:border-cyan-300/55 focus:outline-none"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-300/85">
                <span className="text-xs uppercase tracking-[0.16em] text-slate-300/70">
                  State of Residence
                </span>
                <input
                  type="text"
                  value={values.stateOfResidence}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      stateOfResidence: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/16 bg-slate-950/30 px-3 py-2.5 text-slate-100 focus:border-cyan-300/55 focus:outline-none"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-300/85">
                <span className="text-xs uppercase tracking-[0.16em] text-slate-300/70">
                  Highest Education
                </span>
                <input
                  type="text"
                  value={values.highestEducation}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      highestEducation: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/16 bg-slate-950/30 px-3 py-2.5 text-slate-100 focus:border-cyan-300/55 focus:outline-none"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-300/85">
                <span className="text-xs uppercase tracking-[0.16em] text-slate-300/70">
                  School Name
                </span>
                <input
                  type="text"
                  value={values.schoolName}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      schoolName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/16 bg-slate-950/30 px-3 py-2.5 text-slate-100 focus:border-cyan-300/55 focus:outline-none"
                />
              </label>

              <label className="space-y-1 text-sm text-slate-300/85 sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.16em] text-slate-300/70">
                  College Name
                </span>
                <input
                  type="text"
                  value={values.collegeName}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      collegeName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/16 bg-slate-950/30 px-3 py-2.5 text-slate-100 focus:border-cyan-300/55 focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/16 px-4 py-2 text-xs uppercase tracking-[0.15em] text-cyan-100 transition-colors hover:bg-cyan-300/24 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </button>

              {message ? (
                <p className="text-sm text-emerald-100">{message}</p>
              ) : null}
              {error ? <p className="text-sm text-rose-200">{error}</p> : null}
            </div>
          </article>
        </section>
        <UpgradePlansModal
          open={showPlans}
          onClose={() => setShowPlans(false)}
          onSuccess={() => setHasPremium(true)}
        />
      </main>
    </div>
  );
}
