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
│   ├── layout/                         # DashboardShell, Sidebar, Header
│   │   └── sidebar/                    # WorkspaceHeader, UserFooter
│   ├── ui/                             # shadcn — add via CLI, do not hand-edit
│   ├── providers.tsx
│   └── logo.tsx
│
├── hooks/
│   └── use-auth.ts                     # Thin wrapper over useTenMSAuth()
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
- **components/** — Generic, domain-agnostic UI. `layout/` for shell; `ui/` for shadcn primitives.
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

## Adding a new feature

1. Create `src/features/<name>/` with:
   - `types.ts` — TypeScript types
   - `schema.ts` — Zod validation schemas
   - `api.ts` — SWR hooks + mutations
   - `components/` — Feature UI
   - `<name>.tsx` — Main page component
2. Add a route: `src/app/(dashboard)/<name>/page.tsx` → `import { NamePage } from '@/features/<name>/<name>'`
3. Add nav item in `src/lib/nav.ts`

## shadcn components

Add via CLI (do not hand-edit `src/components/ui/`):

```bash
pnpm dlx shadcn@latest add <component>
```

## Code conventions

- Server components by default — `'use client'` only when you need hooks/events
- No barrel `index.ts` re-exports
- Tailwind utilities only — no CSS modules
- `cn()` for conditional class merging
- Zod schemas in `features/<name>/schema.ts`
- All API routes in `lib/api.ts` — never hardcode URLs in components
