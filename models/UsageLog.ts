import mongoose, { Schema, model, models, Document } from "mongoose";

/**
 * Tracks per-user, per-month usage counters so checkUsageLimit() can compare
 * against plan limits without re-counting raw Form/Response documents on every request.
 *
 * One document per user per calendar month, identified by `period` (e.g. "2026-06").
 */
export interface IUsageLog extends Document {
  userId: mongoose.Types.ObjectId;
  period: string; // "YYYY-MM", e.g. "2026-06"
  formsCreated: number;
  responsesReceived: number;
  aiGenerationsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const UsageLogSchema = new Schema<IUsageLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    period: { type: String, required: true, index: true },
    formsCreated: { type: Number, default: 0 },
    responsesReceived: { type: Number, default: 0 },
    aiGenerationsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One usage doc per user per month
UsageLogSchema.index({ userId: 1, period: 1 }, { unique: true });

export default models.UsageLog || model<IUsageLog>("UsageLog", UsageLogSchema);

/** Helper: current period key in "YYYY-MM" format, IST-safe enough for monthly buckets */
export function getCurrentPeriod(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
