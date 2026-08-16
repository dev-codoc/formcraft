'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Type, Mail, Phone, Hash, AlignLeft, ChevronDown, CheckSquare, Calendar, Paperclip, CircleDot, Star } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { FormField } from '@/models/Form';

const TYPE_ICONS: Record<FormField['type'], React.ComponentType<{ className?: string }>> = {
  text: Type,
  email: Mail,
  tel: Phone,
  number: Hash,
  textarea: AlignLeft,
  select: ChevronDown,
  radio: CircleDot,
  checkbox: CheckSquare,
  date: Calendar,
  file: Paperclip,
  rating: Star,
};

interface DraggableFieldProps {
  field: FormField;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDelete: (id: string) => void;
}

export function DraggableField({ field, onUpdate, onDelete }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = TYPE_ICONS[field.type] ?? Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:border-clay/60"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <Input
          value={field.label}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          className="h-auto border-0 bg-transparent px-0 text-sm font-medium text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <span className="field-id">{field.type}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-muted-foreground">Required</span>
        <Switch
          checked={field.required}
          onCheckedChange={(checked) => onUpdate(field.id, { required: checked })}
        />
      </div>

      <button
        onClick={() => onDelete(field.id)}
        className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Delete field"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
