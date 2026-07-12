import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconTrash, IconTargetArrow, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listGoals, createGoal, updateGoal, deleteGoal, type GoalRow, type GoalInput,
} from "@/lib/goals.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/goals")({
  component: GoalsPage,
});

const CATEGORIES = ["trading", "debt", "savings", "personal", "learning"];

function GoalsPage() {
  const fetch = useServerFn(listGoals);
  const del = useServerFn(deleteGoal);
  const upd = useServerFn(updateGoal);
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GoalRow | null>(null);

  const q = useQuery({ queryKey: ["goals"], queryFn: () => fetch() });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Goal deleted"); qc.invalidateQueries({ queryKey: ["goals"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: (g: GoalRow) => upd({ data: { id: g.id, patch: { status: g.status === "completed" ? "active" : "completed" } } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });

  const goals = q.data ?? [];
  const active = goals.filter((g) => g.status !== "completed");
  const completed = goals.filter((g) => g.status === "completed");

  return (
    <div className="mx-auto w-full max-w-[1200px] p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1 text-text-primary">Goals</h1>
          <p className="mt-1 text-body text-text-secondary">
            {active.length} active · {completed.length} completed
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <IconPlus size={16} strokeWidth={2} /> New goal
        </Button>
      </header>

      {q.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border-subtle bg-bg-surface p-16 text-center">
          <IconTargetArrow size={40} className="text-text-muted" strokeWidth={1.25} />
          <div>
            <div className="text-h3 text-text-primary">No goals yet</div>
            <p className="mt-1 text-body text-text-secondary">Define what you're aiming at.</p>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <IconPlus size={14} strokeWidth={2} /> Set your first goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {[...active, ...completed].map((g) => (
            <GoalCard
              key={g.id}
              g={g}
              onEdit={() => { setEditing(g); setOpen(true); }}
              onDelete={() => delMut.mutate(g.id)}
              onToggle={() => toggleMut.mutate(g)}
            />
          ))}
        </div>
      )}

      <GoalDrawer open={open} onOpenChange={setOpen} goal={editing} />
    </div>
  );
}

function GoalCard({
  g, onEdit, onDelete, onToggle,
}: { g: GoalRow; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  const cur = Number(g.current_value ?? 0);
  const target = Number(g.target_value ?? 0);
  const pct = target > 0 ? Math.min(100, (cur / target) * 100) : 0;
  const done = g.status === "completed";

  return (
    <div className={cn(
      "rounded-lg border border-border-subtle bg-bg-surface p-5 transition-colors hover:bg-bg-surface-hover",
      done && "opacity-60",
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {g.category && (
              <span className="rounded-full bg-bg-surface-raised px-2 py-0.5 text-micro capitalize text-text-secondary">
                {g.category}
              </span>
            )}
            {done && (
              <span className="rounded-full bg-success-wash px-2 py-0.5 text-micro text-success-strong">
                Completed
              </span>
            )}
          </div>
          <h3 className={cn("mt-2 text-h3 text-text-primary", done && "line-through")}>{g.title}</h3>
          {g.target_date && (
            <div className="mt-1 text-small text-text-muted">
              Target: <span className="font-mono tabular-nums">{g.target_date}</span>
            </div>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            onClick={onToggle}
            className={cn(
              "rounded p-1.5 transition-colors",
              done
                ? "bg-success-wash text-success-strong"
                : "text-text-muted hover:bg-bg-surface-raised hover:text-text-primary",
            )}
            aria-label="Toggle completion"
          >
            <IconCheck size={14} strokeWidth={2} />
          </button>
          <button
            onClick={onEdit}
            className="rounded px-2 py-1 text-small text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1.5 text-text-muted hover:bg-danger-wash hover:text-danger-strong"
            aria-label="Delete goal"
          >
            <IconTrash size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {target > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-small">
            <span className="font-mono tabular-nums text-text-secondary">
              {cur.toLocaleString()} / {target.toLocaleString()}
            </span>
            <span className="font-mono tabular-nums text-text-muted">{pct.toFixed(0)}%</span>
          </div>
          <Progress value={pct} />
        </div>
      )}
    </div>
  );
}

function GoalDrawer({
  open, onOpenChange, goal,
}: { open: boolean; onOpenChange: (o: boolean) => void; goal: GoalRow | null }) {
  const qc = useQueryClient();
  const createFn = useServerFn(createGoal);
  const updateFn = useServerFn(updateGoal);

  const [form, setForm] = useState<GoalInput>({
    title: "", category: "trading", target_value: null, current_value: 0, target_date: null,
  });

  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title,
        category: goal.category ?? "trading",
        target_value: goal.target_value,
        current_value: goal.current_value ?? 0,
        target_date: goal.target_date,
      });
    } else if (open) {
      setForm({ title: "", category: "trading", target_value: null, current_value: 0, target_date: null });
    }
  }, [goal, open]);

  const m = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Title is required");
      if (goal) return updateFn({ data: { id: goal.id, patch: form } });
      return createFn({ data: form });
    },
    onSuccess: () => {
      toast.success(goal ? "Goal updated" : "Goal created");
      qc.invalidateQueries({ queryKey: ["goals"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{goal ? "Edit goal" : "New goal"}</SheetTitle>
          <SheetDescription>Track a measurable target with a deadline.</SheetDescription>
        </SheetHeader>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => { e.preventDefault(); m.mutate(); }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Hit $10k trading account"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category ?? "trading"}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Target date</Label>
              <Input
                id="date" type="date"
                value={form.target_date ?? ""}
                onChange={(e) => setForm({ ...form, target_date: e.target.value || null })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="current">Current</Label>
              <Input
                id="current" type="number" step="0.01"
                value={form.current_value ?? 0}
                onChange={(e) => setForm({ ...form, current_value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target" type="number" step="0.01"
                value={form.target_value ?? ""}
                onChange={(e) => setForm({ ...form, target_value: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={m.isPending}>
              {m.isPending ? "Saving…" : goal ? "Save changes" : "Create goal"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
