import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import Submission from "@/models/Submission";
import { ResponsesClient } from "./ResponsesClient";
import type { FormField } from "@/hooks/useFormBuilder";

interface ResponsesPageProps {
  params: { formId: string };
}

// Mongoose `.lean()` returns loosely-typed plain objects; describe the shape we
// actually read so we don't reach for `any`.
type LeanSubmission = {
  _id: { toString(): string };
  formId: { toString(): string };
  submittedAt: Date;
  data: Record<string, string | string[]>;
};

type LeanForm = { title: string; fields: FormField[] };

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const form = await Form.findOne({ _id: params.formId, userId: session.user.id }).lean();
  if (!form) notFound();

  const submissions = await Submission.find({ formId: params.formId })
    .sort({ submittedAt: -1 })
    .lean();

  const responses = (submissions as unknown as LeanSubmission[]).map((sub) => ({
    _id: sub._id.toString(),
    formId: sub.formId.toString(),
    createdAt: sub.submittedAt.toISOString(),
    answers: sub.data,
  }));

  const typedForm = form as unknown as LeanForm;

  return (
    <ResponsesClient
      formTitle={typedForm.title}
      fields={typedForm.fields}
      responses={JSON.parse(JSON.stringify(responses))}
    />
  );
}
