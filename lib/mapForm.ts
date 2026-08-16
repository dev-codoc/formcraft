import type { FormSchema, FieldType } from "@/hooks/useFormBuilder";

/**
 * Shape of a Form document as returned by Mongoose `.lean()`. The stored document
 * uses `_id`/`accentColor`, while the client builder works with a `FormSchema`
 * (`id`/`theme`). Everything that hands a stored form to the client must map
 * between the two — otherwise `schema.id` is `undefined` and autosave PATCHes
 * `/api/forms/undefined`.
 */
export interface LeanFormDoc {
  _id: { toString(): string };
  title?: string;
  description?: string;
  fields?: Array<{
    id: string;
    label?: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    validation?: { minLength?: number; maxLength?: number; pattern?: string };
    order?: number;
  }>;
  accentColor?: string;
  slug: string;
  published?: boolean;
}

export function mapFormDocToSchema(form: LeanFormDoc): FormSchema {
  return {
    id: form._id.toString(),
    title: form.title ?? "Untitled form",
    description: form.description ?? "",
    fields: (form.fields ?? []).map((f, i) => ({
      id: f.id,
      type: (f.type as FieldType) ?? "text",
      label: f.label ?? "",
      placeholder: f.placeholder,
      required: Boolean(f.required),
      options: f.options,
      validation: f.validation,
      order: f.order ?? i,
    })),
    theme: {
      primaryColor: form.accentColor ?? "#7C8B6F",
      fontFamily: "Inter",
    },
  };
}
