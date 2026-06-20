import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyWebhookSignature } from "@/lib/razorpay/verifySignature";
import { getPlanByRazorpayId } from "@/lib/razorpay/plans";
import Subscription from "@/models/Subscription";
import WebhookEvent from "@/models/WebhookEvent";

/**
 * Razorpay webhook handler — this is the SOURCE OF TRUTH for subscription state,
 * not the client-side verify-payment route. Configure this URL in
 * Razorpay Dashboard → Webhooks, subscribed to:
 *   subscription.activated, subscription.charged, subscription.cancelled,
 *   subscription.halted, payment.failed
 *
 * CRITICAL: signature must be verified against the RAW request body, not the
 * parsed JSON — any re-serialization changes whitespace/key order and breaks the HMAC.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
  }

  const isValid = verifyWebhookSignature({ rawBody, signature });
  if (!isValid) {
    console.warn("Razorpay webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const eventType: string = payload.event;

  await connectDB();

  // Idempotency: Razorpay retries webhooks that don't return 2xx, so the same
  // event can arrive more than once. Build a stable ID from the entity + event type.
  const entityId =
    payload.payload?.subscription?.entity?.id ??
    payload.payload?.payment?.entity?.id ??
    payload.id;
  const eventId = `${eventType}:${entityId}`;

  const alreadyProcessed = await WebhookEvent.findOne({ eventId });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (eventType) {
      case "subscription.activated":
      case "subscription.charged": {
        const sub = payload.payload.subscription.entity;
        const razorpayPlanId = sub.plan_id;
        const matchedPlan = getPlanByRazorpayId(razorpayPlanId);

        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: sub.id },
          {
            status: "active",
            plan: matchedPlan?.key, // keep DB plan in sync with whatever Razorpay says is active
            currentPeriodStart: sub.current_start ? new Date(sub.current_start * 1000) : undefined,
            currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : undefined,
            cancelAtPeriodEnd: false,
          }
        );
        break;
      }

      case "subscription.pending":
      case "subscription.halted": {
        // halted = Razorpay gave up retrying a failed charge — treat as past_due,
        // gate features via checkUsageLimit's free-tier fallback rather than hard-locking
        const sub = payload.payload.subscription.entity;
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: sub.id },
          { status: "past_due" }
        );
        break;
      }

      case "subscription.cancelled": {
        const sub = payload.payload.subscription.entity;
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: sub.id },
          { status: "cancelled", cancelAtPeriodEnd: false }
        );
        break;
      }

      case "payment.failed": {
        // Individual charge failure within an active subscription cycle —
        // Razorpay will auto-retry per your retry config before halting.
        const payment = payload.payload.payment.entity;
        if (payment.subscription_id) {
          await Subscription.findOneAndUpdate(
            { razorpaySubscriptionId: payment.subscription_id },
            { status: "past_due" }
          );
        }
        break;
      }

      default:
        // Unhandled event types are fine to ignore — just acknowledge receipt
        break;
    }

    await WebhookEvent.create({ eventId, eventType });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook processing error:", err);
    // Return 500 so Razorpay retries — but the idempotency check above means
    // a successful retry won't double-apply whatever DID get processed before the error.
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
