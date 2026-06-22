import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your profile and account preferences.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
          <CardDescription className="text-xs">
            Update your display name and email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialName={session.user.name ?? ""}
            initialEmail={session.user.email ?? ""}
            image={session.user.image ?? null}
          />
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Password</CardTitle>
          <CardDescription className="text-xs">
            Leave blank if you signed in with Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 dark:border-red-900/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Once you delete your account, all your forms and responses will be permanently removed.
            This action cannot be undone.
          </p>
          <button className="mt-3 text-xs font-medium text-red-500 underline-offset-2 hover:underline">
            Delete my account
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
