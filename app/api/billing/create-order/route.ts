import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { razorpay, RAZORPAY_PUBLIC_KEY } from "@/lib/razorpay/client";
import { getPlan, type PlanKey, type BillingCycle } from "@/lib/razorpay/plans";
import Subscription from "@/models/Subscription";

interface CreateOrderBody {
  plan: PlanKey;
  billingCycle: BillingCycle;
}

/**
 * Creates a Razorpay subscription (not a one-time order — FormCraft plans are
 * recurring) and returns the subscription ID for the client to open the
 * Razorpay Checkout modal against.
 *
 * Flow: client picks a plan → this route creates a pending Razorpay subscription
 * → client opens checkout with that subscription_id → on success, client calls
 * /api/billing/verify-payment → webhook independently confirms via subscription.charged.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateOrderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { plan: planKey, billingCycle } = body;

  if (planKey === "free") {
    return NextResponse.json({ error: "Free plan doesn't require checkout" }, { status: 400 });
  }

  const plan = getPlan(planKey);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const razorpayPlanId = plan.razorpayPlanId[billingCycle];
  if (!razorpayPlanId) {
    return NextResponse.json(
      { error: `No Razorpay plan configured for ${planKey} (${billingCycle})` },
      { status: 500 }
    );
  }

  try {
    await connectDB();

    // Reuse existing Razorpay customer if this user already has one on file
    const existingSub = await Subscription.findOne({ userId: session.user.id });

    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: billingCycle === "monthly" ? 12 : 1, // 12 monthly cycles, or 1 yearly cycle (auto-renews via Razorpay)
      notes: {
        userId: session.user.id,
        plan: planKey,
        billingCycle,
      },
    });

    // Upsert a pending Subscription record — webhook will flip this to "active"
    // once Razorpay confirms the first charge actually succeeded.
    await Subscription.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        plan: planKey,
        billingCycle,
        status: "incomplete",
        razorpaySubscriptionId: razorpaySubscription.id,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      subscriptionId: razorpaySubscription.id,
      razorpayKeyId: RAZORPAY_PUBLIC_KEY,
      plan: planKey,
      billingCycle,
    });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
