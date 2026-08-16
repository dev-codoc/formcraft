import mongoose, { Schema, Document } from 'mongoose';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'rating';

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface FormField {
  id: string;           // unique id
  label: string;        // display label
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];   // only for select / radio / checkbox
  validation?: FieldValidation;
  order?: number;
}

export interface IForm extends Document {
  title: string;
  description?: string;
  fields: FormField[];
  userId: string;
  slug: string;         // nanoid(8)
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  accentColor?: string;
}

// NOTE: `type` is a reserved keyword in Mongoose schema definitions. Declaring it
// inline as `type: String` makes Mongoose treat the whole field object as a type
// definition, collapsing `fields` into an array of strings — which then throws a
// CastError when we save field objects. Wrapping it as `type: { type: String }`
// (and using a dedicated sub-schema) tells Mongoose we really mean a path named "type".
const FormFieldSchema = new Schema<FormField>(
  {
    id: { type: String, required: true },
    label: { type: String, default: '' },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    placeholder: String,
    options: [String],
    validation: {
      minLength: Number,
      maxLength: Number,
      pattern: String,
    },
    order: Number,
  },
  { _id: false }
);

const FormSchema = new Schema<IForm>({
  title: { type: String, required: true },
  description: String,
  fields: { type: [FormFieldSchema], default: [] },
  userId: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  published: { type: Boolean, default: false },
  accentColor: { type: String, default: '#7C3AED' },
}, { timestamps: true });

// In development, Next.js HMR reuses one Node process, so Mongoose keeps the
// previously-compiled model in its registry (`mongoose.models.Form`) and ignores
// any schema edits — the `models.Form || model(...)` guard just hands back the
// stale model. Drop it on reload so schema changes actually take effect. In
// production there's no HMR, so we keep the cached model (and avoid OverwriteModelError).
if (process.env.NODE_ENV !== 'production' && mongoose.models.Form) {
  mongoose.deleteModel('Form');
}

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);
