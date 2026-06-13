import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Form from '@/models/Form';
import Submission from '@/models/Submission';
import { buildZodSchema } from '@/lib/zod-from-schema';
import { ratelimit } from '@/lib/rate-limit';

// POST /api/submit/[formId] — public endpoint, no auth required
export async function POST(req: NextRequest, { params }: { params: { formId: string } }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
  }

  await connectDB();

  const form = await Form.findById(params.formId);
  if (!form || !form.published) {
    return NextResponse.json({ error: 'Form not found or not published' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const zodSchema = buildZodSchema(form.fields);
  const result = zodSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', errors: result.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  await Submission.create({
    formId: form._id,
    data: result.data,
    ip,
    userAgent: req.headers.get('user-agent') ?? undefined,
  });

  return NextResponse.json({ success: true });
}