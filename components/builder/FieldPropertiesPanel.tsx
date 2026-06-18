"use client";

import { Input } from "@/components/ui/input";

export function FieldPropertiesPanel({
  field,
  onUpdate,
}: {
  field: any;
  onUpdate: (field: any) => void;
}) {
  if (!field) {
    return (
      <div className="text-sm text-zinc-500">
        Select a field
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">
        Field Properties
      </h3>

      <div>
        <label className="text-sm">
          Label
        </label>

        <Input
          value={field.label}
          onChange={(e) =>
            onUpdate({
              ...field,
              label: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="text-sm">
          Placeholder
        </label>

        <Input
          value={field.placeholder || ""}
          onChange={(e) =>
            onUpdate({
              ...field,
              placeholder: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}