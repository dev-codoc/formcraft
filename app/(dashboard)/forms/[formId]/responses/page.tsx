import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import Response from "@/models/Response";
import { ResponsesClient } from "./ResponsesClient";

interface ResponsesPageProps {
  params: { formId: string };
}

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const form = await Form.findOne({ _id: params.formId, owner: session.user.id }).lean();
  if (!form) notFound();

  const responses = await Response.find({ formId: params.formId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <ResponsesClient
      formTitle={(form as any).title}
      fields={(form as any).fields}
      responses={JSON.parse(JSON.stringify(responses))}
    />
  );
}
