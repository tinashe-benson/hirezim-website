/**
 * Generates 4 cinematic placeholder keyframe SVGs (16:9, 1408x768) so the
 * scroll experience looks intentional before the real photos are dropped in.
 *
 * STAND-INS ONLY — atmospheric desert-dusk mood that shifts from warm sand to
 * violet, drifting dust, a rising glow, film grain and a heavy vignette. No
 * literal figure: the real warrior photos are the actual subject, and a clean
 * mood plate behind the type reads far better than drawn anatomy.
 *
 * Story arc via mood + the on-screen copy:
 *   frame-1  warm, open, distant   ("Your team, unarmored")
 *   frame-2  warmer, closing in    ("We suit you up")
 *   frame-3  tighter, embered      ("Ready for battle")
 *   frame-4  violet, glowing bloom ("Your agency, augmented" — the climax)
 *
 * Replace each placeholder-N.svg with the real frame-N.jpg and set
 * USE_REAL = true in app.js. Run: node tools/gen-placeholders.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "keyframes");
const W = 1408, H = 768;

/* deterministic pseudo-random so frames are stable across runs */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function dust(seed, count, opacity, tint) {
  const rng = makeRng(seed);
  let out = "";
  for (let i = 0; i < count; i++) {
    const x = rng() * W, y = rng() * H, r = rng() * 2.4 + 0.4;
    const o = (opacity * (0.3 + rng() * 0.7)).toFixed(2);
    out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${tint}" opacity="${o}"/>`;
  }
  return out;
}

/* per-frame: warm keylight color, glow color + strength, seed, background tone */
const frames = [
  { warm: "#5a4326", glow: "#e9b465", strength: 0.35, seed: 11, bg0: "#241a10", cy: 62 },
  { warm: "#6a4c28", glow: "#f0b45e", strength: 0.5,  seed: 23, bg0: "#241609", cy: 58 },
  { warm: "#5b4632", glow: "#ff9d57", strength: 0.62, seed: 37, bg0: "#1c1508", cy: 55 },
  { warm: "#3a2c50", glow: "#b06bff", strength: 1.0,  seed: 53, bg0: "#160f26", cy: 52, dark: true },
];

frames.forEach((f, i) => {
  const n = i + 1;
  const dustTint = f.dark ? "#d9c2ff" : "#f6d9a8";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="key" cx="32%" cy="26%" r="95%">
      <stop offset="0%" stop-color="${f.warm}"/>
      <stop offset="48%" stop-color="${f.bg0}"/>
      <stop offset="100%" stop-color="#05040a"/>
    </radialGradient>
    <linearGradient id="beam" x1="0.05" y1="0" x2="0.75" y2="1">
      <stop offset="0%" stop-color="#ffe6bd" stop-opacity="${(0.18 - f.strength * 0.12).toFixed(3)}"/>
      <stop offset="55%" stop-color="#ffe6bd" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="orb" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="${f.glow}" stop-opacity="${(0.55 * f.strength).toFixed(3)}"/>
      <stop offset="45%" stop-color="${f.glow}" stop-opacity="${(0.18 * f.strength).toFixed(3)}"/>
      <stop offset="100%" stop-color="${f.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="40%" r="72%">
      <stop offset="52%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.85"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#key)"/>
  <rect width="${W}" height="${H}" fill="url(#beam)"/>
  <!-- rising glow: warm ember → violet across the sequence -->
  <ellipse cx="${W * 0.52}" cy="${(H * f.cy) / 100}" rx="${560 + f.strength * 220}" ry="${420 + f.strength * 200}" fill="url(#orb)"/>
  <g opacity="0.7">${dust(f.seed, 90, 0.5, dustTint)}</g>
  <g opacity="0.9">${dust(f.seed + 7, 36, 0.6, dustTint)}</g>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.6"/>
</svg>`;
  writeFileSync(join(OUT, `placeholder-${n}.svg`), svg);
  console.log("wrote placeholder-" + n + ".svg");
});
