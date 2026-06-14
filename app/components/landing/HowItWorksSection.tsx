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
    <section className="relative py-24 bg-[#0D0D14]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-widest text-[#7C3AED] font-semibold">HOW IT WORKS</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">
            Three steps. Zero friction.
          </h2>
        </motion.div>

        <div className="relative grid sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {/* Connecting line — desktop only */}
          <div className="hidden sm:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-[#1E1E2E]">
            <motion.div
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#2DD4BF]"
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
              <div className="w-12 h-12 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center mb-4 relative z-10 ring-4 ring-[#0D0D14]">
                {step.number}
              </div>
              <h3 className="text-white font-medium text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-[#71717A] leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}