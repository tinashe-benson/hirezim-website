/* ══════════════════════════════════════════════════════════════════════
   HireZim AI — scroll engine
   Drives the pinned keyframe hero: crossfades 4 frames and swaps captions
   as the user scrolls through the tall .hero track. Plus nav, reveals,
   marquee doubling, and reduced-motion respect.
   ══════════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* ── To use the real de-watermarked images, drop frame-1.jpg … frame-4.jpg
     into /keyframes and set USE_REAL = true (order = no-helmet → purple-eyes). */
  const USE_REAL = false;
  const EXT = "jpg";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hero      = document.getElementById("hero");
  const frames    = Array.from(document.querySelectorAll(".frame"));
  const caps       = Array.from(document.querySelectorAll(".cap"));
  const nav        = document.getElementById("nav");
  const bar        = document.getElementById("progressBar");
  const scrollHint = document.getElementById("scrollHint");

  if (USE_REAL) {
    frames.forEach((img, i) => { img.src = `keyframes/frame-${i + 1}.${EXT}`; });
  }

  const N = frames.length;      // 4 keyframes
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* smootherstep for silky caption fades */
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

  let heroTop = 0, heroRange = 1, vh = window.innerHeight;

  function measure() {
    const rect = hero.getBoundingClientRect();
    heroTop = rect.top + window.scrollY;
    vh = window.innerHeight;
    heroRange = Math.max(1, hero.offsetHeight - vh);
  }

  /* Map scroll progress p∈[0,1] onto frame opacities + caption states. */
  function render() {
    const p = clamp((window.scrollY - heroTop) / heroRange, 0, 1);
    const f = p * (N - 1);                       // 0 → N-1

    // Crossfade adjacent frames; gentle zoom that intensifies toward the end.
    for (let i = 0; i < N; i++) {
      const op = 1 - clamp(Math.abs(f - i), 0, 1);
      frames[i].style.opacity = op.toFixed(3);
      const zoom = 1.12 - 0.07 * (i / (N - 1)) - 0.03 * (p);   // subtle push-in
      frames[i].style.transform = `scale(${zoom.toFixed(3)})`;
    }

    // Captions: one active window each across the scroll, with fade in/out.
    const seg = 1 / N;
    for (let s = 0; s < caps.length; s++) {
      const local = (p - s * seg) / seg;                      // 0..1 inside window
      // ramp in over first 30%, hold, ramp out over last 22%.
      // First caption is visible on load (no ramp-in); last caption holds to end.
      let a;
      if (local < 0) a = 0;
      else if (s !== 0 && local < 0.3) a = smooth(local / 0.3);
      else if (s === caps.length - 1) a = 1;                  // final caption stays
      else if (local > 0.78) a = smooth((1 - local) / 0.22);
      else if (local <= 1) a = 1;
      else a = 0;
      caps[s].classList.toggle("is-on", a > 0.5);
      caps[s].style.opacity = a.toFixed(3);
      caps[s].style.transform = a > 0 ? `translateY(${(1 - a) * 26}px)` : "translateY(26px)";
    }

    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
    if (scrollHint) scrollHint.style.opacity = p > 0.04 ? "0" : "0.9";
  }

  /* rAF-throttled scroll */
  let ticking = false;
  function onScroll() {
    if (!ticking) { requestAnimationFrame(() => { render(); ticking = false; }); ticking = true; }
    nav.classList.toggle("is-solid", window.scrollY > vh * 0.6 || window.scrollY > 80);
  }

  if (!reduce) {
    measure();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { measure(); render(); });
    window.addEventListener("load", () => { measure(); render(); });
  } else {
    nav.classList.add("is-solid");
  }

  /* ── Nav: mobile burger ─────────────────────────────────────────────── */
  const burger = document.getElementById("burger");
  const links  = document.querySelector(".nav__links");
  if (burger && links) {
    const toggle = (open) => {
      links.classList.toggle("is-open", open);
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    };
    burger.addEventListener("click", () => toggle(!links.classList.contains("is-open")));
    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  /* ── Reveal on scroll ───────────────────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ── Marquee: duplicate contents for a seamless loop ────────────────── */
  const row = document.getElementById("marquee");
  if (row && !reduce) row.innerHTML += row.innerHTML;

  /* ── Footer year ────────────────────────────────────────────────────── */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
