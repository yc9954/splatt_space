# Capture and rendering pipeline

How a place becomes a shareable 3D post, and how it is drawn on screen.

## Ways to create a post

| Entry point | Source | Result |
| --- | --- | --- |
| **Record capture video** (Capture tab hero) | Phone camera, up to 3 minutes | KIRI Engine turns it into a Gaussian splat; `image_3d_url` is the download URL |
| **Pick a Luma scene** | Public Luma capture from `src/constants/sampleScenes.ts` | `image_3d_url` is the Luma capture URL |
| **Take a photo / Choose from gallery** | expo-image-picker | Regular 2D post (`is_3d = false`) |

## Video capture flow

```
Capture tab ──record──▶ kiriService.uploadVideo() ──▶ /kiri-processing
                              │ creates kiri_tasks row          │ Realtime + polling
                              ▼                                  ▼
                        KIRI Engine ── webhook ──▶ Edge Function ──▶ kiri_tasks.status = completed
                                                                     │
                                                                     ▼
                                                     /edit-asset (captureUrl = download_url)
                                                                     │ caption, location, tags,
                                                                     │ background removal, 3D text
                                                                     ▼
                                                                api.createPost() ──▶ feed
```

1. `app/(tabs)/upload.tsx` records with `expo-image-picker`
   (`videoMaxDuration: 180`) and validates the duration.
2. `src/services/kiri.ts` posts the file to KIRI's 3DGS endpoint and inserts
   a `kiri_tasks` row (Supabase mode only).
3. `app/kiri-processing.tsx` shows progress. It listens to
   `postgres_changes` on the row, re-reads the row every ten seconds and
   polls KIRI's status endpoints as a last resort.
4. On completion it replaces itself with `/edit-asset`, passing the model
   URL. Publishing is deliberately a manual step so the user can review the
   scene and write a caption; auto-posting would be a two-line change in
   `kiri-processing.tsx` if you prefer it.

The webhook and Edge Function are described in [kiri-webhook.md](kiri-webhook.md).

## Rendering Gaussian splats

Splats are drawn with [Luma's Web Library](https://github.com/lumalabs/luma-web-examples)
(`@lumaai/luma-web`) on top of Three.js 0.157. React Native has no WebGL
surface, so the renderer runs in a web page:

```
SplatViewer (React)  ──html──▶  WebFrame
                                  ├─ native: react-native-webview
                                  └─ web:    <iframe srcdoc>  (same origin)
                                          │
                                          ▼
                     buildSplatViewerHtml()  → Three.js + LumaSplatsThree
                                          │  postMessage: ready / splatLoaded / splatError
                                          ▼
                              injectJavaScript(): toggleBackground(), updateTextOverlay()
```

* `src/lib/splatViewerHtml.ts` builds one HTML document for every use
  (feed hero, asset viewer, editor, travel map modal). Options control
  auto-rotate, background colour, semantic background removal, the 3D text
  plane and the particle reveal effect.
* `src/components/WebFrame.tsx` / `WebFrame.web.tsx` hide the platform
  difference and provide `injectJavaScript` on both.
* `src/components/SplatViewer.tsx` adds loading and error overlays and
  parses the messages.
* The editor (`app/edit-asset.tsx`) keeps the scene live while the user
  toggles background removal (`LumaSplatsSemantics.FOREGROUND`) or places a
  text mesh; the chosen settings are saved in `posts.edit_metadata` and
  replayed by every viewer.

Luma scripts are loaded from unpkg through an import map, so the pages need
network access; nothing is bundled into the app binary.

## Travel map

`app/(tabs)/travel.tsx` renders `src/lib/travelMapHtml.ts` in a WebFrame:
MapLibre GL with OpenStreetMap raster tiles, one pin per sample scene, a
Nominatim-backed place search and a geolocation button. Tapping a pin's
"Open in 3D" posts a message back and the screen opens the capture in a
`SplatViewer` modal. The "Ask AI" button opens the OpenAI-powered travel
chat (`src/components/TravelAIChatModal.tsx`, `src/services/openai.ts`).
