'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartDataPoint {
  date: string;
  count: number;
}

interface ResponsesChartProps {
  data: ChartDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  const date = new Date(label ?? '');
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="rounded-sm border border-border bg-card px-3 py-2 panel-float">
      <p className="text-xs text-muted-foreground">{formatted}</p>
      <p className="text-sm font-medium text-foreground">
        {payload[0].value} response{payload[0].value === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export function ResponsesChart({ data }: ResponsesChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-md border border-border bg-card p-5"
    >
      <div className="mb-4">
        <h3 className="font-display font-medium text-foreground">Responses over time</h3>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formattedData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C8B6F" />
              <stop offset="100%" stopColor="#C9A87C" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDE8DF" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#8A8577"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(formattedData.length / 6)}
          />
          <YAxis
            stroke="#8A8577"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EDE8DF' }} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="url(#lineGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#7C8B6F', stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
