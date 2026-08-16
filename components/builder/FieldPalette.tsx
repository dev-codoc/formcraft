"use client";

import {
  CalendarDays,
  CheckSquare,
  CircleDot,
  Hash,
  List,
  Mail,
  Star,
  TextCursorInput,
  TextQuote,
  Paperclip,
} from "lucide-react";
import type { FieldType } from "@/hooks/useFormBuilder";

const fieldTypes: {
  type: FieldType;
  label: string;
  icon: typeof TextCursorInput;
}[] = [
  { type: "text", label: "Short answer", icon: TextCursorInput },
  { type: "textarea", label: "Long answer", icon: TextQuote },
  { type: "email", label: "Email", icon: Mail },
  { type: "number", label: "Number", icon: Hash },
  { type: "select", label: "Dropdown", icon: List },
  { type: "radio", label: "Single choice", icon: CircleDot },
  { type: "checkbox", label: "Checkboxes", icon: CheckSquare },
  { type: "date", label: "Date", icon: CalendarDays },
  { type: "rating", label: "Rating", icon: Star },
  { type: "file", label: "File upload", icon: Paperclip },
];

export function FieldPalette({
  onAdd,
  onAddField,
}: {
  onAdd?: (type: FieldType) => void;
  onAddField?: (type: string) => void;
}) {
  const add = (type: FieldType) => (onAdd ?? onAddField)?.(type);
  return (
    <aside className="overflow-hidden rounded-md border border-border bg-card panel-float">
      <div className="border-b border-border px-3 py-2.5">
        <p className="field-id">Field library</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-2">
        {fieldTypes.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => add(type)}
            className="group flex flex-col items-start gap-2 rounded-sm border border-border bg-background/50 p-2.5 text-left transition-colors hover:border-clay hover:bg-card focus-visible:border-clay focus-visible:outline-none"
          >
            <span className="grid h-8 w-8 place-items-center rounded-sm border border-border bg-card text-muted-foreground transition-colors group-hover:border-clay group-hover:text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-medium leading-tight text-foreground">
              {label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
