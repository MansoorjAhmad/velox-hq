import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Analytics</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 6 coming soon.</p>
    </div>
  );
}
