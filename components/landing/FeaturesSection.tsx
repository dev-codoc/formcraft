'use client';

import { motion } from 'framer-motion';
import { Sparkles, Code2, BarChart3, ShieldCheck, GripVertical, Download } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI schema generation',
    desc: 'Describe in plain English. AI generates a structured, validated form schema instantly.',
  },
  {
    icon: Code2,
    title: 'Embed anywhere',
    desc: 'Get a shareable URL and iframe snippet. Drop it into any site in 30 seconds.',
  },
  {
    icon: BarChart3,
    title: 'Response analytics',
    desc: 'Real-time dashboard showing submissions, trends, and completion rates.',
  },
  {
    icon: ShieldCheck,
    title: 'Dynamic validation',
    desc: 'Every submission is validated server-side against a Zod schema built from your form config.',
  },
  {
    icon: GripVertical,
    title: 'Drag & drop editor',
    desc: 'Reorder fields, toggle required, change types — all before publishing.',
  },
  {
    icon: Download,
    title: 'CSV export',
    desc: 'Download all your responses as a CSV file with a single click.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="field-id">everything you need</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Built for speed, not configuration
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group rounded-md border border-border bg-card p-6 transition-colors hover:border-clay"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-accent text-primary transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 font-display font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
