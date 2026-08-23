# Next.js Admin Template

Production-ready admin starter. Next.js 16, App Router, TypeScript, Tailwind v4, shadcn.

## Stack

| Layer     | Choice                                                         |
| --------- | -------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                             |
| UI        | React 19, shadcn (radix-nova), Tailwind v4                     |
| Font      | Geist Sans / Mono                                              |
| Auth      | `@tenminuteschool/auth-admin-react` — localStorage, no cookies |
| Forms     | Zod 4                                                          |
| Data      | SWR + `apiRequest()` for authenticated calls                   |
| Toasts    | sonner                                                         |

## Quick start

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_PREFIX, NEXT_PUBLIC_DOMAIN, NEXT_PUBLIC_APP_NAME
pnpm install
pnpm dev
```

## Environment variables

```bash
# prod  → NEXT_PUBLIC_API_PREFIX=,        NEXT_PUBLIC_DOMAIN=.com
# stage → NEXT_PUBLIC_API_PREFIX=stage-,  NEXT_PUBLIC_DOMAIN=.net
# local → NEXT_PUBLIC_API_PREFIX=local-,  NEXT_PUBLIC_DOMAIN=.net
NEXT_PUBLIC_API_PREFIX=local-
NEXT_PUBLIC_ENVIRONMENT=local
NEXT_PUBLIC_DOMAIN=.net

NEXT_PUBLIC_APP_NAME=10MS APP
NEXT_PUBLIC_TENMS_CLIENT_ID=          # required — client ID for "Login with 10MS Admin"
NEXT_PUBLIC_TENMS_SOURCE_PLATFORM=admin

