# Restub Frontend

Restub is the ticket-resale product at `resale.co`: Next.js 15 App Router, React 19, Tailwind CSS v4, RTK Query, pnpm.

## Development

- `pnpm dev` runs `next dev` on `$PORT` (default `3001`). Do not start Vite or assume a server is running.
- API base URL: `NEXT_PUBLIC_API_BASE_URL`; defaults to `http://localhost:3000/api` in development and `https://restub.onrender.com/api` in production.
- Production Next config uses `distDir: "dist"`, `basePath: "/Restub-frontend"`, trailing slashes, and unoptimized images. Preserve `basePath` when adding links or public assets; use `next/link` and avoid host-root URLs.

## Source of truth

- Implement app changes in `app/`. Follow imports when more context is needed; the app uses relative imports.
- Ignore `src/`, `vite.config.ts`, and old Vite entrypoints unless the task is to delete them.
- `@/*` is configured in `tsconfig.json`, but existing app code uses relative imports.

## Project map

| Area | Path | Use |
|---|---|---|
| Routes | `app/**/page.tsx` | Screens |
| Layout | `app/layout.tsx` | Root layout and `StoreProvider` |
| Chrome | `app/components/` | `Header`, `AccountSidebar`, `AccountPageShell`, `ProtectedRoute`, `ApiErrorNotice` |
| Auth UI | `app/hooks/useAuth.ts` | Session state for chrome and `ProtectedRoute` |
| API | `app/lib/` | Shared HTTP, domain clients/types/models, RTK endpoints and store |
| Static catalog | `app/lib/data.ts` | `EVENTS` used by `/events/[id]` |
| Visual guidance | `guidelines/Guidelines.md` | Palette, typography, and chrome |

## Routing and UI

- Use `Header` for marketplace pages. Use `AccountSidebar` for account/admin pages; keep `AccountPageShell` where already used.
- Pages using hooks or RTK must be Client Components (`"use client"`). Server Components use domain `client.ts` only; never import RTK hooks there.
- In Next.js 15 pages, `params` and `searchParams` are Promises; await them before reading route values.
- `/listings/[id]` loads a live listing through its domain client. `/events/[id]` uses static `EVENTS` and `generateStaticParams`. Do not mix these sources unless requested.
- `ProtectedRoute` is a client-side sign-in gate. There is no auth middleware; do not add server session checks without cookie-based sessions.
- Admin pages live in `app/admin/`. Read `admin`, `superadmin`, and `developer` from `/auth/me`; match admin route gates to backend role/permission guards, and never treat client checks as API security.
- Show API errors with `ApiErrorNotice` and `getApiErrorMessage` from `app/lib/rtk-api.ts`.

## Styling

- Follow `app/globals.css` and `guidelines/Guidelines.md`; do not add a Tailwind config for theme changes.
- Match the component and styling patterns in the file being changed. Global/theme changes belong in `app/globals.css`.
- Use `font-mono-data` for data such as prices, quantities, seats, and dates.

## API layer

- Use the shared HTTP stack: `app/lib/api/http.ts` (`request`) and `app/lib/auth/request.ts` (`authenticatedRequest`); do not add another fetch wrapper or `createApi`.
- `http.ts` handles transport only: no tokens, refresh, or redirects. Browser requests use the same-origin Next API proxy and HttpOnly cookies; authenticated requests handle refresh. `useAuth` derives session state from `/auth/me`.
- Keep domain code together: `types.ts` for wire contracts, `models.ts` for UI models, `client.ts` for requests and boundary parsing, `rtk.ts` for RTK hooks and tags.
- Pages use RTK hooks; Server Components use domain `client.ts`. Inject endpoints into the shared `rtkApi`.
- Validate required identifiers, amounts, and statuses with `require*` / `expect*`. Use `as*` only for optional display fields.
- Give mutations an `idempotency-key`; guest checkout may send `x-device-id`.
- If a backend endpoint is unavailable, throw explicitly in the client (for example disputes or refunds).
- Auth tokens are stored in HttpOnly cookies by the backend; browser API calls use credentialed same-origin proxy requests. Server Component requests remain unauthenticated.
- Add endpoints in order: wire type → UI model (if needed) → client → RTK endpoint → page. For Server Components, stop at the client.

## State and product data

- Redux is for RTK Query only (`app/lib/store.ts`, `StoreProvider`). Do not add unrelated slices without a concrete global-state need; auth session state is derived from `/auth/me` through `useAuth`.
- Listings, checkout, orders, KYC, payouts, and account data come from the API.
- The homepage adapts API listings to the static `Event` shape in `data.ts`; event detail pages may still use mock `EVENTS`. Do not silently redirect event routes to listing data.

## Tooling

- Tool versions are pinned in `.mise.toml`. Check `package.json` for available scripts; do not assume a test runner.
- Format with `pnpm format`. Run `pnpm build` before calling implementation work complete; this checks the production Next build and types.

## Don’t touch / done

- Do not commit `.env*` files or edit generated `dist/` output.
- Before finishing, run the relevant validation command(s), at minimum `pnpm build` for code changes, and report any failures or unavailable checks.
