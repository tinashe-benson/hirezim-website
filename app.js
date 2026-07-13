/* ══════════════════════════════════════════════════════════════════════
   Argo Agent — Hire Zim AI · interactions
   Dark scroll-keyframe hero · nav · reveals (incl. diagram draw) ·
   sticky CTA · FAQ accordion.
   ══════════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const hero = $("#hero");
  const frames = $$(".frame");
  const caps = $$(".cap");
  const nav = $("#nav");
  const bar = $("#progressBar");
  const hint = $("#scrollHint");
  const N = frames.length;
  caps.forEach((c) => (c.style.transition = "none"));

  let heroTop = 0, range = 1, vh = innerHeight;
  function measure() {
    const r = hero.getBoundingClientRect();
    heroTop = r.top + scrollY; vh = innerHeight;
    range = Math.max(1, hero.offsetHeight - vh);
  }
  function renderHero() {
    const p = clamp((scrollY - heroTop) / range, 0, 1);
    const f = p * (N - 1);
    for (let i = 0; i < N; i++) {
      const op = 1 - clamp(Math.abs(f - i), 0, 1);
      frames[i].style.opacity = op.toFixed(3);
      if (op > 0.01) {
        frames[i].style.willChange = "opacity, transform";
        frames[i].style.transform = `scale(${(1.1 - 0.06 * (i / (N - 1)) - 0.03 * p).toFixed(3)})`;
      } else { frames[i].style.willChange = "auto"; }
      const c = caps[i];
      if (c) {
        c.style.opacity = op.toFixed(3);
        c.style.transform = `translateY(${((1 - op) * 20).toFixed(1)}px)`;
        c.classList.toggle("is-on", op > 0.5);
        c.querySelectorAll("a,button").forEach((el) => (el.tabIndex = op > 0.5 ? 0 : -1));
      }
    }
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
    if (hint) hint.style.opacity = p > 0.05 ? "0" : "0.8";
  }

  let ticking = false;
  function onScroll() {
    if (!reduce && !ticking) { requestAnimationFrame(() => { renderHero(); ticking = false; }); ticking = true; }
    nav.classList.toggle("is-solid", scrollY > innerHeight * 0.72);
    updateSticky();
  }
  if (!reduce && hero) {
    measure(); renderHero();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { measure(); renderHero(); syncFaq(); }, { passive: true });
    addEventListener("load", () => { measure(); renderHero(); });
  } else {
    nav.classList.add("is-solid");
    caps.forEach((c) => { c.style.opacity = ""; c.style.transform = ""; });
    addEventListener("scroll", () => { nav.classList.toggle("is-solid", scrollY > 40); updateSticky(); }, { passive: true });
  }

  /* ── Sticky mobile CTA ──────────────────────────────────────────────── */
  const sticky = $("#stickyCta");
  const contact = $("#contact");
  const inView = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.9 && r.bottom > innerHeight * 0.1; };
  function updateSticky() {
    if (!sticky) return;
    const pastHero = scrollY > (hero ? hero.offsetHeight - vh : vh);
    const menuOpen = document.body.classList.contains("menu-open");
    sticky.classList.toggle("is-shown", pastHero && !inView(contact) && !menuOpen);
  }

  /* ── Nav mobile menu ────────────────────────────────────────────────── */
  const burger = $("#burger");
  const links = $("#navLinks");
  if (burger && links) {
    const items = () => $$("a", links);
    const setOpen = (open) => {
      links.classList.toggle("is-open", open);
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) items()[0]?.focus(); else burger.focus();
      updateSticky();
    };
    burger.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
    items().forEach((a) => a.addEventListener("click", () => setOpen(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && links.classList.contains("is-open")) setOpen(false); });
  }

  /* ── Reveal (also triggers the diagram draw + counters) ─────────────── */
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ── FAQ accordion ──────────────────────────────────────────────────── */
  function syncFaq() { const o = $(".faq__item.is-open"); if (o) { const a = $(".faq__a", o); a.style.maxHeight = a.scrollHeight + "px"; } }
  $$(".faq__item").forEach((item) => {
    const q = $(".faq__q", item), a = $(".faq__a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      $$(".faq__item").forEach((it) => { it.classList.remove("is-open"); $(".faq__q", it).setAttribute("aria-expanded", "false"); $(".faq__a", it).style.maxHeight = null; });
      if (!open) { item.classList.add("is-open"); q.setAttribute("aria-expanded", "true"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ── Footer year ────────────────────────────────────────────────────── */
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
})();
