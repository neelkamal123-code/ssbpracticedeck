"use client";

import { useState, type FormEvent } from "react";
import { Apple, Chrome, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useAuth, type EmailAuthMode } from "@/providers/auth-provider";

export function AuthScreen() {
  const { signInWithGoogle, signInWithApple, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<EmailAuthMode>("sign-in");
  const [busyProvider, setBusyProvider] = useState<"google" | "apple" | "email" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleProviderSignIn = async (provider: "google" | "apple") => {
    setError(null);
    setBusyProvider(provider);
    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }
    } catch (providerError) {
      const message =
        providerError instanceof Error ? providerError.message : "Sign-in failed.";
      setError(message);
    } finally {
      setBusyProvider(null);
    }
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusyProvider("email");
    try {
      await signInWithEmail(
        {
          email,
          password,
        },
        mode,
      );
    } catch (emailError) {
      const message =
        emailError instanceof Error ? emailError.message : "Email sign-in failed.";
      setError(message);
    } finally {
      setBusyProvider(null);
    }
  };

  const isBusy = busyProvider !== null;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="stars absolute inset-0 opacity-70" />
        <div className="absolute -top-16 left-1/3 h-72 w-72 rounded-full bg-cyan-300/12 blur-[120px]" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-blue-500/16 blur-[120px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[30rem] space-y-5">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300/72">
            SSB Practice
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            Sign In
          </h1>
          <p className="text-sm text-slate-300/80 sm:text-base">
            Continue with your preferred login, then complete your profile details.
          </p>
        </header>

        <section className="glass-card rounded-[30px] border border-cyan-200/20 p-5 shadow-[0_24px_60px_rgba(1,8,24,0.54)] sm:p-6">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleProviderSignIn("google")}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/18 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyProvider === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="h-4 w-4" />
              )}
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleProviderSignIn("apple")}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/18 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyProvider === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Apple className="h-4 w-4" />
              )}
              Continue with Apple
            </button>
          </div>

          <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200/20 to-transparent" />

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-300/78"
              >
                Email
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/18 bg-slate-950/30 px-3">
                <Mail className="h-4 w-4 text-slate-300/70" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cadet@example.com"
                  className="w-full bg-transparent py-3 text-sm text-slate-100 placeholder:text-slate-400/70 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-300/78"
              >
                Password
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/18 bg-slate-950/30 px-3">
                <LockKeyhole className="h-4 w-4 text-slate-300/70" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-transparent py-3 text-sm text-slate-100 placeholder:text-slate-400/70 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-300/14 px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/22 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busyProvider === "email" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {mode === "sign-in" ? "Sign In with Email" : "Create Email Account"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-300/80">
            <span>
              {mode === "sign-in" ? "New here?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() =>
                setMode((current) =>
                  current === "sign-in" ? "sign-up" : "sign-in",
                )
              }
              className="rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.14em] text-slate-100 transition-colors hover:bg-white/[0.1]"
            >
              {mode === "sign-in" ? "Create account" : "Sign in"}
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-300/35 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
