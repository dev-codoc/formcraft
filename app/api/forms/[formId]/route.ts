import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Form from '@/models/Form';

// GET /api/forms/[formId] — get a single form (owner only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const form = await Form.findOne({ _id: formId, userId: session.user.id });

  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  return NextResponse.json({ form });
}

// PATCH /api/forms/[formId] — update form schema, publish status, etc.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
    }
    if (!/^[a-f\d]{24}$/i.test(formId)) {
      return NextResponse.json({ error: 'Invalid form id.' }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, fields, accentColor, published, theme } = body;

    await connectDB();

    const form = await Form.findOne({ _id: formId, userId: session.user.id });
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    if (title !== undefined) form.title = title;
    if (description !== undefined) form.description = description;
    if (fields !== undefined) form.fields = fields;
    // The client keeps color under `theme.primaryColor`; persist it as `accentColor`.
    if (accentColor !== undefined) form.accentColor = accentColor;
    else if (theme?.primaryColor !== undefined) form.accentColor = theme.primaryColor;
    if (published !== undefined) form.published = published;

    await form.save();

    return NextResponse.json({ form });
  } catch (err) {
    console.error('PATCH /api/forms/[formId] failed:', err);
    return NextResponse.json(
      { error: 'Something went wrong saving the form. Please try again.' },
      { status: 500 },
    );
  }
}

// DELETE /api/forms/[formId] — delete a form
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const form = await Form.findOneAndDelete({ _id: formId, userId: session.user.id });
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
