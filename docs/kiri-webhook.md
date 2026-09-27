# KIRI Engine webhook (Supabase Edge Function)

Recording a capture video sends it to [KIRI Engine](https://www.kiriengine.app)
for 3D Gaussian Splatting. KIRI processes asynchronously and notifies a
webhook when the job changes state. Because a mobile app cannot receive
webhooks, the notification lands in a Supabase Edge Function, which writes
to the `kiri_tasks` table; the app subscribes to that row over Supabase
Realtime (and polls as a fallback).

```
phone ──upload video──▶ KIRI Engine ──webhook──▶ Edge Function kiri-webhook
  ▲                                                   │ service role
  │            Realtime (postgres_changes)            ▼
  └────────────────────────────────────────── kiri_tasks (Postgres)
```

## 1. Database

Run `supabase/migrations/004_add_kiri_tasks_table.sql` (see
[supabase-setup.md](supabase-setup.md)). It creates:

| Column | Purpose |
| --- | --- |
| `serialize` | KIRI's task id, used to match webhook payloads |
| `status` | `pending` / `processing` / `completed` / `failed` |
| `progress` | 0-100 when KIRI reports it |
| `download_url` | URL of the finished model (`.glb` when `isMesh` is on) |
| `error_message` | Failure reason |

Enable Realtime for the table under *Database > Replication*.

## 2. Deploy the Edge Function

The function lives in `supabase/functions/kiri-webhook/index.ts`.

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy kiri-webhook
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically
into Edge Functions; the service role is needed to bypass RLS. Never ship
the service role key inside the app.

The deployed URL is `https://<project-ref>.supabase.co/functions/v1/kiri-webhook`.

## 3. Register the webhook with KIRI

In the KIRI Engine dashboard open **Webhooks > Add webhook**, paste the
function URL and subscribe to task events (completed, failed, progress if
available). KIRI does not accept a webhook URL per upload, so this is a
one-time setup.

## 4. App configuration

```env
EXPO_PUBLIC_KIRI_API_KEY=<from KIRI dashboard > API Keys>
```

`src/services/kiri.ts` uploads the video to `POST /open/3dgs/video` with
`isMesh=1`, `fileFormat=glb` and `isMask=1` (auto object masking), stores a
`kiri_tasks` row for the signed-in user and returns the `serialize` id.
`app/kiri-processing.tsx` then subscribes to the row and polls
`checkTaskStatus` every five seconds as a fallback.

## Payload handling

The function is tolerant about field names because the exact schema
depends on the KIRI plan and event type:

* task id: `serialize` | `task_id` | `id`
* status: `status` | `state` (mapped to the four states above)
* progress: `progress` | `progress_percent` | `progressPercent` | `percent`
* download: `download_url` | `url` | `model_url`
* error: `error` | `error_message`

## Securing the endpoint

The function ships with signature verification commented out. If KIRI
provides a signing secret, set it with

```bash
npx supabase secrets set KIRI_WEBHOOK_SECRET=<secret>
```

and uncomment the check at the top of `index.ts`.

## Local testing

```bash
npx supabase start
npx supabase functions serve kiri-webhook
curl -X POST http://localhost:54321/functions/v1/kiri-webhook \
  -H "Content-Type: application/json" \
  -d '{"serialize":"test-123","status":"completed","download_url":"https://example.com/model.glb"}'
```

Logs: `npx supabase functions logs kiri-webhook` or the dashboard under
*Edge Functions > Logs*.
