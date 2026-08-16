'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Zap, ExternalLink, Loader2 } from 'lucide-react';
import { FormPreview } from '@/components/forms/FormPreview';
import type { FormField } from '@/models/Form';

interface GeneratedSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

// Mock response used when no real session / API key is available on the landing page
const MOCK_SCHEMA: GeneratedSchema = {
  title: 'Hotel Feedback Form',
  description: 'Help us improve your stay',
  fields: [
    { id: 'guest_name', label: 'Guest name', type: 'text', required: true, placeholder: 'John Smith' },
    { id: 'room_number', label: 'Room number', type: 'text', required: true, placeholder: '204' },
    { id: 'check_in_date', label: 'Check-in date', type: 'date', required: false },
    {
      id: 'rating',
      label: 'Overall rating',
      type: 'select',
      required: true,
      options: ['5 - Excellent', '4 - Good', '3 - Average', '2 - Poor', '1 - Terrible'],
    },
    { id: 'comments', label: 'Comments', type: 'textarea', required: false, placeholder: 'Tell us about your stay...' },
  ],
};

export function DemoSection() {
  const [prompt, setPrompt] = useState('');
  const [schema, setSchema] = useState<GeneratedSchema | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setSchema(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        // API returns the schema fields at the top level; support both shapes.
        const next = data.schema ?? data;
        if (next && Array.isArray(next.fields) && next.fields.length > 0) {
          setSchema(next);
        } else {
          setSchema(MOCK_SCHEMA);
        }
      } else {
        // Not logged in or error — fall back to mock for demo purposes
        await new Promise((r) => setTimeout(r, 1200));
        setSchema(MOCK_SCHEMA);
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
      setSchema(MOCK_SCHEMA);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="drafting-dots relative overflow-hidden py-24">
      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="field-id">try it now</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Build a form. Right here.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2"
        >
          {/* Input panel */}
          <div className="flex flex-col rounded-md border border-border bg-card p-6 panel-float">
            <label className="mb-2 text-sm font-medium text-foreground">Describe your form</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A hotel feedback form with star rating, room number, check-in date, and comments..."
              rows={4}
              className="mb-4 resize-none"
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate form
                  </>
                )}
              </Button>
            </motion.div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Powered by OpenRouter · Free to try
            </p>
          </div>

          {/* Preview panel */}
          <div className="flex min-h-[280px] flex-col rounded-md border border-border bg-card p-6 panel-float">
            <AnimatePresence mode="wait">
              {!schema && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center rounded-sm border border-dashed border-border p-8 text-center"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-sm bg-accent text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">Your form preview will appear here</p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col items-center justify-center"
                >
                  <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating your form...</p>
                </motion.div>
              )}

              {schema && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-1 flex-col"
                >
                  <div className="flex-1">
                    <FormPreview
                      title={schema.title}
                      description={schema.description}
                      fields={schema.fields}
                      staticPreview
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="mt-4">
                    <Button className="w-full">
                      Publish form <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
