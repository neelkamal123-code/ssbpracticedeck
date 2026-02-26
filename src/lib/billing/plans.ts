export type BillingCycle = "monthly" | "yearly";

export interface PlanLimits {
  wat: number;
  srt: number;
  tat: number;
  lecturette: number;
}

export interface PracticePlan {
  id: "starter" | "pro" | "elite";
  name: string;
  subtitle: string;
  limits: PlanLimits;
  pricing: {
    monthly: number;
    yearly: number;
  };
}

export const PLAN_UNLOCK_STORAGE_KEY = "ssb_paid_unlock_v1";

export const PRACTICE_PLANS: PracticePlan[] = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Best for steady daily prep",
    limits: {
      wat: 25,
      srt: 20,
      tat: 10,
      lecturette: 10,
    },
    pricing: {
      monthly: 249,
      yearly: 2499,
    },
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "Double practice capacity",
    limits: {
      wat: 50,
      srt: 40,
      tat: 20,
      lecturette: 20,
    },
    pricing: {
      monthly: 449,
      yearly: 4499,
    },
  },
  {
    id: "elite",
    name: "Elite",
    subtitle: "Maximum volume for fast-track prep",
    limits: {
      wat: 100,
      srt: 80,
      tat: 50,
      lecturette: 50,
    },
    pricing: {
      monthly: 799,
      yearly: 7999,
    },
  },
];

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
