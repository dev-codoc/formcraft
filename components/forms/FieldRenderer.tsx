'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { FormField } from '@/models/Form';

interface FieldRendererProps {
  field: FormField;
  value: string | boolean | string[] | undefined;
  onChange: (id: string, value: string | boolean | string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function FieldRenderer({ field, value, onChange, error, disabled }: FieldRendererProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-sm text-foreground">
        {field.label}
        {field.required && <span className="ml-1 text-primary">*</span>}
      </Label>

      {field.type === 'text' && (
        <Input
          id={field.id}
          type="text"
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
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
        />
      )}

      {field.type === 'date' && (
        <Input
          id={field.id}
          type="date"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          disabled={disabled}
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
          className="resize-none"
        />
      )}

      {field.type === 'select' && (
        <Select
          value={(value as string) ?? ''}
          onValueChange={(val) => onChange(field.id, val)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder ?? 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
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
                />
                <Label htmlFor={`${field.id}-${opt}`} className="text-sm font-normal text-foreground">
                  {opt}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {field.type === 'radio' && (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                disabled={disabled}
                onChange={() => onChange(field.id, opt)}
                className="h-4 w-4 accent-[var(--sage)]"
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {field.type === 'file' && (
        <Input
          id={field.id}
          type="file"
          disabled={disabled}
          onChange={(e) => onChange(field.id, e.target.files?.[0]?.name ?? '')}
          className="file:mr-3 file:rounded-sm file:border-0 file:bg-muted file:px-3 file:py-1 file:text-muted-foreground"
        />
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
