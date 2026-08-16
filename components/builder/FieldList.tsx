"use client";

import { GripVertical, Trash2 } from "lucide-react";
import type { FormField } from "@/hooks/useFormBuilder";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  text: "short answer",
  textarea: "long answer",
  email: "email",
  number: "number",
  select: "dropdown",
  radio: "single choice",
  checkbox: "checkboxes",
  date: "date",
  file: "file upload",
  rating: "rating",
};

export function FieldList({
  fields,
  selectedId,
  selectedFieldId,
  onSelect,
  onDelete,
}: {
  fields: FormField[];
  selectedId?: string;
  selectedFieldId?: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onReorder?: (fields: FormField[]) => void;
}) {
  const activeId = selectedId ?? selectedFieldId;

  return (
    <div className="drafting-grid min-h-full rounded-md border border-border p-3 sm:p-4">
      {!fields.length ? (
        <div className="grid min-h-72 place-items-center rounded-sm border border-dashed border-clay/50 bg-card/70 p-8 text-center">
          <div className="max-w-xs">
            <p className="field-id mb-2">empty canvas</p>
            <p className="text-sm font-medium text-foreground">
              Nothing on the table yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a field from the library to start drafting your form.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {fields.map((field, index) => {
            const active = activeId === field.id;
            return (
              <button
                key={field.id}
                onClick={() => onSelect(field.id)}
                aria-pressed={active}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-sm border bg-card p-3.5 text-left transition-colors",
                  "shadow-[0_1px_2px_rgba(43,42,40,0.05)] focus-visible:outline-none",
                  active
                    ? "border-clay ring-1 ring-clay"
                    : "border-border hover:border-clay/60",
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-border bg-background text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    {field.label || "Untitled question"}
                  </span>
                  <span className="field-id mt-1 block">
                    field_{String(index + 1).padStart(3, "0")} ·{" "}
                    {TYPE_LABEL[field.type] ?? field.type}
                    {field.required ? " · required" : ""}
                  </span>
                </span>
                {onDelete && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Delete field"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(field.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.stopPropagation();
                        onDelete(field.id);
                      }
                    }}
                    className="rounded-sm p-2 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
