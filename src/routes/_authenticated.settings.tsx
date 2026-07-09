import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Settings</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 11 coming soon.</p>
    </div>
  );
}
