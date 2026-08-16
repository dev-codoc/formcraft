'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { FormField } from '@/models/Form';

interface Submission {
  _id: string;
  data: Record<string, string | boolean | string[]>;
  submittedAt: string;
}

interface SubmissionsTableProps {
  fields: FormField[];
  submissions: Submission[];
  pageSize?: number;
}

function renderCellValue(value: string | boolean | string[] | undefined): string {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function SubmissionsTable({ fields, submissions, pageSize = 10 }: SubmissionsTableProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(submissions.length / pageSize));
  const start = page * pageSize;
  const pageItems = submissions.slice(start, start + pageSize);

  if (submissions.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No responses yet.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Share your form link to start collecting responses.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="whitespace-nowrap">Submitted</TableHead>
              {fields.map((field) => (
                <TableHead key={field.id} className="whitespace-nowrap">
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((submission) => (
              <TableRow key={submission._id}>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(submission.submittedAt)}
                </TableCell>
                {fields.map((field) => (
                  <TableCell key={field.id} className="max-w-60 truncate text-sm text-foreground">
                    {renderCellValue(submission.data[field.id])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages} · {submissions.length} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