```

Backend base URL constructed in `src/lib/api.ts` (used by feature services added via `API_SERVICES`/`API_ROUTES` — see "API layer" below):

```
https://{NEXT_PUBLIC_API_PREFIX}api.10minuteschool{NEXT_PUBLIC_DOMAIN}
```

Auth itself does not use this base URL — `@tenminuteschool/auth-admin-react` talks to its own fixed OAuth backend (see "Auth architecture" below).

## Folder structure

```
src/
├── app/
│   ├── (auth)/                         # Unauthenticated routes (login)
│   │   ├── components/brand-panel.tsx  # Left-panel split-screen branding
│   │   ├── layout.tsx                  # Split-screen auth shell
│   │   └── login/
│   │       ├── components/login-with-tenms.tsx  # LoginButton + useTenMSAuth
│   │       └── page.tsx
│   ├── (dashboard)/                    # Protected routes
│   │   ├── dashboard/page.tsx
│   │   ├── error.tsx                   # Route-group error boundary
│   │   ├── loading.tsx                 # Route-group skeleton
│   │   └── layout.tsx                  # Client-side auth guard → DashboardShell
│   ├── layout.tsx                      # Root fonts, Providers
│   ├── globals.css
│   ├── not-found.tsx
│   └── page.tsx                        # Redirects → /dashboard
│
├── features/                           # One folder per domain feature
│   └── dashboard/dashboard.tsx
│   # Add: features/users/, features/products/, etc.
│
├── components/
│   ├── layout/
│   │   ├── dashboard-shell.tsx         # Header + rail + content card
│   │   ├── header.tsx                  # Top navbar (logo, env badge, page title, user)
│   │   ├── header-user.tsx             # Navbar account dropdown
│   │   ├── full-bleed-context.tsx      # useFullBleedPage() — page owns the card
│   │   └── sidebar/
│   │       ├── sidebar-primitives.tsx  # shadcn sidebar fork (modes + hover-peek)
│   │       ├── app-sidebar.tsx         # Composed rail
│   │       ├── nav-main.tsx            # Nav groups, collapsibles, icon flyouts
│   │       └── sidebar-settings.tsx    # Rail footer: sidebar mode picker
│   ├── providers.tsx
│   └── logo.tsx
│
├── hooks/
│   ├── use-auth.ts                     # Thin wrapper over useTenMSAuth()
│   ├── use-embedded.ts                 # In an HQ iframe / ?source=hq
│   └── use-large.ts                    # lg breakpoint — desktop rail vs mobile sheet
│
├── lib/
│   ├── api.ts                          # API_SERVICES, API_ROUTES, apiUrl()
│   ├── api/client.ts                   # apiRequest() — Bearer via auth.getAccessToken()
│   ├── auth.ts                         # TenMSAuth instance, CLIENT_ID, LOGIN_PATH
│   ├── nav.ts                          # Sidebar nav items (single source of truth)
│   └── utils.ts                        # cn()
│
└── constants/index.ts                  # APP_NAME, ENV
```

### Why each folder

- **app/** — Next.js routing only. Pages are thin — delegate to `features/`.
- **features/** — All domain logic lives here. Each feature owns: UI components, API calls (SWR hooks), types, schemas.
- **components/** — Generic, domain-agnostic UI. `layout/` for the app shell; everything else comes from `@tenminuteschool/design-system`.
- **hooks/** — Client-side React hooks.
- **lib/** — Pure utilities and infrastructure (no React). `auth.ts` for the auth SDK instance; `api/` for HTTP client.
- **constants/** — Compile-time values read from `process.env`.

## Auth architecture

"Login with 10MS Admin" via `@tenminuteschool/auth-admin-react` — OAuth 2.0 + PKCE against 10 Minute School's own auth backend. Client-side only — no Server Actions, no httpOnly cookies.

| Layer        | File                       | Behavior                                                                       |
| ------------ | -------------------------- | ------------------------------------------------------------------------------ |
| SDK instance | `lib/auth.ts`              | `new TenMSAuth({ clientId, storage: 'localStorage' })` — singleton             |
| Session      | `components/providers.tsx` | `TenMSAuthProvider` wraps the app once; handles cross-app token handoff        |
| Route guard  | `(dashboard)/layout.tsx`   | `useAuth()` (`hydrated`/`user`); redirects to `/login` if missing              |
| API calls    | `lib/api/client.ts`        | Bearer from `auth.getAccessToken()` (auto-refreshes); 401 → redirects `/login` |

### Session provider

`TenMSAuthProvider` needs `"use client"`, so it's mounted inside `components/providers.tsx` (already a client component) rather than directly in the Server Component root layout. Read session state anywhere in the tree with `useTenMSAuth()` — or `useAuth()` in `hooks/use-auth.ts`, a thin wrapper kept for a stable `{ user, hydrated, logout, isLoggingOut }` shape across the app.

**Never**: call `auth.handleTokenHandoff()` yourself (the provider already calls it once, globally, on mount — a second call races it), or read session state via `auth.isLoggedIn()`/`auth.getUser()` inside a component instead of `useTenMSAuth()`/`useAuth()`.

### Login flow

1. `LoginWithTenMS` (`app/(auth)/login/components/login-with-tenms.tsx`) renders the SDK's `<LoginButton clientId={CLIENT_ID} />`
2. `onSuccess`: `await auth.handleLoginSuccess(response)` → `refresh()` → `router.replace('/dashboard')`

### Logout flow

1. `useAuth().logout()`: `await auth.logout()` (revokes token when this app owns the session) → `refresh()` → `window.location.href = '/login'`

## API layer

```ts
// Add a new service in src/lib/api.ts:
export const API_SERVICES = {
  auth: `${API_BASE}/auth/v1`,
  users: `${API_BASE}/users/v1`, // add more services
} as const;

export const API_ROUTES = {
  auth: { login: '/admin/login', logout: '/logout' },
  users: { list: '/users', create: '/users' },
} as const satisfies Record<ServiceName, Record<string, string>>;
```

### Client-side data fetching pattern

```ts
// features/users/api.ts
import useSWR from 'swr';
import { apiRequest } from '@/lib/api/client';
import { apiUrl } from '@/lib/api';

export function useUsers() {
  return useSWR('/users', () => apiRequest(apiUrl('users', 'list')));
}
```

## Layout shell

Ported from **10MS HQ** — top navbar plus a floating left rail, with the page in an inset card.

```
DashboardShell            h-svh, flex-col, overflow-hidden; sets --app-header-h
├── Header                sticky h-14: mobile SidebarTrigger, logo + APP_NAME, page title, HeaderUser
└── row (flex-1)
    ├── AppSidebar        floating rail, fixed at top-(--app-header-h)
    └── content card      rounded-xl border, scrolls inside itself
