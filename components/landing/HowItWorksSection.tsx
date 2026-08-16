'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    number: 1,
    title: 'Describe',
    desc: 'Type what you need in plain English. Be as vague or specific as you want.',
  },
  {
    number: 2,
    title: 'Customize',
    desc: 'Reorder fields, toggle required, change types. The editor reacts instantly.',
  },
  {
    number: 3,
    title: 'Share & analyze',
    desc: 'Copy the link or iframe. Watch responses come in on your dashboard.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative border-y border-border bg-card py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="field-id">how it works</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Three steps. Zero friction.
          </h2>
        </motion.div>

        <div className="relative mx-auto grid max-w-4xl gap-10 sm:grid-cols-3">
          {/* Connecting line — desktop only */}
          <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-border sm:block">
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full bg-primary"
            />
          </div>

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-primary font-display font-semibold text-primary-foreground ring-4 ring-card">
                {step.number}
              </div>
              <h3 className="mb-2 font-display text-lg font-medium text-foreground">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
