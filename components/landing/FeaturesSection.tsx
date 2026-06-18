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
          className="text-center mb-14"
        >
          <span className="text-xs tracking-widest text-[#7C3AED] font-semibold">EVERYTHING YOU NEED</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
            Built for speed, not configuration
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, borderColor: '#7C3AED' }}
                className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <h3 className="text-white font-medium mb-1.5">{feature.title}</h3>
                <p className="text-sm text-[#71717A] leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}