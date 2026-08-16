"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { FormField } from "@/hooks/useFormBuilder";

const HAS_OPTIONS = new Set(["select", "radio", "checkbox"]);

export function FieldPropertiesPanel({
  field,
  onUpdate,
}: {
  field: FormField | null;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
}) {
  if (!field)
    return (
      <aside className="rounded-md border border-dashed border-border bg-card/60 p-5">
        <p className="field-id mb-2">no selection</p>
        <p className="text-sm text-muted-foreground">
          Select a field on the canvas to edit its label, placeholder, and
          options.
        </p>
      </aside>
    );

  const update = (updates: Partial<FormField>) => onUpdate(field.id, updates);
  const options = field.options ?? [];

  const setOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    update({ options: next });
  };
  const addOption = () =>
    update({ options: [...options, `Option ${options.length + 1}`] });
  const removeOption = (index: number) =>
    update({ options: options.filter((_, i) => i !== index) });

  return (
    <aside className="rounded-md border border-border bg-card panel-float">
      <div className="border-b border-border px-4 py-2.5">
        <p className="field-id">Field settings</p>
      </div>

      <div className="space-y-4 p-4">
        <label className="block text-sm font-medium text-foreground">
          Question
          <Input
            value={field.label}
            onChange={(event) => update({ label: event.target.value })}
            className="mt-1.5"
            placeholder="Untitled question"
          />
        </label>

        <label className="block text-sm font-medium text-foreground">
          Placeholder
          <Input
            value={field.placeholder || ""}
            onChange={(event) => update({ placeholder: event.target.value })}
            className="mt-1.5"
            placeholder="Hint text shown in the field"
          />
        </label>

        {HAS_OPTIONS.has(field.type) && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Options</p>
            <div className="space-y-1.5">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="field-id w-10 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Input
                    value={opt}
                    onChange={(event) => setOption(i, event.target.value)}
                    className="h-8"
                  />
                  <button
                    type="button"
                    aria-label={`Remove option ${i + 1}`}
                    onClick={() => removeOption(i)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-2 w-full gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add option
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between rounded-sm border border-border bg-background/60 px-3 py-2.5">
          <span className="text-sm font-medium text-foreground">Required</span>
          <Switch
            checked={field.required}
            onCheckedChange={(required) => update({ required })}
          />
        </div>
      </div>
    </aside>
  );
}
