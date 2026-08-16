"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PLANS, type PlanKey, type BillingCycle } from "@/lib/razorpay/plans";
import { PricingCard } from "@/components/billing/PricingCard";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currentPlan, setCurrentPlan] = useState<PlanKey>("free");
  const [upgradeTarget, setUpgradeTarget] = useState<PlanKey | null>(null);

  useEffect(() => {
    fetch("/api/billing/current-plan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.plan && setCurrentPlan(data.plan))
      .catch(() => {
        // silently fall back to "free" if this fails — the page is still usable
      });
  }, []);

  function handleSelect(planKey: PlanKey) {
    if (planKey === "free") {
      // Downgrade flow — route to billing page where cancel-subscription lives,
      // rather than duplicating that logic here
      window.location.href = "/billing";
      return;
    }
    setUpgradeTarget(planKey);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/billing"
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to billing
      </Link>

      <div className="text-center">
        <p className="field-id">pricing · plans</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-foreground">
          Choose your plan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upgrade or downgrade anytime. No hidden fees.
        </p>

        <div className="mt-5 inline-flex items-center rounded-full border border-border p-0.5">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              billingCycle === "yearly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
            <span className="ml-1 text-primary">save ~17%</span>
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <PricingCard
            key={plan.key}
            plan={plan}
            billingCycle={billingCycle}
            isCurrentPlan={plan.key === currentPlan}
            isPopular={plan.key === "pro"}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {upgradeTarget && (
        <UpgradeModal
          planKey={upgradeTarget}
          billingCycle={billingCycle}
          onClose={() => setUpgradeTarget(null)}
        />
      )}
    </div>
  );
}
