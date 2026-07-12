import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconBell, IconTrash, IconCheck, IconAlertTriangle, IconInfoCircle, IconCalendar,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
  type NotificationRow,
} from "@/lib/notifications.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

function iconFor(type: string) {
  if (type === "warning" || type === "alert") return <IconAlertTriangle size={16} className="text-warning-strong" strokeWidth={1.75} />;
  if (type === "due" || type === "reminder") return <IconCalendar size={16} className="text-info-strong" strokeWidth={1.75} />;
  return <IconInfoCircle size={16} className="text-text-muted" strokeWidth={1.75} />;
}

function NotificationsPage() {
  const fetch = useServerFn(listNotifications);
  const mark = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);
  const del = useServerFn(deleteNotification);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["notifications"], queryFn: () => fetch() });

  const markMut = useMutation({
    mutationFn: ({ id, is_read }: { id: string; is_read: boolean }) => mark({ data: { id, is_read } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const allMut = useMutation({
    mutationFn: () => markAll(),
    onSuccess: () => { toast.success("All marked as read"); qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items = q.data ?? [];
  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto w-full max-w-[900px] p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Notifications</h1>
          <p className="mt-1 text-body text-text-secondary">
            {unread} unread · {items.length} total
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={() => allMut.mutate()} disabled={allMut.isPending}>
            <IconCheck size={14} strokeWidth={2} /> Mark all read
          </Button>
        )}
      </header>

      {q.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-12 text-center">
          <IconBell size={32} className="text-text-muted" strokeWidth={1.25} />
          <div className="text-body text-text-secondary">You're all caught up.</div>
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle bg-bg-surface">
          {items.map((n) => (
            <li key={n.id} className={cn("flex items-start gap-3 p-4 transition-colors hover:bg-bg-surface-hover", !n.is_read && "bg-bg-surface-raised/40")}>
              <div className="mt-0.5">{iconFor(n.type)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-body", !n.is_read ? "font-medium text-text-primary" : "text-text-secondary")}>
                    {n.title}
                  </span>
                  {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />}
                </div>
                {n.body && <p className="mt-1 text-small text-text-secondary">{n.body}</p>}
                <div className="mt-1.5 flex items-center gap-3 text-micro text-text-muted">
                  <span className="font-mono tabular-nums">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                  </span>
                  {n.due_date && <span>Due {n.due_date}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => markMut.mutate({ id: n.id, is_read: !n.is_read })}
                  className="rounded p-1.5 text-text-muted hover:bg-bg-surface-raised hover:text-text-primary"
                  aria-label={n.is_read ? "Mark unread" : "Mark read"}
                >
                  <IconCheck size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={() => delMut.mutate(n.id)}
                  className="rounded p-1.5 text-text-muted hover:bg-danger-wash hover:text-danger-strong"
                  aria-label="Delete"
                >
                  <IconTrash size={14} strokeWidth={1.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
