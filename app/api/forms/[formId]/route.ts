import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Form from '@/models/Form';

// GET /api/forms/[formId] — get a single form (owner only)
export async function GET(req: NextRequest, { params }: { params: { formId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const form = await Form.findOne({ _id: params.formId, userId: session.user.id });

  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  return NextResponse.json({ form });
}

// PATCH /api/forms/[formId] — update form schema, publish status, etc.
export async function PATCH(req: NextRequest, { params }: { params: { formId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, fields, accentColor, published } = body;

  await connectDB();

  const form = await Form.findOne({ _id: params.formId, userId: session.user.id });
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  if (title !== undefined) form.title = title;
  if (description !== undefined) form.description = description;
  if (fields !== undefined) form.fields = fields;
  if (accentColor !== undefined) form.accentColor = accentColor;
  if (published !== undefined) form.published = published;

  await form.save();

  return NextResponse.json({ form });
}

// DELETE /api/forms/[formId] — delete a form
export async function DELETE(req: NextRequest, { params }: { params: { formId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const form = await Form.findOneAndDelete({ _id: params.formId, userId: session.user.id });
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}