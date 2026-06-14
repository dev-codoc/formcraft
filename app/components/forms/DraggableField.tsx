'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Type, Mail, Phone, Hash, AlignLeft, ChevronDown, CheckSquare, Calendar, Paperclip } from 'lucide-react';
import { Switch } from '@/app/components/ui/switch';
import { Input } from '@/app/components/ui/input';
import type { FormField } from '@/models/Form';

const TYPE_ICONS: Record<FormField['type'], React.ComponentType<{ className?: string }>> = {
  text: Type,
  email: Mail,
  tel: Phone,
  number: Hash,
  textarea: AlignLeft,
  select: ChevronDown,
  checkbox: CheckSquare,
  date: Calendar,
  file: Paperclip,
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
      className="flex items-center gap-3 bg-[#111118] border border-[#1E1E2E] rounded-xl p-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-[#52525B] hover:text-[#A1A1AA] transition-colors touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#7C3AED]/10 text-[#A78BFA] flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <Input
          value={field.label}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          className="bg-transparent border-0 text-white text-sm font-medium px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <span className="text-xs text-[#52525B] capitalize">{field.type}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-[#71717A]">Required</span>
        <Switch
          checked={field.required}
          onCheckedChange={(checked) => onUpdate(field.id, { required: checked })}
          className="data-[state=checked]:bg-[#7C3AED]"
        />
      </div>

      <button
        onClick={() => onDelete(field.id)}
        className="text-[#52525B] hover:text-red-400 transition-colors flex-shrink-0"
        aria-label="Delete field"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}