import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <p className="field-id">account · preferences</p>
        <h1 className="mt-1 font-display text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and account preferences.
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-md border border-border bg-card panel-float">
        <div className="border-b border-border px-5 py-3">
          <p className="field-id">profile</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Update your display name and email address.
          </p>
        </div>
        <div className="p-5">
          <ProfileForm
            initialName={session.user.name ?? ""}
            initialEmail={session.user.email ?? ""}
            image={session.user.image ?? null}
          />
        </div>
      </section>

      {/* Password */}
      <section className="rounded-md border border-border bg-card panel-float">
        <div className="border-b border-border px-5 py-3">
          <p className="field-id">password</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Leave blank if you signed in with Google.
          </p>
        </div>
        <div className="p-5">
          <PasswordForm />
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-md border border-destructive/30 bg-card panel-float">
        <div className="border-b border-destructive/20 px-5 py-3">
          <p className="field-id text-destructive/80">danger zone</p>
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground">
            Once you delete your account, all your forms and responses will be permanently removed.
            This action cannot be undone.
          </p>
          <button className="mt-3 text-xs font-medium text-destructive underline-offset-2 hover:underline">
            Delete my account
          </button>
        </div>
      </section>
    </div>
  );
}
