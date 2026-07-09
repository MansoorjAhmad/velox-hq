import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings/accounts")({
  component: AccountsSettingsPage,
});

function AccountsSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Trading Accounts</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 11 coming soon.</p>
    </div>
  );
}
