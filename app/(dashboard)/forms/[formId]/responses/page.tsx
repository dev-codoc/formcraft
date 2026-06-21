import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import Submission from "@/models/Submission";
import { ResponsesClient } from "./ResponsesClient";

interface ResponsesPageProps {
  params: { formId: string };
}

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const form = await Form.findOne({ _id: params.formId, userId: session.user.id }).lean();
  if (!form) notFound();

  const submissions = await Submission.find({ formId: params.formId })
    .sort({ submittedAt: -1 })
    .lean();

  const responses = submissions.map((sub: any) => ({
    _id: sub._id.toString(),
    formId: sub.formId.toString(),
    createdAt: sub.submittedAt.toISOString(),
    answers: sub.data,
  }));

  return (
    <ResponsesClient
      formTitle={(form as any).title}
      fields={(form as any).fields}
      responses={JSON.parse(JSON.stringify(responses))}
    />
  );
}
