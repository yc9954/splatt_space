# Supabase setup

Splatt Space uses Supabase for authentication, the social graph and
realtime capture-status updates. This guide takes about ten minutes.
If you only want to look around, skip it: the app runs in
[demo mode](environment.md#demo-mode) without any credentials.

## 1. Create a project

1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Pick a name, database password and the region closest to your users.
3. Wait for provisioning (about two minutes).

## 2. Apply the schema

Open **SQL Editor > New query** and run the migrations in order. Each file
is idempotent (`IF NOT EXISTS`) so re-running is safe.

| File | What it creates |
| --- | --- |
| `supabase/migrations/001_initial_schema.sql` | `profiles`, `posts`, `likes`, `comments`; indexes; RLS policies; `handle_new_user` trigger that creates a profile on sign-up; triggers that keep `posts_count`, `likes_count`, `comments_count` and `updated_at` in sync |
| `supabase/migrations/002_seed_data.sql` | Three demo users and fourteen sample posts so the feed is not empty on first run |
| `supabase/migrations/003_add_follows_table.sql` | `follows` table, follower/following counters and RLS |
| `supabase/migrations/004_add_kiri_tasks_table.sql` | `kiri_tasks` table used by the video-capture pipeline, plus the policy that lets the webhook update rows |

Alternatively, with the Supabase CLI installed as a dev dependency:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### Schema summary

```
auth.users ─1:1─ profiles ─1:N─ posts ─1:N─ likes
                    │              └────1:N─ comments
                    ├─N:M (follows: follower_id -> following_id)
                    └─1:N─ kiri_tasks (video capture jobs)
```

`posts` stores `image_url` (thumbnail), `image_3d_url` (Luma capture or
KIRI download URL), `is_3d`, `caption`, `location`, `hashtags[]`, the
denormalised counters and `edit_metadata` (JSONB with the text overlay and
background-removal settings applied in the editor).

## 3. Configure the app

Copy **Settings > API > Project URL** and the **anon public** key into
`.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Restart the dev server with `npx expo start --clear`. The demo banner
disappears once both values are present.

## 4. Authentication settings

* **Email confirmations**: for local development turn off
  *Authentication > Providers > Email > Confirm email* so sign-up returns a
  session immediately. Keep it on in production.
* **Google sign-in** (optional): enable the Google provider, create an OAuth
  client in Google Cloud Console and add
  `https://<project-ref>.supabase.co/auth/v1/callback` as an authorised
  redirect URI. The app redirects back through the `splatt-space://`
  scheme (`splatt-space://auth/callback`); add it under
  *Authentication > URL configuration > Redirect URLs*.

## 5. Row Level Security

Policies created by the migrations:

| Table | Read | Write |
| --- | --- | --- |
| `profiles` | everyone | owner only |
| `posts` | everyone | owner can insert/update/delete |
| `likes` | everyone | owner can insert/delete |
| `comments` | everyone | owner can insert/update/delete |
| `follows` | everyone | follower can insert/delete |
| `kiri_tasks` | owner | owner; the Edge Function uses the service role |

## 6. Storage (optional)

Uploads currently reference the picked file URI or a Luma/KIRI URL. To host
your own thumbnails create a public bucket named `post-images` and plug the
upload into `api.uploadImage` in `src/services/api.ts`.

## Troubleshooting

* **"Supabase rejected the API key"**: the anon key or URL is wrong or
  the dev server was not restarted after editing `.env`.
* **Empty feed**: run `002_seed_data.sql`, or create a post from the app.
* **"Profile not found"**: `001_initial_schema.sql` was not applied, so the
  `handle_new_user` trigger did not create a profile row.
* **Realtime never fires for captures**: enable Realtime for `kiri_tasks`
  under *Database > Replication*.
