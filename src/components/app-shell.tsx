import { useState, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommandPalette } from "@/components/command-palette";

import {
  IconLayoutDashboard,
  IconNotebook,
  IconCreditCard,
  IconCoin,
  IconChartBar,
  IconTarget,
  IconBrain,
  IconMessageCircle,
  IconBell,
  IconSettings,
  IconSearch,
  IconMenu2,
  IconX,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

const mainNavItems = [
  { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
  { label: "Journal", to: "/journal", icon: IconNotebook },
  { label: "Debt", to: "/debt", icon: IconCreditCard },
  { label: "Income", to: "/income", icon: IconCoin },
  { label: "Analytics", to: "/analytics", icon: IconChartBar },
  { label: "Goals", to: "/goals", icon: IconTarget },
  { label: "Reflections", to: "/reflections", icon: IconBrain },
  { label: "Coach", to: "/coach", icon: IconMessageCircle },
];

const bottomNavItems = [
  { label: "Notifications", to: "/notifications", icon: IconBell },
  { label: "Settings", to: "/settings", icon: IconSettings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  // Collapse sidebar on smaller screens automatically
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1280 && !collapsed) setCollapsed(true);
      if (window.innerWidth >= 1280 && collapsed) setCollapsed(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [collapsed]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  const sidebarWidth = collapsed ? "w-16" : "w-60";

  return (
    <div className="flex min-h-screen bg-bg-page">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border-subtle bg-bg-surface transition-all duration-200 ease-in-out ${sidebarWidth} fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 px-4 border-b border-border-subtle">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-radius-md bg-accent-primary text-text-primary font-bold text-sm">
            V
          </div>
          {!collapsed && (
            <span className="text-h3 text-text-primary truncate">Velox HQ</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-radius-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-primary-wash text-text-primary border-l-2 border-accent-primary"
                    : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary border-l-2 border-transparent"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          <div className="my-3 border-t border-border-subtle" />

          {bottomNavItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-radius-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-primary-wash text-text-primary border-l-2 border-accent-primary"
                    : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary border-l-2 border-transparent"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle + Sign out */}
        <div className="border-t border-border-subtle p-2 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-radius-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <IconChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            ) : (
              <>
                <IconChevronLeft className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <span className="truncate">Collapse</span>
              </>
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-radius-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-danger-wash hover:text-danger-strong transition-colors"
            title={collapsed ? "Sign out" : undefined}
          >
            <IconLogout className="h-5 w-5 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="truncate">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-200 md:ml-60 ${collapsed ? "md:ml-16" : ""}`}>
        {/* TopBar */}
        <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-bg-surface px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary"
            >
              <IconMenu2 className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <h2 className="text-h3 text-text-primary">
              {getPageTitle(pathname)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Command palette trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-radius-md border border-border-default bg-bg-page px-3 py-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              <IconSearch className="h-4 w-4" strokeWidth={1.5} />
              <span>Search or run a command</span>
              <kbd className="ml-2 hidden lg:inline-block rounded-radius-sm border border-border-subtle bg-bg-surface px-1.5 py-0.5 text-micro text-text-muted">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => navigate({ to: "/notifications" })}
              className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <IconBell className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="h-8 w-8 rounded-radius-full bg-accent-primary-wash flex items-center justify-center text-sm font-medium text-accent-primary-light">
              U
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-60 bg-bg-surface border-r border-border-subtle z-50 md:hidden flex flex-col">
            <div className="flex h-14 items-center justify-between px-4 border-b border-border-subtle">
              <span className="text-h3 text-text-primary">Velox HQ</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary"
              >
                <IconX className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {[...mainNavItems, ...bottomNavItems].map((item) => {
                const isActive = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-radius-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent-primary-wash text-text-primary border-l-2 border-accent-primary"
                        : "text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary border-l-2 border-transparent"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border-subtle p-2">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-radius-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-danger-wash hover:text-danger-strong transition-colors"
              >
                <IconLogout className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-border-subtle bg-bg-surface md:hidden">
        {[
          { label: "Dashboard", to: "/dashboard", icon: IconLayoutDashboard },
          { label: "Journal", to: "/journal", icon: IconNotebook },
          { label: "Debt", to: "/debt", icon: IconCreditCard },
          { label: "Income", to: "/income", icon: IconCoin },
          { label: "Coach", to: "/coach", icon: IconMessageCircle },
        ].map((item) => {
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 flex-1 ${
                isActive ? "text-accent-primary-light" : "text-text-muted"
              }`}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-micro">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/journal": "Trading Journal",
    "/debt": "Debt Tracker",
    "/income": "Income Streams",
    "/analytics": "Analytics",
    "/goals": "Goals",
    "/reflections": "Reflections",
    "/coach": "AI Coach",
    "/notifications": "Notifications",
    "/settings": "Settings",
    "/settings/accounts": "Trading Accounts",
    "/settings/data": "Data & Export",
  };
  return map[pathname] || "Velox HQ";
}
