'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  Pencil,
  BarChart3,
  Link as LinkIcon,
  Trash2,
  Copy,
} from 'lucide-react';
import { formatRelativeTime, getFormUrl, copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';

interface FormCardProps {
  id: string;
  title: string;
  fieldCount: number;
  responseCount: number;
  published: boolean;
  slug: string;
  createdAt: string;
  onDelete: (id: string) => void;
}

export function FormCard({
  id,
  title,
  fieldCount,
  responseCount,
  published,
  slug,
  createdAt,
  onDelete,
}: FormCardProps) {
  const handleCopyLink = async () => {
    const url = getFormUrl(slug);
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Failed to copy link');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3 rounded-md border border-border bg-card p-5 transition-colors hover:border-clay"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-base font-medium leading-snug text-foreground">{title}</h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/forms/${id}/editor`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/forms/${id}/responses`}>
                <BarChart3 className="mr-2 h-4 w-4" /> View responses
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(id)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={published ? 'default' : 'secondary'}>
          {published ? 'Published' : 'Draft'}
        </Badge>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{fieldCount} fields</span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{responseCount} response{responseCount === 1 ? '' : 's'}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(createdAt)}</span>
      </div>
    </motion.div>
  );
}
