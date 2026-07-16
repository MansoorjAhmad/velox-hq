import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconTrash, IconNotebook } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listReflections, createReflection, deleteReflection, type ReflectionRow,
} from "@/lib/reflections.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reflections")({
  component: ReflectionsPage,
});

const MOODS = [
  { v: "great", label: "Great", emoji: "🚀" },
  { v: "good", label: "Good", emoji: "😊" },
  { v: "neutral", label: "Neutral", emoji: "😐" },
  { v: "off", label: "Off", emoji: "😕" },
  { v: "bad", label: "Bad", emoji: "😖" },
];

function ReflectionsPage() {
  const fetch = useServerFn(listReflections);
  const create = useServerFn(createReflection);
  const del = useServerFn(deleteReflection);
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const q = useQuery({ queryKey: ["reflections"], queryFn: () => fetch() });

  const addMut = useMutation({
    mutationFn: () => create({
      title: title || "Untitled Reflection",
      content,
      reflection_date: date,
      category: category || null,
    }),
    onSuccess: () => {
      toast.success("Reflection saved");
      setTitle("");
      setContent("");
      setCategory("");
      qc.invalidateQueries({ queryKey: ["reflections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ id }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["reflections"] }); },
  });

  const entries = q.data ?? [];

  return (
    <div className="mx-auto w-full max-w-[900px] p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-h1 text-text-primary">Reflections</h1>
        <p className="mt-1 text-body text-text-secondary">
          {entries.length} entr{entries.length === 1 ? "y" : "ies"} · Daily journal
        </p>
      </header>

      <section className="mb-8 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="d">Date</Label>
            <Input id="d" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[180px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MOODS.map((m) => (
                  <SelectItem key={m.v} value={m.v}>{m.emoji} {m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea
          rows={4}
          placeholder="What went well? What tripped you up? What are you carrying into tomorrow?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={() => addMut.mutate()} disabled={!content.trim() || addMut.isPending}>
            <IconPlus size={16} strokeWidth={2} />
            {addMut.isPending ? "Saving…" : "Save reflection"}
          </Button>
        </div>
      </section>

      {q.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-12 text-center">
          <IconNotebook size={32} className="text-text-muted" strokeWidth={1.25} />
          <div className="text-body text-text-secondary">No reflections yet — start with today.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => <EntryCard key={e.id} e={e} onDelete={() => delMut.mutate(e.id)} />)}
        </div>
      )}
    </div>
  );
}

function EntryCard({ e, onDelete }: { e: JournalRow; onDelete: () => void }) {
  const mood = MOODS.find((m) => m.v === e.mood);
  return (
    <article className="group rounded-lg border border-border-subtle bg-bg-surface p-4 transition-colors hover:bg-bg-surface-hover">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-small">
          <span className="font-mono tabular-nums text-text-secondary">{e.entry_date}</span>
          {mood && (
            <span className={cn(
              "rounded-full bg-bg-surface-raised px-2 py-0.5 text-micro capitalize text-text-secondary",
            )}>
              {mood.emoji} {mood.label}
            </span>
          )}
        </div>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-text-muted opacity-0 transition-opacity hover:bg-danger-wash hover:text-danger-strong group-hover:opacity-100"
          aria-label="Delete"
        >
          <IconTrash size={14} strokeWidth={1.5} />
        </button>
      </div>
      <p className="whitespace-pre-wrap text-body text-text-primary">{e.content}</p>
    </article>
  );
}
