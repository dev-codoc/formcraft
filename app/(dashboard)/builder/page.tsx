"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Eye, ArrowLeft, PencilRuler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldPalette } from "@/components/builder/FieldPalette";
import { FieldList } from "@/components/builder/FieldList";
import { FieldPropertiesPanel } from "@/components/builder/FieldPropertiesPanel";
import { FormPreview } from "@/components/builder/FormPreview";
import type { FieldType, FormField, FormSchema } from "@/hooks/useFormBuilder";

const EXAMPLE_PROMPTS = [
  "A customer feedback form for a coffee shop with a star rating",
  "Job application form with resume upload and experience level",
  "Event RSVP form with meal preference and plus-one count",
];

function createField(type: FieldType, order: number): FormField {
  return {
    id: crypto.randomUUID(),
    type,
    label: "Untitled question",
    required: false,
    options: ["select", "radio", "checkbox"].includes(type)
      ? ["Option 1"]
      : undefined,
    order,
  };
}

export default function BuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedField =
    schema?.fields.find((f) => f.id === selectedFieldId) ?? null;

  function startBlank() {
    setSchema({
      id: "",
      title: "Untitled form",
      description: "",
      fields: [],
      theme: { primaryColor: "#7C8B6F", fontFamily: "Inter" },
    });
  }

  function addField(type: FieldType) {
    if (!schema) return;
    const field = createField(type, schema.fields.length);
    setSchema({ ...schema, fields: [...schema.fields, field] });
    setSelectedFieldId(field.id);
  }

  function updateField(id: string, updates: Partial<FormField>) {
    if (!schema) return;
    setSchema({
      ...schema,
      fields: schema.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  }

  function deleteField(id: string) {
    if (!schema) return;
    setSchema({ ...schema, fields: schema.fields.filter((f) => f.id !== id) });
    if (selectedFieldId === id) setSelectedFieldId(null);
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Surface the real reason (e.g. 401 = not signed in, 400 = prompt too short)
        throw new Error(data?.error || `Generation failed (${res.status})`);
      }
      if (!data || !Array.isArray(data.fields) || data.fields.length === 0) {
        throw new Error(
          "The AI returned an unexpected response. Try rephrasing your prompt.",
        );
      }

      setSchema({
        id: "",
        title: data.title || "Untitled form",
        description: data.description ?? "",
        fields: data.fields.map((f: Partial<FormField>, i: number) => ({
          ...f,
          id: f.id ?? crypto.randomUUID(),
          label: f.label ?? "Untitled question",
          type: (f.type as FieldType) ?? "text",
          required: Boolean(f.required),
          order: i,
        })),
        theme: { primaryColor: "#7C8B6F", fontFamily: "Inter" },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't generate a form from that prompt. Try rephrasing it or start blank.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateForm() {
    if (!schema) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: schema.title,
          description: schema.description ?? "",
          fields: schema.fields,
          accentColor: schema.theme?.primaryColor ?? "#7C8B6F",
        }),
      });
      if (!res.ok) throw new Error("Failed to create form");
      const { form } = await res.json();
      router.push(`/forms/${form._id}/editor`);
    } catch {
      setError("Couldn't save the form. Check your connection and try again.");
      setCreating(false);
    }
  }

  // --- Stage 1: prompt screen ---
  if (!schema) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center pt-10 text-center sm:pt-16">
        <div className="grid h-12 w-12 place-items-center rounded-md border border-border bg-card text-primary panel-float">
          <PencilRuler className="h-5 w-5" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Start with an idea.
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Describe the form in plain English. AI drafts the questions — you
          arrange the blocks on the table and refine the rest.
        </p>

        <div className="mt-6 w-full rounded-md border border-border bg-card p-2 panel-float">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
            }}
            placeholder="e.g. A feedback form for our food truck with a 5-star rating and an optional comment box"
            rows={4}
            className="resize-none border-none bg-transparent p-3 text-base shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center justify-between gap-3 px-1 pb-1">
            <button
              onClick={startBlank}
              className="rounded-sm px-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start from a blank canvas
            </button>
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="gap-1.5"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? "Drafting…" : "Generate form"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-clay hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Stage 2: drafting canvas ---
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 panel-float">
        <button
          onClick={() => setSchema(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to prompt
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((p) => !p)}
            className="gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
          <Button
            size="sm"
            onClick={handleCreateForm}
            disabled={creating}
            className="gap-1.5"
          >
            {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {creating ? "Saving…" : "Create form"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)_300px]">
        <div className="overflow-y-auto">
          <FieldPalette onAddField={(type: string) => addField(type as FieldType)} />
        </div>

        <div className="overflow-y-auto">
          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FormPreview schema={schema} fields={schema.fields} />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <FieldList
                  fields={schema.fields}
                  selectedId={selectedFieldId ?? undefined}
                  onSelect={setSelectedFieldId}
                  onDelete={deleteField}
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
