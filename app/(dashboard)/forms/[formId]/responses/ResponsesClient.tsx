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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Inbox } from "lucide-react";
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
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Inbox className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h3 className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
            No responses yet
          </h3>
          <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
            Share your form's public link to start collecting submissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {responses.length} response{responses.length === 1 ? "" : "s"}
        </h2>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Responses over time</CardTitle>
        </CardHeader>
        <CardContent className="h-56 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyCounts} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#18181b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-2.5 font-medium">Submitted</th>
                  {fields.slice(0, 3).map((field) => (
                    <th key={field.id} className="px-4 py-2.5 font-medium">
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
                    className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500">
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
                        <td key={field.id} className="max-w-[200px] truncate px-4 py-2.5 text-zinc-900 dark:text-zinc-100">
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Response details
        </h3>
        <p className="mt-0.5 text-xs text-zinc-400">
          {new Date(response.createdAt).toLocaleString("en-IN")}
        </p>
        <div className="mt-4 space-y-3">
          {fields.map((field) => {
            const val = response.answers[field.id];
            const display = Array.isArray(val) ? val.join(", ") : val ?? "—";
            return (
              <div key={field.id}>
                <p className="text-xs text-zinc-400">{field.label}</p>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{display}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
