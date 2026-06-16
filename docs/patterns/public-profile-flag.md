# Public profile flag

How a Company opts into being readable by an unauthenticated visitor at `app.aeqi.ai/<entity_id>`. One column on `runtime_placements`, one read-only HTTP route, one reserved-slug deny list.

## The shape

```sql
ALTER TABLE runtime_placements ADD COLUMN tagline TEXT;
ALTER TABLE runtime_placements ADD COLUMN public  INTEGER NOT NULL DEFAULT 0;
```

`public=0` is the default. Toggling to `1` opens a public face; toggling back to `0` closes it. The column lives on the placement row alongside the runtime address and target host — the same row the proxy already resolves on every authed request, so the public surface costs no extra lookup.

## The slug

There is no separate slug column. The URL segment in `app.aeqi.ai/<slug>` IS the entity_id (a UUID). The naming reflects the user-facing URL shape; the in-DB lookup is by entity_id directly. A future surface can add a vanity-slug column without changing the public route's contract.

## The reserved-slug deny list

The frontend router needs to know which top-level segments are app shell, auth, or assets — never public profiles. A naive `/:slug` route would shadow `/account`, `/start`, `/admin`, every API namespace, and every static prefix.

`apps/ui/src/App.tsx` defines `RESERVED_SLUGS` as the source of truth: `api`, `auth`, `account`, `c`, `company`, `launch`, `templates`, `markets`, `economy`, `referrals`, `acting-as`, `inbox`, `start`, `network`, `identity`, `onboarding`, `signup`, `login`, `verify`, `waitlist`, `reset-password`, `invitations`, `admin`, `agents`, `change-password`, `sessions`, `assets`, `static`, `signin`. Any new top-level shell path must land in this set in the same diff.

```tsx
function PublicProfileRoute({ protectedFallback }) {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <NotFoundPage />;
  if (RESERVED_SLUGS.has(slug.toLowerCase())) return <>{protectedFallback}</>;
  return <PublicProfilePage />;
}
```

Reserved slugs delegate to the protected tree (which bounces unauth visitors to login). Non-reserved slugs render the public profile.

## The route

`GET /api/public/entities/<slug>` is the unauth endpoint. Three behaviors:

| Placement state | Response |
|---|---|
| Missing | `404 {"error":"not found"}` |
| Exists but `public=0` | `404 {"error":"not found"}` |
| Exists and `public=1` | `200 {entity_id, display_name, tagline, public, roles[], ideas[]}` |

The 404 collapse for non-public placements is deliberate — private workspaces shouldn't be discoverable by oracle-style probing of UUIDs. Existence and publicness are inseparable to an unauthenticated caller.

The runtime is fetched in parallel for roles and ideas via `internal_runtime_client()` with a synthesized system JWT scoped to the entity. If the runtime is asleep, the hero (name + tagline) still returns; roles and ideas degrade to empty arrays. A public profile shouldn't 503 because a runtime hasn't woken up.

## Public ideas — tag, not table

Ideas don't get a `public` column on the runtime side. An idea is public when its `tags` array contains `"public"` or any `"public:*"` tag (e.g. `public:roadmap`). The platform's sanitiser filters server-side after the IPC fetch.

This keeps the runtime contract unchanged — ideas remain a single table — and aligns with the universal-tag model: visibility is a tag, like `kind`, `scope`, or any other facet. Adding a separate `public_ideas` table would split the substrate; tagging keeps it whole.

## Related

- [Public companies](/docs/patterns/public-companies) — the discoverable / hireable / investable opt-ins this column gates.
- [Memory (Ideas)](/docs/concepts/memory) — tag-driven scope.
