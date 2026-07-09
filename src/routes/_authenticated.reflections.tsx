import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/reflections")({
  component: ReflectionsPage,
});

function ReflectionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Reflections</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 8 coming soon.</p>
    </div>
  );
}
