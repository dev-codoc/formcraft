'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FieldRenderer } from './FieldRenderer';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { FormField } from '@/models/Form';

interface FormPreviewProps {
  title: string;
  description?: string;
  fields: FormField[];
  /** If provided, the form is interactive and submits to this form's API */
  formId?: string;
  /** Static preview mode — no real submission, just visual */
  staticPreview?: boolean;
  accentColor?: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function FormPreview({
  title,
  description,
  fields,
  formId,
  staticPreview = false,
  accentColor = '#7C3AED',
}: FormPreviewProps) {
  const [values, setValues] = useState<Record<string, string | boolean | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (id: string, value: string | boolean | string[]) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (staticPreview || !formId) return;

    setState('submitting');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/submit/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.errors)) {
            fieldErrors[key] = Array.isArray(msgs) ? (msgs[0] as string) : String(msgs);
          }
          setErrors(fieldErrors);
        }
        setErrorMessage(data.error ?? 'Something went wrong');
        setState('error');
        return;
      }

      setState('success');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="w-16 h-16 text-[#2DD4BF]" />
        </motion.div>
        <h3 className="mt-4 text-xl font-medium text-white">Thanks for your response!</h3>
        <p className="mt-1 text-sm text-[#71717A]">Your submission has been recorded.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-medium text-white">{title || 'Untitled form'}</h2>
        {description && <p className="mt-1 text-sm text-[#71717A]">{description}</p>}
      </div>

      <AnimatePresence>
        {fields.map((field, i) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <FieldRenderer
              field={field}
              value={values[field.id]}
              onChange={handleChange}
              error={errors[field.id]}
              disabled={staticPreview || state === 'submitting'}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {fields.length === 0 && (
        <p className="text-sm text-[#52525B] italic">No fields yet — generate or add some to see a preview.</p>
      )}

      {fields.length > 0 && (
        <motion.div whileHover={{ scale: staticPreview ? 1 : 1.02 }} whileTap={{ scale: staticPreview ? 1 : 0.97 }}>
          <Button
            onClick={handleSubmit}
            disabled={staticPreview || state === 'submitting'}
            className="w-full"
            style={{ backgroundColor: accentColor }}
          >
            {state === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </motion.div>
      )}

      {state === 'error' && errorMessage && (
        <p className="text-sm text-red-400 text-center">{errorMessage}</p>
      )}
    </div>
  );
}