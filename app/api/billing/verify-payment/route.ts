import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { verifySubscriptionSignature } from "@/lib/razorpay/verifySignature";
import Subscription from "@/models/Subscription";

interface VerifyPaymentBody {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

/**
 * Called by the client immediately after Razorpay Checkout's success callback fires.
 * This gives the UI an instant "you're upgraded" state WITHOUT trusting the client —
 * the signature check below is what actually proves the payment is legitimate.
 *
 * This is a UX optimization, not the source of truth: the webhook
 * (subscription.charged) is what should be treated as the final confirmation,
 * since this route can theoretically be skipped if the user closes the tab
 * right after paying.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: VerifyPaymentBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const isValid = verifySubscriptionSignature({
    paymentId: razorpay_payment_id,
    subscriptionId: razorpay_subscription_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    console.warn("Razorpay signature verification failed for", razorpay_subscription_id);
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  try {
    await connectDB();

    const subscription = await Subscription.findOne({
      userId: session.user.id,
      razorpaySubscriptionId: razorpay_subscription_id,
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription record not found" }, { status: 404 });
    }

    // Optimistically mark active for instant UI feedback — webhook will
    // reconcile currentPeriodStart/End with the authoritative values shortly after.
    subscription.status = "active";
    await subscription.save();

    return NextResponse.json({ verified: true, plan: subscription.plan });
  } catch (err) {
    console.error("verify-payment error:", err);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
