"use client";

import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FormField, FormSchema } from "@/hooks/useFormBuilder";

export function FormPreview({
  fields,
  schema,
}: {
  fields?: FormField[];
  schema?: FormSchema;
}) {
  const formFields = fields ?? schema?.fields ?? [];

  return (
    <div className="mx-auto max-w-2xl rounded-md border border-border bg-card p-6 panel-float sm:p-8">
      <p className="field-id">Live preview</p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
        {schema?.title || "Your form"}
      </h2>
      {schema?.description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {schema.description}
        </p>
      )}

      <div className="mt-6 space-y-5">
        {formFields.map((field) => (
          <div key={field.id}>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {field.label || "Untitled question"}
              {field.required && <span className="ml-1 text-primary">*</span>}
            </label>

            {field.type === "textarea" ? (
              <Textarea
                disabled
                placeholder={field.placeholder || "Your answer"}
                className="min-h-24"
              />
            ) : field.type === "select" ? (
              <select
                disabled
                className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm text-muted-foreground"
              >
                <option>{field.placeholder || "Choose an option"}</option>
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : ["radio", "checkbox"].includes(field.type) ? (
              <div className="space-y-2">
                {(field.options?.length ? field.options : ["Option 1"]).map(
                  (option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <input
                        disabled
                        type={field.type === "radio" ? "radio" : "checkbox"}
                        className="accent-[var(--sage)]"
                      />
                      {option}
                    </label>
                  ),
                )}
              </div>
            ) : field.type === "rating" ? (
              <div className="flex items-center gap-1 text-clay">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="h-5 w-5" strokeWidth={1.5} />
                ))}
              </div>
            ) : field.type === "file" ? (
              <div className="flex h-16 items-center justify-center rounded-md border border-dashed border-input text-sm text-muted-foreground">
                {field.placeholder || "Drop a file or click to upload"}
              </div>
            ) : (
              <Input
                disabled
                type={
                  ["email", "number", "date", "tel"].includes(field.type)
                    ? field.type
                    : "text"
                }
                placeholder={field.placeholder || "Your answer"}
              />
            )}
          </div>
        ))}
      </div>

      {!formFields.length && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Your questions will appear here.
        </p>
      )}
    </div>
  );
}
