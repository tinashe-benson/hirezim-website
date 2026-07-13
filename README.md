# Argo Agent — Hire Zim AI

A recreation of **hirezim.ai/argo-agent**: Argo is a **governed AI agent for
founders** — "leverage without losing control" — built around your business
context, tools, workflows, voice, approvals, and operating standards. Runs on
**FounderOS™** and the **G.A.M.E.™** governance framework.

Static site, no build, no deps. Vercel serves it at the repo root (`vercel.json`).

## The build

A hybrid of the real page's content/brand and an interactive hero:

- **Dark cinematic scroll hero** — a 500vh pinned Spartan keyframe sequence
  (unarmored → suits up → ready → glowing-eyed close-up) carrying the narrative
  *"Everyone will have an AI agent → You are not everyone → your AI can't be
  either → Leverage without losing control."*
- **Light product page** in the real brand (purple→magenta gradient, bold black
  display type, soft cards): the **Argo governance diagram** (tools → Argo →
  governed outputs, ringed by Guardrails/Permissions/Approvals/Risk Management),
  **You Are Not Everyone**, **Tier 1 use cases**, **This Is Just Tier 1**,
  **FounderOS™**, **G.A.M.E.™** framework, **FAQ**, related guides, final CTA,
  and the full footer.

All copy is transcribed from the live page. Fonts: Plus Jakarta Sans + Inter.

## Structure

```
index.html   # full Argo page (dark hero → light body), SEO/OG/JSON-LD, a11y
styles.css   # light brand system + dark hero; responsive + reduced-motion
app.js       # scroll hero engine, nav, reveals (incl. SVG diagram draw), FAQ, sticky CTA
favicon.svg  # double-chevron mark
og-image.jpg # 1200×630 social card
keyframes/   # frame-1..4 .jpg + .webp (de-watermarked); originals/ = raw sources
tools/       # remove-watermark.py, gen-placeholders.mjs
```

## Fill-in before launch

- **Real links** for the CTAs ("Schedule / Book a Strategy Call", "Download the
  Argo Playbook", "Explore the Platform", "Read the book", the guides, and
  footer links) — currently point to `#contact` / `mailto:`. Wire to your
  scheduler + real URLs.
- **Tool logos** (OpenClaw / HERMES-AGENT / NemoClaw) render as text chips in the
  diagram — swap for real SVG logos if desired.

## Run locally

```bash
python3 -m http.server 8080   # → http://localhost:8080
```
