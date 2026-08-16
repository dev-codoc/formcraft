"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Inbox, X } from "lucide-react";
import type { FormField } from "@/hooks/useFormBuilder";

interface ResponseRecord {
  _id: string;
  formId: string;
  createdAt: string;
  answers: Record<string, string | string[]>;
}

interface ResponsesClientProps {
  formTitle: string;
  fields: FormField[];
  responses: ResponseRecord[];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-sm border border-border bg-card px-3 py-2 panel-float">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">
        {payload[0].value} response{payload[0].value === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function ResponsesClient({ formTitle, fields, responses }: ResponsesClientProps) {
  const [selectedRow, setSelectedRow] = useState<ResponseRecord | null>(null);

  const dailyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    responses.forEach((r) => {
      const day = new Date(r.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      counts[day] = (counts[day] ?? 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [responses]);

  function exportCSV() {
    const headers = ["Submitted at", ...fields.map((f) => f.label)];
    const rows = responses.map((r) => [
      new Date(r.createdAt).toLocaleString("en-IN"),
      ...fields.map((f) => {
        const val = r.answers[f.id];
        return Array.isArray(val) ? val.join("; ") : val ?? "";
      }),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formTitle.replace(/\s+/g, "-").toLowerCase()}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (responses.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card p-12 text-center panel-float">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-sm border border-border bg-accent">
          <Inbox className="h-5 w-5 text-primary" />
        </div>
        <p className="field-id mt-4">no submissions</p>
        <h3 className="mt-1 text-sm font-medium text-foreground">No responses yet</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Share your form&apos;s public link to start collecting submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="field-id">collected</p>
          <h2 className="text-sm font-semibold text-foreground">
            {responses.length} response{responses.length === 1 ? "" : "s"}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card p-5 panel-float">
        <div className="mb-4">
          <h3 className="font-display font-medium text-foreground">Responses over time</h3>
          <p className="text-sm text-muted-foreground">Daily submissions</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyCounts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="responsesLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7C8B6F" />
                <stop offset="100%" stopColor="#C9A87C" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE8DF" />
            <XAxis dataKey="date" stroke="#8A8577" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8A8577" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#EDE8DF" }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="url(#responsesLine)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#7C8B6F", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card panel-float">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 field-id font-medium">Submitted</th>
                {fields.slice(0, 3).map((field) => (
                  <th key={field.id} className="px-4 py-2.5 field-id font-medium">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr
                  key={response._id}
                  onClick={() => setSelectedRow(response)}
                  className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/50"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                    {new Date(response.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  {fields.slice(0, 3).map((field) => {
                    const val = response.answers[field.id];
                    const display = Array.isArray(val) ? val.join(", ") : val ?? "—";
                    return (
                      <td key={field.id} className="max-w-50 truncate px-4 py-2.5 text-foreground">
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRow && (
        <ResponseDetailModal
          response={selectedRow}
          fields={fields}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
}

function ResponseDetailModal({
  response,
  fields,
  onClose,
}: {
  response: ResponseRecord;
  fields: FormField[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-md border border-border bg-card p-5 panel-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="field-id">response · detail</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(response.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {fields.map((field, i) => {
            const val = response.answers[field.id];
            const display = Array.isArray(val) ? val.join(", ") : val ?? "—";
            return (
              <div key={field.id} className="rounded-sm border border-border bg-background/60 p-3">
                <p className="field-id">
                  field_{String(i + 1).padStart(3, "0")} · {field.label}
                </p>
                <p className="mt-1 text-sm text-foreground">{display}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
