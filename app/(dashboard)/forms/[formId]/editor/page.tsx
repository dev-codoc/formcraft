import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import { EditorClient } from "./EditorClient";
import type { FormSchema } from "@/hooks/useFormBuilder";

interface EditorPageProps {
  params: { formId: string };
}

async function getForm(formId: string, userId: string): Promise<FormSchema | null> {
  await connectDB();
  const form = await Form.findOne({ _id: formId, owner: userId }).lean();
  if (!form) return null;
  return JSON.parse(JSON.stringify(form));
}

export default async function EditorPage({ params }: EditorPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const schema = await getForm(params.formId, session.user.id);
  if (!schema) notFound();

  return <EditorClient initialSchema={schema} formId={params.formId} />;
}
