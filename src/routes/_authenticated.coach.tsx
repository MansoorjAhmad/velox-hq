import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachPage,
});

function CoachPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">AI Coach</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 10 coming soon.</p>
    </div>
  );
}
