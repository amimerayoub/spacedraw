<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ebfc1709-d9c3-4d21-98a1-319f8df80ef4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

# SpaceDraw — SEO, i18n and Sound architecture

SpaceDraw is a browser draw-and-guess **front-end prototype** with simulated
players. All marketing copy is written to be honest about that (no "real online
multiplayer" claims) until the `realMultiplayer` flag is switched on.

## Routes

| Path | What it is |
| --- | --- |
| `/` | Root alias — serves the en-US home page, canonical points to `/en-us/`. |
| `/en-us/ /en-gb/ /fr/ /es/ /de/ /ar/ /pt-br/ /ru/` | 8 static, fully crawlable language home pages. |
| `/play/` | The game app (single application). Linked from every home page as `/play/?lang=<code>`. |
| `/admin/#/admin/languages` | Admin: Languages & SEO editor. |
| `/admin/#/admin/seo-audit` | Admin: audits the deployed static pages. |
| `/admin/#/admin/export` | Admin: Export & Site Settings (build + download the static bundle). |
| `/admin/#/admin/sounds` | Admin: Sound Manager. |

**There is deliberately no language switcher on the public site.** Each language
is reachable only by its own URL, and visitors/bots are never auto-redirected by
IP or browser language. Reciprocal `hreflang` (plus `en`/`pt` catch-alls and
`x-default`) tells search engines which version to serve.

## Static-first SEO build

The pages that matter for SEO are generated as **real static HTML** into
`public/` (no client-side JS on the marketing pages) and served through
`next.config.ts` rewrites with `trailingSlash: true`.

- Data: `public/data/seo/{site,pages,locales}.json` and `public/data/i18n/home.<locale>.json`.
- Shared pure renderers: `public/js/seo/{render-page,sitemap,validate}.js`
  (ESM, `public/js/seo/package.json` sets `"type":"module"`). The **same modules**
  are used by the Node build and the Admin export, so exported files are
  byte-identical to the committed ones.
- Build command: `node scripts/build-seo.mjs` — regenerates all pages, sitemaps,
  `sitemap-index.xml`, `robots.txt` and the OG placeholder image, and runs a
  validation gate (title ≤ 60, meta ≤ 155, one H1, no forbidden competitor or
  `future` keywords, FAQ matches JSON-LD). The gate exits non-zero on hard errors.

### Publishing model

Editing in the Admin console only changes **your browser** (overrides stored in
`localStorage`). Nothing is written to disk from the browser. To ship changes:

1. Set a **real production `siteUrl`** in `public/data/seo/site.json` (or in
   Admin → Export & Site Settings). While it is the `https://example.com`
   placeholder, the export/build download is **blocked** and canonicals are wrong.
2. Admin → Export & Deploy → **Build files** → download the bundle (root
   `index.html`, 8 locale `index.html`, `sitemap-index.xml`, 8 locale sitemaps,
   `robots.txt`), or run `node scripts/build-seo.mjs`.
3. Deploy the files to your web root, preserving the folder paths.

## App localization limitation

The marketing pages are fully localized, but the **game app at `/play/` is a
single application** and is not yet fully translated. The `?lang=<code>` query
parameter is passed through for future use; in-app strings may still appear in
English regardless of the marketing language a visitor arrived from.

## Sound system (MP3 only)

`lib/sound.ts` is a Web Audio engine. It is **off by default**, creates the
`AudioContext` only after a user gesture, lazily `fetch`+`decodeAudioData`s each
`/assets/sounds/<name>.mp3`, stays silent if a file is missing, and never plays
while `document.hidden`. User preference lives in `doodleduel:v1:sound`;
admin overrides live in `spacedraw:v1:sound-config` (written via
`sound.setConfig`). The Admin → Sound Manager lists all 18 cues with per-sound
enable/volume, file status (found/missing, size, duration), master volume and a
default-enabled setting.
