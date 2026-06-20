import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number; // -1 = unlimited
}

export function UsageMeter({ label, current, limit }: UsageMeterProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((current / limit) * 100));
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isOverLimit = !isUnlimited && current >= limit;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        <span
          className={cn(
            "text-xs tabular-nums",
            isOverLimit
              ? "font-medium text-red-500"
              : isNearLimit
              ? "font-medium text-amber-500"
              : "text-zinc-400"
          )}
        >
          {isUnlimited ? `${current.toLocaleString("en-IN")} used` : `${current.toLocaleString("en-IN")} / ${limit.toLocaleString("en-IN")}`}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={percentage}
          indicatorClassName={cn(
            isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-zinc-900 dark:bg-zinc-50"
          )}
        />
      )}
      {isUnlimited && (
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-zinc-900 to-zinc-400 dark:from-zinc-50 dark:to-zinc-600" />
      )}
    </div>
  );
}
