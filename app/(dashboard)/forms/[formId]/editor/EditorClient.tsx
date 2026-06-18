"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Check,
  Loader2,
  AlertCircle,
  Undo2,
  Redo2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldPalette } from "@/components/builder/FieldPalette";
import { FieldList } from "@/components/builder/FieldList";
import { FieldPropertiesPanel } from "@/components/builder/FieldPropertiesPanel";
import { FormPreview } from "@/components/builder/FormPreview";
import { useFormBuilder, type FormSchema } from "@/hooks/useFormBuilder";

interface EditorClientProps {
  initialSchema: FormSchema;
  formId: string;
}

export function EditorClient({ initialSchema, formId }: EditorClientProps) {
  const [showPreview, setShowPreview] = useState(false);

  const {
    schema,
    fields,
    selectedField,
    selectedFieldId,
    saveStatus,
    canUndo,
    canRedo,
    addField,
    updateField,
    deleteField,
    reorderFields,
    selectField,
    updateMeta,
    undo,
    redo,
  } = useFormBuilder({ formId, initialSchema });

  return (
    <div className="flex h-full flex-col">
      {/* Top bar: title + save status */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input
          value={schema.title}
          onChange={(e) => updateMeta({ title: e.target.value })}
          className="h-8 max-w-xs border-none px-0 text-base font-semibold shadow-none focus-visible:ring-0"
        />

        <div className="flex items-center gap-2">
          <SaveIndicator status={saveStatus} />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowPreview((p) => !p)} className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {showPreview ? "Hide preview" : "Preview"}
          </Button>

          <Link href={`/f/${formId}`} target="_blank">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Open live
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[200px_1fr_280px]">
        <div className="overflow-y-auto">
          <FieldPalette onAdd={(type) => addField(type)} />
        </div>

        <div className="overflow-y-auto">
          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FormPreview schema={schema} />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FieldList
                  fields={fields}
                  selectedFieldId={selectedFieldId}
                  onSelect={selectField}
                  onDelete={deleteField}
                  onReorder={reorderFields}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-y-auto">
          <FieldPropertiesPanel field={selectedField} onUpdate={updateField} />
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;

  const config = {
    saving: { icon: Loader2, label: "Saving...", className: "text-zinc-400 [&_svg]:animate-spin" },
    saved: { icon: Check, label: "Saved", className: "text-emerald-500" },
    error: { icon: AlertCircle, label: "Couldn't save", className: "text-red-500" },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1 text-xs ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
