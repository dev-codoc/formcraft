'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="drafting-grid relative overflow-hidden rounded-lg border border-border bg-accent px-6 py-20 text-center panel-float"
        >
          <span className="field-id">ready when you are</span>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-semibold text-foreground sm:text-5xl">
            Stop building forms by hand.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Your next form is one sentence away.
          </p>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mt-8 inline-block"
          >
            <Button asChild size="lg" className="px-8">
              <Link href="/builder">
                <Sparkles className="mr-2 h-5 w-5" />
                Start building for free
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
