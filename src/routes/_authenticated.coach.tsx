import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IconSend, IconTrash, IconSparkles } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listCoachMessages, sendCoachMessage, clearCoachHistory, type CoachMessage,
} from "@/lib/coach.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/coach")({
  component: CoachPage,
});

function CoachPage() {
  const fetch = useServerFn(listCoachMessages);
  const send = useServerFn(sendCoachMessage);
  const clear = useServerFn(clearCoachHistory);
  const qc = useQueryClient();

  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const q = useQuery({ queryKey: ["coach"], queryFn: () => fetch() });
  const messages = q.data ?? [];

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const sendMut = useMutation({
    mutationFn: (content: string) => send({ data: { content } }),
    onSuccess: () => { setInput(""); qc.invalidateQueries({ queryKey: ["coach"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const clearMut = useMutation({
    mutationFn: () => clear(),
    onSuccess: () => { toast.success("History cleared"); qc.invalidateQueries({ queryKey: ["coach"] }); },
  });

  const submit = () => {
    if (!input.trim() || sendMut.isPending) return;
    sendMut.mutate(input.trim());
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-56px)] w-full max-w-[900px] flex-col p-4 md:p-8">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-h1 text-text-primary">
            <IconSparkles size={24} className="text-accent-primary" strokeWidth={1.5} />
            AI Coach
          </h1>
          <p className="mt-1 text-body text-text-secondary">Your always-on trading & finance mentor.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => clearMut.mutate()}>
            <IconTrash size={14} strokeWidth={1.5} /> Clear history
          </Button>
        )}
      </header>

      <div
        ref={scroller}
        className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-border-subtle bg-bg-surface p-4"
      >
        {q.isLoading ? (
          <>
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="ml-auto h-12 w-1/2" />
          </>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <IconSparkles size={40} className="text-accent-primary" strokeWidth={1.25} />
            <div>
              <div className="text-h3 text-text-primary">Ask your coach anything</div>
              <p className="mt-1 text-body text-text-secondary">
                Trade reviews, risk sizing, debt payoff order, mindset — start the conversation.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Review my last week of trades",
                "How should I size positions with a $2k account?",
                "Which debt should I attack first?",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border-subtle bg-bg-surface-raised px-3 py-1.5 text-small text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <Bubble key={m.id} m={m} />)
        )}
        {sendMut.isPending && (
          <div className="flex items-center gap-2 text-small text-text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-primary" />
            Coach is thinking…
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder="Ask the coach… (Enter to send, Shift+Enter for newline)"
          className="flex-1 resize-none"
        />
        <Button onClick={submit} disabled={!input.trim() || sendMut.isPending} className="h-auto">
          <IconSend size={16} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

function Bubble({ m }: { m: CoachMessage }) {
  const user = m.role === "user";
  return (
    <div className={cn("flex", user ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2.5 text-body",
          user
            ? "bg-accent-primary text-white"
            : "border border-border-subtle bg-bg-surface-raised text-text-primary",
        )}
      >
        {m.content}
      </div>
    </div>
  );
}
