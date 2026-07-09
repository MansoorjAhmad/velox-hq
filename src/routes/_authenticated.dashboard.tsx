import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Dashboard</h1>
      <p className="mt-2 text-body text-text-secondary">
        Your personal command center. Stage 2 coming soon.
      </p>
    </div>
  );
}
