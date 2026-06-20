import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import UsageLog, { getCurrentPeriod } from "@/models/UsageLog";
import { getPlan, isUnlimited, type PlanKey } from "@/lib/razorpay/plans";

export type UsageMetric = "forms" | "responses" | "aiGenerations";

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  plan: PlanKey;
  current: number;
  limit: number; // -1 means unlimited
}

const METRIC_TO_LIMIT_KEY = {
  forms: "maxForms",
  responses: "maxResponsesPerMonth",
  aiGenerations: "aiGenerationsPerMonth",
} as const;

const METRIC_TO_LOG_FIELD = {
  forms: "formsCreated",
  responses: "responsesReceived",
  aiGenerations: "aiGenerationsUsed",
} as const;

/**
 * Call this BEFORE performing the action (creating a form, accepting a response,
 * running an AI generation). It does not increment usage — call incrementUsage()
 * separately after the action actually succeeds.
 *
 * Usage:
 *   const check = await checkUsageLimit(userId, "forms");
 *   if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 402 });
 */
export async function checkUsageLimit(
  userId: string,
  metric: UsageMetric
): Promise<UsageCheckResult> {
  await connectDB();

  const subscription = await Subscription.findOne({ userId }).lean();
  const planKey: PlanKey = (subscription?.plan as PlanKey) ?? "free";
  const plan = getPlan(planKey);

  // A past-due or cancelled paid plan should fall back to free-tier limits,
  // not keep granting paid-tier usage indefinitely.
  const effectivePlan =
    subscription && ["active", "trialing"].includes(subscription.status)
      ? plan
      : getPlan("free");

  const limit = effectivePlan.limits[METRIC_TO_LIMIT_KEY[metric]];

  if (isUnlimited(limit)) {
    return { allowed: true, plan: effectivePlan.key, current: 0, limit: -1 };
  }

  const period = getCurrentPeriod();
  const usage = await UsageLog.findOne({ userId, period }).lean();
  const current = usage?.[METRIC_TO_LOG_FIELD[metric]] ?? 0;

  // "forms" is a running total (not monthly), so check it against all-time count separately
  // if your product treats max forms as a lifetime cap rather than monthly — adjust here.

  if (current >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${effectivePlan.name} plan limit of ${limit} ${metric} this month. Upgrade to continue.`,
      plan: effectivePlan.key,
      current,
      limit,
    };
  }

  return { allowed: true, plan: effectivePlan.key, current, limit };
}

/**
 * Call this AFTER the action succeeds (form created, response saved, AI call completed).
 * Uses upsert so the first call of the month creates the UsageLog doc automatically.
 */
export async function incrementUsage(userId: string, metric: UsageMetric, by: number = 1): Promise<void> {
  await connectDB();
  const period = getCurrentPeriod();

  await UsageLog.findOneAndUpdate(
    { userId, period },
    { $inc: { [METRIC_TO_LOG_FIELD[metric]]: by } },
    { upsert: true, new: true }
  );
}