```

`--app-header-h` is the navbar's height (`3.5rem`, `0px` when embedded). The rail
is `position: fixed` while the content sits in flow, so both read this one
variable — hard-coding either offset drifts them apart. Fallback in
`globals.css`; overridden per-render in `dashboard-shell.tsx`.

### Sidebar modes

`SidebarProvider` persists one of three modes in `localStorage` (`sidebar_mode`), default `expanded`:

| Mode        | Behavior                                                                |
| ----------- | ----------------------------------------------------------------------- |
| `expanded`  | Pinned open — reserves real layout width                                |
| `collapsed` | Icon rail, no peek; groups open as hover flyouts, items get tooltips    |
| `hover`     | Icon rail that peeks open on hover (debounced) and overlays the content |

- `⌘/Ctrl + B` (or the navbar trigger) flips `expanded` ⇄ `hover`; all three are pickable from the rail's bottom **Sidebar** item (`sidebar-settings.tsx`).
- The account menu lives only in the navbar (`header-user.tsx`) — the rail carries nav plus its own display settings.
- Rail items have no focus ring; a focused item takes the accent surface instead.
- Below `lg` the rail is replaced by a Sheet drawer, opened by the navbar trigger — or, when embedded, by a floating trigger in `dashboard-shell.tsx` (the navbar is gone).
- An open dropdown/popover inside the rail locks the peek open via `setPeekLocked` — pass it to `onOpenChange` for anything anchored in the rail.
- Passing `mode` makes the provider **controlled**: the stored preference is ignored and no longer written, so a forced mode can't clobber what the user picked standalone.
- The mode picker marks its selection with a trailing tick, not `DropdownMenuRadioItem` — that reserves a left gutter for a filled dot, which reads as a stray bullet beside each mode's own icon.
- The rail takes the app's own `--sidebar` tokens — near-white in light mode, dark in dark mode. It is not pinned to one surface.

`sidebar-primitives.tsx` is a **fork** of the shadcn sidebar (modes instead of a boolean `open`, hover-peek, header offset) — edit it directly; do not re-add it via the shadcn CLI. Leaf primitives come from `@tenminuteschool/design-system`.

### Nav, titles, full-bleed pages

- `lib/nav.ts` — `NAV` (categories → items → optional `items` children) is the single source of truth; `getNavTitle(pathname)` feeds the header title. Its **Examples** section (`Menu 1/2/3` → `app/(dashboard)/menu-*/`, `features/placeholder/`) is dummy content — delete it with the first real feature.
- `useFullBleedPage()` (`layout/full-bleed-context.tsx`) drops the card's padding and inner scroll so a page can own them (tables, iframes).
- `useIsEmbedded()` (`?source=hq` or an iframe) drives the embedded layout — see below.

### Embedded in 10MS HQ

`useIsEmbedded()` is true when the URL carries `?source=hq` or the app is in an
iframe. HQ already draws a navbar and a primary rail, so the shell steps down to
avoid competing with it:

| | Standalone | Embedded |
| --- | --- | --- |
| `Header` | rendered | **not rendered** — HQ owns the navbar |
| `--app-header-h` | `3.5rem` | `0px` — rail runs flush to the top |
| Rail `variant` | `floating` (rounded card, shadow) | `sidebar` — flat, bordered, secondary |
| Rail heading | — | `APP_NAME` (the navbar that showed it is gone) |
| Rail mode | user's stored preference | pinned `expanded`, picker hidden |
| Mobile drawer trigger | in the navbar | floating, `lg:hidden` |
| Content inset | from the navbar above it | `pt-2` on `<main>` |

The iframe check has no server-side equivalent, so `useIsEmbedded()` reads
`false` through hydration and syncs after mount — via `useSyncExternalStore`, not
a bare `window` read during render, which would mismatch.

## Adding a new feature

1. Create `src/features/<name>/` with:
   - `types.ts` — TypeScript types
   - `schema.ts` — Zod validation schemas
   - `api.ts` — SWR hooks + mutations
   - `components/` — Feature UI
   - `<name>.tsx` — Main page component
2. Add a route: `src/app/(dashboard)/<name>/page.tsx` → `import { NamePage } from '@/features/<name>/<name>'`
3. Add nav item to `NAV` in `src/lib/nav.ts`

## UI components

Import from `@tenminuteschool/design-system` (Button, Input, Dialog, DataTable, …). The only hand-maintained UI is the layout shell in `src/components/layout/` — notably the sidebar fork described above.

## Code conventions

- Server components by default — `'use client'` only when you need hooks/events
- No barrel `index.ts` re-exports
- Tailwind utilities only — no CSS modules
- `cn()` for conditional class merging
- Zod schemas in `features/<name>/schema.ts`
- All API routes in `lib/api.ts` — never hardcode URLs in components
