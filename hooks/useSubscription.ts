import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; 
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import UsageLog, { getCurrentPeriod } from "@/models/UsageLog";
import { getPlan } from "@/lib/razorpay/plans";

/**
 * Single combined endpoint for everything the client needs to render billing UI —
 * avoids the useSubscription hook having to make 2-3 separate requests.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const subscription = await Subscription.findOne({ userId: session.user.id }).lean();
  const period = getCurrentPeriod();
  const usage = await UsageLog.findOne({ userId: session.user.id, period }).lean();

  const planKey = subscription?.plan ?? "free";
  const plan = getPlan(planKey);

  return NextResponse.json({
    plan: planKey,
    status: subscription?.status ?? "active",
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    limits: plan.limits,
    usage: {
      forms: usage?.formsCreated ?? 0,
      responses: usage?.responsesReceived ?? 0,
      aiGenerations: usage?.aiGenerationsUsed ?? 0,
    },
  });
}