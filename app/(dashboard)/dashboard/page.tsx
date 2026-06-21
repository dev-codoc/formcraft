import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Form from "@/models/Form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Eye,
  BarChart3,
  Plus,
  MoreVertical,
  Sparkles,
} from "lucide-react";

interface FormSummary {
  _id: string;
  title: string;
  slug: string;
  responseCount: number;
  status: "draft" | "published";
  updatedAt: string;
}

async function getUserForms(userId: string): Promise<FormSummary[]> {
  await connectDB();
  const forms = await Form.find({ userId: userId })
    .sort({ updatedAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(forms));
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const forms = await getUserForms(session.user.id);

  const totalResponses = forms.reduce((sum, f) => sum + (f.responseCount ?? 0), 0);
  const published = forms.filter((f) => f.status === "published").length;

  return (
    <div className="space-y-6">
      {/* Metrics summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Total forms" value={forms.length} icon={FileText} />
        <MetricCard label="Published" value={published} icon={Eye} />
        <MetricCard label="Total responses" value={totalResponses} icon={BarChart3} />
      </div>

      {/* Forms list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Your forms
          </h2>
          <Link href="/builder">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New form
            </Button>
          </Link>
        </div>

        {forms.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <FormCard key={form._id} form={form} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
          <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </div>
      </CardContent>
    </Card>
  );
}

function FormCard({ form }: { form: FormSummary }) {
  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link
            href={`/forms/${form._id}/editor`}
            className="min-w-0 flex-1"
          >
            <h3 className="truncate text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-50">
              {form.title || "Untitled form"}
            </h3>
          </Link>
          <button
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Badge variant={form.status === "published" ? "default" : "secondary"}>
            {form.status === "published" ? "Published" : "Draft"}
          </Badge>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {form.responseCount} response{form.responseCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <Link href={`/forms/${form._id}/editor`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Edit
            </Button>
          </Link>
          <Link href={`/forms/${form._id}/responses`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Responses
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <Sparkles className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        </div>
        <h3 className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          No forms yet
        </h3>
        <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
          Describe what you need in plain English and let AI build the first
          draft for you.
        </p>
        <Link href="/builder" className="mt-4">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Create your first form
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
