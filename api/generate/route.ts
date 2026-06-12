import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateFormSchema } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== 'string' || prompt.length < 10) {
    return NextResponse.json({ error: 'Prompt too short' }, { status: 400 });
  }

  try {
    const schema = await generateFormSchema(prompt);
    return NextResponse.json({ schema });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
  }
}