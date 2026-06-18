'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  delay?: number;
}

export function MetricCard({ label, value, icon: Icon, trend, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[#71717A]">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#A78BFA]">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`text-xs ${trend.positive ? 'text-[#2DD4BF]' : 'text-red-400'}`}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
}