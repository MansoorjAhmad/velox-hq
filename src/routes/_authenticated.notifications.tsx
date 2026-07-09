import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-h1 text-text-primary">Notifications</h1>
      <p className="mt-2 text-body text-text-secondary">Stage 9 coming soon.</p>
    </div>
  );
}
