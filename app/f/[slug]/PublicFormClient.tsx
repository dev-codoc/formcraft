"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FormField, FormSchema } from "@/hooks/useFormBuilder";

type Answers = Record<string, string | string[]>;

export function PublicFormClient({ schema }: { schema: FormSchema }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const accent = schema.theme?.primaryColor ?? "#7C8B6F";

  function setAnswer(fieldId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    for (const field of schema.fields) {
      if (!field.required) continue;
      const val = answers[field.id];
      const isEmpty = !val || (Array.isArray(val) && val.length === 0);
      if (isEmpty) nextErrors[field.id] = "This field is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      const firstErrorField = document.querySelector("[data-error='true']");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // The submit route validates the body directly against a schema keyed by
      // field id, so send the answers map as the top-level body (not { answers }).
      const res = await fetch(`/api/submit/${schema.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Submission failed (${res.status})`);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong submitting your response. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="drafting-dots flex min-h-screen items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-sm flex-col items-center text-center"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-sm"
            style={{ backgroundColor: `${accent}1a` }}
          >
            <CheckCircle2 className="h-6 w-6" style={{ color: accent }} />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
            Response recorded
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Thanks for taking the time to fill this out.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="drafting-dots min-h-screen bg-background px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md rounded-md border border-border bg-card p-6 panel-float sm:p-7"
        style={{ fontFamily: schema.theme?.fontFamily }}
      >
        <h1 className="font-display text-xl font-semibold text-foreground">
          {schema.title}
        </h1>
        {schema.description && (
          <p className="mt-1 text-sm text-muted-foreground">{schema.description}</p>
        )}

        <div className="mt-6 space-y-5">
          {schema.fields.map((field) => (
            <FieldInput
              key={field.id}
              field={field}
              value={answers[field.id]}
              error={errors[field.id]}
              accent={accent}
              onChange={(value) => setAnswer(field.id, value)}
            />
          ))}
        </div>

        <AnimatePresence>
          {submitError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 text-sm text-destructive"
            >
              {submitError}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full gap-1.5"
          style={{ backgroundColor: accent }}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting..." : "Submit"}
        </Button>

        <p className="field-id mt-4 text-center">Powered by FormCraft AI</p>
      </form>
    </div>
  );
}

function FieldInput({
  field,
  value,
  error,
  accent,
  onChange,
}: {
  field: FormField;
  value: string | string[] | undefined;
  error?: string;
  accent: string;
  onChange: (value: string | string[]) => void;
}) {
  return (
    <div className="space-y-1.5" data-error={!!error}>
      <Label className="text-sm">
        {field.label}
        {field.required && <span className="ml-0.5 text-primary">*</span>}
      </Label>

      {field.type === "textarea" && (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={cn(error && "border-destructive focus-visible:ring-destructive")}
        />
      )}

      {(field.type === "text" || field.type === "email" || field.type === "number" || field.type === "date") && (
        <Input
          type={field.type === "text" ? "text" : field.type}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn(error && "border-destructive focus-visible:ring-destructive")}
        />
      )}

      {field.type === "select" && (
        <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className={cn(error && "border-destructive")}>
            <SelectValue placeholder={field.placeholder ?? "Choose an option"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "radio" && (
        <RadioGroup value={(value as string) ?? ""} onValueChange={(v) => onChange(v)} className="gap-2">
          {(field.options ?? []).map((opt) => (
            <div key={opt} className="flex items-center gap-2">
              <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
              <Label htmlFor={`${field.id}-${opt}`} className="text-sm font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {field.type === "checkbox" && (
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => {
            const selected = ((value as string[]) ?? []).includes(opt);
            return (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${opt}`}
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = (value as string[]) ?? [];
                    onChange(checked ? [...current, opt] : current.filter((o) => o !== opt));
                  }}
                />
                <Label htmlFor={`${field.id}-${opt}`} className="text-sm font-normal">
                  {opt}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {field.type === "file" && (
        <Input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")}
          className={cn(error && "border-destructive")}
        />
      )}

      {field.type === "rating" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => {
            const active = Number(value ?? 0) >= i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(String(i))}
                aria-label={`Rate ${i} out of 5`}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Star
                  className="h-6 w-6 transition-colors"
                  style={{
                    color: active ? accent : "var(--ink-muted)",
                    fill: active ? accent : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
