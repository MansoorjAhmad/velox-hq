import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: GeneralSettings,
});

function GeneralSettings() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [signedInAt, setSignedInAt] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setSignedInAt(data.user?.last_sign_in_at ?? null);
    });
  }, []);

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/auth" });
  };

  return (
    <div className="max-w-[640px] space-y-8">
      <section className="rounded-lg border border-border-subtle bg-bg-surface p-5">
        <h2 className="text-h3 text-text-primary">Account</h2>
        <p className="mt-1 text-small text-text-secondary">Personal Velox HQ workspace.</p>
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} readOnly />
          </div>
          {signedInAt && (
            <div className="text-small text-text-muted">
              Last sign-in: <span className="font-mono tabular-nums">{new Date(signedInAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-bg-surface p-5">
        <h2 className="text-h3 text-text-primary">Session</h2>
        <p className="mt-1 text-small text-text-secondary">End your current session on this device.</p>
        <div className="mt-4">
          <Button variant="outline" onClick={signOut} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </section>
    </div>
  );
}
