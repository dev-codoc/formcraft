import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { razorpay } from "@/lib/razorpay/client";
import Subscription from "@/models/Subscription";

interface CancelBody {
  // If true, user keeps access until currentPeriodEnd (recommended default — better UX,
  // avoids "I paid for this month and lost access immediately" complaints).
  // If false, cancels immediately.
  cancelAtPeriodEnd?: boolean;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CancelBody = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine, defaults below apply
  }
  const cancelAtPeriodEnd = body.cancelAtPeriodEnd ?? true;

  try {
    await connectDB();

    const subscription = await Subscription.findOne({ userId: session.user.id });

    if (!subscription || !subscription.razorpaySubscriptionId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    if (subscription.plan === "free") {
      return NextResponse.json({ error: "Free plan has nothing to cancel" }, { status: 400 });
    }

    // Razorpay's `cancel_at_cycle_end`: 1 = let current cycle finish, 0 = cancel now
    await razorpay.subscriptions.cancel(
      subscription.razorpaySubscriptionId,
      cancelAtPeriodEnd ? true : false
    );

    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
      // status stays "active" until the period actually ends — webhook flips it
    } else {
      subscription.status = "cancelled";
      subscription.cancelAtPeriodEnd = false;
    }

    await subscription.save();

    return NextResponse.json({
      cancelled: true,
      effectiveImmediately: !cancelAtPeriodEnd,
      accessUntil: subscription.currentPeriodEnd,
    });
  } catch (err) {
    console.error("cancel-subscription error:", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
