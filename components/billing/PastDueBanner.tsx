"use client";

import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PastDueBannerProps {
  onUpdatePaymentMethod?: () => Promise<void> | void;
}

export function PastDueBanner({ onUpdatePaymentMethod }: PastDueBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (dismissed) return null;

  async function handleUpdate() {
    setLoading(true);
    try {
      await onUpdatePaymentMethod?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-900/40 dark:bg-amber-900/20">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <p className="text-sm">
          Your last payment failed. Update your payment method to avoid losing access to paid features.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 border-amber-300 bg-white text-xs text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-transparent dark:text-amber-300"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          {loading ? "Opening..." : "Update payment method"}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
