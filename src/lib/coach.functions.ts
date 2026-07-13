import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CoachMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string | null;
};

const SYSTEM_PROMPT = `You are Velox, an elite trading and personal finance coach for the app owner.
You have direct, calm authority. Your job: help the user grow trading edge, escape debt, and build wealth.

Style:
- Concise, specific, no fluff.
- Ask sharp questions when context is missing.
- Reference discipline, risk management, and process over outcomes.
- Never give financial advice as a licensed advisor — you are a personal coach.`;

export const listCoachMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CoachMessage[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("coach_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as CoachMessage[];
  });

export const clearCoachHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("coach_messages").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendCoachMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { content: string }) => {
    if (!data.content || !data.content.trim()) throw new Error("Message is empty");
    if (data.content.length > 4000) throw new Error("Message too long");
    return { content: data.content.trim() };
  })
  .handler(async ({ data, context }): Promise<{ user: CoachMessage; assistant: CoachMessage }> => {
    const { supabase, userId } = context;

    // Insert user message
    const { data: userRow, error: uErr } = await supabase
      .from("coach_messages")
      .insert({ user_id: userId, role: "user", content: data.content })
      .select("*")
      .single();
    if (uErr) throw new Error(uErr.message);

    // Load recent history
    const { data: history } = await supabase
      .from("coach_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(30);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    ];

    const apiKey = process.env.GROQ_API_KEY;
    let reply = "The coach is unavailable right now. Try again shortly.";
    if (apiKey) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
          }),
        });
        if (res.ok) {
          const json: any = await res.json();
          reply = json?.choices?.[0]?.message?.content?.trim() || reply;
        } else if (res.status === 429) {
          reply = "Rate limit reached. Give it a moment and try again.";
        } else if (res.status === 401) {
          reply = "Groq API key invalid. Update GROQ_API_KEY in settings.";
        } else {
          reply = `Coach error (${res.status}). Try again shortly.`;
        }
      } catch (e) {
        reply = "Couldn't reach the coach. Check your connection and retry.";
      }
    } else {
      reply = "GROQ_API_KEY is not configured yet. Add it in Settings → Secrets.";
    }

    const { data: aRow, error: aErr } = await supabase
      .from("coach_messages")
      .insert({ user_id: userId, role: "assistant", content: reply })
      .select("*")
      .single();
    if (aErr) throw new Error(aErr.message);

    return { user: userRow as CoachMessage, assistant: aRow as CoachMessage };
  });
