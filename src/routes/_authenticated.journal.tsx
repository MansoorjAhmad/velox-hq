import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
});

function JournalPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Trading Journal</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 3 coming soon.</p>
    </div>
  );
}
