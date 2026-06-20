/**
 * Single source of truth for FormCraft AI's pricing plans.
 * Razorpay plan IDs come from your Razorpay Dashboard → Subscriptions → Plans
 * (create one Plan per billing cycle, e.g. pro-monthly and pro-yearly separately).
 */

export type PlanKey = "free" | "pro" | "business";
export type BillingCycle = "monthly" | "yearly";

export interface PlanLimits {
  maxForms: number; // -1 = unlimited
  maxResponsesPerMonth: number; // -1 = unlimited
  removeBranding: boolean;
  aiGenerationsPerMonth: number; // -1 = unlimited
  teamSeats: number;
  webhooksEnabled: boolean;
}

export interface PlanConfig {
  key: PlanKey;
  name: string;
  description: string;
  priceINR: { monthly: number; yearly: number }; // in rupees, not paise
  razorpayPlanId: { monthly: string | null; yearly: string | null }; // null for free plan
  limits: PlanLimits;
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  free: {
    key: "free",
    name: "Free",
    description: "For trying FormCraft out",
    priceINR: { monthly: 0, yearly: 0 },
    razorpayPlanId: { monthly: null, yearly: null },
    limits: {
      maxForms: 3,
      maxResponsesPerMonth: 100,
      removeBranding: false,
      aiGenerationsPerMonth: 10,
      teamSeats: 1,
      webhooksEnabled: false,
    },
  },
  pro: {
    key: "pro",
    name: "Pro",
    description: "For freelancers and small teams",
    priceINR: { monthly: 499, yearly: 4990 }, // ~2 months free on yearly
    razorpayPlanId: {
      monthly: process.env.RAZORPAY_PLAN_PRO_MONTHLY ?? "",
      yearly: process.env.RAZORPAY_PLAN_PRO_YEARLY ?? "",
    },
    limits: {
      maxForms: -1,
      maxResponsesPerMonth: 5000,
      removeBranding: true,
      aiGenerationsPerMonth: -1,
      teamSeats: 1,
      webhooksEnabled: false,
    },
  },
  business: {
    key: "business",
    name: "Business",
    description: "For growing teams",
    priceINR: { monthly: 999, yearly: 9990 },
    razorpayPlanId: {
      monthly: process.env.RAZORPAY_PLAN_BUSINESS_MONTHLY ?? "",
      yearly: process.env.RAZORPAY_PLAN_BUSINESS_YEARLY ?? "",
    },
    limits: {
      maxForms: -1,
      maxResponsesPerMonth: -1,
      removeBranding: true,
      aiGenerationsPerMonth: -1,
      teamSeats: 5,
      webhooksEnabled: true,
    },
  },
};

export function getPlan(key: PlanKey): PlanConfig {
  return PLANS[key];
}

/** Reverse-lookup: given a Razorpay plan ID from a webhook payload, find which internal plan it maps to */
export function getPlanByRazorpayId(razorpayPlanId: string): PlanConfig | null {
  for (const plan of Object.values(PLANS)) {
    if (plan.razorpayPlanId.monthly === razorpayPlanId || plan.razorpayPlanId.yearly === razorpayPlanId) {
      return plan;
    }
  }
  return null;
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}
