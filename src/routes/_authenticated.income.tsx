import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/income")({
  component: IncomePage,
});

function IncomePage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Income Streams</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 5 coming soon.</p>
    </div>
  );
}
