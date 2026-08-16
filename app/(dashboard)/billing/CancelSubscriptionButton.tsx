"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelAtPeriodEnd: true }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="rounded-sm border border-border bg-background/60 p-3">
        <p className="text-xs text-muted-foreground">
          You&apos;ll keep access until the end of your current billing period. Continue?
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
            Never mind
          </Button>
          <Button variant="destructive" size="sm" onClick={handleCancel} disabled={loading}>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loading ? "Cancelling..." : "Confirm cancellation"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-destructive hover:underline"
    >
      Cancel subscription
    </button>
  );
}
