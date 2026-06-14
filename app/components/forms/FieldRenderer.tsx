'use client';

import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import type { FormField } from '@/models/Form';

interface FieldRendererProps {
  field: FormField;
  value: string | boolean | string[] | undefined;
  onChange: (id: string, value: string | boolean | string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function FieldRenderer({ field, value, onChange, error, disabled }: FieldRendererProps) {
  const baseInputClasses =
    'bg-[#0A0A0F] border-[#1E1E2E] text-white placeholder:text-[#52525B] focus-visible:ring-[#7C3AED]';

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-sm text-[#A1A1AA]">
        {field.label}
        {field.required && <span className="text-[#2DD4BF] ml-1">*</span>}
      </Label>

      {field.type === 'text' && (
        <Input
          id={field.id}
          type="text"
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {field.type === 'email' && (
        <Input
          id={field.id}
          type="email"
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {field.type === 'tel' && (
        <Input
          id={field.id}
          type="tel"
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {field.type === 'number' && (
        <Input
          id={field.id}
          type="number"
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {field.type === 'date' && (
        <Input
          id={field.id}
          type="date"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
          rows={4}
          className={`${baseInputClasses} resize-none`}
        />
      )}

      {field.type === 'select' && (
        <Select
          value={(value as string) ?? ''}
          onValueChange={(val) => onChange(field.id, val)}
          disabled={disabled}
        >
          <SelectTrigger className={baseInputClasses}>
            <SelectValue placeholder={field.placeholder ?? 'Select an option'} />
          </SelectTrigger>
          <SelectContent className="bg-[#111118] border-[#1E1E2E] text-white">
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt} className="focus:bg-[#1E1E2E] focus:text-white">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'checkbox' && (
        <div className="space-y-2">
          {field.options?.map((opt) => {
            const selected = Array.isArray(value) ? value.includes(opt) : false;
            return (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${opt}`}
                  checked={selected}
                  disabled={disabled}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? value : [];
                    const next = checked
                      ? [...current, opt]
                      : current.filter((v) => v !== opt);
                    onChange(field.id, next);
                  }}
                  className="border-[#1E1E2E] data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED]"
                />
                <Label htmlFor={`${field.id}-${opt}`} className="text-sm text-[#D4D4D8] font-normal">
                  {opt}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {field.type === 'file' && (
        <Input
          id={field.id}
          type="file"
          disabled={disabled}
          onChange={(e) => onChange(field.id, e.target.files?.[0]?.name ?? '')}
          className={`${baseInputClasses} file:text-[#A1A1AA] file:bg-[#1E1E2E] file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3`}
        />
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}