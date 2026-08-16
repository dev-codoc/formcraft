import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import { EditorClient } from "./EditorClient";
import { mapFormDocToSchema, type LeanFormDoc } from "@/lib/mapForm";
import type { FormSchema } from "@/hooks/useFormBuilder";

interface EditorPageProps {
  params: Promise<{ formId: string }>;
}

async function getForm(
  formId: string,
  userId: string,
): Promise<{ schema: FormSchema; slug: string; published: boolean } | null> {
  if (!/^[a-f\d]{24}$/i.test(formId)) return null;
  await connectDB();
  const form = await Form.findOne({ _id: formId, userId }).lean<LeanFormDoc | null>();
  if (!form) return null;
  return {
    schema: mapFormDocToSchema(form),
    slug: form.slug,
    published: Boolean(form.published),
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { formId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await getForm(formId, session.user.id);
  if (!result) notFound();

  return (
    <EditorClient
      initialSchema={result.schema}
      formId={formId}
      slug={result.slug}
      initialPublished={result.published}
    />
  );
}
