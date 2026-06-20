"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlan, type PlanKey, type BillingCycle } from "@/lib/razorpay/plans";

declare global {
  interface Window {
    Razorpay: any;
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
        theme: { color: "#18181b" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-xl bg-white p-5 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {step === "confirm" && `Upgrade to ${plan.name}`}
            {step === "processing" && "Opening checkout..."}
            {step === "verifying" && "Confirming payment..."}
            {step === "error" && "Couldn't complete upgrade"}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "confirm" && (
          <>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You'll be charged ₹{price.toLocaleString("en-IN")} {billingCycle === "yearly" ? "today, billed yearly" : "today, then monthly"}.
            </p>
            <div className="mt-4 flex items-center gap-1.5 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
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
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            <p className="mt-2 text-xs text-zinc-400">
              {step === "processing" ? "Hang tight..." : "Almost done..."}
            </p>
          </div>
        )}

        {step === "error" && (
          <>
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
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
