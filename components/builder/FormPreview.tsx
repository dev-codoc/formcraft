"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function FormPreview({
  fields,
}: {
  fields: any[];
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block mb-1 text-sm font-medium">
            {field.label}
          </label>

          {field.type === "textarea" ? (
            <Textarea
              placeholder={field.placeholder}
            />
          ) : (
            <Input
              placeholder={field.placeholder}
              type={field.type}
            />
          )}
        </div>
      ))}
    </div>
  );
}