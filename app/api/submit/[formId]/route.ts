import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Form from '@/models/Form';
import Submission from '@/models/Submission';
import { buildZodSchema } from '@/lib/zod-from-schema';
import { checkRateLimit } from '@/lib/rate-limit';

// POST /api/submit/[formId] — public endpoint, no auth required
export async function POST(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params;
    if (!/^[a-f\d]{24}$/i.test(formId)) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    await connectDB();

    const form = await Form.findById(formId);
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
  } catch (err) {
    console.error('POST /api/submit/[formId] failed:', err);
    return NextResponse.json(
      { error: 'Something went wrong submitting your response. Please try again.' },
      { status: 500 },
    );
  }
}
