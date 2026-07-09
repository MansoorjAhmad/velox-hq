import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [hashChecked, setHashChecked] = useState(false);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValid(true);
    }
    setHashChecked(true);
  }, []);

  async function onSubmit(data: FormData) {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. Signing you in…");
    navigate({ to: "/dashboard" });
  }

  if (!hashChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page">
        <div className="text-text-secondary text-body">Loading…</div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-h2 text-text-primary">Invalid link</h1>
          <p className="mt-2 text-small text-text-secondary">
            This password reset link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-h1 text-text-primary">Velox HQ</h1>
          <p className="mt-2 text-small text-text-secondary">
            Set a new password
          </p>
        </div>

        <div className="rounded-radius-lg border border-border-default bg-bg-surface p-6 shadow-lg">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-label text-text-secondary mb-1.5 block">
                New password
              </label>
              <input
                type="password"
                {...form.register("password")}
                className="w-full rounded-radius-md border border-border-default bg-bg-page px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                placeholder="••••••••"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-small text-danger">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-radius-md bg-accent-primary py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-accent-primary-hover disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
