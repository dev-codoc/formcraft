import { Schema, model, models, Document } from "mongoose";

/**
 * Records every processed Razorpay webhook event ID so retried/duplicate
 * deliveries (Razorpay retries on non-2xx responses) don't double-apply effects
 * like extending a subscription period twice.
 */
export interface IWebhookEvent extends Document {
  eventId: string; // Razorpay's `payload.payment.entity.id` + event type, or x-razorpay-event-id if present
  eventType: string;
  processedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

export default models.WebhookEvent || model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
