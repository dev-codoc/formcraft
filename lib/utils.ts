import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as "Jan 5, 2025"
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date as relative time: "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;

  return formatDate(date);
}

/**
 * Get the full public form URL from a slug
 */
export function getFormUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${base}/f/${slug}`;
}

/**
 * Get the iframe embed snippet for a form
 */
export function getEmbedSnippet(slug: string): string {
  const url = getFormUrl(slug);
  return `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border-radius: 12px;"></iframe>`;
}

/**
 * Convert a label to a snake_case field id
 * e.g. "Full Name" -> "full_name"
 */
export function toSnakeCase(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * Generate a unique field id, avoiding collisions with existing ids
 */
export function generateUniqueFieldId(label: string, existingIds: string[]): string {
  const base = toSnakeCase(label) || 'field';
  if (!existingIds.includes(base)) return base;

  let counter = 2;
  while (existingIds.includes(`${base}_${counter}`)) {
    counter++;
  }
  return `${base}_${counter}`;
}

/**
 * Escape a value for CSV output
 */
export function escapeCsvValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  const str = Array.isArray(value) ? value.join('; ') : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1).trimEnd() + '…';
}

/**
 * Copy text to clipboard, returns success boolean
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sleep utility for demo/loading sequences
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}