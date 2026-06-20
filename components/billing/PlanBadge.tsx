import { Badge } from "@/components/ui/badge";
import type { PlanKey } from "@/lib/razorpay/plans";
import { getPlan } from "@/lib/razorpay/plans";
import type { SubscriptionStatus } from "@/models/Subscription";

interface PlanBadgeProps {
  plan: PlanKey;
  status?: SubscriptionStatus;
}

export function PlanBadge({ plan, status }: PlanBadgeProps) {
  const config = getPlan(plan);

  if (status === "past_due") {
    return <Badge variant="destructive">{config.name} · Payment due</Badge>;
  }

  if (status === "cancelled") {
    return <Badge variant="destructive">{config.name} · Cancelled</Badge>;
  }

  if (plan === "free") {
    return <Badge variant="secondary">Free plan</Badge>;
  }

  return <Badge variant="default">{config.name} plan</Badge>;
}
