import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Form from '@/models/Form';
import Submission from '@/models/Submission';

// GET /api/export/[formId] — download all submissions as CSV (owner only)
export async function GET(req: NextRequest, { params }: { params: { formId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const form = await Form.findOne({ _id: params.formId, userId: session.user.id });
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  const submissions = await Submission.find({ formId: form._id }).sort({ submittedAt: 1 });

  const fieldIds = form.fields.map((f: { id: string }) => f.id);
  const fieldLabels = form.fields.map((f: { label: string }) => f.label);

  const headers = ['Submitted At', ...fieldLabels];

  const escapeCsv = (value: unknown): string => {
    if (value === undefined || value === null) return '';
    const str = Array.isArray(value) ? value.join('; ') : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = submissions.map((s) => {
    const row = [s.submittedAt.toISOString()];
    for (const id of fieldIds) {
      row.push(escapeCsv(s.data[id]));
    }
    return row.join(',');
  });

  const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n');

  const filename = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}