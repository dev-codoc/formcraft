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
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-12 text-center">
        <p className="text-sm text-[#71717A]">No responses yet.</p>
        <p className="text-xs text-[#52525B] mt-1">Share your form link to start collecting responses.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E1E2E] hover:bg-transparent">
              <TableHead className="text-[#71717A] whitespace-nowrap">Submitted</TableHead>
              {fields.map((field) => (
                <TableHead key={field.id} className="text-[#71717A] whitespace-nowrap">
                  {field.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((submission) => (
              <TableRow key={submission._id} className="border-[#1E1E2E] hover:bg-[#1A1A27]">
                <TableCell className="text-[#A1A1AA] whitespace-nowrap text-sm">
                  {formatDate(submission.submittedAt)}
                </TableCell>
                {fields.map((field) => (
                  <TableCell key={field.id} className="text-white text-sm max-w-[240px] truncate">
                    {renderCellValue(submission.data[field.id])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2E]">
          <span className="text-xs text-[#71717A]">
            Page {page + 1} of {totalPages} · {submissions.length} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="border-[#1E1E2E] bg-transparent hover:bg-[#1E1E2E] text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="border-[#1E1E2E] bg-transparent hover:bg-[#1E1E2E] text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}