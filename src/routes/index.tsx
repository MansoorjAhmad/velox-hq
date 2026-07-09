import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-page px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-radius-lg bg-accent-primary text-text-primary text-2xl font-bold">
          V
        </div>
        <h1 className="text-h1 text-text-primary">Velox HQ</h1>
        <p className="mt-3 max-w-md text-body text-text-secondary">
          Your personal trading command center. Unify performance, debt, income,
          goals, and mindset in one disciplined dashboard.
        </p>
        <div className="mt-8">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-radius-md bg-accent-primary px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-accent-primary-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}
