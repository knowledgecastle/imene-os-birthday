# imene.os

My year (Sep 2025 to Sep 2026) as a tiny lofi operating system: a terminal in the middle, eight desktop icons, windows with stories, and a small game layer.

Plain HTML, CSS and vanilla JS. No build step, no backend.

## Files

```
index.html      page shell, meta and share tags
styles.css      theme tokens (light sunset room / dark rainy night), layout, windows
content.js      ALL copy, stats, clients, achievements, picture paths. Edit this one.
app.js          boot, terminal, windows, game layer, sound
icons.js        Lucide icons inlined (no CDN)
assets/         pictures (see assets/README.md)
```

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 4321
```

Add `?og=1` to the URL to skip the boot sequence (used for the share image).

## Deploy to Vercel

From this folder:

```bash
npx vercel --prod
```

Accept the defaults: framework "Other", no build command, output directory `.`. Or push the folder to a GitHub repo and import it at vercel.com/new with the same settings.
