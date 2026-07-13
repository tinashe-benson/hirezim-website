# HireZim AI — interactive landing page

A scroll-driven, keyframe-sequence recreation of **hirezim.ai**, using the
interaction pattern of the Avondale demo: a pinned hero where a Spartan
warrior's story plays out as you scroll — from **unarmored → suiting up →
armored → the menacing purple-eyed close-up** — over the brand narrative
"Your team, unarmored → Your agency, augmented."

Pure static site. No build step, no dependencies. **Vercel deploys it at the
repo root with zero config** (`vercel.json` pins it as a static project); also
works on Netlify / GitHub Pages as-is.

```
.
├── index.html            # markup + copy
├── styles.css            # theme (bronze/sand + violet accent), layout, responsive
├── app.js                # scroll engine: crossfade keyframes + caption swaps
├── vercel.json           # static-site config + asset cache headers
├── keyframes/
│   ├── placeholder-1..4.svg   # temporary frames so it runs now
│   └── originals/             # ← drop the 4 RAW images here (see below)
└── tools/
    ├── gen-placeholders.mjs   # (re)builds the placeholder SVGs
    └── remove-watermark.py    # strips the HIGGSFIELD watermark, emits frame-N.jpg
```

## Deploy to Vercel

Import this repo in Vercel and deploy — no framework, no build command, output
directory is the repo root. Every push to `main` publishes automatically.

## Run locally

```bash
python3 -m http.server 8080     # or: npx serve .
# open http://localhost:8080
```

## Drop in the real keyframes

The 4 attached warrior images have a **HIGGSFIELD AI** watermark that must be
removed, and must be ordered **no-helmet first, purple-eyes last**.

1. Put the raw images in `keyframes/originals/`, named so they sort into story
   order:
   ```
   1-no-helmet.jpg      # kneeling, helmet on the ground
   2-donning.jpg        # raising the helmet
   3-helmet-on.jpg      # full armor, ready
   4-purple-eyes.jpg    # extreme close-up, glowing eyes
   ```
2. De-watermark them:
   ```bash
   pip install opencv-python-headless numpy
   python tools/remove-watermark.py           # → keyframes/frame-1..4.jpg
   # tune the box if a ghost remains:  --x0 0.72 --y0 0.88 --radius 12  (--debug to preview)
   ```
3. Flip the switch in `app.js`:
   ```js
   const USE_REAL = true;
   ```

That's it — the crossfade hero now runs on the real frames.

## Notes

- Fonts (Oswald + Inter) load from Google Fonts with system fallbacks.
- Fully responsive; honors `prefers-reduced-motion` (shows the final frame + CTA
  without the scroll animation).
- Content is reconstructed from HireZim's positioning (AI automation for US
  marketing agencies: CloseBot SMS, GHL Voice AI, n8n, HubSpot, A2P). Swap any
  copy in `index.html` to match the live site exactly.
