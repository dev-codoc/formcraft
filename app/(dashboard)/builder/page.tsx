"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
    options: ["select", "radio", "checkbox"].includes(type) ? ["Option 1"] : undefined,
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

  const selectedField = schema?.fields.find((f) => f.id === selectedFieldId) ?? null;

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: { title: string; description?: string; fields: Omit<FormField, "id">[] } =
        await res.json();

      setSchema({
        id: "",
        title: data.title,
        description: data.description,
        fields: data.fields.map((f, i) => ({ ...f, id: crypto.randomUUID(), order: i })),
        theme: { primaryColor: "#18181b", fontFamily: "Inter" },
      });
    } catch (err) {
      setError("Couldn't generate a form from that prompt. Try rephrasing it or start blank.");
    } finally {
      setGenerating(false);
    }
  }

  function startBlank() {
    setSchema({
      id: "",
      title: "Untitled form",
      description: "",
      fields: [],
      theme: { primaryColor: "#18181b", fontFamily: "Inter" },
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

  function reorderFields(fields: FormField[]) {
    if (!schema) return;
    setSchema({ ...schema, fields: fields.map((f, i) => ({ ...f, order: i })) });
  }

  async function handleCreateForm() {
    if (!schema) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema),
      });
      if (!res.ok) throw new Error("Failed to create form");
      const created = await res.json();
      router.push(`/forms/${created._id}/editor`);
    } catch (err) {
      setError("Couldn't save the form. Check your connection and try again.");
      setCreating(false);
    }
  }

  // --- Stage 1: prompt screen ---
  if (!schema) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center pt-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 dark:bg-white">
          <Sparkles className="h-5 w-5 text-white dark:text-zinc-900" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          What do you want to ask?
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Describe the form in plain English. AI drafts the questions — you refine the rest.
        </p>

        <Card className="mt-6 w-full">
          <CardContent className="p-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A feedback form for our food truck with a 5-star rating and an optional comment box"
              rows={4}
              className="resize-none border-none p-0 shadow-none focus-visible:ring-0"
            />
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={startBlank}
                className="text-xs text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
              >
                Start from a blank form instead
              </button>
              <Button onClick={handleGenerate} disabled={!prompt.trim() || generating} className="gap-1.5">
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? "Generating..." : "Generate form"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Stage 2: drag-drop editor ---
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setSchema(null)}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to prompt
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview((p) => !p)} className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
          <Button size="sm" onClick={handleCreateForm} disabled={creating} className="gap-1.5">
            {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {creating ? "Saving..." : "Create form"}
          </Button>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[200px_1fr_280px]">
        <div className="overflow-y-auto">
          <FieldPalette onAdd={addField} />
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
                <FormPreview schema={schema} />
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FieldList
                  fields={schema.fields}
                  selectedFieldId={selectedFieldId}
                  onSelect={setSelectedFieldId}
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
