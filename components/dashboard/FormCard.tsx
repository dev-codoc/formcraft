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
      whileHover={{ y: -2, borderColor: '#7C3AED' }}
      transition={{ duration: 0.3 }}
      className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white font-medium text-base leading-snug">{title}</h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-[#52525B] hover:text-white transition-colors shrink-0">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#111118] border-[#1E1E2E] text-white">
            <DropdownMenuItem asChild className="focus:bg-[#1E1E2E] focus:text-white cursor-pointer">
              <Link href={`/forms/${id}/editor`}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-[#1E1E2E] focus:text-white cursor-pointer">
              <Link href={`/forms/${id}/responses`}>
                <BarChart3 className="w-4 h-4 mr-2" /> View responses
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} className="focus:bg-[#1E1E2E] focus:text-white cursor-pointer">
              <Copy className="w-4 h-4 mr-2" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1E1E2E]" />
            <DropdownMenuItem
              onClick={() => onDelete(id)}
              className="focus:bg-red-950 text-red-400 focus:text-red-300 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            published
              ? 'border-[#2DD4BF]/30 text-[#2DD4BF] bg-[#2DD4BF]/10'
              : 'border-[#1E1E2E] text-[#71717A] bg-transparent'
          }
        >
          {published ? 'Published' : 'Draft'}
        </Badge>
        <span className="text-xs text-[#52525B]">·</span>
        <span className="text-xs text-[#71717A]">{fieldCount} fields</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#1E1E2E]">
        <div className="flex items-center gap-1.5 text-sm text-[#A1A1AA]">
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{responseCount} response{responseCount === 1 ? '' : 's'}</span>
        </div>
        <span className="text-xs text-[#52525B]">{formatRelativeTime(createdAt)}</span>
      </div>
    </motion.div>
  );
}