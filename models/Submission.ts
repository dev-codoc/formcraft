import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  data: Record<string, string | boolean | string[]>;
  submittedAt: Date;
  ip?: string;
  userAgent?: string;
}

const SubmissionSchema = new Schema<ISubmission>({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);