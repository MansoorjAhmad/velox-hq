import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsLayout,
});

const TABS = [
  { to: "/settings", label: "General" },
  { to: "/settings/accounts", label: "Trading accounts" },
  { to: "/settings/data", label: "Data & export" },
] as const;

function SettingsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto w-full max-w-[1200px] p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-h1 text-text-primary">Settings</h1>
        <p className="mt-1 text-body text-text-secondary">Manage your workspace and data.</p>
      </header>
      <nav className="mb-6 flex gap-1 border-b border-border-subtle">
        {TABS.map((t) => {
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-small transition-colors",
                active
                  ? "border-accent-primary text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </div>
  );
}
