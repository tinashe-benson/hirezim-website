# Argo — HireZim AI · product landing page

A conversion-focused product page for **Argo**, HireZim AI's flagship AI agent
(voice + SMS + web chat: answers, qualifies, books, follows up — 24/7, inside
the client's existing GHL / HubSpot / n8n / CloseBot stack, A2P/10DLC compliant).

Pure static site — no build, no dependencies. Vercel serves it at the repo root
(zero config via `vercel.json`).

## Signature interactions

- **Scroll cinematic** — a 500vh pinned hero where a Spartan warrior crossfades
  across 4 keyframes (unarmored → suit up → ready → glowing-eyed close-up) while
  the headline story tracks scroll. Violet eye-glow lands on "Unstoppable".
- **Argo in action** — a self-playing chat demo: an inbound SMS lead is
  qualified and booked, with typing indicator, live latency timer, and an
  "Appointment booked ✓" chip. Loops on scroll-into-view; static transcript
  without JS / under reduced-motion.
- Pointer spotlight on cards, sticky mobile CTA, FAQ accordion, accessible
  mobile menu, scroll reveals.

## Structure

```
index.html      # full Argo page (nav → hero → value → speed-to-lead → chat demo →
                #   capabilities → how-it-works → integrations → why → compliance →
                #   proof → FAQ → book), SEO/OG/JSON-LD, a11y baked in
styles.css      # magenta (#FF2D8E) + near-black brand; violet reserved for the
                #   eye-glow payoff. Oswald / Inter / IBM Plex Mono. Responsive + reduced-motion.
app.js          # scroll engine, chat demo, spotlight, sticky CTA, accordion, menu
favicon.svg     # double-chevron mark
og-image.jpg    # 1200×630 social card (built from frame-4)
keyframes/      # frame-1..4 .jpg + .webp (de-watermarked); originals/ = raw sources
tools/          # remove-watermark.py, gen-placeholders.mjs
```

## Fill-in before launch (kept honest — nothing fabricated)

- **Booking**: the "Book a live demo" CTAs point to `#book`; the form currently
  falls back to a `mailto:`. Wire it to your real scheduler (Calendly / GHL) and
  automation endpoint.
- **Proof / compliance placeholders**: the dashed "Add …" cards mark where real
  client logos, a headline metric, a testimonial, and your data-handling note go.
- **Copy**: content is a strong inference of the Argo product (the live
  `/argo-agent` page couldn't be fetched from the build environment). Paste the
  real copy and it swaps straight in.

## Run locally

```bash
python3 -m http.server 8080   # → http://localhost:8080
```
