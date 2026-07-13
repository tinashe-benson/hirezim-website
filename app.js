/* ══════════════════════════════════════════════════════════════════════
   Argo — HireZim AI · interaction layer
   Scroll-keyframe hero · self-playing chat demo · spotlight · sticky CTA ·
   FAQ accordion · accessible mobile menu · scroll reveals.
   ══════════════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ── HERO: scroll-scrubbed keyframes + captions ─────────────────────── */
  const hero = $("#hero");
  const frames = $$(".frame");
  const caps = $$(".cap");
  const nav = $("#nav");
  const bar = $("#progressBar");
  const hint = $("#scrollHint");
  const N = frames.length;

  // Crisp scrubbing: no CSS transitions fighting per-frame writes.
  caps.forEach((c) => (c.style.transition = "none"));

  let heroTop = 0, range = 1, vh = innerHeight;
  function measure() {
    const r = hero.getBoundingClientRect();
    heroTop = r.top + scrollY;
    vh = innerHeight;
    range = Math.max(1, hero.offsetHeight - vh);
  }
  function renderHero() {
    const p = clamp((scrollY - heroTop) / range, 0, 1);
    const f = p * (N - 1); // frames AND captions share this progress
    for (let i = 0; i < N; i++) {
      const d = clamp(Math.abs(f - i), 0, 1);
      const op = 1 - d;
      frames[i].style.opacity = op.toFixed(3);
      // zoom: gentle, only on the 1-2 visible frames (perf: will-change on the fly)
      if (op > 0.01) {
        frames[i].style.willChange = "opacity, transform";
        frames[i].style.transform = `scale(${(1.1 - 0.06 * (i / (N - 1)) - 0.03 * p).toFixed(3)})`;
      } else {
        frames[i].style.willChange = "auto";
      }
      const c = caps[i];
      if (c) {
        c.style.opacity = op.toFixed(3);
        c.style.transform = `translateY(${((1 - op) * 20).toFixed(1)}px)`;
        c.classList.toggle("is-on", op > 0.5);
        c.querySelectorAll("a,button").forEach((el) => (el.tabIndex = op > 0.5 ? 0 : -1));
      }
    }
    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
    if (hint) hint.style.opacity = p > 0.05 ? "0" : "0.85";
  }

  let ticking = false;
  function onScroll() {
    if (!reduce && !ticking) { requestAnimationFrame(() => { renderHero(); ticking = false; }); ticking = true; }
    nav.classList.toggle("is-solid", scrollY > 60);
    updateSticky();
  }

  if (!reduce && hero) {
    measure(); renderHero();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { measure(); renderHero(); });
    addEventListener("load", () => { measure(); renderHero(); });
  } else {
    nav.classList.add("is-solid");
    caps.forEach((c) => { c.style.opacity = ""; c.style.transform = ""; });
    addEventListener("scroll", () => { nav.classList.toggle("is-solid", scrollY > 60); updateSticky(); }, { passive: true });
  }

  /* ── STICKY MOBILE CTA ──────────────────────────────────────────────── */
  const sticky = $("#stickyCta");
  const book = $("#book");
  const inAction = $("#in-action");
  const inView = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.85 && r.bottom > innerHeight * 0.15; };
  function updateSticky() {
    if (!sticky) return;
    const pastHero = scrollY > (hero ? hero.offsetHeight - vh * 0.9 : vh);
    const menuOpen = document.body.classList.contains("menu-open");
    // hide over the booking section (its own CTA) and the chat demo (avoid overlap)
    sticky.classList.toggle("is-shown", pastHero && !inView(book) && !inView(inAction) && !menuOpen);
  }

  /* ── NAV: accessible mobile menu ────────────────────────────────────── */
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
      if (open) items()[0]?.focus();
      else burger.focus();
      updateSticky();
    };
    burger.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
    items().forEach((a) => a.addEventListener("click", () => setOpen(false)));
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("is-open")) setOpen(false);
    });
  }

  /* ── SCROLL REVEAL ──────────────────────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ── POINTER SPOTLIGHT ──────────────────────────────────────────────── */
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    $$(".spot").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ── MARQUEE: seamless loop ─────────────────────────────────────────── */
  const row = $("#intMarquee");
  if (row && !reduce) row.innerHTML += row.innerHTML;

  /* ── FAQ ACCORDION ──────────────────────────────────────────────────── */
  $$(".faq__item").forEach((item) => {
    const q = $(".faq__q", item);
    const a = $(".faq__a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      $$(".faq__item").forEach((it) => {
        it.classList.remove("is-open");
        $(".faq__q", it).setAttribute("aria-expanded", "false");
        $(".faq__a", it).style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("is-open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
  // Recompute the open FAQ answer height on resize so it never clips.
  addEventListener("resize", () => {
    const open = $(".faq__item.is-open");
    if (open) { const a = $(".faq__a", open); a.style.maxHeight = a.scrollHeight + "px"; }
  }, { passive: true });

  /* ── ARGO CHAT DEMO (self-playing) ──────────────────────────────────── */
  const chat = $("#argoChat");
  if (chat) {
    const log = $("#chatLog", chat);
    const msgs = $$(".msg", log);
    const timerEl = $("#chatTimer", chat);
    const booked = $("#chatBooked", chat);
    const titleEl = $(".demo__title", chat);
    const tabs = $$(".demo__tab", chat);
    const baseTitle = "Peak Remodeling Co.";
    const chanNoun = { sms: "SMS", voice: "Voice", chat: "Web chat" };
    let timers = [];
    const stop = () => { timers.forEach(clearTimeout); timers = []; };
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));

    if (!reduce) log.classList.add("demo__log--anim");

    function reset() {
      stop();
      $$(".msg--typing", log).forEach((t) => t.remove());
      msgs.forEach((m) => m.classList.remove("is-shown"));
      if (booked) booked.hidden = true;
      if (timerEl) timerEl.textContent = "responded in 0.0s";
      log.scrollTop = 0;
    }

    async function play() {
      if (reduce) { msgs.forEach((m) => m.classList.add("is-shown")); if (booked) booked.hidden = false; if (timerEl) timerEl.textContent = "responded in 4.2s"; return; }
      reset();
      for (let i = 0; i < msgs.length; i++) {
        const m = msgs[i];
        const isArgo = m.classList.contains("msg--argo");
        if (isArgo) {
          // typing indicator + latency count
          const typing = document.createElement("div");
          typing.className = "msg msg--argo msg--typing is-shown";
          typing.innerHTML = "<p><i></i><i></i><i></i></p>";
          log.appendChild(typing);
          const dur = 750 + Math.min(900, m.textContent.length * 12);
          let t = 0;
          const tick = () => { t += 0.1; if (timerEl) timerEl.textContent = "responding… " + t.toFixed(1) + "s"; if (t < dur / 1000) timers.push(setTimeout(tick, 100)); };
          tick();
          await wait(dur);
          typing.remove();
          m.classList.add("is-shown");
          if (timerEl) timerEl.textContent = "replied in " + (dur / 1000).toFixed(1) + "s";
        } else {
          m.classList.add("is-shown");
        }
        // keep newest in view within the log
        log.scrollTop = log.scrollHeight;
        await wait(isArgo ? 650 : 900);
      }
      if (booked) booked.hidden = false;
      await wait(2600);
      play(); // loop
    }

    tabs.forEach((tab) => tab.addEventListener("click", () => {
      tabs.forEach((t) => { t.classList.remove("is-on"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-on"); tab.setAttribute("aria-selected", "true");
      if (titleEl) titleEl.textContent = baseTitle + " · " + (chanNoun[tab.dataset.ch] || "");
      play();
    }));
    chat.addEventListener("mouseenter", () => { if (!reduce) play(); });

    if (reduce) { play(); }
    else {
      const cio = new IntersectionObserver((ents) => {
        ents.forEach((e) => { if (e.isIntersecting) { play(); } else { stop(); } });
      }, { threshold: 0.4 });
      cio.observe(chat);
    }
  }

  /* ── DEMO FORM (mailto fallback until a scheduler is wired) ──────────── */
  const form = $("#demoForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const body = encodeURIComponent(
        `Name: ${d.get("name") || ""}\nCompany: ${d.get("company") || ""}\nEmail: ${d.get("email") || ""}\n\n${d.get("message") || ""}`
      );
      location.href = `mailto:tinashe@hirezim.ai?subject=${encodeURIComponent("Argo demo request")}&body=${body}`;
    });
  }

  /* ── FOOTER YEAR ────────────────────────────────────────────────────── */
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
