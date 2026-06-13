import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Form from '@/models/Form';
import Submission from '@/models/Submission';

// GET /api/forms/[formId]/responses — get all submissions + summary stats (owner only)
export async function GET(req: NextRequest, { params }: { params: { formId: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const form = await Form.findOne({ _id: params.formId, userId: session.user.id });
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

  const submissions = await Submission.find({ formId: form._id }).sort({ submittedAt: -1 });

  // Build last-30-days response counts for chart
  const now = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = submissions.filter(
      (s) => s.submittedAt.toISOString().slice(0, 10) === dateStr
    ).length;
    days.push({ date: dateStr, count });
  }

  const last7Days = days.slice(-7).reduce((sum, d) => sum + d.count, 0);

  return NextResponse.json({
    form: {
      title: form.title,
      fields: form.fields,
      published: form.published,
      slug: form.slug,
    },
    submissions,
    stats: {
      total: submissions.length,
      last7Days,
      chartData: days,
    },
  });
}