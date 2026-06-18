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
        setSchema(data.schema);
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
    <section id="demo" className="relative py-24 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED] rounded-full opacity-[0.08] blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs tracking-widest text-[#7C3AED] font-semibold">TRY IT NOW</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Build a form. Right here.</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {/* Input panel */}
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 flex flex-col">
            <label className="text-sm text-[#A1A1AA] mb-2">Describe your form</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A hotel feedback form with star rating, room number, check-in date, and comments..."
              rows={4}
              className="bg-[#0A0A0F] border-[#1E1E2E] text-white placeholder:text-[#52525B] resize-none focus-visible:ring-[#7C3AED] mb-4"
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Generate form
                  </>
                )}
              </Button>
            </motion.div>

            <p className="text-xs text-[#52525B] mt-3 text-center">
              Powered by OpenRouter · Free to try
            </p>
          </div>

          {/* Preview panel */}
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 min-h-[280px] flex flex-col">
            <AnimatePresence mode="wait">
              {!schema && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-[#1E1E2E] rounded-xl p-8"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-[#A78BFA]" />
                  </div>
                  <p className="text-sm text-[#71717A]">Your form preview will appear here</p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center"
                >
                  <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin mb-2" />
                  <p className="text-sm text-[#71717A]">Generating your form...</p>
                </motion.div>
              )}

              {schema && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
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
                    <Button className="w-full bg-[#2DD4BF] hover:bg-[#26B8A5] text-[#0A0A0F]">
                      Publish form <ExternalLink className="w-4 h-4 ml-2" />
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