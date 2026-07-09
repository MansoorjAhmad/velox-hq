import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/debt")({
  component: DebtPage,
});

function DebtPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Debt Tracker</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 4 coming soon.</p>
    </div>
  );
}
