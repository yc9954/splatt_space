# Environment variables

Splatt Space reads all configuration from `EXPO_PUBLIC_*` variables. Copy
`.env.example` to `.env`, fill in what you have and restart the dev server
(`npx expo start --clear`). Every variable is optional: with none of them
set the app runs in **demo mode** against bundled sample scenes.

| Variable | Required for | Where to get it |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Real auth, feed, likes, comments, follows | Supabase dashboard > Settings > API > Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same | Supabase dashboard > Settings > API > `anon public` key |
| `EXPO_PUBLIC_KIRI_API_KEY` | Recording a video and turning it into a Gaussian splat | [KIRI Engine](https://www.kiriengine.app) dashboard > API Keys |
| `EXPO_PUBLIC_OPENAI_API_KEY` | Travel AI chat (without it the chat returns canned demo replies) | [OpenAI platform](https://platform.openai.com/api-keys) |
| `EXPO_PUBLIC_LUMA_API_KEY` | Optional image-to-3D conversion through the Luma API | [Luma AI](https://lumalabs.ai) |
| `EXPO_PUBLIC_DEMO_MODE` | `true` forces the in-memory backend even when Supabase is configured | - |

How the values are resolved (`src/lib/config.ts`):

1. `process.env.EXPO_PUBLIC_*` – inlined by Expo at bundle time.
2. `Constants.expoConfig.extra.*` – `app.config.js` mirrors the same
   variables into `extra`, which is handy for EAS builds and for reading
   config at runtime.

`isSupabaseConfigured` is true only when both Supabase values are present;
`isDemoMode` is `EXPO_PUBLIC_DEMO_MODE === 'true' || !isSupabaseConfigured`.

## Demo mode

Demo mode swaps `SupabaseAPI` for `DemoAPI` (`src/services/demo.ts`), an
in-memory backend seeded with real public Luma captures. Any email and
password signs you in, likes/comments/follows work and reset on reload,
and a small banner in the feed and profile tells you that nothing is
persisted. It exists so the product can be explored, demoed and
screenshotted without provisioning a backend.

## Secrets

* `.env` is git-ignored. Never commit it.
* Only the Supabase `anon` key belongs in the app; the `service_role` key
  is used exclusively by the Edge Function (see [kiri-webhook.md](kiri-webhook.md)).
* `supabase/.temp/` (project ref, pooler URL written by the Supabase CLI)
  is git-ignored as well.

## Checklist

- [ ] `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` set (or demo mode intended)
- [ ] `EXPO_PUBLIC_KIRI_API_KEY` set if you want video capture
- [ ] `EXPO_PUBLIC_OPENAI_API_KEY` set if you want live AI answers
- [ ] Dev server restarted with `--clear` after editing `.env`
