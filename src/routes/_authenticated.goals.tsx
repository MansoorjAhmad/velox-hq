import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/goals")({
  component: GoalsPage,
});

function GoalsPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Goals</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 7 coming soon.</p>
    </div>
  );
}
