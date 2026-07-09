## Stage 1 — Foundation

### What we're building
The entire foundation for Velox HQ: dark-themed design system, self-hosted fonts, 18 base components, Lovable Cloud auth, app shell (sidebar + topbar + command palette), all 9 database tables with RLS, and the protected route structure. Everything in later stages depends on this being rock-solid.

### 1. Packages & Assets
- Install: `framer-motion`, `@tabler/icons-react`, `@fontsource-variable/inter`
- Geist Mono: self-hosted via `@font-face` using the `geist` npm package font files (or a CDN fallback if unavailable, then cached locally)
- No Google Fonts CDN dependency per blueprint §4.2

### 2. Design System (src/styles.css)
- Replace current Tailwind theme with blueprint §4.1 tokens (dark-only: `--bg-page`, `--bg-surface`, `--bg-surface-raised`, `--accent-primary`, semantic colors for success/danger/warning/info, shadows, radii, spacing scale)
- Wire tokens into `@theme inline` so Tailwind utilities work (`bg-page`, `text-primary`, `border-subtle`, etc.)
- Typography scale §4.2: Inter for UI text, Geist Mono for numbers with `tabular-nums`
- No light mode — dark theme only

### 3. Database Schema (migration)
Create all 9 tables from blueprint §5, in order, each with GRANT + RLS:
1. `trading_accounts`
2. `trades`
3. `income_entries`
4. `debts`
5. `debt_payments`
6. `goals`
7. `journal_entries`
8. `notifications`
9. `coach_messages`

Each table: `GRANT SELECT, INSERT, UPDATE, DELETE TO authenticated; GRANT ALL TO service_role;` then `ENABLE RLS` then `owner_all` policy.

Storage: create private `trade-screenshots` bucket (no public access), RLS policy scoped to `auth.uid()::text = foldername(name)[1]`.

### 4. Base Component Library (src/components/)
Build once, reuse forever. All styled with design tokens, no hardcoded colors:
- `Button`, `IconButton`, `Input`, `Select`, `Textarea`, `DatePicker`, `Tabs`, `Tooltip`
- `MetricCard` (label + mono value + delta pill + optional sparkline)
- `DataTable` (sticky header, sort, row hover, infinite scroll, empty state, skeleton)
- `ProgressBar` (segmented, 8px/12px variants, animated fill)
- `StatusBadge` (pill variants: success, danger, warning, info, neutral)
- `Drawer` (480px desktop, full-screen mobile, backdrop + Esc dismiss)
- `EmptyState` (contextual icon + headline + description + CTA)
- `Skeleton` (shimmer, exact dimensions match real content)
- `CommandPalette` (cmdk-based, Navigate + Quick Actions sections, fuzzy search)
- `Toast` (sonner-based, bottom-right, success/error/info variants)

### 5. Auth Pages
- `/auth` — combined login/signup toggle, email + password, inline zod validation, loading states, error toasts
- `/reset-password` — password reset flow (checks `type=recovery` in URL hash)
- Redirect authenticated users away from auth pages to `/dashboard`
- Single-user personal tool — no custom restriction logic needed beyond standard auth

### 6. App Shell
- TopBar: 56px, page title, cmdk trigger (fake input), notification bell, avatar
- Sidebar: 240px persistent desktop, collapsible to 64px icon rail. Active state: purple wash + left border. All nav items from §3.1. Pages 2-12 render as placeholders.
- Mobile (<768px): bottom tab bar (Dashboard, Journal, Debt, Income, Coach) + "More" sheet
- Content area: max-width 1400px, 32px desktop / 16px mobile padding

### 7. Route Structure
```
/auth                         (public)
/reset-password               (public)
/_authenticated/
  /dashboard                  (placeholder → Stage 2)
  /journal                    (placeholder → Stage 3)
  /debt                       (placeholder → Stage 4)
  /income                     (placeholder → Stage 5)
  /analytics                  (placeholder → Stage 6)
  /goals                      (placeholder → Stage 7)
  /reflections                (placeholder → Stage 8)
  /coach                      (placeholder → Stage 10)
  /notifications             (placeholder → Stage 9)
  /settings                   (placeholder → Stage 11)
  /settings/accounts          (placeholder → Stage 11)
  /settings/data              (placeholder → Stage 11)
```

### 8. Data Layer
- React Query provider in `__root.tsx` (already present, keep it)
- Create query hook pattern: `useTrades`, `useIncome`, etc. as stubs to be filled in later stages
- Supabase client from `@/integrations/supabase/client` for browser queries
- Server functions in `src/lib/*.functions.ts` for protected data fetching
- `requireSupabaseAuth` middleware already wired in `src/start.ts`

### 9. Head Metadata
Update `src/routes/__root.tsx` head: title → "Velox HQ", description → "Personal trading command center", og/twitter tags. No placeholder "Lovable App" text anywhere.

### Acceptance Criteria
- [ ] Can sign up, log out, log back in via email/password
- [ ] Every base component renders correctly in a temporary `/component-showcase` route
- [ ] Sidebar nav + command palette both navigate to all placeholder pages
- [ ] No console errors/warnings on any page
- [ ] All 9 database tables exist with RLS and correct grants
- [ ] `trade-screenshots` bucket is private with owner-scoped RLS
