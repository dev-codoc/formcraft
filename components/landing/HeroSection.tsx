'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const DEMO_PROMPT =
  'Job application with name, email, LinkedIn, role interest dropdown, years of experience, and cover letter...';

const DEMO_FIELDS = [
  { id: 'field_001', label: 'Full name', placeholder: 'Jane Smith', type: 'input' },
  { id: 'field_002', label: 'Email address', placeholder: 'jane@company.com', type: 'input' },
  { id: 'field_003', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/...', type: 'input' },
  { id: 'field_004', label: 'Role interest', placeholder: 'Frontend Engineer', type: 'select' },
  { id: 'field_005', label: 'Cover letter', placeholder: 'Tell us why you’d be a great fit...', type: 'textarea' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function ShimmerBar() {
  return <div className="h-10 w-full animate-pulse rounded-sm bg-muted" />;
}

function AnimatedFormCard() {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'loading' | 'reveal'>('typing');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    let i = 0;
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setText(DEMO_PROMPT.slice(0, i));
        if (i >= DEMO_PROMPT.length) {
          clearInterval(interval);
          setPhase('loading');
          setTimeout(() => setPhase('reveal'), 1200);
        }
      }, 28);
    }, 600);

    return () => clearTimeout(startDelay);
  }, [reduceMotion]);

  // Reduced-motion users get the finished state directly (derived during
  // render) instead of via a synchronous setState in the effect, which would
  // trigger a cascading re-render.
  const displayText = reduceMotion ? DEMO_PROMPT : text;
  const displayPhase = reduceMotion ? 'reveal' : phase;

  return (
    <div className="w-full max-w-md rounded-md border border-border bg-card p-6 panel-float">
      <div className="mb-4 flex items-center gap-2">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="field-id">drafting form_schema</span>
      </div>

      <div className="mb-4 min-h-18 rounded-sm border border-border bg-secondary/50 p-3">
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          {displayText}
          {displayPhase === 'typing' && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="ml-0.5 inline-block h-4 w-0.5 align-middle bg-primary"
            />
          )}
        </p>
      </div>

      {displayPhase === 'loading' && (
        <div className="space-y-2.5">
          <ShimmerBar />
          <ShimmerBar />
          <ShimmerBar />
        </div>
      )}

      {displayPhase === 'reveal' && (
        <div className="space-y-3">
          <AnimatePresence>
            {DEMO_FIELDS.map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <label className="mb-1 block text-xs font-medium text-foreground">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <div className="flex h-16 items-start rounded-sm border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    {field.placeholder}
                  </div>
                ) : (
                  <div className="flex h-10 items-center rounded-sm border border-border bg-background px-3 text-xs text-muted-foreground">
                    {field.placeholder}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: DEMO_FIELDS.length * 0.1 + 0.2 }}
            className="flex items-center gap-1.5 pt-1 text-xs text-primary"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>5 fields generated · ready to publish</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="drafting-grid relative flex min-h-screen items-center overflow-hidden pt-20">
      <div className="container relative z-10 mx-auto grid items-center gap-12 px-6 lg:grid-cols-2">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Powered by OpenRouter AI
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="block text-foreground">Describe it.</span>
            <span className="block text-primary">Ship it.</span>
          </motion.h1>

          <motion.p variants={item} className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Type one sentence. Get a fully-validated, embeddable form — in seconds.
            No drag-drop hell, no config files.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" className="px-6">
                <Link href="/builder">
                  Build your first form <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" variant="outline" className="px-6">
                <Link href="#demo">See live demo</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <AnimatedFormCard />
        </motion.div>
      </div>
    </section>
  );
}
