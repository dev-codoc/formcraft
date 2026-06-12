import mongoose, { Schema, Document } from 'mongoose';

export interface FormField {
  id: string;           // unique id
  label: string;        // display label
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];   // only for select / checkbox
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

const FormSchema = new Schema<IForm>({
  title: { type: String, required: true },
  description: String,
  fields: [{ id: String, label: String, type: String, required: Boolean, placeholder: String, options: [String] }],
  userId: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  published: { type: Boolean, default: false },
  accentColor: { type: String, default: '#7C3AED' },
}, { timestamps: true });

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);