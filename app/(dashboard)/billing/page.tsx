import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import UsageLog, { getCurrentPeriod } from "@/models/UsageLog";
import { getPlan } from "@/lib/razorpay/plans";
import { razorpay } from "@/lib/razorpay/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { UsageMeter } from "@/components/billing/UsageMeter";
import { PastDueBanner } from "@/components/billing/PastDueBanner";
import { CancelSubscriptionButton } from "./CancelSubscriptionButton";

async function getBillingData(userId: string) {
  await connectDB();

  const subscription = await Subscription.findOne({ userId }).lean();
  const period = getCurrentPeriod();
  const usage = await UsageLog.findOne({ userId, period }).lean();

  let invoices: { id: string; amount: number; date: string; status: string }[] = [];
  if (subscription?.razorpaySubscriptionId) {
    try {
      const result = await razorpay.invoices.all({
        subscription_id: subscription.razorpaySubscriptionId,
      });
      // Razorpay's SDK types invoice fields loosely (amount can be string|number|
      // undefined), so coerce through a permissive shape rather than trusting it.
      const items = result.items as unknown as Array<{
        id?: string;
        amount?: string | number;
        created_at?: number;
        status?: string;
      }>;
      invoices = items.map((inv) => ({
        id: String(inv.id ?? ""),
        amount: Number(inv.amount ?? 0) / 100, // paise → rupees
        date: new Date(Number(inv.created_at ?? 0) * 1000).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: String(inv.status ?? ""),
      }));
    } catch {
      // Razorpay API hiccup shouldn't block the whole billing page from rendering
      invoices = [];
    }
  }

  return {
    subscription: subscription ? JSON.parse(JSON.stringify(subscription)) : null,
    usage: usage ? JSON.parse(JSON.stringify(usage)) : null,
    invoices,
  };
}

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { subscription, usage, invoices } = await getBillingData(session.user.id);
  const planKey = subscription?.plan ?? "free";
  const plan = getPlan(planKey);
  const isPastDue = subscription?.status === "past_due";

  const current = {
    forms: usage?.formsCreated ?? 0,
    responses: usage?.responsesReceived ?? 0,
    aiGenerations: usage?.aiGenerationsUsed ?? 0,
  };

  return (
    <div className="space-y-4">
      {isPastDue && <PastDueBanner />}

      <div className="flex items-center justify-between">
        <div>
          <p className="field-id">plan · usage</p>
          <h1 className="mt-1 font-display text-lg font-semibold text-foreground">Billing</h1>
        </div>
        <Link href="/billing/pricing">
          <Button size="sm">{planKey === "free" ? "Upgrade plan" : "Change plan"}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Current plan</CardTitle>
            <PlanBadge plan={planKey} status={subscription?.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.currentPeriodEnd && (
            <p className="text-xs text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? `Access ends on ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
                : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`}
            </p>
          )}

          <div className="space-y-3">
            <UsageMeter label="Forms" current={current.forms} limit={plan.limits.maxForms} />
            <UsageMeter
              label="Responses this month"
              current={current.responses}
              limit={plan.limits.maxResponsesPerMonth}
            />
            <UsageMeter
              label="AI generations this month"
              current={current.aiGenerations}
              limit={plan.limits.aiGenerationsPerMonth}
            />
          </div>

          {planKey !== "free" && subscription && !subscription.cancelAtPeriodEnd && (
            <CancelSubscriptionButton />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Invoice history</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-xs text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-muted-foreground">{invoice.date}</span>
                  <span className="font-medium text-foreground">
                    ₹{invoice.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="field-id capitalize">{invoice.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
