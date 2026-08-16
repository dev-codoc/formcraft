"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlan, type PlanKey, type BillingCycle } from "@/lib/razorpay/plans";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

interface UpgradeModalProps {
  planKey: PlanKey;
  billingCycle: BillingCycle;
  onClose: () => void;
}

type Step = "confirm" | "processing" | "verifying" | "error";

export function UpgradeModal({ planKey, billingCycle, onClose }: UpgradeModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("confirm");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const plan = getPlan(planKey);
  const price = plan.priceINR[billingCycle];

  // Preload Razorpay's checkout script so the modal opens instantly when clicked
  useEffect(() => {
    if (document.getElementById("razorpay-checkout-js")) return;
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  async function handleConfirm() {
    setStep("processing");
    setErrorMessage(null);

    try {
      const orderRes = await fetch("/api/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billingCycle }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Couldn't start checkout");
      }

      const { subscriptionId, razorpayKeyId } = await orderRes.json();

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: "FormCraft AI",
        description: `${plan.name} plan — ${billingCycle}`,
        theme: { color: "#7C8B6F" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          setStep("verifying");
          try {
            const verifyRes = await fetch("/api/billing/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            if (!verifyRes.ok) throw new Error("Verification failed");
            router.refresh();
            onClose();
          } catch {
            setStep("error");
            setErrorMessage(
              "Payment went through but we couldn't confirm it instantly. It'll reflect within a few minutes — refresh this page shortly."
            );
          }
        },
        modal: {
          ondismiss: () => setStep("confirm"),
        },
      });

      razorpay.on("payment.failed", () => {
        setStep("error");
        setErrorMessage("Payment failed or was declined. No charge was made — you can try again.");
      });

      razorpay.open();
    } catch (err) {
      setStep("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-md border border-border bg-card p-5 panel-float"
      >
        <div className="flex items-start justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">
            {step === "confirm" && `Upgrade to ${plan.name}`}
            {step === "processing" && "Opening checkout..."}
            {step === "verifying" && "Confirming payment..."}
            {step === "error" && "Couldn't complete upgrade"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "confirm" && (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ll be charged ₹{price.toLocaleString("en-IN")} {billingCycle === "yearly" ? "today, billed yearly" : "today, then monthly"}.
            </p>
            <div className="mt-4 flex items-center gap-1.5 rounded-sm bg-accent px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
              Secured by Razorpay. Cancel anytime from your billing page.
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Continue
              </Button>
            </div>
          </>
        )}

        {(step === "processing" || step === "verifying") && (
          <div className="mt-6 flex flex-col items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">
              {step === "processing" ? "Hang tight..." : "Almost done..."}
            </p>
          </div>
        )}

        {step === "error" && (
          <>
            <p className="mt-2 text-sm text-destructive">{errorMessage}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => setStep("confirm")}>
                Try again
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
