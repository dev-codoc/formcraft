'use client';

import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#7C3AED] rounded-full opacity-20 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Stop building forms by hand.
          </h2>
          <p className="text-[#71717A] text-lg mb-8">
            Your next form is one sentence away.
          </p>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="inline-block"
          >
            <Button asChild size="lg" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-6 text-lg">
              <Link href="/builder">
                <Sparkles className="w-5 h-5 mr-2" />
                Start building for free
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}