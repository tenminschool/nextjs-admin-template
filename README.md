# Next.js Admin Template

Production-ready admin starter. Clone, configure env, ship.

## Stack

- **Next.js 16** — App Router, Turbopack, React 19
- **Tailwind v4** + **`@tenminuteschool/design-system`** — UI components
- **SWR** — client-side data fetching
- **Zod 4** — form validation
- **sonner** — toasts
- **Auth** — "Login with 10MS Admin" via `@tenminuteschool/auth-admin-react`, localStorage session, no cookies or Server Actions

## Quick start

```bash
git clone <repo>
cd nextjs-admin-template
cp .env.example .env.local
# Edit .env.local
pnpm install
pnpm dev
```

## Configuration

| Variable                            | Description                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_API_PREFIX`            | URL prefix: `""` (prod) / `"stage-"` / `"local-"`                |
| `NEXT_PUBLIC_DOMAIN`                | TLD: `".com"` (prod) / `".net"` (stage/local)                    |
| `NEXT_PUBLIC_ENVIRONMENT`           | `prod` \| `stage` \| `local`                                     |
| `NEXT_PUBLIC_APP_NAME`              | Displayed in the navbar and page titles (defaults to `10MS APP`) |
| `NEXT_PUBLIC_TENMS_CLIENT_ID`       | Client ID registered with "Login with 10MS Admin"                |
| `NEXT_PUBLIC_TENMS_SOURCE_PLATFORM` | Sent as `X-TENMS-SOURCE-PLATFORM` header on every request        |

## Layout

Top navbar + a floating left rail (three modes: pinned open, icon-only, or peek-on-hover — persisted per browser; `⌘/Ctrl + B` toggles). Below `lg` the rail becomes a drawer. See `CLAUDE.md` → "Layout shell".

## Embedding

Both account menus (navbar and sidebar footer) auto-hide when the app is loaded inside an iframe, or when the URL has `?source=hq` — the host shell supplies its own.

## Adding features

See `CLAUDE.md` for the full architecture guide and step-by-step instructions.
