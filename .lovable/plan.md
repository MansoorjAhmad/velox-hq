# Velox HQ v1.1 — Design Refresh + Feature Upgrade

Two tracks executed together: a full visual/interaction refresh so the app stops feeling like a stock dashboard, plus the highest-leverage features that make Velox HQ genuinely next-level.

---

## Track A — UI/UX Overhaul

Current state: functional but generic. Flat cards, uniform density, no personality, no motion, no visual hierarchy between "hero moment" screens (Dashboard, Analytics) and "utility" screens (Settings, Debt table).

### A1. Design language reset
- Pick a distinctive direction (I'll present 3 rendered directions to choose from — a "trader terminal / financial noir" register, an "editorial finance magazine" register, and a "premium coach / calm mastery" register).
- Lock the winning palette, type pair, and layout as design tokens in `src/styles.css`. Kill all remaining raw color utilities.
- Introduce a real accent + accent-glow system for gradients, glows, and focus rings.

### A2. Hierarchy & density
- Dashboard: promote to a real hero — oversized net-worth number, animated delta, sparkline behind the hero metric, secondary KPI row.
- Analytics: split into an "at-a-glance" strip and a "deep-dive" grid instead of one flat wall of cards.
- Tables (Debt, Income, Journal): compact zebra rows, sticky totals footer, inline row actions on hover instead of a cluttered actions column.

### A3. Motion & feedback
- Number counters (Framer Motion) on KPI cards.
- Smooth chart mount transitions (recharts + reduced-motion respect).
- Toast → inline optimistic UI on trade/income/debt saves.
- Route transitions (fade + subtle slide) via a root-level layout wrapper.

### A4. Navigation
- Redesigned sidebar: grouped (Trade / Money / Growth / System), collapsible, active-route indicator with an accent bar, keyboard shortcuts hint per row.
- ⌘K command palette upgrade: quick-log actions (log trade, add income, mark debt payment), jump-to-route, run coach prompt.

### A5. Empty & loading states
- Every list/page gets a custom illustrated empty state with a primary CTA (not just "no data").
- Skeleton loaders that match the final layout, not generic gray blocks.

### A6. Mobile
- App-shell becomes a bottom-tab bar under 768px.
- Drawers replace side sheets on small screens.
- All header rows fixed with `grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `truncate` so nothing clips.

### A7. Micro-polish
- Focus-visible rings across all interactives.
- Consistent 44px min tap targets.
- `h-dvh` everywhere instead of `h-screen`.
- Gradient/glow only on hero KPIs and CTAs — everywhere else stays quiet.

---

## Track B — v1.1 Features

Priority-ordered. Anything unchecked stays for v1.2.

### B1. Streaming coach (Groq SSE)
Replace the current request/response coach with token streaming. Groq is fast enough that this feels instant. Adds a "stop generating" button.

### B2. Weekly auto-review
Sunday cron (`/api/public/cron/weekly-review`) — coach analyzes the week's trades + reflections and drops a graded report into Notifications with a link to the full review page.

### B3. Rule engine
User defines rules (max daily loss, min RR, no trades after N losses, no revenge trading window). On trade save, run rules → flag violations → surface on the trade row and in Analytics' "Rule Violations" KPI (currently hardcoded).

### B4. Debt payoff simulator
New `/debt/simulator` page. Snowball vs avalanche side-by-side, projected payoff dates, "what if I add $X/mo from trading profits" slider, interest saved chart.

### B5. Net-worth timeline
Nightly snapshot of net worth (accounts − debts + reinvest). Chart on Dashboard with goal-deadline projection lines. New `net_worth_snapshots` table.

### B6. Trade screenshot vision (Groq multimodal or fallback)
Upload chart image on trade form → Groq LLaMA 3.2 Vision extracts pair, entry, direction, timeframe. Pre-fills the form.

### B7. Broker CSV import
`/journal/import` — paste or upload CSV from MT4/MT5/TradingView/cTrader. Column-mapping wizard, dedupe on external_id, preview → confirm.

### B8. Tag system
Free-form tags on trades/goals/reflections. New "breakdown by tag" chart on Analytics. Tag chip picker with autocomplete.

### B9. PWA + push
Manifest + service worker so users can install to homescreen. Web-push for goal milestones, rule violations, weekly reviews.

### B10. Milestone share cards
Server-generated OG image on `/share/[milestoneId]` — dark card with the achievement (e.g. "Paid off $12,400"). Copy-link + tweet-intent.

---

## Technical Details

### New tables (Supabase migration)
- `rules` (user_id, name, kind, params jsonb, active) + `rule_violations` (trade_id, rule_id, message)
- `net_worth_snapshots` (user_id, captured_at, net_worth, total_assets, total_debt)
- `weekly_reviews` (user_id, week_start, grade, summary, metrics jsonb)
- `tags` + `taggables` (polymorphic: trade/goal/reflection)
- `broker_imports` (user_id, source, status, row_count)
Each with GRANTs + RLS + `auth.uid()`-scoped policies.

### Server functions
- `src/lib/rules.functions.ts` — CRUD + `evaluateTrade`
- `src/lib/simulator.functions.ts` — pure math, no DB
- `src/lib/net-worth.functions.ts` — snapshot + range read
- `src/lib/weekly-review.functions.ts` — invoked by cron
- `src/lib/import.functions.ts` — parse + dry-run + commit
- Streaming route: `src/routes/api/coach.stream.ts` (server route, Groq SSE passthrough)
- Cron route: `src/routes/api/public/cron/weekly-review.ts` (HMAC-verified)

### Coach streaming
Move Groq call out of `sendCoachMessage` into a server route that returns a `ReadableStream`. Client uses `EventSource`/`fetch` + reader. Persist final message after stream completes.

### Design tokens
Extend `src/styles.css` `@theme` with `--accent-glow`, `--gradient-hero`, `--shadow-hero`, `--surface-elevated`, motion timing vars.

### File layout
```
src/
  components/
    hero-metric.tsx            (new)
    kpi-strip.tsx              (new)
    empty-state.tsx            (new)
    bottom-tab-bar.tsx         (new)
    route-transition.tsx       (new)
  routes/
    _authenticated.debt.simulator.tsx        (new)
    _authenticated.journal.import.tsx        (new)
    _authenticated.review.$week.tsx          (new)
    api/coach.stream.ts                      (new server route)
    api/public/cron/weekly-review.ts         (new server route)
  lib/
    rules.functions.ts, simulator.functions.ts,
    net-worth.functions.ts, weekly-review.functions.ts,
    import.functions.ts, tags.functions.ts   (new)
```

### Secrets needed
- `CRON_SECRET` (generated) — HMAC for weekly-review cron
- `GROQ_API_KEY` (already set)

---

## Execution Order

1. **Design directions** — I render 3 options, you pick one. (Track A1)
2. **Token + shell refresh** — apply chosen direction, redo sidebar, mobile bottom tabs, motion primitives. (A1–A4, A6)
3. **Screen-by-screen polish** — Dashboard hero → Analytics → tables → empty/loading states. (A2, A5, A7)
4. **Streaming coach** — visible win, low risk. (B1)
5. **Rule engine + net-worth timeline** — highest daily-value features. (B3, B5)
6. **Debt simulator + weekly review** — the "wow" additions. (B4, B2)
7. **Import + vision + tags** — power-user layer. (B6, B7, B8)
8. **PWA + share cards** — distribution layer. (B9, B10)

Approve this and I'll start with step 1 (design directions).