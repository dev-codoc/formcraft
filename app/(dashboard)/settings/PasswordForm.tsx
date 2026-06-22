"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = current.length > 0 && next.length >= 8 && next === confirm;

  async function handleSave() {
    if (next !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (next.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update password");
      }

      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="current-password" className="text-xs">Current password</Label>
        <div className="relative">
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••"
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-password" className="text-xs">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showNext ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Min. 8 characters"
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowNext((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {next.length > 0 && next.length < 8 && (
          <p className="text-[11px] text-zinc-400">
            {8 - next.length} more character{8 - next.length === 1 ? "" : "s"} needed
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm-password" className="text-xs">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          className={
            confirm.length > 0 && confirm !== next
              ? "border-red-400 focus-visible:ring-red-400"
              : ""
          }
        />
        {confirm.length > 0 && confirm !== next && (
          <p className="text-[11px] text-red-500">Passwords don't match</p>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-emerald-500">Password updated successfully.</p>}

      <Button onClick={handleSave} disabled={!canSave || saving} size="sm" className="gap-1.5">
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saving ? "Updating..." : "Update password"}
      </Button>
    </div>
  );
}
