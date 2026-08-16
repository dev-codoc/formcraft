import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateFormSchema } from '@/lib/ai';

export async function POST(req: NextRequest) {
  // Best-effort session lookup. Generation is intentionally NOT gated behind a
  // required session so the public landing demo works and so the builder keeps
  // working even when the database is unreachable. auth() is wrapped because a
  // misconfigured adapter/DB could otherwise throw before we ever reach the AI.
  try {
    await auth();
  } catch (err) {
    console.error('generate: session lookup failed (continuing anonymously)', err);
  }

  let prompt: unknown;
  try {
    ({ prompt } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
    return NextResponse.json(
      { error: 'Please describe your form in at least a sentence.' },
      { status: 400 },
    );
  }

  try {
    const schema = await generateFormSchema(prompt.trim());
    return NextResponse.json(schema);
  } catch (err) {
    console.error('generate: AI generation failed', err);
    const message =
      err instanceof Error && /OPENROUTER_API_KEY/.test(err.message)
        ? 'AI is not configured on the server.'
        : 'AI generation failed. Please try again in a moment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}