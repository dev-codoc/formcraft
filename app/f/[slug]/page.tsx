import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import { PublicFormClient } from "./PublicFormClient";
import { mapFormDocToSchema, type LeanFormDoc } from "@/lib/mapForm";
import type { FormSchema } from "@/hooks/useFormBuilder";

interface PublicFormPageProps {
  params: Promise<{ slug: string }>;
}

async function getFormBySlug(slug: string): Promise<FormSchema | null> {
  await connectDB();
  const form = await Form.findOne({ slug, published: true }).lean<LeanFormDoc | null>();
  if (!form) return null;
  return mapFormDocToSchema(form);
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { slug } = await params;
  const schema = await getFormBySlug(slug);
  if (!schema) notFound();

  return <PublicFormClient schema={schema} />;
}

export async function generateMetadata({ params }: PublicFormPageProps) {
  const { slug } = await params;
  const schema = await getFormBySlug(slug);
  return {
    title: schema ? `${schema.title} · FormCraft` : "Form not found",
    description: schema?.description,
  };
}
