"use client";

import { Plus } from "lucide-react";

const fieldTypes = [
  "text",
  "textarea",
  "email",
  "number",
  "select",
  "radio",
  "checkbox",
];

export function FieldPalette({
  onAddField,
}: {
  onAddField: (type: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Fields</h3>

      {fieldTypes.map((type) => (
        <button
          key={type}
          onClick={() => onAddField(type)}
          className="w-full flex items-center gap-2 border rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Plus size={16} />
          {type}
        </button>
      ))}
    </div>
  );
}