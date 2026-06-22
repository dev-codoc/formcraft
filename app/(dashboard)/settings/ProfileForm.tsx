"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  image: string | null;
}

export function ProfileForm({ initialName, initialEmail, image }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "?";

  const isDirty = name !== initialName || email !== initialEmail;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save changes");
      }

      setSuccess(true);
      router.refresh(); // re-runs the server component so topbar avatar updates
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-14 w-14">
            <AvatarImage src={image ?? ""} alt={name} />
            <AvatarFallback className="text-base">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-zinc-900 dark:border-zinc-900 dark:bg-white">
            <Camera className="h-3 w-3 text-white dark:text-zinc-900" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {name || "Your name"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs">Display name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs">Email address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-emerald-500">Changes saved successfully.</p>}

      <Button onClick={handleSave} disabled={!isDirty || saving} size="sm" className="gap-1.5">
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
