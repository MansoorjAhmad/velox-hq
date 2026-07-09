import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  async function onLogin(data: LoginForm) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  }

  async function onSignup(data: SignupForm) {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — check your email to confirm");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-h1 text-text-primary">Velox HQ</h1>
          <p className="mt-2 text-small text-text-secondary">
            Personal trading command center
          </p>
        </div>

        <div className="rounded-radius-lg border border-border-default bg-bg-surface p-6 shadow-lg">
          <div className="mb-6 flex gap-1 rounded-radius-md bg-bg-page p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-radius-sm py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-bg-surface-raised text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-radius-sm py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-bg-surface-raised text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Create account
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="text-label text-text-secondary mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  {...loginForm.register("email")}
                  className="w-full rounded-radius-md border border-border-default bg-bg-page px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  placeholder="you@example.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-small text-danger">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-label text-text-secondary mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  {...loginForm.register("password")}
                  className="w-full rounded-radius-md border border-border-default bg-bg-page px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-small text-danger">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-radius-md bg-accent-primary py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-accent-primary-hover disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div>
                <label className="text-label text-text-secondary mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  {...signupForm.register("email")}
                  className="w-full rounded-radius-md border border-border-default bg-bg-page px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  placeholder="you@example.com"
                />
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-small text-danger">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-label text-text-secondary mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  {...signupForm.register("password")}
                  className="w-full rounded-radius-md border border-border-default bg-bg-page px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                  placeholder="••••••••"
                />
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-small text-danger">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-radius-md bg-accent-primary py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-accent-primary-hover disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          {mode === "login" && (
            <div className="mt-4 text-center">
              <Link
                to="/reset-password"
                className="text-small text-text-secondary hover:text-text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
