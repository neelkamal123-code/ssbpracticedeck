"use client";

import { useState, type FormEvent } from "react";
import { SampleModal } from "@/components/ssb/cards/sample-modal";
import {
  BillingCycle,
  formatInr,
  PLAN_UNLOCK_STORAGE_KEY,
  PRACTICE_PLANS,
  type PracticePlan,
} from "@/lib/billing/plans";

interface UpgradePlansModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (selectedPlan: PracticePlan, billingCycle: BillingCycle) => void;
  title?: string;
  subtitle?: string;
}

const initialPaymentForm = {
  fullName: "",
  email: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

export function UpgradePlansModal({
  open,
  onClose,
  onSuccess,
  title = "Unlock More Practice",
  subtitle = "Pick a plan and complete checkout to unlock premium sets and 1-minute Lecturette recording.",
}: UpgradePlansModalProps) {
  const [selectedPlanId, setSelectedPlanId] =
    useState<PracticePlan["id"]>("starter");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [checkoutStep, setCheckoutStep] = useState<"plans" | "payment" | "success">(
    "plans",
  );
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const selectedPlan =
    PRACTICE_PLANS.find((plan) => plan.id === selectedPlanId) ??
    PRACTICE_PLANS[0];
  const selectedPlanPrice =
    billingCycle === "monthly"
      ? selectedPlan.pricing.monthly
      : selectedPlan.pricing.yearly;

  const resetCheckout = () => {
    setCheckoutStep("plans");
    setPaymentError(null);
    setPaymentForm(initialPaymentForm);
    setIsProcessingPayment(false);
  };

  const handleClose = () => {
    if (isProcessingPayment) {
      return;
    }
    onClose();
    resetCheckout();
  };

  const handlePaymentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPaymentError(null);

    const sanitizedCard = paymentForm.cardNumber.replace(/\s+/g, "");
    const hasValidName = paymentForm.fullName.trim().length >= 3;
    const hasValidEmail =
      paymentForm.email.includes("@") && paymentForm.email.includes(".");
    const hasValidCard = /^\d{12,19}$/.test(sanitizedCard);
    const hasValidExpiry = /^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentForm.expiry);
    const hasValidCvv = /^\d{3,4}$/.test(paymentForm.cvv);

    if (
      !hasValidName ||
      !hasValidEmail ||
      !hasValidCard ||
      !hasValidExpiry ||
      !hasValidCvv
    ) {
      setPaymentError("Please enter valid payment details to continue.");
      return;
    }

    setIsProcessingPayment(true);
    window.setTimeout(() => {
      setIsProcessingPayment(false);
      setCheckoutStep("success");
      window.localStorage.setItem(PLAN_UNLOCK_STORAGE_KEY, "true");
      window.dispatchEvent(new Event("ssb:plan-unlocked"));
      onSuccess?.(selectedPlan, billingCycle);
    }, 1100);
  };

  return (
    <SampleModal
      title={title}
      subtitle={subtitle}
      open={open}
      onClose={handleClose}
    >
      {checkoutStep === "plans" ? (
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-white/14 bg-slate-950/35 p-1">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                billingCycle === "monthly"
                  ? "bg-cyan-300/24 text-cyan-100"
                  : "text-slate-300/80 hover:text-slate-100"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                billingCycle === "yearly"
                  ? "bg-emerald-300/24 text-emerald-100"
                  : "text-slate-300/80 hover:text-slate-100"
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {PRACTICE_PLANS.map((plan) => {
              const isActive = selectedPlanId === plan.id;
              const price =
                billingCycle === "monthly"
                  ? plan.pricing.monthly
                  : plan.pricing.yearly;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    isActive
                      ? "border-cyan-200/50 bg-cyan-300/12"
                      : "border-white/12 bg-slate-950/30 hover:bg-white/[0.03]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/90">
                    {plan.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-300/85">
                    {plan.subtitle}
                  </p>
                  <p className="mt-3 font-display text-2xl font-semibold text-slate-100">
                    {formatInr(price)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300/70">
                    {billingCycle === "monthly" ? "per month" : "per year"}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-slate-200/95">
                    <p>{plan.limits.wat} WAT</p>
                    <p>{plan.limits.srt} SRT</p>
                    <p>{plan.limits.tat} TAT</p>
                    <p>{plan.limits.lecturette} Lecturette</p>
                    <p>1 min recording</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCheckoutStep("payment")}
            className="inline-flex items-center justify-center rounded-full border border-cyan-200/45 bg-cyan-300/22 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 transition-colors hover:bg-cyan-300/30"
          >
            Continue to Payment
          </button>
        </div>
      ) : null}

      {checkoutStep === "payment" ? (
        <form className="space-y-4" onSubmit={handlePaymentSubmit}>
          <div className="rounded-2xl border border-cyan-200/30 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/90">
              Selected Plan
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-slate-100">
              {selectedPlan.name}
            </p>
            <p className="mt-1 text-sm text-slate-200/90">
              Amount to pay: {formatInr(selectedPlanPrice)}{" "}
              {billingCycle === "monthly" ? "/ month" : "/ year"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-slate-300/80">
              Full Name
              <input
                value={paymentForm.fullName}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/15 bg-slate-950/35 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none transition-colors focus:border-cyan-300/45"
                placeholder="Enter your full name"
              />
            </label>

            <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-slate-300/80">
              Email
              <input
                type="email"
                value={paymentForm.email}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/15 bg-slate-950/35 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none transition-colors focus:border-cyan-300/45"
                placeholder="you@example.com"
              />
            </label>

            <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-slate-300/80 sm:col-span-2">
              Card Number
              <input
                inputMode="numeric"
                value={paymentForm.cardNumber}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    cardNumber: event.target.value.replace(/[^\d\s]/g, ""),
                  }))
                }
                className="w-full rounded-xl border border-white/15 bg-slate-950/35 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none transition-colors focus:border-cyan-300/45"
                placeholder="1234 5678 9012 3456"
              />
            </label>

            <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-slate-300/80">
              Expiry (MM/YY)
              <input
                value={paymentForm.expiry}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    expiry: event.target.value.replace(/[^\d/]/g, ""),
                  }))
                }
                className="w-full rounded-xl border border-white/15 bg-slate-950/35 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none transition-colors focus:border-cyan-300/45"
                placeholder="MM/YY"
              />
            </label>

            <label className="space-y-1 text-xs uppercase tracking-[0.12em] text-slate-300/80">
              CVV
              <input
                inputMode="numeric"
                value={paymentForm.cvv}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    cvv: event.target.value.replace(/[^\d]/g, ""),
                  }))
                }
                className="w-full rounded-xl border border-white/15 bg-slate-950/35 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none transition-colors focus:border-cyan-300/45"
                placeholder="123"
              />
            </label>
          </div>

          {paymentError ? (
            <p className="rounded-xl border border-rose-300/40 bg-rose-400/12 px-3 py-2 text-sm text-rose-100">
              {paymentError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCheckoutStep("plans");
                setPaymentError(null);
              }}
              className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:bg-white/[0.1]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isProcessingPayment}
              className="inline-flex items-center justify-center rounded-full border border-emerald-200/45 bg-emerald-300/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition-colors hover:bg-emerald-300/28 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isProcessingPayment
                ? "Processing..."
                : `Pay ${formatInr(selectedPlanPrice)}`}
            </button>
          </div>
        </form>
      ) : null}

      {checkoutStep === "success" ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-emerald-200/45 bg-emerald-300/16 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/95">
              Payment Successful
            </p>
            <p className="mt-1 text-sm text-emerald-50">
              {selectedPlan.name} is now active. Premium access is unlocked.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-full border border-emerald-200/45 bg-emerald-300/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition-colors hover:bg-emerald-300/28"
          >
            Continue Practice
          </button>
        </div>
      ) : null}
    </SampleModal>
  );
}
