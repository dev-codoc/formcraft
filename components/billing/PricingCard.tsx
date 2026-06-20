import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanConfig } from "@/lib/razorpay/plans";
import type { BillingCycle } from "@/lib/razorpay/plans";

const FEATURE_COPY: Record<string, (limits: PlanConfig["limits"]) => string> = {
  maxForms: (l) => (l.maxForms === -1 ? "Unlimited forms" : `${l.maxForms} forms`),
  maxResponsesPerMonth: (l) =>
    l.maxResponsesPerMonth === -1 ? "Unlimited responses" : `${l.maxResponsesPerMonth.toLocaleString("en-IN")} responses/month`,
  aiGenerationsPerMonth: (l) =>
    l.aiGenerationsPerMonth === -1 ? "Unlimited AI generations" : `${l.aiGenerationsPerMonth} AI generations/month`,
  removeBranding: (l) => (l.removeBranding ? "Remove FormCraft branding" : "FormCraft branding included"),
  teamSeats: (l) => (l.teamSeats > 1 ? `${l.teamSeats} team seats` : "1 team seat"),
  webhooksEnabled: (l) => (l.webhooksEnabled ? "Webhooks & integrations" : ""),
};

interface PricingCardProps {
  plan: PlanConfig;
  billingCycle: BillingCycle;
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSelect: (planKey: PlanConfig["key"]) => void;
  loading?: boolean;
}

export function PricingCard({
  plan,
  billingCycle,
  isCurrentPlan,
  isPopular,
  onSelect,
  loading,
}: PricingCardProps) {
  const price = plan.priceINR[billingCycle];
  const monthlyEquivalent = billingCycle === "yearly" ? Math.round(price / 12) : price;

  const features = Object.entries(FEATURE_COPY)
    .map(([key, copy]) => copy(plan.limits))
    .filter(Boolean);

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        isPopular && "border-zinc-900 shadow-md dark:border-zinc-100"
      )}
    >
      {isPopular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-white dark:bg-white dark:text-zinc-900">
          Most popular
        </div>
      )}

      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</h3>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{plan.description}</p>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            ₹{monthlyEquivalent.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-zinc-400">/month</span>
        </div>
        {billingCycle === "yearly" && price > 0 && (
          <p className="mt-0.5 text-[11px] text-zinc-400">
            ₹{price.toLocaleString("en-IN")} billed yearly
          </p>
        )}

        <ul className="mt-4 flex-1 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          className="mt-5 w-full"
          variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
          disabled={isCurrentPlan || loading}
          onClick={() => onSelect(plan.key)}
        >
          {isCurrentPlan ? "Current plan" : loading ? "Loading..." : plan.key === "free" ? "Downgrade" : "Upgrade"}
        </Button>
      </CardContent>
    </Card>
  );
}
