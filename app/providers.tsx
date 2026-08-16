'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Global client providers.
 * MotionConfig reducedMotion="user" makes every framer-motion animation in the
 * app honor the OS "reduce motion" setting without per-component wiring.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
