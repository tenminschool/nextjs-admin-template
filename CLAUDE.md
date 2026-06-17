# Next.js Admin Template

Production-ready admin starter. Next.js 16, App Router, TypeScript, Tailwind v4, shadcn.

## Stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                 |
| UI        | React 19, shadcn (radix-nova), Tailwind v4         |
| Font      | Geist Sans / Mono                                  |
| Auth      | Client-side only — localStorage, no cookies        |
| Forms     | Zod 4                                              |
| Data      | SWR + `apiRequest()` for authenticated calls       |
| Toasts    | sonner                                             |

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

NEXT_PUBLIC_APP_NAME=Admin
NEXT_PUBLIC_GOOGLE_CLIENT_ID=         # required for Google sign-in button
NEXT_PUBLIC_TENMS_SOURCE_PLATFORM=admin

NEXT_PUBLIC_SITE_URL_prod=https://admin.10minuteschool.com
NEXT_PUBLIC_SITE_URL_stage=https://admin.10minuteschool.net
NEXT_PUBLIC_SITE_URL_local=https://local.10minuteschool.net
```

Backend URL constructed in `src/lib/api.ts`:

```
https://{NEXT_PUBLIC_API_PREFIX}api.10minuteschool{NEXT_PUBLIC_DOMAIN}/auth/v1
```

## Folder structure

```
src/
├── app/
│   ├── (auth)/                         # Unauthenticated routes (login)
│   │   ├── components/brand-panel.tsx  # Left-panel split-screen branding
│   │   ├── layout.tsx                  # Split-screen auth shell
│   │   └── login/
│   │       ├── components/             # login-form.tsx, google-sign-in.tsx
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
│   └── use-auth.ts                     # Client session (localStorage user)
│
├── lib/
│   ├── api.ts                          # API_SERVICES, API_ROUTES, apiUrl()
│   ├── api/client.ts                   # apiRequest() — Bearer from localStorage
│   ├── auth/                           # api, storage, config, types
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
- **lib/** — Pure utilities and infrastructure (no React). `auth/` for auth plumbing; `api/` for HTTP client.
- **constants/** — Compile-time values read from `process.env`.

## Auth architecture

Client-side only — no Server Actions, no httpOnly cookies.

| Layer        | File                         | Behavior                                                              |
| ------------ | ---------------------------- | --------------------------------------------------------------------- |
| Route guard  | `(dashboard)/layout.tsx`     | `useEffect` checks localStorage token; redirects `/login` if missing |
| API calls    | `lib/api/client.ts`          | Bearer from localStorage; 401 → clears storage, redirects `/login`   |

### Token storage

- **localStorage only** — Bearer token + user profile, read by `useAuth()` via `useSyncExternalStore`

### Login flow

1. User submits form → `loginWithPassword()` called directly from client
2. API responds with tokens + user
3. Client: `setStoredUser()` + `setAccessToken()` → localStorage
4. `router.replace('/dashboard')`

### Logout flow

1. `useAuth().logout()` clears localStorage immediately
2. Calls `logoutRemote()` (best-effort, fire-and-forget)
3. `window.location.href = '/login'`

## API layer

```ts
// Add a new service in src/lib/api.ts:
export const API_SERVICES = {
  auth: `${API_BASE}/auth/v1`,
  users: `${API_BASE}/users/v1`,  // add more services
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
