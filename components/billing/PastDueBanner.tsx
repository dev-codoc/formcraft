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
    <div className="flex items-center justify-between gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2.5">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <p className="text-sm">
          Your last payment failed. Update your payment method to avoid losing access to paid features.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-7 border-destructive/40 bg-card text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          {loading ? "Opening..." : "Update payment method"}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-sm p-1 text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
