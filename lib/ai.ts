const SYSTEM_INSTRUCTION = `You are a form schema generator API.
Your only output is a single valid JSON object — no markdown, no backticks, no explanation, no preamble.
Follow this exact TypeScript interface:

{
  "title": string,
  "description": string,
  "fields": Array<{
    "id": string,
    "label": string,
    "type": "text" | "textarea" | "email" | "tel" | "number" | "select" | "radio" | "checkbox" | "date" | "file" | "rating",
    "required": boolean,
    "placeholder": string,
    "options": string[]   // ONLY when type is "select", "radio" or "checkbox"
  }>
}

Rules:
- Generate 3–12 fields depending on context
- Infer required/optional from context clues
- id must be snake_case, no spaces
- Keep labels concise (2–4 words max)
- Use "radio" for single-choice, "checkbox" for multi-choice, "select" for dropdowns
- Use "rating" for star ratings (no options needed)
- For select/radio/checkbox fields, generate 3–6 realistic options`;

const ALLOWED_TYPES = new Set([
  "text",
  "textarea",
  "email",
  "tel",
  "number",
  "select",
  "radio",
  "checkbox",
  "date",
  "file",
  "rating",
]);

const OPTION_TYPES = new Set(["select", "radio", "checkbox"]);

export interface GeneratedField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  options?: string[];
}

export interface GeneratedSchema {
  title: string;
  description: string;
  fields: GeneratedField[];
}

function slugify(input: string, fallback: string): string {
  const slug = String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return slug || fallback;
}

/**
 * Models occasionally wrap JSON in prose or markdown fences despite the
 * instruction. Strip fences, then fall back to extracting the outermost
 * balanced { ... } block so a chatty model doesn't crash the whole feature.
 */
function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to brace extraction
  }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last > first) {
    return JSON.parse(cleaned.slice(first, last + 1));
  }
  throw new Error("Model did not return parseable JSON");
}

/**
 * Coerce whatever the model returned into a predictable schema shape so both
 * the public demo and the authenticated builder always receive valid fields.
 */
function normalizeSchema(raw: unknown): GeneratedSchema {
  const root = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const rawFields: unknown[] = Array.isArray(root.fields)
    ? (root.fields as unknown[])
    : Array.isArray(raw)
      ? (raw as unknown[])
      : [];

  const usedIds = new Set<string>();

  const fields: GeneratedField[] = rawFields
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
    .map((f, i) => {
      const rawType = typeof f.type === "string" ? f.type : "";
      const type = ALLOWED_TYPES.has(rawType) ? rawType : "text";
      const label =
        typeof f.label === "string" && f.label.trim()
          ? f.label.trim()
          : `Question ${i + 1}`;

      // Guarantee a unique, stable, snake_case id
      const seed = typeof f.id === "string" ? f.id : label;
      let id = slugify(seed, `field_${i + 1}`);
      while (usedIds.has(id)) id = `${id}_${i + 1}`;
      usedIds.add(id);

      const field: GeneratedField = {
        id,
        label,
        type,
        required: Boolean(f.required),
        placeholder: typeof f.placeholder === "string" ? f.placeholder : "",
      };

      if (OPTION_TYPES.has(type)) {
        const options = Array.isArray(f.options)
          ? (f.options as unknown[]).map((o) => String(o)).filter(Boolean)
          : [];
        field.options = options.length ? options : ["Option 1", "Option 2", "Option 3"];
      }

      return field;
    });

  return {
    title:
      typeof root.title === "string" && root.title.trim()
        ? root.title.trim()
        : "Untitled form",
    description: typeof root.description === "string" ? root.description : "",
    fields,
  };
}

export async function generateFormSchema(prompt: string): Promise<GeneratedSchema> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-70b-instruct";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "FormCraft AI",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" }, // honored by most models; parser handles the rest
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenRouter error ${response.status}: ${detail.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("OpenRouter returned an empty completion");
  }

  const parsed = extractJson(text);
  const schema = normalizeSchema(parsed);

  if (schema.fields.length === 0) {
    throw new Error("Model returned no usable fields");
  }

  return schema;
}
