import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconTrash, IconNotebook, IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { listJournal, deleteJournal, type JournalRow } from "@/lib/journal.functions";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/journal")({
  component: JournalPage,
});

function JournalPage() {
  const fetchJournal = useServerFn(listJournal);
  const deleteFn = useServerFn(deleteJournal);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");

  const journalQuery = useQuery({
    queryKey: ["journal"],
    queryFn: () => fetchJournal(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ id }),
    onSuccess: () => {
      toast.success("Journal entry deleted");
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const rows = journalQuery.data ?? [];
    return rows.filter((j) => {
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && 
          !j.content.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [journalQuery.data, search]);

  const stats = useMemo(() => {
    const rows = journalQuery.data ?? [];
    return { total: rows.length };
  }, [journalQuery.data]);

  return (
    <div className="mx-auto w-full max-w-[1400px] p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-h1 text-text-primary">Trading Journal</h1>
        <p className="mt-1 text-body text-text-secondary">
          {stats.total} entr{stats.total === 1 ? "y" : "ies"} · Reflect on your trades and decisions
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="Search entries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[240px]"
        />
      </div>

      <div className="space-y-4">
        {journalQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border-primary bg-surface-secondary py-12 px-4">
            <IconNotebook className="w-12 h-12 text-text-muted mb-4" />
            <p className="text-text-muted text-sm">
              {journalQuery.data && journalQuery.data.length > 0
                ? "No entries match your search"
                : "No journal entries yet"}
            </p>
          </div>
        ) : (
          filtered.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => del.mutate(entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function JournalEntryCard({
  entry,
  onDelete,
}: {
  entry: JournalRow;
  onDelete: () => void;
}) {
  const date = new Date(entry.entry_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-border-primary bg-surface-secondary p-5 hover:bg-surface-tertiary transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-semibold text-text-primary">{entry.title}</h3>
          <p className="text-sm text-text-muted">{date}</p>
        </div>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-accent-danger-wash rounded text-text-muted hover:text-accent-danger-light"
          aria-label="Delete entry"
        >
          <IconTrash size={16} />
        </button>
      </div>
      <p className="text-sm text-text-secondary line-clamp-3">{entry.content}</p>
      {entry.lessons_learned && (
        <div className="mt-3 pt-3 border-t border-border-primary">
          <p className="text-xs text-text-muted font-medium mb-1">Lessons Learned:</p>
          <p className="text-sm text-text-secondary">{entry.lessons_learned}</p>
        </div>
      )}
    </div>
  );
}
