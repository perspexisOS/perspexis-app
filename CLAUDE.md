# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

No test runner or linter is configured.

## Architecture

Perspexis is a React/Vite single-page app helping organizations define their operating system across three layers: **Identity** (mission/values), **People** (org chart/roles), and **Rhythm** (meeting cadences). AI analysis via Claude API grades clarity across each layer.

**Everything lives in one file: `src/App.jsx` (~1580 lines).** It contains all components, state, API calls, and inline styles. There is no component splitting, no separate style files, and no state management library — only `useState`/`useEffect`.

### Key components (all in App.jsx)
- `PerspexisCore` — root component; owns all state and Supabase persistence
- `AuthScreen` — Supabase email/password auth + password reset
- `OnboardingScreen` — org name + type setup (runs once after signup)
- `IdentityView/Edit`, `PeopleView/EmptyPeopleState`, `RhythmSetup/RhythmView` — the three layer UIs
- `HealthOverview` — aggregate AI analysis across all layers
- UI primitives: `Label`, `Card`, `Tag`, `Btn`, `Bar`, `Animated`, `Spinner`

### Data flow
All user data persists to Supabase (tables: `profiles`, `identity`, `people`, `rhythm`, `activity_logs`). Reads happen on auth — each table is fetched and merged into local state. Writes use `.upsert()` keyed on `user_id`. There is no optimistic update logic; saves are fire-and-forget with no rollback.

AI calls go directly from the browser to `api.anthropic.com` using `anthropic-dangerous-direct-browser-access: true`. The API key is hardcoded in the file (intentional for this dev stage). Model: `claude-sonnet-4-20250514`, max tokens: 2000. Responses are JSON extracted via regex (`/\{[\s\S]*\}/`) to handle markdown-wrapped output.

### Beta gating
A hardcoded `BETA_EMAILS` array (around line 1138) controls access. Users not in the list see a locked screen instead of the app.

### Known bug
`saveRhythm()` (around line 1113) calls itself recursively instead of calling `setRhythm(d)` — this causes a stack overflow when saving rhythm data.

### Styling
All styles are inline via React `style` props. CSS variables are defined in a `<style>` tag in `main.jsx` (`:root` block). The scoring color scheme: ≥80 → teal (`#2EC4B6`), ≥60 → coral (`#F26751`), <60 → deep red (`#CC5A4A`).
