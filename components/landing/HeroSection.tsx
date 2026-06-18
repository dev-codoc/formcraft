'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const DEMO_PROMPT =
  'Job application with name, email, LinkedIn, role interest dropdown, years of experience, and cover letter...';

const DEMO_FIELDS = [
  { label: 'Full name', placeholder: 'Jane Smith', type: 'input' },
  { label: 'Email address', placeholder: 'jane@company.com', type: 'input' },
  { label: 'LinkedIn URL', placeholder: 'linkedin.com/in/...', type: 'input' },
  { label: 'Role interest', placeholder: 'Frontend Engineer', type: 'select' },
  { label: 'Cover letter', placeholder: 'Tell us why you\u2019d be a great fit...', type: 'textarea' },
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
  return (
    <div
      className="h-10 rounded-lg w-full"
      style={{
        background: 'linear-gradient(90deg, #1E1E2E 25%, #2a2a3e 50%, #1E1E2E 75%)',
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.5s linear infinite',
      }}
    />
  );
}

function AnimatedFormCard() {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'loading' | 'reveal'>('typing');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setText(DEMO_PROMPT);
      setPhase('reveal');
      return;
    }

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

  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 shadow-2xl w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#7C3AED]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-xs text-[#71717A]">AI is generating your form...</span>
      </div>

      <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3 mb-4 min-h-[72px]">
        <p className="text-sm text-[#A1A1AA] leading-relaxed font-mono">
          {text}
          {phase === 'typing' && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-[2px] h-4 bg-[#7C3AED] ml-0.5 align-middle"
            />
          )}
        </p>
      </div>

      {phase === 'loading' && (
        <div className="space-y-2.5">
          <ShimmerBar />
          <ShimmerBar />
          <ShimmerBar />
        </div>
      )}

      {phase === 'reveal' && (
        <div className="space-y-3">
          <AnimatePresence>
            {DEMO_FIELDS.map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <label className="text-xs text-[#71717A] mb-1 block">{field.label}</label>
                {field.type === 'textarea' ? (
                  <div className="rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] h-16 px-3 py-2 text-xs text-[#52525B] flex items-start">
                    {field.placeholder}
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] h-10 px-3 flex items-center text-xs text-[#52525B]">
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
            className="flex items-center gap-1.5 text-xs text-[#2DD4BF] pt-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5 fields generated · Ready to publish</span>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#7C3AED] rounded-full opacity-[0.15] blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#2DD4BF] rounded-full opacity-[0.15] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
          <motion.div variants={item}>
            <Badge variant="outline" className="border-[#7C3AED]/40 text-[#A78BFA] bg-[#7C3AED]/5 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Powered by OpenRouter AI
            </Badge>
          </motion.div>

          <motion.h1 variants={item} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block text-white">Describe it.</span>
            <span className="block bg-gradient-to-r from-[#7C3AED] to-[#2DD4BF] bg-clip-text text-transparent">
              Ship it.
            </span>
          </motion.h1>

          <motion.p variants={item} className="text-lg text-[#71717A] max-w-md leading-relaxed">
            Type one sentence. Get a fully-validated, embeddable form — in seconds.
            No drag-drop hell, no config files.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap gap-3 pt-2">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6">
                <Link href="/builder">
                  Build your first form <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Button asChild size="lg" variant="ghost" className="text-white hover:bg-[#1E1E2E] px-6">
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