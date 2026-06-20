import mongoose, { Schema, model, models, Document } from "mongoose";
import type { PlanKey, BillingCycle } from "@/lib/razorpay/plans";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled"
  | "incomplete";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: PlanKey;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  razorpaySubscriptionId: string | null; // null for free plan
  razorpayCustomerId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one active subscription record per user
      index: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free",
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["active", "trialing", "past_due", "cancelled", "incomplete"],
      default: "active",
      required: true,
      index: true,
    },
    razorpaySubscriptionId: { type: String, default: null, index: true },
    razorpayCustomerId: { type: String, default: null },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fast lookup when a webhook arrives with only the Razorpay subscription ID
SubscriptionSchema.index({ razorpaySubscriptionId: 1 });

export default models.Subscription || model<ISubscription>("Subscription", SubscriptionSchema);
