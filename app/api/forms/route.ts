import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Form from '@/models/Form';
import { nanoid } from 'nanoid';

// GET /api/forms — list all forms for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const forms = await Form.find({ userId: session.user.id }).sort({ createdAt: -1 });

  return NextResponse.json({ forms });
}

// POST /api/forms — create a new form
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, fields, accentColor } = body;

  if (!title || !Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json({ error: 'Title and at least one field are required' }, { status: 400 });
  }

  await connectDB();

  const form = await Form.create({
    title,
    description,
    fields,
    accentColor,
    userId: session.user.id,
    slug: nanoid(8),
    published: false,
  });

  return NextResponse.json({ form }, { status: 201 });
}