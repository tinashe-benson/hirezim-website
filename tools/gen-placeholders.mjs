/**
 * Generates 4 placeholder keyframe SVGs (16:9, 1408x768) so the scroll
 * experience runs before the real images are dropped in.
 *
 * Story order (matches the brief):
 *   frame-1  no helmet          (warrior kneeling, helmet on the ground)
 *   frame-2  donning the helmet (hands raising the helmet)
 *   frame-3  helmet on          (armored, calm, ready)
 *   frame-4  purple-eyed close  (menacing, glowing eyes — the climax)
 *
 * Replace each placeholder-N.svg with the real frame-N.jpg and update the
 * FRAMES array in app.js. Run: node tools/gen-placeholders.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "keyframes");
const W = 1408, H = 768;

const stages = [
  { n: 1, label: "01 — NO HELMET",      eyes: false, bg: ["#3a2f22", "#0d0a07"], glow: 0.0 },
  { n: 2, label: "02 — SUITING UP",     eyes: false, bg: ["#463322", "#0d0a07"], glow: 0.0 },
  { n: 3, label: "03 — READY",          eyes: false, bg: ["#2c2a26", "#08070a"], glow: 0.1 },
  { n: 4, label: "04 — UNSTOPPABLE",    eyes: true,  bg: ["#241b2e", "#050308"], glow: 1.0 },
];

// A minimal Corinthian-helmet glyph, centered.
function helmet(cx, cy, s, eyes, glow) {
  const p = (x, y) => `${(cx + x * s).toFixed(1)},${(cy + y * s).toFixed(1)}`;
  const body = [
    "M", p(0, -90), "C", p(60, -90), p(72, -30), p(72, 20),
    "C", p(72, 60), p(60, 96), p(52, 120),
    "L", p(40, 120), "L", p(40, 44), "C", p(40, 30), p(30, 24), p(16, 24),
    "L", p(-8, 24), "L", p(-8, 62), "L", p(-40, 62), "L", p(-40, 24),
    "C", p(-64, 22), p(-72, -10), p(-72, -30),
    "C", p(-72, -70), p(-40, -90), p(0, -90), "Z",
  ].join(" ");
  const crest = `M ${p(-6,-118)} C ${p(30,-140)} ${p(70,-130)} ${p(78,-96)} L ${p(56,-92)} C ${p(48,-112)} ${p(20,-116)} ${p(2,-100)} Z`;
  const eyeFill = eyes ? "#c98bff" : "#1a1712";
  const eyeGlow = eyes
    ? `<ellipse cx="${cx-26*s}" cy="${cy-8*s}" rx="${26*s}" ry="${16*s}" fill="#a855f7" opacity="0.55" filter="url(#blur)"/>
       <ellipse cx="${cx+4*s}"  cy="${cy-8*s}" rx="${26*s}" ry="${16*s}" fill="#a855f7" opacity="0.55" filter="url(#blur)"/>`
    : "";
  return `
    ${eyeGlow}
    <path d="${crest}" fill="#3a3d7a" opacity="${0.45 + glow*0.4}"/>
    <path d="${body}" fill="none" stroke="#b8975a" stroke-width="${3.2*s}" opacity="0.9"/>
    <path d="${body}" fill="#000" opacity="0.18"/>
    <circle cx="${cx-20*s}" cy="${cy-6*s}" r="${5*s}" fill="${eyeFill}"/>
    <circle cx="${cx+2*s}"  cy="${cy-6*s}" r="${5*s}" fill="${eyeFill}"/>`;
}

for (const st of stages) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="${st.bg[0]}"/>
      <stop offset="100%" stop-color="${st.bg[1]}"/>
    </radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="${18*st.glow + 4}"/></filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
      <feComposite operator="over" in2="SourceGraphic"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#g)" filter="url(#grain)"/>
  ${helmet(W/2, H/2 - 20, 2.1, st.eyes, st.glow)}
  <text x="${W/2}" y="${H-70}" text-anchor="middle" font-family="'Oswald','Arial Narrow',sans-serif"
        font-size="34" letter-spacing="8" fill="#e9dcc4" opacity="0.85">${st.label}</text>
  <text x="${W/2}" y="${H-38}" text-anchor="middle" font-family="Inter,Arial,sans-serif"
        font-size="15" letter-spacing="3" fill="#9a8f7d" opacity="0.7">PLACEHOLDER · replace with frame-${st.n}.jpg</text>
</svg>`;
  writeFileSync(join(OUT, `placeholder-${st.n}.svg`), svg);
  console.log("wrote placeholder-" + st.n + ".svg");
}
