const SYSTEM_INSTRUCTION = `You are a form schema generator API.
Your only output is a single valid JSON object — no markdown, no backticks, no explanation, no preamble.
Follow this exact TypeScript interface:

{
  "title": string,
  "description": string,
  "fields": Array<{
    "id": string,
    "label": string,
    "type": "text" | "email" | "tel" | "number" | "textarea" | "select" | "checkbox" | "date" | "file",
    "required": boolean,
    "placeholder": string,
    "options": string[]   // ONLY if type is "select" or "checkbox"
  }>
}

Rules:
- Generate 3–12 fields depending on context
- infer required/optional from context clues
- id must be snake_case, no spaces
- Keep labels concise (2–4 words max)
- For select fields, generate 3–6 realistic options`;

export async function generateFormSchema(prompt: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL!,
      'X-Title': 'FormCraft AI',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-70b-instruct', // or 'google/gemini-flash-1.5'
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' }, // forces valid JSON, supported by most models
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}