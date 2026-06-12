import { z } from 'zod';
import type { FormField } from '@/models/Form';

export function buildZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let validator: z.ZodTypeAny;

    switch (field.type) {
      case 'email':
        validator = z.string().email('Please enter a valid email');
        break;
      case 'tel':
        validator = z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number');
        break;
      case 'number':
        validator = z.coerce.number();
        break;
      case 'checkbox':
        validator = z.array(z.string()).min(field.required ? 1 : 0);
        break;
      case 'date':
        validator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date');
        break;
      default:
        validator = z.string().min(field.required ? 1 : 0);
    }

    shape[field.id] = field.required ? validator : validator.optional();
  }

  return z.object(shape);
}