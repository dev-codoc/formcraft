import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import { PublicFormClient } from "./PublicFormClient";
import type { FormSchema } from "@/hooks/useFormBuilder";

interface PublicFormPageProps {
  params: { slug: string };
}

async function getFormBySlug(slug: string): Promise<FormSchema | null> {
  await connectDB();
  const form = await Form.findOne({ slug, status: "published" }).lean();
  if (!form) return null;
  return JSON.parse(JSON.stringify(form));
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const schema = await getFormBySlug(params.slug);
  if (!schema) notFound();

  return <PublicFormClient schema={schema} />;
}

export async function generateMetadata({ params }: PublicFormPageProps) {
  const schema = await getFormBySlug(params.slug);
  return {
    title: schema ? `${schema.title} · FormCraft` : "Form not found",
    description: schema?.description,
  };
}
